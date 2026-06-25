import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { DatePickerModule } from 'primeng/datepicker';
import { TooltipModule } from 'primeng/tooltip';
import { DashboardService, DashboardStats, CommandeRecente } from '../../../../services/dashboard.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, CardModule, ButtonModule,
              SkeletonModule, TagModule, TableModule, DatePickerModule, TooltipModule],
    template: `
        <div class="admin-dashboard">
            <div class="dash-header">
                <div>
                    <p class="dash-kicker">TABLEAU DE BORD</p>
                    <h1>Vue d'ensemble</h1>
                    <p>Bienvenue, <strong>{{ nomAdmin }}</strong> — {{ dateAujourdhui }}</p>
                </div>
                <div class="dash-controls">
                    <!-- Filtre de période -->
                    <div class="dash-date-filter">
                        <p-datepicker [(ngModel)]="plageDate" selectionMode="range"
                                      [readonlyInput]="true" [showButtonBar]="true"
                                      placeholder="Filtrer par période"
                                      dateFormat="dd/mm/yy"
                                      appendTo="body"
                                      (onSelect)="onDateChange()"
                                      (onClearClick)="effacerFiltre()"
                                      styleClass="dash-datepicker">
                        </p-datepicker>
                        <button *ngIf="filtreDateActif" pButton icon="pi pi-times"
                                class="p-button-outlined p-button-sm dash-clear-btn"
                                (click)="effacerFiltre()"
                                pTooltip="Supprimer le filtre">
                        </button>
                    </div>
                    <button pButton icon="pi pi-refresh" label="Actualiser"
                            class="p-button-outlined" (click)="charger()">
                    </button>
                </div>
            </div>

            <!-- Bandeau filtre actif -->
            <div class="dash-filter-banner" *ngIf="filtreDateActif">
                <i class="pi pi-filter-fill"></i>
                <span>Données filtrées du <strong>{{ formatDate(plageDate[0]) }}</strong>
                    au <strong>{{ formatDate(plageDate[1] ?? plageDate[0]) }}</strong></span>
                <button class="dash-filter-close" (click)="effacerFiltre()">
                    <i class="pi pi-times"></i> Effacer
                </button>
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
                        <span class="kpi-label">CA confirmé{{ filtreDateActif ? ' (période)' : '' }}</span>
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
                    <div *ngFor="let i of [1,2,3,4,5,6,7]" class="kpi-card">
                        <p-skeleton height="80px" borderRadius="1rem"></p-skeleton>
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
                <a [routerLink]="['/admin/analytiques']" class="ql-card ql-card--highlight">
                    <i class="pi pi-chart-line"></i>
                    <span>Analytiques & KPI</span>
                </a>
                <a *ngIf="isSuperAdmin" [routerLink]="['/admin/utilisateurs']" class="ql-card">
                    <i class="pi pi-users"></i>
                    <span>Gérer les admins</span>
                </a>
                <a *ngIf="isSuperAdmin" [routerLink]="['/admin/audit-log']" class="ql-card">
                    <i class="pi pi-shield"></i>
                    <span>Journal d'audit</span>
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

        .dash-kicker { margin: 0; font-size: 0.72rem; letter-spacing: 0.14em; color: #6366f1; font-weight: 700; }
        .dash-header {
            display: flex; align-items: flex-start; justify-content: space-between;
            flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem;
        }
        .dash-header h1 { margin: 0.3rem 0; font-size: 1.7rem; color: var(--text-color, #0f172a); }
        .dash-header p  { margin: 0; color: var(--text-color-secondary, #64748b); }
        .dash-controls  { display: flex; align-items: center; gap: .6rem; flex-wrap: wrap; }
        .dash-date-filter { display: flex; align-items: center; gap: .4rem; }
        :host ::ng-deep .dash-datepicker { width: 220px; }
        :host ::ng-deep .dash-datepicker input { font-size: .85rem; }
        .dash-clear-btn { height: 38px; }

        /* Bandeau filtre actif */
        .dash-filter-banner {
            display: flex; align-items: center; gap: .6rem;
            background: rgba(99,102,241,0.09);
            border: 1px solid rgba(99,102,241,0.25);
            border-radius: .75rem; padding: .6rem 1rem; margin-bottom: 1rem;
            font-size: .85rem; color: var(--text-color, #374151);
        }
        .dash-filter-banner i { color: #6366f1; }
        .dash-filter-close {
            margin-left: auto; background: none; border: none; cursor: pointer;
            color: #6366f1; font-size: .82rem; display: flex; align-items: center; gap: .3rem;
        }
        .dash-filter-close:hover { text-decoration: underline; }

        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem; margin-bottom: 1.5rem;
        }
        .kpi-card {
            background: var(--surface-card, #fff);
            border: 1px solid var(--surface-border, rgba(15,23,42,.08));
            border-radius: 1rem; padding: 1.1rem;
            display: flex; align-items: center; gap: 1rem;
            transition: transform .2s, box-shadow .2s;
        }
        .kpi-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,.08); }
        .kpi-icon {
            width: 48px; height: 48px; border-radius: 12px;
            display: flex; align-items: center; justify-content: center;
            font-size: 1.4rem; flex-shrink: 0;
        }
        .kpi-total   .kpi-icon { background: #eff6ff; color: #3b82f6; }
        .kpi-attente .kpi-icon { background: #fef3c7; color: #d97706; }
        .kpi-livrees .kpi-icon { background: #dcfce7; color: #16a34a; }
        .kpi-ca      .kpi-icon { background: #f0fdf4; color: #15803d; }
        .kpi-produits .kpi-icon { background: #f3e8ff; color: #9333ea; }
        .kpi-en-cours .kpi-icon { background: #eff6ff; color: #2563eb; }
        .kpi-annulees .kpi-icon { background: #fef2f2; color: #dc2626; }
        .kpi-value { display: block; font-size: 1.3rem; font-weight: 700; color: var(--text-color, #0f172a); line-height: 1.2; }
        .kpi-label { font-size: 0.76rem; color: var(--text-color-secondary, #64748b); }

        .quick-links { display: flex; flex-wrap: wrap; gap: .8rem; margin-bottom: 1.5rem; }
        .ql-card {
            display: flex; align-items: center; gap: .6rem;
            padding: .7rem 1.1rem;
            border: 1px solid var(--surface-border, rgba(15,23,42,.1));
            border-radius: .75rem;
            background: var(--surface-card, #fff);
            color: var(--text-color, #334155);
            text-decoration: none; font-size: .9rem;
            transition: background .18s, border-color .18s;
        }
        .ql-card:hover { background: var(--highlight-bg, #f1f5f9); border-color: #6366f1; color: #6366f1; }
        .ql-card--highlight { border-color: rgba(99,102,241,0.3); }
        .ql-card i { font-size: 1.1rem; }

        .recentes-section h2 { font-size: 1.2rem; color: var(--text-color, #0f172a); margin-bottom: 1rem; }

        @media (max-width: 640px) {
            .admin-dashboard { padding: 1rem; }
            .dash-header { flex-direction: column; }
            .dash-controls { width: 100%; flex-direction: column; align-items: stretch; }
            .dash-header h1 { font-size: 1.4rem; }
            .kpi-grid { grid-template-columns: 1fr 1fr; }
            .quick-links { flex-direction: column; }
            .ql-card { width: 100%; }
            :host ::ng-deep .dash-datepicker { width: 100% !important; }
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

    plageDate: Date[] = [];
    filtreDateActif = false;

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

    onDateChange(): void {
        if (this.plageDate?.length === 2 && this.plageDate[0] && this.plageDate[1]) {
            this.filtreDateActif = true;
            this.charger();
        }
    }

    effacerFiltre(): void {
        this.plageDate = [];
        this.filtreDateActif = false;
        this.charger();
    }

    charger(): void {
        this.chargement = true;
        const debut = this.filtreDateActif ? this.plageDate[0] : null;
        const fin   = this.filtreDateActif ? (this.plageDate[1] ?? this.plageDate[0]) : null;

        this.dashboardService.getStats(debut, fin).subscribe({
            next: (s) => { this.stats = s; this.chargement = false; },
            error: () => { this.chargement = false; }
        });
        this.dashboardService.getCommandesRecentes().subscribe({
            next: (c) => { this.commandesRecentes = c; }
        });
    }

    statutSeverity(statut: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        const m: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
            EN_ATTENTE: 'warn', CONFIRMEE: 'info', EN_COURS: 'info',
            EXPEDIEE: 'info', VALIDEE: 'success', LIVREE: 'success',
            ANNULEE: 'danger', STANDBY: 'secondary'
        };
        return m[statut] ?? 'secondary';
    }

    formatDate(date: string | Date | null | undefined): string {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
}
