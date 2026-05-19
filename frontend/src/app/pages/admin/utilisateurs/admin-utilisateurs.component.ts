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
import { MessageService, ConfirmationService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { AdminUtilisateurService, Utilisateur, CreateUtilisateurRequest } from '../../../../services/admin-utilisateur.service';

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

            <p-table [value]="utilisateurs" [loading]="chargement" [paginator]="true" [rows]="10"
                     styleClass="p-datatable-sm p-datatable-striped" responsiveLayout="scroll">
                <ng-template pTemplate="header">
                    <tr>
                        <th>Nom</th>
                        <th>Prénoms</th>
                        <th>Login</th>
                        <th>Rôle</th>
                        <th>Statut</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-u>
                    <tr>
                        <td><strong>{{ u.nom }}</strong></td>
                        <td>{{ u.prenoms }}</td>
                        <td><code>{{ u.username }}</code></td>
                        <td>
                            <p-tag [value]="u.role"
                                   [severity]="u.role === 'SUPER_ADMIN' ? 'danger' : 'info'"></p-tag>
                        </td>
                        <td>
                            <p-tag [value]="u.statut"
                                   [severity]="u.statut === 'ACTIF' ? 'success' : 'secondary'"></p-tag>
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
                                <button pButton icon="pi pi-trash" class="p-button-text p-button-sm p-button-danger"
                                        pTooltip="Supprimer" (click)="supprimer(u)"></button>
                            </div>
                        </td>
                    </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                    <tr><td colspan="6" class="text-center">Aucun utilisateur</td></tr>
                </ng-template>
            </p-table>
        </div>

        <p-dialog [(visible)]="formulaireVisible"
                  [header]="editMode ? 'Modifier admin' : 'Nouvel admin'"
                  [modal]="true" [style]="{width:'min(95vw, 440px)'}" [draggable]="false">
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
                    <input pInputText formControlName="username" class="w-full" placeholder="Identifiant de connexion" />
                </div>
                <div class="field">
                    <label>{{ editMode ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe *' }}</label>
                    <p-password formControlName="password" [toggleMask]="true" [feedback]="true" styleClass="w-full"></p-password>
                </div>
                <div class="field">
                    <label>Rôle *</label>
                    <p-dropdown formControlName="role" [options]="rolesOptions"
                                optionLabel="label" optionValue="value" styleClass="w-full"></p-dropdown>
                </div>
                <div class="field">
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
        .users-header { display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; }
        .users-header h1 { margin: .3rem 0; font-size: 1.6rem; color: #0f172a; }
        .users-header p { margin: 0; color: #64748b; }
        .action-btns { display: flex; gap: .2rem; }
        .user-form { display: flex; flex-direction: column; gap: .9rem; }
        .field { display: flex; flex-direction: column; gap: .3rem; }
        .field label { font-size: .85rem; font-weight: 600; color: #374151; }
        code { font-family: monospace; background: #f1f5f9; padding: .1rem .4rem; border-radius: 4px; font-size: .85rem; }

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

    formulaireVisible = false;
    editMode = false;
    utilisateurEnEdition: Utilisateur | null = null;
    enregistrementEnCours = false;

    form: FormGroup;

    rolesOptions = [
        { label: 'Administrateur', value: 'ADMIN' },
        { label: 'Super Administrateur', value: 'SUPER_ADMIN' }
    ];

    statutsOptions = [
        { label: 'Actif', value: 'ACTIF' },
        { label: 'Inactif', value: 'INACTIF' }
    ];

    constructor(
        private utilisateurService: AdminUtilisateurService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private fb: FormBuilder
    ) {
        this.form = this.fb.group({
            nom: ['', Validators.required],
            prenoms: ['', Validators.required],
            username: ['', Validators.required],
            password: [''],
            role: ['ADMIN', Validators.required],
            statut: ['ACTIF', Validators.required]
        });
    }

    ngOnInit(): void { this.charger(); }

    charger(): void {
        this.chargement = true;
        this.utilisateurService.lister().subscribe({
            next: (data) => { this.utilisateurs = data; this.chargement = false; },
            error: () => { this.chargement = false; }
        });
    }

    ouvrirCreation(): void {
        this.editMode = false;
        this.utilisateurEnEdition = null;
        this.form.reset({ role: 'ADMIN', statut: 'ACTIF' });
        this.form.get('password')?.setValidators([Validators.required]);
        this.form.get('password')?.updateValueAndValidity();
        this.formulaireVisible = true;
    }

    ouvrirEdition(u: Utilisateur): void {
        this.editMode = true;
        this.utilisateurEnEdition = u;
        this.form.patchValue({ nom: u.nom, prenoms: u.prenoms, username: u.username, role: u.role, statut: u.statut });
        this.form.get('password')?.clearValidators();
        this.form.get('password')?.setValue('');
        this.form.get('password')?.updateValueAndValidity();
        this.formulaireVisible = true;
    }

    enregistrer(): void {
        if (this.form.invalid) return;
        const v = this.form.value;
        const req: CreateUtilisateurRequest = {
            nom: v.nom, prenoms: v.prenoms, username: v.username,
            password: v.password, role: v.role, statut: v.statut
        };
        this.enregistrementEnCours = true;
        const action$ = this.editMode && this.utilisateurEnEdition
            ? this.utilisateurService.mettreAJour(this.utilisateurEnEdition.id, req)
            : this.utilisateurService.creer(req);
        action$.subscribe({
            next: () => {
                this.formulaireVisible = false;
                this.enregistrementEnCours = false;
                this.charger();
                this.messageService.add({ severity: 'success', summary: this.editMode ? 'Admin modifié' : 'Admin créé', life: 3000 });
            },
            error: () => {
                this.enregistrementEnCours = false;
                this.messageService.add({ severity: 'error', summary: 'Erreur' });
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
