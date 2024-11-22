import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { PieChartComponent } from '../pie-chart/pie-chart.component';

@NgModule({
  declarations: [
    PieChartComponent
  ],
  imports: [
    CommonModule,
    NgApexchartsModule
  ],
  exports : [
    PieChartComponent
  ]
})
export class SharedModule { }
