import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuditLogService, AuditLogEntry, TypeEntite } from '../../../../services/audit-log.service';

interface FiltreAudit {
    username: string;
    typeEntite: TypeEntite | '';
    joursHistorique: number;
}

@Component({
    selector: 'app-admin-audit-log',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, TagModule, InputTextModule,
              SelectModule, ButtonModule, CardModule, SkeletonModule, TooltipModule],
    template: `
    <div class="audit-shell">

        <!-- ── Header ── -->
        <div class="audit-header">
            <div>
                <p class="audit-kicker">SUPER ADMIN</p>
                <h1>Journal d'audit</h1>
                <p>Traçabilité complète des actions effectuées par les administrateurs</p>
            </div>
            <div class="audit-stats" *ngIf="totalElements > 0">
                <div class="audit-stat-chip">
                    <i class="pi pi-list"></i>
                    <span>{{ totalElements | number }} entrées</span>
                </div>
            </div>
        </div>

        <!-- ── Filtres ── -->
        <div class="audit-filtres">
            <div class="audit-filtre-group">
                <label>Administrateur</label>
                <span class="p-input-icon-left">
                    <i class="pi pi-search"></i>
                    <input pInputText type="text" [(ngModel)]="filtre.username"
                           placeholder="Nom d'utilisateur..." (ngModelChange)="onUsernameChange()"
                           class="audit-input" />
                </span>
            </div>
            <div class="audit-filtre-group">
                <label>Type d'entité</label>
                <p-select [options]="typeEntiteOptions" [(ngModel)]="filtre.typeEntite"
                          optionLabel="label" optionValue="value"
                          placeholder="Toutes les entités"
                          (onChange)="recharger()" styleClass="audit-select">
                </p-select>
            </div>
            <div class="audit-filtre-group">
                <label>Période</label>
                <p-select [options]="periodeOptions" [(ngModel)]="filtre.joursHistorique"
                          optionLabel="label" optionValue="value"
                          (onChange)="recharger()" styleClass="audit-select">
                </p-select>
            </div>
            <button pButton icon="pi pi-times" label="Réinitialiser"
                    class="p-button-outlined p-button-sm audit-reset-btn"
                    (click)="reinitialiser()">
            </button>
        </div>

        <!-- ── Tableau ── -->
        <div class="audit-table-card">
            <p-table [value]="entrees" [loading]="chargement"
                     [rows]="taille" [totalRecords]="totalElements"
                     [lazy]="true" (onLazyLoad)="onLazyLoad($event)"
                     [paginator]="true" [rowsPerPageOptions]="[15,30,50]"
                     paginatorDropdownAppendTo="body"
                     styleClass="p-datatable-sm p-datatable-gridlines"
                     [tableStyle]="{'min-width':'900px'}">

                <ng-template pTemplate="header">
                    <tr>
                        <th style="width:160px">Date &amp; heure</th>
                        <th style="width:150px">Administrateur</th>
                        <th style="width:130px">Action</th>
                        <th style="width:120px">Entité</th>
                        <th style="width:100px">Réf.</th>
                        <th>Description</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-log>
                    <tr class="audit-row">
                        <td>
                            <div class="audit-date">
                                <span class="audit-date-day">{{ formatDate(log.createdAt) }}</span>
                                <span class="audit-date-time">{{ formatHeure(log.createdAt) }}</span>
                            </div>
                        </td>
                        <td>
                            <div class="audit-admin">
                                <div class="audit-admin-avatar">{{ initiales(log.adminNom) }}</div>
                                <div>
                                    <div class="audit-admin-nom">{{ log.adminNom || log.adminUsername }}</div>
                                    <div class="audit-admin-login">&#64;{{ log.adminUsername }}</div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <p-tag [value]="labelAction(log.typeAction)"
                                   [severity]="severityAction(log.typeAction)">
                            </p-tag>
                        </td>
                        <td>
                            <p-tag [value]="labelEntite(log.typeEntite)"
                                   [severity]="severityEntite(log.typeEntite)"
                                   [style]="{'font-size':'0.72rem'}">
                            </p-tag>
                        </td>
                        <td class="audit-ref">
                            <span *ngIf="log.entiteReference" [pTooltip]="'ID: ' + log.entiteId">
                                {{ log.entiteReference }}
                            </span>
                            <span *ngIf="!log.entiteReference && log.entiteId" class="audit-id">
                                #{{ log.entiteId }}
                            </span>
                        </td>
                        <td class="audit-desc">{{ log.description }}</td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="6">
                            <div class="audit-empty">
                                <i class="pi pi-shield" style="font-size:2.5rem;opacity:.25"></i>
                                <p>Aucune entrée d'audit pour les critères sélectionnés.</p>
                            </div>
                        </td>
                    </tr>
                </ng-template>

            </p-table>
        </div>

    </div>
    `,
    styles: [`
        .audit-shell { padding: 1.5rem; font-family:'Poppins','Segoe UI',sans-serif; }

        /* ── Header ── */
        .audit-kicker { margin:0; font-size:.72rem; letter-spacing:.14em; color:#6366f1; font-weight:700; }
        .audit-header { display:flex; justify-content:space-between; align-items:flex-start;
                        flex-wrap:wrap; gap:1rem; margin-bottom:1.5rem; }
        .audit-header h1 { margin:.3rem 0; font-size:1.6rem; color:var(--text-color,#0f172a); }
        .audit-header p { margin:0; color:var(--text-color-secondary,#64748b); font-size:.88rem; }
        .audit-stats { display:flex; align-items:center; }
        .audit-stat-chip { display:flex; align-items:center; gap:.4rem; background:var(--primary-color,#6366f1);
                           color:#fff; padding:.4rem .8rem; border-radius:999px; font-size:.82rem; font-weight:600; }

        /* ── Filtres ── */
        .audit-filtres { display:flex; align-items:flex-end; flex-wrap:wrap; gap:.8rem;
                         background:var(--surface-card,#fff);
                         border:1px solid var(--surface-border,rgba(15,23,42,.08));
                         border-radius:1rem; padding:1rem 1.2rem; margin-bottom:1.2rem; }
        .audit-filtre-group { display:flex; flex-direction:column; gap:.3rem; }
        .audit-filtre-group label { font-size:.75rem; font-weight:600; color:var(--text-color-secondary,#64748b);
                                    text-transform:uppercase; letter-spacing:.05em; }
        .audit-input { width:210px; font-size:.87rem; }
        :host ::ng-deep .audit-select { width:190px; font-size:.87rem; }
        .audit-reset-btn { height:38px; align-self:flex-end; }

        /* ── Table ── */
        .audit-table-card { background:var(--surface-card,#fff);
                            border:1px solid var(--surface-border,rgba(15,23,42,.08));
                            border-radius:1rem; overflow:hidden; }
        :host ::ng-deep .p-datatable .p-datatable-thead > tr > th {
            background:var(--surface-section,#f8fafc) !important;
            font-size:.8rem; font-weight:700; text-transform:uppercase; letter-spacing:.05em;
            color:var(--text-color-secondary,#64748b) !important;
            padding:.7rem .9rem !important;
            border-bottom: 2px solid var(--surface-border,rgba(15,23,42,.08)) !important;
        }
        :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td {
            padding: .6rem .9rem !important; vertical-align:middle;
            border-bottom: 1px solid var(--surface-border,rgba(15,23,42,.06)) !important;
        }
        :host ::ng-deep .p-datatable .p-datatable-tbody > tr:hover > td {
            background: var(--highlight-bg, rgba(99,102,241,0.04)) !important;
        }

        /* ── Cells ── */
        .audit-date-day { display:block; font-size:.82rem; color:var(--text-color,#374151); font-weight:500; }
        .audit-date-time { display:block; font-size:.72rem; color:var(--text-color-secondary,#94a3b8); }

        .audit-admin { display:flex; align-items:center; gap:.6rem; }
        .audit-admin-avatar { width:30px; height:30px; border-radius:50%;
                              background:linear-gradient(135deg,#6366f1,#8b5cf6);
                              color:#fff; display:flex; align-items:center; justify-content:center;
                              font-size:.7rem; font-weight:700; flex-shrink:0; }
        .audit-admin-nom { font-size:.82rem; font-weight:600; color:var(--text-color,#374151); }
        .audit-admin-login { font-size:.7rem; color:var(--text-color-secondary,#94a3b8); }

        .audit-ref { font-size:.82rem; color:var(--primary-color,#6366f1); font-weight:500; }
        .audit-id { color:var(--text-color-secondary,#94a3b8); font-size:.78rem; }
        .audit-desc { font-size:.83rem; color:var(--text-color,#374151); max-width:340px;
                      white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

        .audit-empty { display:flex; flex-direction:column; align-items:center;
                       justify-content:center; gap:.7rem; padding:3rem 1rem;
                       color:var(--text-color-secondary,#94a3b8); }

        /* ── Pagination dark override ── */
        :host ::ng-deep .p-paginator { border-top: 1px solid var(--surface-border,rgba(15,23,42,.08)) !important;
                                       background:var(--surface-card,#fff) !important; }

        @media(max-width:700px) {
            .audit-filtres { flex-direction:column; }
            .audit-input, :host ::ng-deep .audit-select { width:100% !important; }
        }
    `]
})
export class AdminAuditLogComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    private usernameChange$ = new Subject<string>();

    chargement = true;
    entrees: AuditLogEntry[] = [];
    totalElements = 0;
    page = 0;
    taille = 15;

    filtre: FiltreAudit = { username: '', typeEntite: '', joursHistorique: 30 };

    typeEntiteOptions = [
        { label: 'Toutes les entités', value: '' },
        { label: 'Commandes', value: 'COMMANDE' as TypeEntite },
        { label: 'Produits',  value: 'PRODUIT'  as TypeEntite },
        { label: 'Utilisateurs', value: 'UTILISATEUR' as TypeEntite }
    ];

    periodeOptions = [
        { label: '7 derniers jours',  value: 7  },
        { label: '30 derniers jours', value: 30 },
        { label: '90 derniers jours', value: 90 },
        { label: '1 an',              value: 365 }
    ];

    constructor(private auditLogService: AuditLogService) {}

    ngOnInit(): void {
        this.usernameChange$.pipe(
            debounceTime(400),
            distinctUntilChanged(),
            takeUntil(this.destroy$)
        ).subscribe(() => this.recharger());

        this.recharger();
    }

    ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

    onUsernameChange(): void { this.usernameChange$.next(this.filtre.username); }

    onLazyLoad(event: any): void {
        this.page  = Math.floor((event.first ?? 0) / (event.rows ?? this.taille));
        this.taille = event.rows ?? this.taille;
        this.charger();
    }

    recharger(): void {
        this.page = 0;
        this.charger();
    }

    reinitialiser(): void {
        this.filtre = { username: '', typeEntite: '', joursHistorique: 30 };
        this.recharger();
    }

    private charger(): void {
        this.chargement = true;
        this.auditLogService.lister({
            username:        this.filtre.username || undefined,
            typeEntite:      (this.filtre.typeEntite as TypeEntite) || undefined,
            joursHistorique: this.filtre.joursHistorique,
            page:  this.page,
            taille: this.taille
        }).pipe(takeUntil(this.destroy$)).subscribe({
            next: (result) => {
                this.entrees       = result.content;
                this.totalElements = result.totalElements;
                this.chargement    = false;
            },
            error: () => { this.chargement = false; }
        });
    }

    // ── Formatage ──

    formatDate(date: string): string {
        return new Date(date).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' });
    }
    formatHeure(date: string): string {
        return new Date(date).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
    }
    initiales(nom: string | null): string {
        if (!nom) return '?';
        const parts = nom.trim().split(' ');
        return parts.length >= 2
            ? (parts[0][0] + parts[1][0]).toUpperCase()
            : nom.slice(0, 2).toUpperCase();
    }

    labelAction(action: string): string {
        const m: Record<string, string> = {
            CREATION: 'Création', MODIFICATION: 'Modification',
            SUPPRESSION: 'Suppression', CHANGEMENT_STATUT: 'Statut'
        };
        return m[action] ?? action;
    }
    severityAction(action: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        const m: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
            CREATION: 'success', MODIFICATION: 'info',
            SUPPRESSION: 'danger', CHANGEMENT_STATUT: 'warn'
        };
        return m[action] ?? 'secondary';
    }

    labelEntite(entite: string): string {
        const m: Record<string, string> = {
            COMMANDE: 'Commande', PRODUIT: 'Produit', UTILISATEUR: 'Utilisateur'
        };
        return m[entite] ?? entite;
    }
    severityEntite(entite: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        const m: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
            COMMANDE: 'info', PRODUIT: 'success', UTILISATEUR: 'warn'
        };
        return m[entite] ?? 'secondary';
    }
}
