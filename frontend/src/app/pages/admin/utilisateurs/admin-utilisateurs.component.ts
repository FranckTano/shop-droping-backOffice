import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AdminUtilisateurService, Utilisateur, CreateUtilisateurRequest, UpdateUtilisateurRequest } from '../../../../services/admin-utilisateur.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
    selector: 'app-admin-utilisateurs',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, TableModule, ButtonModule,
              TagModule, InputTextModule, PasswordModule, DropdownModule,
              DialogModule, ToastModule, ConfirmDialogModule, TooltipModule],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast></p-toast>
        <p-confirmDialog></p-confirmDialog>

        <div class="users-shell">
            <div class="users-header">
                <div>
                    <p class="kicker">SUPER ADMIN</p>
                    <h1>Gestion des administrateurs</h1>
                    <p>{{ utilisateurs.length }} compte(s)</p>
                </div>
                <button pButton icon="pi pi-plus" label="Nouvel admin" (click)="ouvrirCreation()"></button>
            </div>

            <!-- Bandeau admin actif -->
            <div class="admin-actif-banner" *ngIf="adminActifInfo">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#25D366" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .99h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 8.1a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92v3z"/>
                </svg>
                <span *ngIf="adminActifInfo.configure === 'true'">
                    Les commandes clients vont vers <strong>{{ adminActifInfo.nom }}</strong>
                    — <code>{{ adminActifInfo.telephone }}</code>
                </span>
                <span *ngIf="adminActifInfo.configure !== 'true'" style="color:#f59e0b">
                    ⚠️ Aucun admin actif configuré — les commandes n'ont pas de destinataire WhatsApp.
                </span>
            </div>

            <p-table [value]="utilisateurs" [loading]="chargement" [paginator]="true" [rows]="10"
                     styleClass="p-datatable-sm p-datatable-striped" responsiveLayout="scroll">
                <ng-template pTemplate="header">
                    <tr>
                        <th>Nom</th>
                        <th>Prénoms</th>
                        <th>Login</th>
                        <th>Téléphone</th>
                        <th>Rôle</th>
                        <th>Statut</th>
                        <th>Commandes</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-u>
                    <tr>
                        <td><strong>{{ u.nom }}</strong></td>
                        <td>{{ u.prenoms }}</td>
                        <td><code>{{ u.username }}</code></td>
                        <td>
                            <span *ngIf="u.telephone">{{ u.telephone }}</span>
                            <span *ngIf="!u.telephone" style="color:#94a3b8;font-size:.8rem">—</span>
                        </td>
                        <td>
                            <p-tag [value]="u.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'"
                                   [severity]="u.role === 'SUPER_ADMIN' ? 'danger' : 'info'"></p-tag>
                        </td>
                        <td>
                            <p-tag [value]="u.statut === 'ACTIF' ? 'Actif' : 'Inactif'"
                                   [severity]="u.statut === 'ACTIF' ? 'success' : 'secondary'"></p-tag>
                        </td>
                        <td>
                            <span *ngIf="u.recevoirCommandes" class="badge-actif-wa">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                Reçoit les commandes
                            </span>
                        </td>
                        <td>
                            <div class="action-btns">
                                <button pButton icon="pi pi-pencil" class="p-button-text p-button-sm"
                                        pTooltip="Modifier" (click)="ouvrirEdition(u)"></button>
                                <button pButton
                                        [icon]="u.statut === 'ACTIF' ? 'pi pi-lock' : 'pi pi-unlock'"
                                        class="p-button-text p-button-sm"
                                        [pTooltip]="u.statut === 'ACTIF' ? 'Désactiver' : 'Activer'"
                                        (click)="toggleStatut(u)"></button>
                                <!-- Bouton "Définir comme admin actif" uniquement pour les ADMIN avec téléphone -->
                                <button *ngIf="u.role === 'ADMIN' && u.telephone && !u.recevoirCommandes"
                                        pButton icon="pi pi-whatsapp"
                                        class="p-button-text p-button-sm p-button-success"
                                        pTooltip="Définir pour recevoir les commandes"
                                        (click)="definirAdminActif(u)"></button>
                                <button *ngIf="u.role !== 'SUPER_ADMIN'"
                                        pButton icon="pi pi-trash" class="p-button-text p-button-sm p-button-danger"
                                        pTooltip="Supprimer" (click)="supprimer(u)"></button>
                            </div>
                        </td>
                    </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                    <tr><td colspan="8" class="text-center">Aucun utilisateur</td></tr>
                </ng-template>
            </p-table>
        </div>

        <p-dialog [(visible)]="formulaireVisible"
                  [header]="editMode ? 'Modifier admin' : 'Nouvel admin'"
                  [modal]="true" [style]="{width:'min(95vw, 480px)'}" [draggable]="false">
            <form [formGroup]="form" class="user-form">
                <div class="field">
                    <label>Nom *</label>
                    <input pInputText formControlName="nom" class="w-full" placeholder="Nom de famille" />
                </div>
                <div class="field">
                    <label>Prénoms *</label>
                    <input pInputText formControlName="prenoms" class="w-full" placeholder="Prénoms" />
                </div>
                <div class="field">
                    <label>Login *</label>
                    <input pInputText formControlName="username" class="w-full" placeholder="Identifiant de connexion"
                           [attr.disabled]="editMode ? true : null" />
                </div>
                <div class="field">
                    <label>Téléphone WhatsApp</label>
                    <input pInputText formControlName="telephone" class="w-full" type="tel"
                           placeholder="Ex: +2250799136306" />
                    <small style="color:#64748b;font-size:.75rem">
                        Numéro utilisé pour recevoir les commandes clients
                    </small>
                </div>
                <div class="field">
                    <label>{{ editMode ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe *' }}</label>
                    <p-password formControlName="password" [toggleMask]="true" [feedback]="true" styleClass="w-full"></p-password>
                </div>
                <div class="field" *ngIf="editMode">
                    <label>Statut</label>
                    <p-dropdown formControlName="statut" [options]="statutsOptions"
                                optionLabel="label" optionValue="value" styleClass="w-full"></p-dropdown>
                </div>
            </form>
            <ng-template pTemplate="footer">
                <button pButton label="Annuler" icon="pi pi-times" class="p-button-text"
                        (click)="formulaireVisible = false"></button>
                <button pButton [label]="editMode ? 'Enregistrer' : 'Créer'" icon="pi pi-check"
                        [disabled]="form.invalid || enregistrementEnCours"
                        (click)="enregistrer()"></button>
            </ng-template>
        </p-dialog>
    `,
    styles: [`
        .users-shell { padding: 1.5rem; font-family: 'Poppins', 'Segoe UI', sans-serif; }
        .kicker { margin: 0; font-size: .72rem; letter-spacing: .14em; color: #dc2626; font-weight: 700; }
        .users-header { display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.2rem; }
        .users-header h1 { margin: .3rem 0; font-size: 1.6rem; color: #0f172a; }
        .users-header p { margin: 0; color: #64748b; }
        .action-btns { display: flex; gap: .2rem; flex-wrap: wrap; }
        .user-form { display: flex; flex-direction: column; gap: .9rem; }
        .field { display: flex; flex-direction: column; gap: .3rem; }
        .field label { font-size: .85rem; font-weight: 600; color: #374151; }
        code { font-family: monospace; background: #f1f5f9; padding: .1rem .4rem; border-radius: 4px; font-size: .85rem; }

        .admin-actif-banner {
            display: flex; align-items: center; gap: .6rem;
            padding: .75rem 1rem; margin-bottom: 1.2rem;
            background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: .75rem;
            font-size: .88rem; color: #166534;
        }
        .badge-actif-wa {
            display: inline-flex; align-items: center; gap: .3rem;
            padding: .2rem .55rem; background: #f0fdf4; border: 1px solid #bbf7d0;
            border-radius: 999px; font-size: .72rem; color: #166534; font-weight: 600; white-space: nowrap;
        }

        @media (max-width: 640px) {
            .users-shell { padding: 1rem; }
            .users-header { flex-direction: column; }
            .users-header button { width: 100%; }
            .users-header h1 { font-size: 1.3rem; }
        }
    `]
})
export class AdminUtilisateursComponent implements OnInit {
    utilisateurs: Utilisateur[] = [];
    chargement = true;
    adminActifInfo: { telephone: string; nom: string; configure: string } | null = null;

    formulaireVisible = false;
    editMode = false;
    utilisateurEnEdition: Utilisateur | null = null;
    enregistrementEnCours = false;

    form: FormGroup;

    statutsOptions = [
        { label: 'Actif',   value: 'ACTIF' },
        { label: 'Inactif', value: 'INACTIF' }
    ];

    constructor(
        private utilisateurService: AdminUtilisateurService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        public authService: AuthService,
        private fb: FormBuilder
    ) {
        this.form = this.fb.group({
            nom:       ['', Validators.required],
            prenoms:   ['', Validators.required],
            username:  ['', Validators.required],
            telephone: [''],
            password:  [''],
            statut:    ['ACTIF']
        });
    }

    ngOnInit(): void {
        this.charger();
        this.chargerAdminActif();
    }

    charger(): void {
        this.chargement = true;
        this.utilisateurService.lister().subscribe({
            next: (data) => { this.utilisateurs = data; this.chargement = false; },
            error: () => { this.chargement = false; }
        });
    }

    chargerAdminActif(): void {
        this.utilisateurService.getAdminActif().subscribe({
            next: (info) => { this.adminActifInfo = info; },
            error: () => {}
        });
    }

    ouvrirCreation(): void {
        this.editMode = false;
        this.utilisateurEnEdition = null;
        this.form.reset({ statut: 'ACTIF' });
        this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
        this.form.get('password')?.updateValueAndValidity();
        this.formulaireVisible = true;
    }

    ouvrirEdition(u: Utilisateur): void {
        this.editMode = true;
        this.utilisateurEnEdition = u;
        this.form.patchValue({
            nom: u.nom, prenoms: u.prenoms, username: u.username,
            telephone: u.telephone ?? '', statut: u.statut
        });
        this.form.get('password')?.clearValidators();
        this.form.get('password')?.setValue('');
        this.form.get('password')?.updateValueAndValidity();
        this.formulaireVisible = true;
    }

    enregistrer(): void {
        if (this.form.invalid) return;
        const v = this.form.value;
        this.enregistrementEnCours = true;

        const action$ = this.editMode && this.utilisateurEnEdition
            ? this.utilisateurService.mettreAJour(this.utilisateurEnEdition.id, {
                nom:       v.nom,
                prenoms:   v.prenoms,
                telephone: v.telephone || null,
                statut:    v.statut,
                password:  v.password || undefined
              } as any)
            : this.utilisateurService.creer({
                nom:       v.nom,
                prenoms:   v.prenoms,
                username:  v.username,
                password:  v.password,
                role:      'ADMIN',          // Création = toujours ADMIN (SUPER_ADMIN interdit par API)
                telephone: v.telephone || undefined
              } as CreateUtilisateurRequest);

        action$.subscribe({
            next: () => {
                this.formulaireVisible = false;
                this.enregistrementEnCours = false;
                this.charger();
                this.chargerAdminActif();
                this.messageService.add({
                    severity: 'success',
                    summary: this.editMode ? 'Admin modifié' : 'Admin créé',
                    life: 3000
                });
            },
            error: (err) => {
                this.enregistrementEnCours = false;
                const msg = err?.error?.message ?? err?.error ?? 'Une erreur est survenue.';
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: msg, life: 5000 });
            }
        });
    }

    definirAdminActif(u: Utilisateur): void {
        this.confirmationService.confirm({
            message: `Définir <strong>${u.nom} ${u.prenoms}</strong> (${u.telephone}) comme admin qui reçoit les commandes clients ?`,
            header: 'Confirmer',
            icon: 'pi pi-whatsapp',
            acceptLabel: 'Oui, définir',
            rejectLabel: 'Annuler',
            accept: () => {
                this.utilisateurService.definirAdminActif(u.id).subscribe({
                    next: () => {
                        this.charger();
                        this.chargerAdminActif();
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Admin actif défini',
                            detail: `${u.nom} recevra désormais les commandes clients.`,
                            life: 4000
                        });
                    },
                    error: (err) => {
                        const msg = err?.error?.message ?? 'Erreur lors de la définition.';
                        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: msg });
                    }
                });
            }
        });
    }

    toggleStatut(u: Utilisateur): void {
        const newStatut = u.statut === 'ACTIF' ? 'INACTIF' : 'ACTIF';
        this.utilisateurService.changerStatut(u.id, newStatut).subscribe({
            next: () => {
                u.statut = newStatut;
                this.messageService.add({ severity: 'success', summary: 'Statut mis à jour', life: 3000 });
            }
        });
    }

    supprimer(u: Utilisateur): void {
        this.confirmationService.confirm({
            message: `Supprimer définitivement ${u.nom} ${u.prenoms} ?`,
            header: 'Confirmation', icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Supprimer', rejectLabel: 'Annuler',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.utilisateurService.supprimer(u.id).subscribe({
                    next: () => {
                        this.utilisateurs = this.utilisateurs.filter(x => x.id !== u.id);
                        this.messageService.add({ severity: 'success', summary: 'Admin supprimé', life: 3000 });
                    }
                });
            }
        });
    }
}
