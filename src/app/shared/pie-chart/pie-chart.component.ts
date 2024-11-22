import { ChangeDetectorRef, Component, EventEmitter, inject, Input, Output, SimpleChanges } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html'
})
export class PieChartComponent {

   /**
   * Input che rappresenta i dati per il grafico.
   * Contiene i valori per "overLimits" e "underLimits".
   */
  @Input() data: { overLimits: number; underLimits: number } | null = null;

  /**
   * Opzioni di configurazione del grafico.
   */
  chartOptions: any;

  constructor() {}

  /**
   * Rileva i cambiamenti nei dati in ingresso e aggiorna il grafico di conseguenza.
   * @param changes - Cambiamenti degli input
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && changes['data'].currentValue) {
      this.updateChartOptions();
    }
  }

   /**
   * Aggiorna le opzioni del grafico in base ai dati attuali.
   */
  private updateChartOptions(): void {
    if (!this.data) {
      this.chartOptions = null; // Se i dati sono nulli, non configurare il grafico
      return;
    }
    this.chartOptions = {
      series: [this.data?.overLimits, this.data?.underLimits],
      chart: {
        width: 350,
        type: 'pie',
      },
      colors: ['#61c454', '#ec6a5e'],
      labels: ['Livello Superato', 'Livello Non Superato'],
      legend: {
        position: 'bottom',
      },
    };
  }
}
