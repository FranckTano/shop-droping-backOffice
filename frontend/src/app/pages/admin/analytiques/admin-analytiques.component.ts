import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
    KpiService, EvolutionMensuelle, RepartitionStatut, TopProduit, DataPoint
} from '../../../../services/kpi.service';

type Periode = '3M' | '6M' | '12M';

@Component({
    selector: 'app-admin-analytiques',
    standalone: true,
    imports: [CommonModule, FormsModule, ChartModule, CardModule, SkeletonModule,
              SelectButtonModule, ToastModule],
    providers: [MessageService],
    template: `
    <p-toast></p-toast>
    <div class="ana-shell">

        <!-- ── En-tête ── -->
        <div class="ana-header">
            <div>
                <p class="ana-kicker">ANALYTIQUES</p>
                <h1>KPI & Performances</h1>
                <p>Indicateurs clés basés sur les commandes confirmées</p>
            </div>
            <div class="ana-controls">
                <p-selectButton [options]="periodeOptions" [(ngModel)]="periode"
                                optionLabel="label" optionValue="value"
                                (onChange)="changerPeriode()">
                </p-selectButton>
                <button class="ana-refresh-btn" (click)="charger()" [class.spinning]="chargement">
                    <i class="pi pi-refresh"></i>
                </button>
            </div>
        </div>

        <!-- ── KPI Summary Cards ── -->
        <div class="ana-kpi-row" *ngIf="!chargement; else skeletonCards">
            <div class="ana-kpi-card ana-kpi--ca">
                <div class="ana-kpi-icon"><i class="pi pi-wallet"></i></div>
                <div class="ana-kpi-body">
                    <span class="ana-kpi-val">{{ totalCA | number:'1.0-0' }} FCFA</span>
                    <span class="ana-kpi-lbl">CA Total (confirmé)</span>
                </div>
            </div>
            <div class="ana-kpi-card ana-kpi--cmd">
                <div class="ana-kpi-icon"><i class="pi pi-shopping-cart"></i></div>
                <div class="ana-kpi-body">
                    <span class="ana-kpi-val">{{ totalCommandes | number }}</span>
                    <span class="ana-kpi-lbl">Commandes sur la période</span>
                </div>
            </div>
            <div class="ana-kpi-card ana-kpi--taux">
                <div class="ana-kpi-icon"><i class="pi pi-chart-line"></i></div>
                <div class="ana-kpi-body">
                    <span class="ana-kpi-val">{{ tauxConfirmation | number:'1.0-1' }}%</span>
                    <span class="ana-kpi-lbl">Taux de confirmation</span>
                </div>
            </div>
            <div class="ana-kpi-card ana-kpi--panier">
                <div class="ana-kpi-icon"><i class="pi pi-tag"></i></div>
                <div class="ana-kpi-body">
                    <span class="ana-kpi-val">{{ panierMoyen | number:'1.0-0' }} FCFA</span>
                    <span class="ana-kpi-lbl">Panier moyen</span>
                </div>
            </div>
            <div class="ana-kpi-card ana-kpi--annul">
                <div class="ana-kpi-icon"><i class="pi pi-times-circle"></i></div>
                <div class="ana-kpi-body">
                    <span class="ana-kpi-val">{{ totalAnnulees | number }}</span>
                    <span class="ana-kpi-lbl">Commandes annulées</span>
                </div>
            </div>
            <div class="ana-kpi-card ana-kpi--livr">
                <div class="ana-kpi-icon"><i class="pi pi-check-circle"></i></div>
                <div class="ana-kpi-body">
                    <span class="ana-kpi-val">{{ tauxLivraison | number:'1.0-1' }}%</span>
                    <span class="ana-kpi-lbl">Taux de livraison</span>
                </div>
            </div>
        </div>

        <ng-template #skeletonCards>
            <div class="ana-kpi-row">
                <div *ngFor="let i of [1,2,3,4,5,6]" class="ana-kpi-card">
                    <p-skeleton height="80px" borderRadius="1rem"></p-skeleton>
                </div>
            </div>
        </ng-template>

        <!-- ── Grille des charts ── -->
        <div class="ana-charts-grid" *ngIf="!chargement; else skeletonCharts">

            <!-- Chart 1 : Évolution CA mensuel (Line) -->
            <div class="ana-chart-card ana-chart--wide">
                <div class="ana-chart-header">
                    <h3>Évolution du CA mensuel</h3>
                    <span class="ana-chart-badge ana-badge--green">Commandes confirmées</span>
                </div>
                <p-chart type="line" [data]="chartCAMensuel" [options]="optionsLine"
                         height="280px"></p-chart>
            </div>

            <!-- Chart 2 : Volume de commandes par mois (Bar groupé) -->
            <div class="ana-chart-card ana-chart--wide">
                <div class="ana-chart-header">
                    <h3>Volume de commandes par mois</h3>
                    <span class="ana-chart-badge ana-badge--blue">Toutes catégories</span>
                </div>
                <p-chart type="bar" [data]="chartVolumeCommandes" [options]="optionsBar"
                         height="280px"></p-chart>
            </div>

            <!-- Chart 3 : Répartition des statuts (Donut) -->
            <div class="ana-chart-card">
                <div class="ana-chart-header">
                    <h3>Répartition par statut</h3>
                    <span class="ana-chart-badge ana-badge--purple">Toutes commandes</span>
                </div>
                <p-chart type="doughnut" [data]="chartRepartitionStatuts"
                         [options]="optionsDonut" height="260px"></p-chart>
            </div>

            <!-- Chart 4 : Top produits (Bar horizontal) -->
            <div class="ana-chart-card">
                <div class="ana-chart-header">
                    <h3>Top 10 produits (CA)</h3>
                    <span class="ana-chart-badge ana-badge--orange">Commandes confirmées</span>
                </div>
                <p-chart type="bar" [data]="chartTopProduits" [options]="optionsBarH"
                         height="260px"></p-chart>
            </div>

            <!-- Chart 5 : Commandes par jour de semaine (Bar) -->
            <div class="ana-chart-card">
                <div class="ana-chart-header">
                    <h3>Activité par jour de semaine</h3>
                    <span class="ana-chart-badge ana-badge--blue">90 derniers jours</span>
                </div>
                <p-chart type="bar" [data]="chartJourSemaine" [options]="optionsBarSimple"
                         height="260px"></p-chart>
            </div>

            <!-- Chart 6 : Confirmées vs Annulées vs Livrées (Line multi) -->
            <div class="ana-chart-card">
                <div class="ana-chart-header">
                    <h3>Confirmées vs Annulées</h3>
                    <span class="ana-chart-badge ana-badge--red">Comparaison mensuelle</span>
                </div>
                <p-chart type="line" [data]="chartComparaison" [options]="optionsLineSmall"
                         height="260px"></p-chart>
            </div>

        </div>

        <ng-template #skeletonCharts>
            <div class="ana-charts-grid">
                <div class="ana-chart-card ana-chart--wide"><p-skeleton height="320px" borderRadius="1rem"></p-skeleton></div>
                <div class="ana-chart-card ana-chart--wide"><p-skeleton height="320px" borderRadius="1rem"></p-skeleton></div>
                <div class="ana-chart-card"><p-skeleton height="300px" borderRadius="1rem"></p-skeleton></div>
                <div class="ana-chart-card"><p-skeleton height="300px" borderRadius="1rem"></p-skeleton></div>
                <div class="ana-chart-card"><p-skeleton height="300px" borderRadius="1rem"></p-skeleton></div>
                <div class="ana-chart-card"><p-skeleton height="300px" borderRadius="1rem"></p-skeleton></div>
            </div>
        </ng-template>

    </div>
    `,
    styles: [`
        .ana-shell { padding: 1.5rem; font-family: 'Poppins','Segoe UI',sans-serif; }

        /* ── Header ── */
        .ana-kicker { margin:0; font-size:.72rem; letter-spacing:.14em; color:#6366f1; font-weight:700; }
        .ana-header { display:flex; justify-content:space-between; align-items:flex-start;
                      flex-wrap:wrap; gap:1rem; margin-bottom:1.5rem; }
        .ana-header h1 { margin:.3rem 0; font-size:1.6rem; color:var(--text-color,#0f172a); }
        .ana-header p { margin:0; color:var(--text-color-secondary,#64748b); font-size:.88rem; }
        .ana-controls { display:flex; align-items:center; gap:.6rem; }
        .ana-refresh-btn { width:38px; height:38px; border-radius:50%; border:1px solid rgba(0,0,0,.1);
                           background:var(--surface-card,#fff); cursor:pointer; display:flex;
                           align-items:center; justify-content:center; transition:all .2s; color:var(--text-color,#374151); }
        .ana-refresh-btn:hover { background:var(--primary-color,#6366f1); color:#fff; border-color:transparent; }
        .ana-refresh-btn.spinning i { animation: spin .7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── KPI Summary Row ── */
        .ana-kpi-row { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
                       gap:.9rem; margin-bottom:1.5rem; }
        .ana-kpi-card { background:var(--surface-card,#fff);
                        border:1px solid var(--surface-border,rgba(15,23,42,.08));
                        border-radius:1rem; padding:1rem;
                        display:flex; align-items:center; gap:.8rem;
                        transition:transform .2s, box-shadow .2s; }
        .ana-kpi-card:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,.07); }
        .ana-kpi-icon { width:44px; height:44px; border-radius:.75rem;
                        display:flex; align-items:center; justify-content:center; font-size:1.2rem; flex-shrink:0; }
        .ana-kpi-val { display:block; font-size:1.15rem; font-weight:700; color:var(--text-color,#0f172a); line-height:1.2; }
        .ana-kpi-lbl { font-size:.72rem; color:var(--text-color-secondary,#64748b); }

        .ana-kpi--ca   .ana-kpi-icon { background:#f0fdf4; color:#15803d; }
        .ana-kpi--cmd  .ana-kpi-icon { background:#eff6ff; color:#2563eb; }
        .ana-kpi--taux .ana-kpi-icon { background:#f5f3ff; color:#7c3aed; }
        .ana-kpi--panier .ana-kpi-icon { background:#fff7ed; color:#c2410c; }
        .ana-kpi--annul .ana-kpi-icon { background:#fef2f2; color:#dc2626; }
        .ana-kpi--livr  .ana-kpi-icon { background:#ecfdf5; color:#059669; }

        /* ── Charts Grid ── */
        .ana-charts-grid { display:grid;
                           grid-template-columns: repeat(2, 1fr);
                           gap:1.2rem; }
        .ana-chart-card { background:var(--surface-card,#fff);
                          border:1px solid var(--surface-border,rgba(15,23,42,.08));
                          border-radius:1rem; padding:1.3rem; }
        .ana-chart--wide { grid-column: span 2; }
        .ana-chart-header { display:flex; align-items:center; justify-content:space-between;
                            margin-bottom:1rem; flex-wrap:wrap; gap:.4rem; }
        .ana-chart-header h3 { margin:0; font-size:1rem; font-weight:600;
                               color:var(--text-color,#0f172a); }
        .ana-chart-badge { font-size:.7rem; font-weight:600; padding:.2rem .65rem;
                           border-radius:999px; white-space:nowrap; }
        .ana-badge--green  { background:#dcfce7; color:#166534; }
        .ana-badge--blue   { background:#dbeafe; color:#1d4ed8; }
        .ana-badge--purple { background:#ede9fe; color:#6d28d9; }
        .ana-badge--orange { background:#ffedd5; color:#c2410c; }
        .ana-badge--red    { background:#fee2e2; color:#b91c1c; }

        @media (max-width: 900px) {
            .ana-charts-grid { grid-template-columns: 1fr; }
            .ana-chart--wide { grid-column: span 1; }
            .ana-kpi-row { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 520px) {
            .ana-shell { padding: 1rem; }
            .ana-kpi-row { grid-template-columns: 1fr 1fr; }
        }
    `]
})
export class AdminAnalytiquesComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    chargement = true;
    periode: Periode = '12M';
    periodeOptions = [
        { label: '3 mois', value: '3M' },
        { label: '6 mois', value: '6M' },
        { label: '12 mois', value: '12M' }
    ];

    // Données brutes
    evolution: EvolutionMensuelle[] = [];
    repartition: RepartitionStatut[] = [];
    topProduits: TopProduit[] = [];
    joursSemaine: DataPoint[] = [];

    // Métriques calculées
    totalCA = 0;
    totalCommandes = 0;
    totalConfirmees = 0;
    totalAnnulees = 0;
    totalLivrees = 0;
    tauxConfirmation = 0;
    tauxLivraison = 0;
    panierMoyen = 0;

    // Datasets Chart.js
    chartCAMensuel: any       = {};
    chartVolumeCommandes: any = {};
    chartRepartitionStatuts: any = {};
    chartTopProduits: any     = {};
    chartJourSemaine: any     = {};
    chartComparaison: any     = {};

    // Options Chart.js
    readonly optionsLine    = this.buildLineOptions(false);
    readonly optionsLineSmall = this.buildLineOptions(true);
    readonly optionsBar     = this.buildBarOptions(false, false);
    readonly optionsBarSimple = this.buildBarOptions(false, false);
    readonly optionsBarH    = this.buildBarOptions(true, false);
    readonly optionsDonut   = this.buildDonutOptions();

    constructor(private kpiService: KpiService) {}

    ngOnInit(): void { this.charger(); }
    ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

    charger(): void {
        this.chargement = true;
        forkJoin({
            evolution:    this.kpiService.getEvolutionMensuelle(),
            repartition:  this.kpiService.getRepartitionStatuts(),
            topProduits:  this.kpiService.getTopProduits(),
            joursSemaine: this.kpiService.getCommandesParJourSemaine()
        }).pipe(takeUntil(this.destroy$)).subscribe({
            next: (data) => {
                this.evolution    = data.evolution;
                this.repartition  = data.repartition;
                this.topProduits  = data.topProduits;
                this.joursSemaine = data.joursSemaine;
                this.calculerMetriques();
                this.construireCharts();
                this.chargement = false;
            },
            error: () => { this.chargement = false; }
        });
    }

    changerPeriode(): void {
        this.calculerMetriques();
        this.construireCharts();
    }

    private evolutionFiltered(): EvolutionMensuelle[] {
        const n = this.periode === '3M' ? 3 : this.periode === '6M' ? 6 : 12;
        return this.evolution.slice(-n);
    }

    private calculerMetriques(): void {
        const data = this.evolutionFiltered();
        this.totalCA          = data.reduce((s, d) => s + Number(d.caConfirmees), 0);
        this.totalCommandes   = data.reduce((s, d) => s + d.totalCommandes, 0);
        this.totalConfirmees  = data.reduce((s, d) => s + d.confirmees, 0);
        this.totalAnnulees    = data.reduce((s, d) => s + d.annulees, 0);
        this.totalLivrees     = data.reduce((s, d) => s + d.livrees, 0);
        this.tauxConfirmation = this.totalCommandes > 0
            ? (this.totalConfirmees / this.totalCommandes) * 100 : 0;
        this.tauxLivraison    = this.totalCommandes > 0
            ? (this.totalLivrees / this.totalCommandes) * 100 : 0;
        this.panierMoyen      = this.totalConfirmees > 0
            ? this.totalCA / this.totalConfirmees : 0;
    }

    private construireCharts(): void {
        const data   = this.evolutionFiltered();
        const labels = data.map(d => this.formatMois(d.mois));
        const docStyle = getComputedStyle(document.documentElement);
        const textColor   = docStyle.getPropertyValue('--text-color').trim()          || '#374151';
        const gridColor   = docStyle.getPropertyValue('--surface-border').trim()      || 'rgba(0,0,0,0.06)';

        // 1 — CA mensuel (line)
        this.chartCAMensuel = {
            labels,
            datasets: [{
                label: 'CA confirmé (FCFA)',
                data: data.map(d => Number(d.caConfirmees)),
                fill: true,
                borderColor: '#16a34a',
                backgroundColor: 'rgba(22,163,74,0.10)',
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 7,
                borderWidth: 2.5
            }]
        };

        // 2 — Volume commandes (bar groupé)
        this.chartVolumeCommandes = {
            labels,
            datasets: [
                {
                    label: 'Total commandes',
                    data: data.map(d => d.totalCommandes),
                    backgroundColor: 'rgba(99,102,241,0.7)',
                    borderColor: '#6366f1',
                    borderWidth: 1.5,
                    borderRadius: 6
                },
                {
                    label: 'Confirmées',
                    data: data.map(d => d.confirmees),
                    backgroundColor: 'rgba(22,163,74,0.7)',
                    borderColor: '#16a34a',
                    borderWidth: 1.5,
                    borderRadius: 6
                },
                {
                    label: 'Livrées',
                    data: data.map(d => d.livrees),
                    backgroundColor: 'rgba(5,150,105,0.6)',
                    borderColor: '#059669',
                    borderWidth: 1.5,
                    borderRadius: 6
                }
            ]
        };

        // 3 — Répartition statuts (donut)
        const statutColors: Record<string, string> = {
            EN_ATTENTE: '#f59e0b', CONFIRMEE: '#6366f1', EN_COURS: '#3b82f6',
            EXPEDIEE: '#06b6d4', VALIDEE: '#10b981', LIVREE: '#16a34a',
            ANNULEE: '#ef4444', STANDBY: '#94a3b8'
        };
        const statutLabels: Record<string, string> = {
            EN_ATTENTE: 'En attente', CONFIRMEE: 'Confirmée', EN_COURS: 'En cours',
            EXPEDIEE: 'Expédiée', VALIDEE: 'Validée', LIVREE: 'Livrée',
            ANNULEE: 'Annulée', STANDBY: 'Standby'
        };
        this.chartRepartitionStatuts = {
            labels: this.repartition.map(r => statutLabels[r.statut] ?? r.statut),
            datasets: [{
                data: this.repartition.map(r => r.nb),
                backgroundColor: this.repartition.map(r => statutColors[r.statut] ?? '#94a3b8'),
                hoverOffset: 8,
                borderWidth: 2,
                borderColor: docStyle.getPropertyValue('--surface-card').trim() || '#fff'
            }]
        };

        // 4 — Top produits (bar horizontal)
        const top = this.topProduits.slice(0, 10);
        this.chartTopProduits = {
            labels: top.map(p => p.nom.length > 22 ? p.nom.slice(0, 20) + '…' : p.nom),
            datasets: [{
                label: 'CA (FCFA)',
                data: top.map(p => Number(p.caTotal)),
                backgroundColor: top.map((_, i) => `hsla(${220 + i * 14},70%,55%,0.80)`),
                borderRadius: 6,
                borderWidth: 0
            }]
        };

        // 5 — Commandes par jour semaine
        this.chartJourSemaine = {
            labels: this.joursSemaine.map(d => d.label),
            datasets: [{
                label: 'Commandes',
                data: this.joursSemaine.map(d => d.valeur),
                backgroundColor: 'rgba(99,102,241,0.75)',
                borderColor: '#6366f1',
                borderWidth: 1.5,
                borderRadius: 8
            }]
        };

        // 6 — Comparaison confirmées vs annulées (line multi)
        this.chartComparaison = {
            labels,
            datasets: [
                {
                    label: 'Confirmées',
                    data: data.map(d => d.confirmees),
                    borderColor: '#16a34a', backgroundColor: 'rgba(22,163,74,0.08)',
                    fill: true, tension: 0.4, pointRadius: 3, borderWidth: 2
                },
                {
                    label: 'Annulées',
                    data: data.map(d => d.annulees),
                    borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.08)',
                    fill: true, tension: 0.4, pointRadius: 3, borderWidth: 2
                },
                {
                    label: 'Livrées',
                    data: data.map(d => d.livrees),
                    borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.06)',
                    fill: false, tension: 0.4, pointRadius: 3, borderWidth: 1.5, borderDash: [4, 4]
                }
            ]
        };
    }

    private formatMois(iso: string): string {
        if (!iso) return '';
        const [year, month] = iso.split('-');
        const mois = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
        return `${mois[parseInt(month, 10) - 1]} ${year}`;
    }

    private buildLineOptions(compact: boolean): any {
        return {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } },
                tooltip: { callbacks: {
                    label: (ctx: any) => ` ${ctx.dataset.label}: ${Number(ctx.raw).toLocaleString('fr-FR')}${ctx.dataset.label.includes('FCFA') ? ' FCFA' : ''}`
                }}
            },
            scales: {
                x: { grid: { display: false }, ticks: { font: { size: compact ? 10 : 11 } } },
                y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: {
                    font: { size: 10 },
                    callback: (v: any) => v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v
                }}
            }
        };
    }

    private buildBarOptions(horizontal: boolean, stacked: boolean): any {
        return {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: horizontal ? 'y' as const : 'x' as const,
            plugins: {
                legend: { display: !horizontal, labels: { boxWidth: 12, font: { size: 11 } } },
                tooltip: { callbacks: {
                    label: (ctx: any) => ` ${ctx.dataset.label}: ${Number(ctx.raw).toLocaleString('fr-FR')}`
                }}
            },
            scales: {
                x: { stacked, grid: { display: horizontal } },
                y: { stacked, grid: { display: !horizontal, color: 'rgba(0,0,0,0.05)' } }
            }
        };
    }

    private buildDonutOptions(): any {
        return {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: { position: 'right' as const, labels: { boxWidth: 12, font: { size: 11 } } },
                tooltip: { callbacks: {
                    label: (ctx: any) => ` ${ctx.label}: ${ctx.raw} (${
                        ((ctx.raw / ctx.dataset.data.reduce((a: number, b: number) => a + b, 0)) * 100).toFixed(1)
                    }%)`
                }}
            }
        };
    }
}
