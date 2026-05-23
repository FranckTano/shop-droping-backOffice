import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { DashboardService, DashboardStats, CommandeRecente } from '../../../../services/dashboard.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, CardModule, ButtonModule, SkeletonModule, TagModule, TableModule],
    template: `
        <div class="admin-dashboard">
            <div class="dash-header">
                <div>
                    <p class="dash-kicker">TABLEAU DE BORD</p>
                    <h1>Vue d'ensemble</h1>
                    <p>Bienvenue, <strong>{{ nomAdmin }}</strong> — {{ dateAujourdhui }}</p>
                </div>
                <button pButton icon="pi pi-refresh" label="Actualiser" class="p-button-outlined" (click)="charger()"></button>
            </div>

            <!-- KPI Cards -->
            <div class="kpi-grid" *ngIf="!chargement; else skeletonKpi">
                <div class="kpi-card kpi-total">
                    <div class="kpi-icon"><i class="pi pi-shopping-cart"></i></div>
                    <div class="kpi-body">
                        <span class="kpi-value">{{ stats?.totalCommandes | number }}</span>
                        <span class="kpi-label">Total commandes</span>
                    </div>
                </div>
                <div class="kpi-card kpi-attente">
                    <div class="kpi-icon"><i class="pi pi-clock"></i></div>
                    <div class="kpi-body">
                        <span class="kpi-value">{{ stats?.commandesEnAttente | number }}</span>
                        <span class="kpi-label">En attente</span>
                    </div>
                </div>
                <div class="kpi-card kpi-livrees">
                    <div class="kpi-icon"><i class="pi pi-check-circle"></i></div>
                    <div class="kpi-body">
                        <span class="kpi-value">{{ stats?.commandesLivrees | number }}</span>
                        <span class="kpi-label">Livrées</span>
                    </div>
                </div>
                <div class="kpi-card kpi-ca">
                    <div class="kpi-icon"><i class="pi pi-wallet"></i></div>
                    <div class="kpi-body">
                        <span class="kpi-value">{{ (stats?.chiffreAffaires ?? 0) | number:'1.0-0' }} FCFA</span>
                        <span class="kpi-label">Chiffre d'affaires</span>
                    </div>
                </div>
                <div class="kpi-card kpi-produits">
                    <div class="kpi-icon"><i class="pi pi-box"></i></div>
                    <div class="kpi-body">
                        <span class="kpi-value">{{ stats?.produitsActifs | number }}</span>
                        <span class="kpi-label">Produits actifs</span>
                    </div>
                </div>
                <div class="kpi-card kpi-en-cours">
                    <div class="kpi-icon"><i class="pi pi-send"></i></div>
                    <div class="kpi-body">
                        <span class="kpi-value">{{ ((stats?.commandesConfirmees ?? 0) + (stats?.commandesEnCours ?? 0) + (stats?.commandesExpediees ?? 0)) | number }}</span>
                        <span class="kpi-label">En traitement</span>
                    </div>
                </div>
                <div class="kpi-card kpi-annulees">
                    <div class="kpi-icon"><i class="pi pi-times-circle"></i></div>
                    <div class="kpi-body">
                        <span class="kpi-value">{{ stats?.commandesAnnulees | number }}</span>
                        <span class="kpi-label">Annulées</span>
                    </div>
                </div>
            </div>

            <ng-template #skeletonKpi>
                <div class="kpi-grid">
                    <div *ngFor="let i of [1,2,3,4,5,6]" class="kpi-card">
                        <p-skeleton height="80px"></p-skeleton>
                    </div>
                </div>
            </ng-template>

            <!-- Liens rapides -->
            <div class="quick-links">
                <a [routerLink]="['/admin/produits']" class="ql-card">
                    <i class="pi pi-box"></i>
                    <span>Gérer les produits</span>
                </a>
                <a [routerLink]="['/admin/commandes']" class="ql-card">
                    <i class="pi pi-shopping-cart"></i>
                    <span>Gérer les commandes</span>
                </a>
                <a *ngIf="isSuperAdmin" [routerLink]="['/admin/utilisateurs']" class="ql-card">
                    <i class="pi pi-users"></i>
                    <span>Gérer les admins</span>
                </a>
                <a *ngIf="isSuperAdmin" [routerLink]="['/admin/archives']" class="ql-card">
                    <i class="pi pi-history"></i>
                    <span>Archives produits</span>
                </a>
            </div>

            <!-- Commandes récentes -->
            <div class="recentes-section">
                <h2>Commandes récentes</h2>
                <p-table [value]="commandesRecentes" [loading]="chargement" [paginator]="false"
                         styleClass="p-datatable-sm p-datatable-striped" responsiveLayout="scroll">
                    <ng-template pTemplate="header">
                        <tr>
                            <th>N°</th>
                            <th>Client</th>
                            <th>Téléphone</th>
                            <th>Total</th>
                            <th>Statut</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-cmd>
                        <tr>
                            <td><strong>{{ cmd.numero }}</strong></td>
                            <td>{{ cmd.clientNom }}</td>
                            <td>{{ cmd.clientTelephone }}</td>
                            <td>{{ cmd.montantTotal | number:'1.0-0' }} FCFA</td>
                            <td>
                                <p-tag [value]="cmd.statut" [severity]="statutSeverity(cmd.statut)"></p-tag>
                            </td>
                            <td>{{ formatDate(cmd.createdAt) }}</td>
                            <td>
                                <a [routerLink]="['/admin/commandes']" pButton icon="pi pi-arrow-right"
                                   class="p-button-text p-button-sm"></a>
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                        <tr><td colspan="7" class="text-center">Aucune commande pour le moment</td></tr>
                    </ng-template>
                </p-table>
            </div>
        </div>
    `,
    styles: [`
        .admin-dashboard { padding: 1.5rem; font-family: 'Poppins', 'Segoe UI', sans-serif; }

        .dash-header {
            display: flex; align-items: start; justify-content: space-between;
            flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem;
        }
        .dash-kicker { margin: 0; font-size: 0.72rem; letter-spacing: 0.14em; color: #6366f1; font-weight: 700; }
        .dash-header h1 { margin: 0.3rem 0; font-size: 1.7rem; color: #0f172a; }
        .dash-header p { margin: 0; color: #64748b; }

        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem; margin-bottom: 1.5rem;
        }
        .kpi-card {
            background: #fff; border: 1px solid rgba(15,23,42,.08);
            border-radius: 1rem; padding: 1.1rem;
            display: flex; align-items: center; gap: 1rem;
            transition: transform .2s, box-shadow .2s;
        }
        .kpi-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,.08); }
        .kpi-icon {
            width: 48px; height: 48px; border-radius: 12px;
            display: flex; align-items: center; justify-content: center;
            font-size: 1.4rem;
        }
        .kpi-total .kpi-icon { background: #eff6ff; color: #3b82f6; }
        .kpi-attente .kpi-icon { background: #fef3c7; color: #d97706; }
        .kpi-livrees .kpi-icon { background: #dcfce7; color: #16a34a; }
        .kpi-ca .kpi-icon { background: #f0fdf4; color: #15803d; }
        .kpi-produits .kpi-icon { background: #f3e8ff; color: #9333ea; }
        .kpi-en-cours .kpi-icon { background: #eff6ff; color: #2563eb; }
        .kpi-annulees .kpi-icon { background: #fef2f2; color: #dc2626; }
        .kpi-value { display: block; font-size: 1.35rem; font-weight: 700; color: #0f172a; }
        .kpi-label { font-size: 0.78rem; color: #64748b; }

        .quick-links {
            display: flex; flex-wrap: wrap; gap: .8rem; margin-bottom: 1.5rem;
        }
        .ql-card {
            display: flex; align-items: center; gap: .6rem;
            padding: .7rem 1.1rem; border: 1px solid rgba(15,23,42,.1);
            border-radius: .75rem; background: #fff; color: #334155;
            text-decoration: none; font-size: .9rem;
            transition: background .18s, border-color .18s;
        }
        .ql-card:hover { background: #f1f5f9; border-color: #6366f1; color: #6366f1; }
        .ql-card i { font-size: 1.1rem; }

        .recentes-section h2 { font-size: 1.2rem; color: #0f172a; margin-bottom: 1rem; }

        @media (max-width: 640px) {
            .admin-dashboard { padding: 1rem; }
            .dash-header { flex-direction: column; }
            .dash-header button { width: 100%; }
            .dash-header h1 { font-size: 1.4rem; }
            .kpi-grid { grid-template-columns: 1fr 1fr; }
            .quick-links { flex-direction: column; }
            .ql-card { width: 100%; }
        }
    `]
})
export class AdminDashboardComponent implements OnInit {
    stats: DashboardStats | null = null;
    commandesRecentes: CommandeRecente[] = [];
    chargement = true;
    nomAdmin = '';
    dateAujourdhui = '';
    isSuperAdmin = false;

    constructor(
        private dashboardService: DashboardService,
        private authService: AuthService
    ) {}

    ngOnInit(): void {
        const user = this.authService.getUtilisateurConnecte();
        if (user) {
            this.nomAdmin = `${user.prenoms ?? ''} ${user.nom ?? ''}`.trim() || user.login;
            this.isSuperAdmin = this.authService.isSuperAdmin();
        }
        this.dateAujourdhui = new Date().toLocaleDateString('fr-FR', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });
        this.charger();
    }

    charger(): void {
        this.chargement = true;
        this.dashboardService.getStats().subscribe({
            next: (s) => { this.stats = s; this.chargement = false; },
            error: () => { this.chargement = false; }
        });
        this.dashboardService.getCommandesRecentes().subscribe({
            next: (c) => { this.commandesRecentes = c; }
        });
    }

    statutSeverity(statut: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        const m: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
            EN_ATTENTE: 'warn',
            CONFIRMEE:  'info',
            EN_COURS:   'info',
            EXPEDIEE:   'info',
            VALIDEE:    'success',
            LIVREE:     'success',
            ANNULEE:    'danger',
            STANDBY:    'secondary'
        };
        return m[statut] ?? 'secondary';
    }

    formatDate(date: string): string {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
}
