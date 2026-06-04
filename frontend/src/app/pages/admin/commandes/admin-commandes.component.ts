import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import { AdminCommandeService, Commande, StatutCommande } from '../../../../services/admin-commande.service';
import { environment } from '@environments/environment';

@Component({
    selector: 'app-admin-commandes',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, TagModule,
              DropdownModule, InputTextModule, DialogModule, ToastModule, DividerModule],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>

        <div class="cmd-shell">
            <div class="cmd-header">
                <div>
                    <p class="kicker">GESTION</p>
                    <h1>Commandes clients</h1>
                    <p>{{ commandes.length }} commande(s) au total</p>
                </div>
            </div>

            <!-- Filtres -->
            <div class="cmd-toolbar">
                <div class="filter-group">
                    <button *ngFor="let s of statutsFiltre"
                        pButton [label]="s.label"
                        [class.p-button-outlined]="filtreStatut !== s.value"
                        (click)="filtrer($any(s.value))"
                        class="p-button-sm">
                    </button>
                </div>
                <div class="search-wrap">
                    <i class="pi pi-search"></i>
                    <input type="text" [(ngModel)]="recherche" (input)="appliquerRecherche()"
                           placeholder="Client, N° commande..." />
                </div>
            </div>

            <!-- Table -->
            <p-table [value]="commandesFiltrees" [loading]="chargement" [paginator]="true" [rows]="15"
                     dataKey="id" styleClass="p-datatable-sm p-datatable-striped" responsiveLayout="scroll">
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="numero">N° <p-sortIcon field="numero"></p-sortIcon></th>
                        <th pSortableColumn="clientNom">Client <p-sortIcon field="clientNom"></p-sortIcon></th>
                        <th>Téléphone</th>
                        <th pSortableColumn="montantTotal">Total <p-sortIcon field="montantTotal"></p-sortIcon></th>
                        <th>Statut</th>
                        <th pSortableColumn="createdAt">Date <p-sortIcon field="createdAt"></p-sortIcon></th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-cmd>
                    <tr>
                        <td><strong class="cmd-numero">{{ cmd.numero }}</strong></td>
                        <td>{{ cmd.clientNom }}</td>
                        <td>{{ cmd.clientTelephone }}</td>
                        <td><strong>{{ cmd.montantTotal | number:'1.0-0' }} FCFA</strong></td>
                        <td>
                            <p-tag [value]="labelStatut(cmd.statut)" [severity]="statutSeverity(cmd.statut)"></p-tag>
                        </td>
                        <td>{{ formatDate(cmd.createdAt) }}</td>
                        <td>
                            <div class="action-btns">
                                <button pButton icon="pi pi-eye" class="p-button-text p-button-sm"
                                        pTooltip="Voir détails" (click)="ouvrirDetail(cmd)"></button>
                                <button pButton icon="pi pi-pencil" class="p-button-text p-button-sm"
                                        pTooltip="Changer statut" (click)="ouvrirChangementStatut(cmd)"></button>
                                <button pButton icon="pi pi-whatsapp" class="p-button-text p-button-sm p-button-success"
                                        pTooltip="Contacter via WhatsApp" (click)="ouvrirWhatsApp(cmd)"></button>
                            </div>
                        </td>
                    </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                    <tr><td colspan="7" class="text-center py-4">Aucune commande trouvée</td></tr>
                </ng-template>
            </p-table>
        </div>

        <!-- Dialog Détail -->
        <p-dialog [(visible)]="detailVisible" [header]="'Commande ' + (commandeSelectionnee?.numero ?? '')"
                  [modal]="true" [style]="{width: 'min(95vw, 700px)'}" [draggable]="false">
            <ng-container *ngIf="commandeSelectionnee as cmd">
                <div class="detail-grid">
                    <div>
                        <p class="detail-label">Client</p>
                        <p class="detail-value">{{ cmd.clientNom }}</p>
                    </div>
                    <div>
                        <p class="detail-label">Téléphone</p>
                        <p class="detail-value">{{ cmd.clientTelephone }}</p>
                    </div>
                    <div>
                        <p class="detail-label">Adresse</p>
                        <p class="detail-value">{{ cmd.clientAdresse || '-' }}</p>
                    </div>
                    <div>
                        <p class="detail-label">Notes</p>
                        <p class="detail-value">{{ cmd.notes || '-' }}</p>
                    </div>
                </div>

                <p-divider></p-divider>
                <h4>Articles commandés</h4>
                <div class="lignes-list">
                    <div *ngFor="let ligne of cmd.lignes" class="ligne-item">
                        <div class="ligne-img-wrap">
                            <img [src]="resolveImageUrl(ligne.produitImage)"
                                 [alt]="ligne.produitNom"
                                 (error)="onImgError($event)"
                                 class="ligne-img" />
                        </div>
                        <div class="ligne-infos">
                            <strong>{{ ligne.produitNom }}</strong>
                            <small>Taille {{ ligne.taille }} · {{ ligne.couleur }}</small>
                            <small *ngIf="ligne.badgesOfficiels">· Badges officiels</small>
                            <small *ngIf="ligne.flocage">· Flocage: {{ ligne.flocageNom }} {{ ligne.flocageNumero }}</small>
                        </div>
                        <div class="ligne-prix">
                            <span>x{{ ligne.quantite }}</span>
                            <strong>{{ ligne.prixTotal | number:'1.0-0' }} FCFA</strong>
                        </div>
                    </div>
                </div>
                <p-divider></p-divider>
                <div class="total-line">
                    <span>Total</span>
                    <strong>{{ cmd.montantTotal | number:'1.0-0' }} FCFA</strong>
                </div>
            </ng-container>
        </p-dialog>

        <!-- Dialog Changement Statut -->
        <p-dialog [(visible)]="statutVisible" header="Changer le statut"
                  [modal]="true" [style]="{width:'380px'}" [draggable]="false">
            <div class="field" style="padding: 0.5rem 0;">
                <label style="font-size:0.85rem;font-weight:600;color:#374151;display:block;margin-bottom:0.5rem;">Nouveau statut</label>
                <p-dropdown [options]="statutsOptions" [(ngModel)]="nouveauStatut"
                            optionLabel="label" optionValue="value"
                            appendTo="body"
                            styleClass="w-full"
                            placeholder="Sélectionner un statut"></p-dropdown>
            </div>
            <ng-template pTemplate="footer">
                <button pButton label="Annuler" icon="pi pi-times" class="p-button-text"
                        (click)="statutVisible = false"></button>
                <button pButton label="Confirmer" icon="pi pi-check" [disabled]="!nouveauStatut"
                        (click)="confirmerChangementStatut()"></button>
            </ng-template>
        </p-dialog>
    `,
    styles: [`
        .cmd-shell { padding: 1.5rem; font-family: 'Poppins', 'Segoe UI', sans-serif; }
        .kicker { margin: 0; font-size: .72rem; letter-spacing: .14em; color: #6366f1; font-weight: 700; }
        .cmd-header { display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.2rem; }
        .cmd-header h1 { margin: .3rem 0; font-size: 1.6rem; color: #0f172a; }
        .cmd-header p { margin: 0; color: #64748b; }
        .cmd-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: .6rem; margin-bottom: 1rem; }
        .filter-group { display: flex; flex-wrap: wrap; gap: .4rem; }
        .search-wrap { display: flex; align-items: center; gap: .5rem; padding: .5rem .9rem; border: 1px solid rgba(15,23,42,.1); border-radius: 999px; background: #fff; }
        .search-wrap input { border: none; outline: none; background: transparent; }
        .cmd-numero { color: #6366f1; font-family: monospace; }
        .action-btns { display: flex; gap: .2rem; }
        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .8rem; }
        .detail-label { margin: 0 0 .2rem; font-size: .78rem; color: #64748b; text-transform: uppercase; }
        .detail-value { margin: 0; font-weight: 600; color: #0f172a; }
        .lignes-list { display: flex; flex-direction: column; gap: .6rem; }
        .ligne-item { display: flex; align-items: center; gap: .75rem; padding: .6rem; background: #f8fafc; border-radius: .5rem; }
        .ligne-img-wrap { flex-shrink: 0; }
        .ligne-img { width: 72px; height: 72px; border-radius: .5rem; object-fit: cover; background: #e2e8f0; display: block; }
        .ligne-infos { flex: 1; min-width: 0; }
        .ligne-infos strong { display: block; color: #0f172a; }
        .ligne-infos small { display: block; color: #64748b; font-size: .8rem; }
        .ligne-prix { display: flex; flex-direction: column; align-items: end; gap: .2rem; color: #334155; white-space: nowrap; flex-shrink: 0; }
        .total-line { display: flex; justify-content: space-between; font-size: 1.1rem; }
        .total-line strong { color: #0f172a; }

        @media (max-width: 640px) {
            .cmd-shell { padding: 1rem; }
            .cmd-header h1 { font-size: 1.3rem; }
            .cmd-toolbar { flex-direction: column; align-items: stretch; }
            .search-wrap { width: 100%; }
            .filter-group { justify-content: center; }
            .detail-grid { grid-template-columns: 1fr; }
            .ligne-infos small { font-size: .75rem; }
        }
    `]
})
export class AdminCommandesComponent implements OnInit {
    commandes: Commande[] = [];
    commandesFiltrees: Commande[] = [];
    chargement = true;
    filtreStatut: StatutCommande | 'TOUS' = 'TOUS';
    recherche = '';

    detailVisible = false;
    statutVisible = false;
    commandeSelectionnee: Commande | null = null;
    nouveauStatut: StatutCommande | null = null;

    statutsFiltre = [
        { label: 'Toutes',     value: 'TOUS' },
        { label: 'En attente', value: 'EN_ATTENTE' },
        { label: 'Confirmées', value: 'CONFIRMEE' },
        { label: 'En cours',   value: 'EN_COURS' },
        { label: 'Expédiées',  value: 'EXPEDIEE' },
        { label: 'Livrées',    value: 'LIVREE' },
        { label: 'Annulées',   value: 'ANNULEE' },
        { label: 'Standby',    value: 'STANDBY' }
    ];

    statutsOptions = [
        { label: '🕐 En attente',        value: 'EN_ATTENTE' },
        { label: '✅ Confirmée',          value: 'CONFIRMEE' },
        { label: '📦 En cours (prépa.)', value: 'EN_COURS' },
        { label: '🚚 Expédiée',          value: 'EXPEDIEE' },
        { label: '✔️ Livrée',            value: 'LIVREE' },
        { label: '❌ Annulée',           value: 'ANNULEE' },
        { label: '⏸️ Standby',          value: 'STANDBY' }
    ];

    constructor(
        private commandeService: AdminCommandeService,
        private messageService: MessageService,
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void { this.charger(); }

    charger(): void {
        this.chargement = true;
        this.commandeService.listerToutes().subscribe({
            next: (data) => {
                this.commandes = data.sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                this.appliquerFiltres();
                this.chargement = false;
                /* Auto-ouvrir la commande si un ID est présent dans l'URL (lien WhatsApp) */
                const idParam = this.route.snapshot.paramMap.get('id');
                if (idParam) {
                    const id = parseInt(idParam, 10);
                    const cible = this.commandes.find(c => c.id === id);
                    if (cible) {
                        setTimeout(() => this.ouvrirDetail(cible), 350);
                    }
                }
            },
            error: () => { this.chargement = false; }
        });
    }

    filtrer(statut: StatutCommande | 'TOUS'): void {
        this.filtreStatut = statut;
        this.appliquerFiltres();
    }

    appliquerRecherche(): void { this.appliquerFiltres(); }

    private appliquerFiltres(): void {
        let base = this.filtreStatut === 'TOUS'
            ? this.commandes
            : this.commandes.filter(c => c.statut === this.filtreStatut);

        const q = this.recherche.trim().toLowerCase();
        if (q) {
            base = base.filter(c =>
                c.clientNom?.toLowerCase().includes(q) ||
                c.numero?.toLowerCase().includes(q) ||
                c.clientTelephone?.includes(q)
            );
        }
        this.commandesFiltrees = base;
    }

    ouvrirDetail(cmd: Commande): void {
        this.commandeService.getById(cmd.id).subscribe(full => {
            this.commandeSelectionnee = full;
            this.detailVisible = true;
        });
    }

    ouvrirChangementStatut(cmd: Commande): void {
        this.commandeSelectionnee = cmd;
        this.nouveauStatut = cmd.statut;
        this.statutVisible = true;
    }

    confirmerChangementStatut(): void {
        if (!this.commandeSelectionnee || !this.nouveauStatut) return;
        this.commandeService.changerStatut(this.commandeSelectionnee.id, this.nouveauStatut).subscribe({
            next: (updated) => {
                const idx = this.commandes.findIndex(c => c.id === updated.id);
                if (idx > -1) this.commandes[idx] = updated;
                this.appliquerFiltres();
                this.statutVisible = false;
                this.messageService.add({ severity: 'success', summary: 'Statut mis à jour', life: 3000 });
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de la mise à jour' })
        });
    }

    ouvrirWhatsApp(cmd: Commande): void {
        const tel = (cmd.clientTelephone ?? '').replace(/[\s\-().+]/g, '');
        if (!tel) return;
        const msg = encodeURIComponent(`Bonjour ${cmd.clientNom}, concernant votre commande ${cmd.numero}...`);
        window.open(`https://wa.me/${tel}?text=${msg}`, '_blank');
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

    labelStatut(statut: string): string {
        const m: Record<string, string> = {
            EN_ATTENTE: 'En attente',
            CONFIRMEE:  'Confirmée',
            EN_COURS:   'En cours',
            EXPEDIEE:   'Expédiée',
            VALIDEE:    'Validée',
            LIVREE:     'Livrée',
            ANNULEE:    'Annulée',
            STANDBY:    'Standby'
        };
        return m[statut] ?? statut;
    }

    formatDate(date: string): string {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    resolveImageUrl(url: string | null): string {
        if (!url) return '/images/app/login.png';
        if (url.startsWith('http')) return url;
        const clean = url.replace(/^\/+/, '');
        if (clean.startsWith('images/')) {
            return `${environment.frontOfficeUrl}/${clean}`;
        }
        if (clean.startsWith('uploads/')) {
            return `${environment.apiUrl.replace('/api', '')}/${clean}`;
        }
        return '/' + clean;
    }

    onImgError(event: Event): void {
        const img = event.target as HTMLImageElement;
        if (img && !img.src.includes('login.png')) {
            img.src = '/images/app/login.png';
        }
    }
}
