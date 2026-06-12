import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import { AdminCommandeService, Commande, StatutCommande } from '../../../../services/admin-commande.service';
import { AdminUtilisateurService } from '../../../../services/admin-utilisateur.service';
import { environment } from '@environments/environment';

@Component({
    selector: 'app-admin-commandes',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, TagModule,
              DropdownModule, InputTextModule, TextareaModule, DialogModule, ToastModule, DividerModule],
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
                        <td>
                            <div class="date-cell">
                                <span>{{ formatDate(cmd.createdAt) }}</span>
                                <span class="date-heure">{{ formatHeure(cmd.createdAt) }}</span>
                            </div>
                        </td>
                        <td>
                            <div class="action-btns">
                                <button pButton icon="pi pi-eye" class="p-button-text p-button-sm"
                                        pTooltip="Voir détails" (click)="ouvrirDetail(cmd)"></button>
                                <button pButton icon="pi pi-pencil" class="p-button-text p-button-sm"
                                        pTooltip="Changer statut" (click)="ouvrirChangementStatut(cmd)"></button>
                                <button pButton icon="pi pi-whatsapp" class="p-button-text p-button-sm p-button-success"
                                        pTooltip="Contacter via WhatsApp" (click)="ouvrirWhatsApp(cmd)"></button>
                                <button pButton icon="pi pi-trash" class="p-button-text p-button-sm p-button-danger"
                                        pTooltip="Supprimer la commande" (click)="demanderSuppression(cmd)"></button>
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

        <!-- Dialog Suppression -->
        <p-dialog [(visible)]="suppressionVisible" header="Supprimer la commande"
                  [modal]="true" [style]="{width:'min(95vw, 460px)'}"
                  [draggable]="false" styleClass="del-dialog">
            <div class="del-body" *ngIf="commandeAsupprimer">
                <div class="del-icon-wrap">
                    <i class="pi pi-exclamation-triangle del-icon"></i>
                </div>
                <p class="del-title">Êtes-vous sûr ?</p>
                <p class="del-subtitle">
                    Vous allez supprimer définitivement la commande
                    <strong>{{ commandeAsupprimer.numero }}</strong>
                    de <strong>{{ commandeAsupprimer.clientNom }}</strong>
                    ({{ commandeAsupprimer.montantTotal | number:'1.0-0' }} FCFA).
                </p>
                <p class="del-warning">Cette action est irréversible.</p>
            </div>
            <ng-template pTemplate="footer">
                <button pButton label="Annuler" icon="pi pi-times" class="p-button-text"
                        (click)="suppressionVisible = false"></button>
                <button pButton label="Supprimer définitivement" icon="pi pi-trash"
                        class="p-button-danger" [loading]="suppressionEnCours"
                        (click)="confirmerSuppression()"></button>
            </ng-template>
        </p-dialog>

        <!-- Dialog WhatsApp -->
        <p-dialog [(visible)]="whatsappVisible" header="Message WhatsApp"
                  [modal]="true" [style]="{width:'min(96vw, 520px)'}"
                  [draggable]="false" [resizable]="false"
                  styleClass="wa-dialog">
            <div class="wa-body">
                <div class="wa-client-info" *ngIf="whatsappCommande">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#25D366" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .99h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.1a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                    <span><strong>{{ whatsappCommande.clientNom }}</strong> — {{ whatsappCommande.clientTelephone }}</span>
                </div>
                <label class="wa-label">Message à envoyer</label>
                <textarea
                    [(ngModel)]="whatsappMessage"
                    rows="6"
                    class="wa-textarea"
                    placeholder="Saisissez votre message...">
                </textarea>
                <small class="wa-hint">Ce message sera pré-rempli dans WhatsApp. Vous pourrez encore le modifier avant d'envoyer.</small>
                <small class="wa-admin-actif" *ngIf="numeroAdminActif">
                    📲 {{ numeroAdminActifAffiche }}
                </small>
            </div>
            <ng-template pTemplate="footer">
                <button pButton label="Annuler" icon="pi pi-times" class="p-button-text"
                        (click)="whatsappVisible = false"></button>
                <!-- Lien <a> natif : jamais bloqué sur mobile ni desktop -->
                <!-- Bouton natif : window.open() dans un click handler est TOUJOURS autorisé -->
                <button type="button" class="wa-send-btn" (click)="ouvrirWhatsAppNow()">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Ouvrir WhatsApp
                </button>
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

        /* ── Date + heure ── */
        .date-cell { display: flex; flex-direction: column; line-height: 1.3; }
        .date-heure { font-size: .75rem; color: #94a3b8; font-weight: 500; }

        /* ── Dialog Suppression ── */
        ::ng-deep .del-dialog .p-dialog-header { background: #fff5f5 !important; border-bottom: 1px solid #fed7d7 !important; }
        .del-body { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 1rem 0; gap: .6rem; }
        .del-icon-wrap { width: 56px; height: 56px; border-radius: 50%; background: #fff5f5; border: 2px solid #feb2b2; display: flex; align-items: center; justify-content: center; margin-bottom: .4rem; }
        .del-icon { font-size: 1.6rem; color: #e53e3e; }
        .del-title { margin: 0; font-size: 1.1rem; font-weight: 700; color: #1a202c; }
        .del-subtitle { margin: 0; font-size: .9rem; color: #4a5568; line-height: 1.5; }
        .del-warning { margin: 0; font-size: .82rem; color: #e53e3e; font-weight: 600; background: #fff5f5; padding: .35rem .8rem; border-radius: .4rem; }

        /* ── Dialog WhatsApp ── */
        ::ng-deep .wa-dialog .p-dialog { border-radius: 1rem !important; }
        ::ng-deep .wa-dialog .p-dialog-header { background: #f0fdf4 !important; border-bottom: 1px solid #dcfce7 !important; border-radius: 1rem 1rem 0 0 !important; }
        ::ng-deep .wa-dialog .p-dialog-content { padding: 1.25rem 1.5rem !important; }
        ::ng-deep .wa-dialog .p-dialog-footer { border-top: 1px solid #f1f5f9 !important; padding: .9rem 1.5rem !important; display: flex; justify-content: flex-end; gap: .6rem; }
        .wa-body { display: flex; flex-direction: column; gap: .8rem; }
        .wa-client-info { display: flex; align-items: center; gap: .5rem; padding: .55rem .9rem; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: .6rem; font-size: .85rem; color: #166534; }
        .wa-label { font-size: .82rem; font-weight: 600; color: #374151; }
        .wa-textarea { width: 100%; padding: .7rem .9rem; border: 1.5px solid #d1d5db; border-radius: .6rem; font-family: 'Poppins','Segoe UI',sans-serif; font-size: .88rem; color: #111827; resize: vertical; outline: none; transition: border-color .2s; background: #fff; }
        .wa-textarea:focus { border-color: #25D366; }
        .wa-hint { font-size: .75rem; color: #9ca3af; }
        .wa-admin-actif { font-size: .75rem; color: #2563eb; background: #eff6ff; padding: .25rem .6rem; border-radius: .4rem; display: block; margin-top: .2rem; }
        .wa-send-btn {
            display: inline-flex; align-items: center; gap: .45rem;
            padding: .6rem 1.3rem; background: #25D366; color: #fff;
            border-radius: .5rem; font-size: .85rem; font-weight: 600;
            text-decoration: none; font-family: 'Poppins','Segoe UI',sans-serif;
            transition: background .2s, transform .15s;
            cursor: pointer;
        }
        .wa-send-btn:hover { background: #1ebe5c; transform: translateY(-1px); }
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

    // WhatsApp dialog
    whatsappVisible = false;
    whatsappCommande: Commande | null = null;
    whatsappMessage = '';

    // Suppression dialog
    suppressionVisible = false;
    commandeAsupprimer: Commande | null = null;
    suppressionEnCours = false;

    get whatsappUrlSafe(): SafeUrl {
        if (!this.whatsappCommande) return this.sanitizer.bypassSecurityTrustUrl('#');
        const tel = (this.whatsappCommande.clientTelephone ?? '').replace(/[\s\-().+]/g, '');
        const url = `https://wa.me/${tel}?text=${encodeURIComponent(this.whatsappMessage)}`;
        return this.sanitizer.bypassSecurityTrustUrl(url);
    }

    get numeroAdminActifAffiche(): string {
        return this.numeroAdminActif
            ? `Réponses reçues sur : ${this.numeroAdminActif}`
            : 'Aucun admin actif configuré';
    }

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

    // Téléphone de l'admin actif (pour le message WhatsApp du client)
    numeroAdminActif = '';

    constructor(
        private commandeService: AdminCommandeService,
        private messageService: MessageService,
        private route: ActivatedRoute,
        private sanitizer: DomSanitizer,
        private utilisateurService: AdminUtilisateurService
    ) {}

    ngOnInit(): void {
        this.charger();
        this.utilisateurService.getAdminActif().subscribe({
            next: (info) => { this.numeroAdminActif = info.telephone ?? ''; },
            error: () => {}
        });
    }

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
        this.whatsappCommande = cmd;
        const prenom = cmd.clientNom?.split(' ')[0] ?? cmd.clientNom ?? '';
        this.whatsappMessage = `${this.salutation()} ${prenom},\n\n`;
        this.whatsappVisible = true;
    }

    /**
     * Ouvre WhatsApp via window.open() dans un click handler synchrone.
     * Cette méthode est appelée directement par (click) — JAMAIS bloquée
     * par les popup blockers sur aucun navigateur ni appareil mobile.
     */
    ouvrirWhatsAppNow(): void {
        if (!this.whatsappCommande) return;
        const tel = (this.whatsappCommande.clientTelephone ?? '').replace(/[\s\-().+]/g, '');
        const url = `https://wa.me/${tel}?text=${encodeURIComponent(this.whatsappMessage)}`;
        // Fermer le dialog EN PREMIER pour libérer l'overlay PrimeNG
        this.whatsappVisible = false;
        // Puis ouvrir WhatsApp — window.open dans click handler = toujours autorisé
        window.open(url, '_blank');
    }

    private salutation(): string {
        const h = new Date().getHours();
        return (h >= 18 || h < 6) ? 'Bonsoir' : 'Bonjour';
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

    demanderSuppression(cmd: Commande): void {
        this.commandeAsupprimer = cmd;
        this.suppressionVisible = true;
    }

    confirmerSuppression(): void {
        if (!this.commandeAsupprimer) return;
        this.suppressionEnCours = true;
        this.commandeService.supprimer(this.commandeAsupprimer.id).subscribe({
            next: () => {
                this.commandes = this.commandes.filter(c => c.id !== this.commandeAsupprimer!.id);
                this.appliquerFiltres();
                this.suppressionVisible = false;
                this.suppressionEnCours = false;
                this.commandeAsupprimer = null;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Commande supprimée',
                    detail: 'La commande a été supprimée définitivement.',
                    life: 4000
                });
            },
            error: () => {
                this.suppressionEnCours = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de supprimer la commande.',
                    life: 4000
                });
            }
        });
    }

    formatDate(date: string): string {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    formatHeure(date: string): string {
        if (!date) return '';
        return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
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
