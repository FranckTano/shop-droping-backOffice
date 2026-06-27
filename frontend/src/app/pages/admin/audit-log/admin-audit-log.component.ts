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
          <div class="audit-table-scroll">
            <p-table [value]="entrees" [loading]="chargement"
                     [rows]="taille" [totalRecords]="totalElements"
                     [lazy]="true" (onLazyLoad)="onLazyLoad($event)"
                     [paginator]="true" [rowsPerPageOptions]="[15,30,50]"
                     paginatorDropdownAppendTo="body"
                     styleClass="p-datatable-sm p-datatable-gridlines"
                     [tableStyle]="{'min-width':'700px'}">

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
          </div><!-- /audit-table-scroll -->
        </div>

    </div>
    `,
    styles: [`
        /* ── Shell ── */
        .audit-shell { padding: 1.5rem; font-family:'Poppins','Segoe UI',sans-serif; }

        /* ── Header ── */
        .audit-kicker { margin:0; font-size:.72rem; letter-spacing:.14em; color:#6366f1; font-weight:700; }
        .audit-header { display:flex; justify-content:space-between; align-items:flex-start;
                        flex-wrap:wrap; gap:.75rem; margin-bottom:1.25rem; }
        .audit-header h1 { margin:.25rem 0; font-size:1.5rem; color:var(--p-text-color); }
        .audit-header p  { margin:0; color:var(--p-text-muted-color); font-size:.86rem; }
        .audit-stats { display:flex; align-items:center; }
        .audit-stat-chip { display:flex; align-items:center; gap:.4rem; background:var(--p-primary-color);
                           color:#fff; padding:.35rem .75rem; border-radius:999px; font-size:.8rem; font-weight:600; }

        /* ── Filtres ── */
        .audit-filtres {
            display: flex; align-items: flex-end; flex-wrap: wrap; gap: .75rem;
            background: var(--p-surface-card);
            border: 1px solid var(--p-surface-200);
            border-radius: .875rem; padding: .9rem 1rem; margin-bottom: 1rem;
        }
        .audit-filtre-group {
            display: flex; flex-direction: column; gap: .4rem;
            min-width: 0; flex: 1 1 180px;
        }
        .audit-filtre-group label {
            font-size: .73rem; font-weight: 600; color: var(--p-text-muted-color);
            text-transform: uppercase; letter-spacing: .05em;
        }
        .audit-input { width: 100%; font-size: .86rem; }
        :host ::ng-deep .audit-select { width: 100% !important; font-size: .86rem; }
        :host ::ng-deep .audit-select .p-select { width: 100% !important; }
        .audit-reset-btn { height: 38px; align-self: flex-end; flex-shrink: 0; }

        /* ── Table wrapper (scroll horizontal mobile) ── */
        .audit-table-card {
            background:var(--p-surface-card);
            border:1px solid var(--p-surface-200);
            border-radius:.875rem;
            overflow: hidden;
        }
        .audit-table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }

        :host ::ng-deep .p-datatable .p-datatable-thead > tr > th {
            background:var(--p-surface-50) !important;
            font-size:.78rem; font-weight:700; text-transform:uppercase; letter-spacing:.05em;
            color:var(--p-text-muted-color) !important;
            padding:.65rem .85rem !important;
            border-bottom: 2px solid var(--p-surface-200) !important;
            white-space: nowrap;
        }
        :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td {
            padding: .55rem .85rem !important; vertical-align:middle;
            border-bottom: 1px solid var(--p-surface-100) !important;
        }
        :host ::ng-deep .p-datatable .p-datatable-tbody > tr:hover > td {
            background: color-mix(in srgb, var(--p-primary-color) 5%, transparent) !important;
        }

        /* ── Cells ── */
        .audit-date-day  { display:block; font-size:.8rem; color:var(--p-text-color); font-weight:500; }
        .audit-date-time { display:block; font-size:.7rem; color:var(--p-text-muted-color); }

        .audit-admin { display:flex; align-items:center; gap:.5rem; }
        .audit-admin-avatar { width:28px; height:28px; border-radius:50%;
                              background:linear-gradient(135deg,#6366f1,#8b5cf6);
                              color:#fff; display:flex; align-items:center; justify-content:center;
                              font-size:.65rem; font-weight:700; flex-shrink:0; }
        .audit-admin-nom   { font-size:.8rem; font-weight:600; color:var(--p-text-color); white-space:nowrap; }
        .audit-admin-login { font-size:.68rem; color:var(--p-text-muted-color); }

        .audit-ref  { font-size:.8rem; color:var(--p-primary-color); font-weight:500; }
        .audit-id   { color:var(--p-text-muted-color); font-size:.76rem; }
        .audit-desc { font-size:.81rem; color:var(--p-text-color); max-width:300px;
                      white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

        .audit-empty { display:flex; flex-direction:column; align-items:center;
                       justify-content:center; gap:.65rem; padding:2.5rem 1rem;
                       color:var(--p-text-muted-color); }

        /* ── Paginator ── */
        :host ::ng-deep .p-paginator {
            border-top: 1px solid var(--p-surface-200) !important;
            background:var(--p-surface-card) !important;
            flex-wrap: wrap;
            gap: .5rem;
            padding: .5rem !important;
        }

        /* ═══════════════════════════════ RESPONSIVE ═══════════════════════════════ */

        /* Tablette large (≤ 991px) — sidebar overlay, contenu pleine largeur */
        @media(max-width: 991px) {
            .audit-shell { padding: 1.25rem; }
            .audit-filtres { gap: .6rem; }
            .audit-filtre-group { flex: 1 1 200px; }
        }

        /* Tablette (≤ 768px) — 2 filtres par ligne */
        @media(max-width: 768px) {
            .audit-shell { padding: 1rem; }
            .audit-header { flex-direction: column; align-items: flex-start; gap: .5rem; }
            .audit-header h1 { font-size: 1.3rem; }
            .audit-header p  { font-size: .82rem; }
            .audit-filtres { gap: .6rem; padding: .85rem; }
            .audit-filtre-group { flex: 1 1 calc(50% - .3rem); }
        }

        /* Mobile (≤ 600px) — filtres style formulaire pleine largeur */
        @media(max-width: 600px) {
            .audit-shell { padding: .75rem; }
            /* align-items: stretch est crucial : en flex-direction:column,
               flex-end alignerait les items à droite (axe transversal = horizontal) */
            .audit-filtres {
                flex-direction: column;
                align-items: stretch;
                gap: .6rem;
                padding: .8rem;
            }
            /* width:100% car flex: 1 1 100% en mode colonne = 100% de hauteur, pas largeur */
            .audit-filtre-group { flex: none; width: 100%; }
            /* reset align-self:flex-end qui pousserait le btn à droite en mode colonne */
            .audit-reset-btn { width: 100%; justify-content: center; align-self: auto; }
            .audit-header h1 { font-size: 1.2rem; }
            .audit-stat-chip { font-size: .75rem; }
            .audit-desc { max-width: 140px; }
            .audit-table-card { border-left: none; border-right: none; border-radius: 0; margin: 0 -.75rem; }
        }

        /* Très petit (≤ 480px) */
        @media(max-width: 480px) {
            .audit-shell { padding: .6rem; }
            .audit-filtres { padding: .6rem; }
            .audit-header h1 { font-size: 1.15rem; }
            .audit-kicker { font-size: .68rem; }
            :host ::ng-deep .p-paginator { padding: .4rem .3rem !important; }
            :host ::ng-deep .p-paginator .p-paginator-page,
            :host ::ng-deep .p-paginator .p-paginator-prev,
            :host ::ng-deep .p-paginator .p-paginator-next { min-width: 2rem !important; height: 2rem !important; }
        }

        /* Très petit (≤ 400px) */
        @media(max-width: 400px) {
            .audit-shell { padding: .5rem; }
            .audit-filtres { padding: .5rem; }
            .audit-header h1 { font-size: 1.05rem; }
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
