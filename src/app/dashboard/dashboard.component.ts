import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { DataService } from '../services/data.service';
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, forkJoin } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {

  // Stato reattivo per tracciare i pazienti sopra/sotto i limiti
  data$ = new BehaviorSubject<{ overLimits: number; underLimits: number }>({
    overLimits: 0,
    underLimits: 0,
  });

  // Form di filtro
  filterForm: FormGroup;

  // Pazienti filtrati
  filteredPatients: Patient[] = [];

  // Fonte dati per la tabella
  dataSource!: MatTableDataSource<Patient>;

  // Colonne visualizzate nella tabella
  displayedColumns: string[] = ['name', 'birthdate', 'level'];

  constructor(
    private cdr: ChangeDetectorRef,
    private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Inizializza il form
    this.filterForm = new FormGroup({
      search: new FormControl(''),
      level: new FormControl('')
    });
  
    // Ascolta i cambiamenti del form e applica i filtri
    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.applyFilters();
    });
  }
  

  ngOnInit(): void {
    // Carica i dati iniziali
    forkJoin({
      patients: this.dataService.getPatients(),
      activities: this.dataService.getActivities()
    }).subscribe({
      next: (results) => {
        this.filteredPatients = results.patients.filter((patient) => this.isBetween20And40(patient.birthDate));
  
        // Processa ciascun paziente per determinare il livello
        this.filteredPatients.forEach((patient: any) => {
          this.dataService.getPatient(patient.id).subscribe((p) => {
            const moderateMinutes = this.calculateModerateMinutes(p, results.activities);
            const vigorousMinutes = this.calculateVigorousMinutes(p, results.activities);
  
            const currentData = this.data$.getValue();
  
            // Determina se il paziente è sopra o sotto i limiti
            if (moderateMinutes >= 150 || vigorousMinutes >= 75 || this.isCombinationValid(moderateMinutes, vigorousMinutes)) {
              patient.level = true;
              this.data$.next({ ...currentData, overLimits: currentData.overLimits + 1 });
            } else {
              patient.level = false;
              this.data$.next({ ...currentData, underLimits: currentData.underLimits + 1 });
            }
          });
        });
  
        this.applyFilters();
      },
      error: (err) => console.error('Error:', err),
    });
  }
  
  

  private isBetween20And40(birthDate: string): boolean {
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();

    // Regola l'età se il compleanno non è ancora passato quest'anno
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      return age - 1 >= 20 && age - 1 <= 40;
    }
    return age >= 20 && age <= 40;
  }

  /**
   * Calcola i minuti di attività moderata di un paziente.
   * @param patientActivities - Attività del paziente
   * @param activityDefinitions - Definizioni delle attività
   * @returns Totale minuti di attività moderata
   */
  private calculateModerateMinutes(patientActivities: any[], activityDefinitions: any[]): number {
    return patientActivities
      .filter(activity => {
        const definition = activityDefinitions.find(def => def.activity === activity.activity);
        return definition?.intensity === 'moderate'; // Filtra solo le attività moderate
      })
      .reduce((total, activity) => total + activity.minutes, 0); // Somma i minuti
  }

   /**
   * Calcola i minuti di attività vigorosa di un paziente.
   * @param patientActivities - Attività del paziente
   * @param activityDefinitions - Definizioni delle attività
   * @returns Totale minuti di attività vigorosa
   */
  private calculateVigorousMinutes(patientActivities: any[], activityDefinitions: any[]): number {
    return patientActivities
      .filter(activity => {
        const definition = activityDefinitions.find(def => def.activity === activity.activity);
        return definition?.intensity === 'vigorous'; // Filtra solo le attività vigorose
      })
      .reduce((total, activity) => total + activity.minutes, 0); // Somma i minuti
  }

   /**
   * Valida una combinazione di minuti di attività moderata e vigorosa.
   * @param moderateMinutes - Minuti di attività moderata
   * @param vigorousMinutes - Minuti di attività vigorosa
   * @returns True se la combinazione è valida, altrimenti False
   */
  private isCombinationValid(moderateMinutes: number, vigorousMinutes: number): boolean {
    return vigorousMinutes == 25 && moderateMinutes == 100;
  }

  clear(){
    this.filterForm.get('level')!.reset();
  }

  /**
   * Applica i filtri alla lista dei pazienti.
   */
  private applyFilters(): void {
    const filters = this.filterForm.value;
  
    const filteredData = this.filteredPatients.filter((patient: any) => {
      const matchesSearch = filters.search
        ? patient.name.toLowerCase().includes(filters.search.toLowerCase())
        : true;
  
      const matchesLevel = filters.level
        ? patient.level === (filters.level === 'true')
        : true;
  
      return matchesSearch && matchesLevel;
    });
  
    this.dataSource = new MatTableDataSource(filteredData.sort((a: any, b: any) => a?.name.localeCompare(b?.name)));
    this.cdr.detectChanges();
  }
  


}

/**
 * Interfaccia per rappresentare un paziente.
 */
interface Patient {
  id: number;
  name: string;
  birthDate: string;
  level?: boolean;
  activities?: Activity[];
}

/**
 * Interfaccia per rappresentare un'attività.
 */
interface Activity {
  activity: string;
  minutes: number;
}