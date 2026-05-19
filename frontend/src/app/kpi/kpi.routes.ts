import {Routes} from '@angular/router';

export default [
	{
		path: 'kpi-commercial',
		data: {breadcrumb: 'KPI-COMMERCIAL'},
		loadComponent: () => import('./kpi-commercial/kpi-commercial.component').then((c) => c.KpiCommercialComponent)
	},
	{
		path: 'kpi-finance',
		data: {breadcrumb: 'KPI-FINANCE'},
		loadComponent: () => import('./kpi-finance/kpi-finance.component').then((c) => c.KpiFinanceComponent)
	},
	{
		path: 'kpi-dsi',
		data: {breadcrumb: 'KPI-DSI'},
		loadComponent: () => import('./kpi-dsi/kpi-dsi.component').then((c) => c.KpiDsiComponent)
	}
	,
	{
		path: 'kpi-rh',
		data: {breadcrumb: 'KPI-RH'},
		loadComponent: () => import('./kpi-rh/kpi-rh.component').then((c) => c.KpiRhComponent)
	},
	{
		path: 'kpi-stock',
		data: {breadcrumb: 'KPI-STOCK'},
		loadComponent: () => import('./kpi-stock/kpi-stock.component').then((c) => c.KpiStockComponent)
	},
	{
		path: 'kpi-technique',
		data: {breadcrumb: 'KPI-TECHNIQUE'},
		loadComponent: () => import('./kpi-technique/kpi-technique.component').then((c) => c.KpiTechniqueComponent)
	}
] as Routes;
