import { Routes } from '@angular/router';
import { AppLayout } from '@/layout/components/app.layout';
import { authGuard, superAdminGuard } from './guards/auth.guard';

export const appRoutes: Routes = [
    // Redirection racine vers dashboard admin
    {
        path: '',
        redirectTo: '/admin/dashboard',
        pathMatch: 'full'
    },
    // Page de connexion
    {
        path: 'connexion',
        loadComponent: () => import('./app/login/login').then((c) => c.Login)
    },
    // Administration protégée
    {
        path: 'admin',
        component: AppLayout,
        canActivate: [authGuard],
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: 'dashboard',
                loadComponent: () => import('./app/pages/admin/dashboard/admin-dashboard.component')
                    .then(c => c.AdminDashboardComponent),
                data: { breadcrumb: 'Tableau de bord' }
            },
            {
                path: 'produits',
                loadComponent: () => import('./app/pages/admin/produits/admin-produits.component')
                    .then(c => c.AdminProduitsComponent),
                data: { breadcrumb: 'Produits' }
            },
            {
                path: 'commandes',
                loadComponent: () => import('./app/pages/admin/commandes/admin-commandes.component')
                    .then(c => c.AdminCommandesComponent),
                data: { breadcrumb: 'Commandes' }
            },
            {
                path: 'commandes/:id',
                loadComponent: () => import('./app/pages/admin/commandes/admin-commandes.component')
                    .then(c => c.AdminCommandesComponent),
                data: { breadcrumb: 'Commandes' }
            },
            {
                path: 'utilisateurs',
                canActivate: [superAdminGuard],
                loadComponent: () => import('./app/pages/admin/utilisateurs/admin-utilisateurs.component')
                    .then(c => c.AdminUtilisateursComponent),
                data: { breadcrumb: 'Utilisateurs' }
            },
            {
                path: 'analytiques',
                loadComponent: () => import('./app/pages/admin/analytiques/admin-analytiques.component')
                    .then(c => c.AdminAnalytiquesComponent),
                data: { breadcrumb: 'Analytiques' }
            },
            {
                path: 'audit-log',
                canActivate: [superAdminGuard],
                loadComponent: () => import('./app/pages/admin/audit-log/admin-audit-log.component')
                    .then(c => c.AdminAuditLogComponent),
                data: { breadcrumb: 'Journal d\'audit' }
            }
        ]
    },
    {
        path: 'notfound',
        loadComponent: () => import('./app/pages/notfound/notfound').then((c) => c.Notfound)
    },
    { path: '**', redirectTo: '/notfound' }
];
