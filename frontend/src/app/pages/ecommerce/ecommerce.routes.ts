import { Routes } from '@angular/router';

export default [
    {
        path: '',
        data: { breadcrumb: 'Accueil' },
        loadComponent: () => import('./productlist').then((c) => c.ProductListComponent)
    },
    {
        path: 'product-overview/:id',
        data: { breadcrumb: 'Détail Produit' },
        loadComponent: () => import('./productoverview').then((c) => c.ProductOverviewComponent)
    },
    {
        path: 'panier',
        data: { breadcrumb: 'Panier' },
        loadComponent: () => import('./shoppingcart.component').then((c) => c.ShoppingCartComponent)
    },
] as Routes;
