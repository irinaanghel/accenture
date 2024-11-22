import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../services/data.service';
import { forkJoin } from 'rxjs';
import { Location } from '@angular/common';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styles: [
  ]
})
export class ProfileComponent {

  // ID del paziente estratto dai parametri di route
  idPatient: string = '';

  // Oggetto che rappresenta il paziente attuale
  patient: Patient | null = null;

  // Dizionario per tradurre le attività
  activityTranslations: Record<string, string> = {
    walking: 'Camminata',
    running: 'Correre',
    cycling: 'Ciclismo',
    swimming: 'Nuotare',
    sleeping: 'Dormire',
    'stationary-awake': 'Sveglio',
  };

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
  ){ 
    // Sottoscrizione per recuperare l'ID del paziente dai parametri della route
    this.route.params.subscribe( params => {
      this.idPatient = params['id'];
    });
  }

  ngOnInit() : void {
    forkJoin({
      patient : this.dataService.getPatient(this.idPatient),
      patients : this.dataService.getPatients(),
      activities : this.dataService.getActivities()
    }).subscribe({
      next: (results) => {
        const matchingPatient = results.patients.find(patient => patient.id === Number(this.idPatient));
        this.patient = {
          ...matchingPatient,
          activities: results.patient || null
        };
      },
      error: (err) => {
        console.error('Error:', err);
      }
    });
  }
  
  /**
   * Traduce il nome di un'attività nel linguaggio specifico.
   * @param activity - Nome dell'attività in lingua originale
   * @returns Traduzione dell'attività o il valore originale se non trovato
   */
  translateActivity(activity: string): string {
    return this.activityTranslations[activity] || activity;
  }

   /**
   * Converte una durata in minuti nel formato `hh:mm`.
   * @param minutes - Durata in minuti
   * @returns Stringa formattata in ore e minuti
   */
  convertToHoursAndMinutes(minutes: number): string {
    const hours = Math.floor(minutes / 60); // Calcola le ore
    const remainingMinutes = minutes % 60; // Calcola i minuti rimanenti
    return `${hours}h ${remainingMinutes}m`; // Ritorna nel formato hh:mm
  }

}

/**
 * Interfaccia che definisce un paziente
 */
interface Patient {
  id: number;
  name: string;
  gender: 'male' | 'female';
  birthDate: string;
  heightCm: number;
  weightKg: number;
  bmi: number;
  activities?: Activity[];
}

/**
 * Interfaccia che definisce un'attività
 */
interface Activity {
  activity: string;
  minutes: number;
}
