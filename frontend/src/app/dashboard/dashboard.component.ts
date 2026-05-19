import { Component, OnInit } from '@angular/core';
import { DashboardService, DashboardStats } from '../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  stats?: DashboardStats;

  ordersChartData: any;
  revenueChartData: any;

  readonly chartOptions = {
    responsive: true,
    maintainAspectRatio: false
  };

  constructor(private readonly dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getStats().subscribe((data) => {
      this.stats = data;
      this.ordersChartData = {
        labels: data.ordersByDay.map((x) => x.date),
        datasets: [{
          label: 'Commandes par jour',
          data: data.ordersByDay.map((x) => x.count)
        }]
      };

      this.revenueChartData = {
        labels: data.revenueByMonth.map((x) => x.month),
        datasets: [{
          label: 'Revenus par mois',
          data: data.revenueByMonth.map((x) => x.amount)
        }]
      };
    });
  }
}
