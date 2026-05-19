import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { FileUploadModule } from 'primeng/fileupload';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import { AdminProduitService, ProduitAdmin, ProduitCreateRequest } from '../../../../services/admin-produit.service';

@Component({
    selector: 'app-admin-produits',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, TableModule, ButtonModule,
              TagModule, InputTextModule, TextareaModule, InputNumberModule, CheckboxModule,
              DialogModule, ToastModule, TooltipModule, FileUploadModule, DividerModule],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>

        <div class="prod-shell">
            <div class="prod-header">
                <div>
                    <p class="kicker">CATALOGUE</p>
                    <h1>Gestion des produits</h1>
                    <p>{{ produits.length }} produit(s) actif(s)</p>
                </div>
                <div class="header-actions">
                    <button pButton icon="pi pi-archive" label="Archives" class="p-button-outlined p-button-secondary"
                            (click)="voirArchives()"></button>
                    <button pButton icon="pi pi-plus" label="Nouveau produit"
                            (click)="ouvrirFormulaireCreation()"></button>
                </div>
            </div>

            <!-- Barre de recherche -->
            <div class="search-bar">
                <i class="pi pi-search"></i>
                <input type="text" [(ngModel)]="recherche" (input)="filtrer()"
                       placeholder="Rechercher un maillot..." />
            </div>

            <!-- Grid produits -->
            <div class="prod-grid" *ngIf="!chargement">
                <div *ngFor="let p of produitsFiltres" class="prod-card">
                    <div class="prod-img-wrap">
                        <img [src]="resolveUrl(p.imagePrincipale)" [alt]="p.nom" (error)="onImgError($event)" />
                        <div class="prod-badges">
                            <span class="badge-actif" [class.inactif]="!p.actif">
                                {{ p.actif ? 'Actif' : 'Archivé' }}
                            </span>
                            <span *ngIf="p.enPromotion" class="badge-promo">Promo</span>
                            <span *ngIf="p.nouveau" class="badge-new">Nouveau</span>
                        </div>
                    </div>
                    <div class="prod-info">
                        <h3>{{ p.nom }}</h3>
                        <small>{{ p.categorieNom || p.equipe }}</small>
                        <p class="prod-desc">{{ p.description | slice:0:80 }}{{ p.description?.length > 80 ? '...' : '' }}</p>
                        <div class="prod-footer">
                            <strong>{{ p.prix | number:'1.0-0' }} FCFA</strong>
                            <div class="prod-actions">
                                <button pButton icon="pi pi-pencil" class="p-button-text p-button-sm"
                                        pTooltip="Modifier" (click)="ouvrirFormulaireEdition(p)"></button>
                                <button pButton icon="pi pi-trash" class="p-button-text p-button-sm p-button-danger"
                                        pTooltip="Archiver" (click)="archiver(p)"></button>
                            </div>
                        </div>
                    </div>
                </div>

                <div *ngIf="produitsFiltres.length === 0" class="empty-state">
                    <i class="pi pi-box"></i>
                    <p>Aucun produit trouvé.</p>
                </div>
            </div>

            <div *ngIf="chargement" class="prod-grid">
                <div *ngFor="let i of [1,2,3,4,5,6]" class="prod-card prod-skeleton">
                    <div class="sk-img"></div>
                    <div class="sk-body">
                        <div class="sk-line sk-75"></div>
                        <div class="sk-line sk-50"></div>
                    </div>
                </div>
            </div>

            <!-- Dialog Archives -->
            <div *ngIf="voirArchivesMode" class="archives-panel">
                <div class="archives-header">
                    <h2>Produits archivés ({{ produitsArchives.length }})</h2>
                    <button pButton icon="pi pi-times" class="p-button-text" (click)="voirArchivesMode = false"></button>
                </div>
                <div class="prod-grid">
                    <div *ngFor="let p of produitsArchives" class="prod-card archived">
                        <div class="prod-img-wrap">
                            <img [src]="resolveUrl(p.imagePrincipale)" [alt]="p.nom" (error)="onImgError($event)" />
                        </div>
                        <div class="prod-info">
                            <h3>{{ p.nom }}</h3>
                            <small>{{ p.categorieNom || p.equipe }}</small>
                            <div class="prod-footer">
                                <strong>{{ p.prix | number:'1.0-0' }} FCFA</strong>
                                <button pButton icon="pi pi-refresh" label="Restaurer"
                                        class="p-button-sm p-button-success"
                                        (click)="restaurer(p)"></button>
                            </div>
                        </div>
                    </div>
                    <div *ngIf="produitsArchives.length === 0" class="empty-state">
                        <i class="pi pi-check-circle"></i>
                        <p>Aucun produit archivé.</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Dialog Formulaire -->
        <p-dialog [(visible)]="formulaireVisible"
                  [header]="editMode ? 'Modifier le produit' : 'Nouveau produit'"
                  [modal]="true" [style]="{width: 'min(96vw, 700px)'}"
                  [draggable]="false" [resizable]="false">
            <form [formGroup]="form" class="prod-form">
                <!-- Upload image -->
                <div class="field-full">
                    <label>Image principale</label>
                    <div class="image-upload-zone">
                        <img *ngIf="imagePreview" [src]="imagePreview" class="image-preview" alt="Aperçu" />
                        <div class="upload-btn-wrap">
                            <input type="file" #fileInput accept="image/*" style="display:none"
                                   (change)="onFileSelected($event)" />
                            <button pButton type="button" icon="pi pi-upload" [label]="labelImageBtn"
                                    class="p-button-outlined" (click)="fileInput.click()"></button>
                            <small *ngIf="uploadEnCours" class="ml-2">Upload en cours...</small>
                        </div>
                    </div>
                </div>

                <div class="form-row">
                    <div class="field">
                        <label>Nom *</label>
                        <input pInputText formControlName="nom" placeholder="Nom du maillot" class="w-full" />
                    </div>
                    <div class="field">
                        <label>Prix (FCFA) *</label>
                        <p-inputNumber formControlName="prix" [min]="0" mode="decimal" styleClass="w-full"></p-inputNumber>
                    </div>
                </div>

                <div class="form-row">
                    <div class="field">
                        <label>Équipe</label>
                        <input pInputText formControlName="equipe" placeholder="Ex: Real Madrid" class="w-full" />
                    </div>
                    <div class="field">
                        <label>Marque</label>
                        <input pInputText formControlName="marque" placeholder="Ex: Adidas" class="w-full" />
                    </div>
                </div>

                <div class="form-row">
                    <div class="field">
                        <label>Saison</label>
                        <input pInputText formControlName="saison" placeholder="Ex: 2024/2025" class="w-full" />
                    </div>
                    <div class="field">
                        <label>Prix promo (FCFA)</label>
                        <p-inputNumber formControlName="prixPromo" [min]="0" mode="decimal" styleClass="w-full"></p-inputNumber>
                    </div>
                </div>

                <div class="field-full">
                    <label>Description</label>
                    <textarea pTextarea formControlName="description" rows="4"
                              placeholder="Description détaillée du maillot..." class="w-full"></textarea>
                </div>

                <div class="field-full">
                    <label>Couleurs disponibles (séparées par virgule)</label>
                    <input pInputText formControlName="couleursDisponibles"
                           placeholder="Standard, Bleu, Rouge, Noir..." class="w-full" />
                </div>

                <div class="form-row">
                    <div class="field-check">
                        <p-checkbox formControlName="enPromotion" [binary]="true" inputId="chk-promo"></p-checkbox>
                        <label for="chk-promo" class="chk-label">En promotion</label>
                    </div>
                    <div class="field-check">
                        <p-checkbox formControlName="nouveau" [binary]="true" inputId="chk-nouveau"></p-checkbox>
                        <label for="chk-nouveau" class="chk-label">Nouveau</label>
                    </div>
                    <div class="field-check" *ngIf="editMode">
                        <p-checkbox formControlName="actif" [binary]="true" inputId="chk-actif"></p-checkbox>
                        <label for="chk-actif" class="chk-label">Actif</label>
                    </div>
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
        .prod-shell { padding: 1.5rem; font-family: 'Poppins', 'Segoe UI', sans-serif; }
        .kicker { margin: 0; font-size: .72rem; letter-spacing: .14em; color: #6366f1; font-weight: 700; }
        .prod-header { display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.2rem; }
        .prod-header h1 { margin: .3rem 0; font-size: 1.6rem; color: #0f172a; }
        .prod-header p { margin: 0; color: #64748b; }
        .header-actions { display: flex; gap: .6rem; flex-wrap: wrap; }
        .search-bar { display: flex; align-items: center; gap: .6rem; padding: .6rem 1rem; border: 1px solid rgba(15,23,42,.1); border-radius: 999px; background: #fff; margin-bottom: 1rem; max-width: 500px; }
        .search-bar input { border: none; outline: none; background: transparent; flex: 1; }

        .prod-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
        .prod-card { background: #fff; border: 1px solid rgba(15,23,42,.08); border-radius: 1rem; overflow: hidden; transition: transform .2s, box-shadow .2s; }
        .prod-card:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(0,0,0,.09); }
        .prod-card.archived { opacity: .75; }
        .prod-img-wrap { position: relative; aspect-ratio: 1; background: #f1f5f9; }
        .prod-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
        .prod-badges { position: absolute; top: .5rem; left: .5rem; display: flex; gap: .3rem; flex-wrap: wrap; }
        .badge-actif { padding: .2rem .5rem; border-radius: 999px; font-size: .65rem; font-weight: 700; background: #dcfce7; color: #15803d; }
        .badge-actif.inactif { background: #fef2f2; color: #dc2626; }
        .badge-promo { padding: .2rem .5rem; border-radius: 999px; font-size: .65rem; font-weight: 700; background: #fef3c7; color: #d97706; }
        .badge-new { padding: .2rem .5rem; border-radius: 999px; font-size: .65rem; font-weight: 700; background: #eff6ff; color: #3b82f6; }
        .prod-info { padding: .8rem; }
        .prod-info h3 { margin: 0; font-size: .95rem; color: #0f172a; }
        .prod-info small { color: #64748b; font-size: .78rem; }
        .prod-desc { margin: .4rem 0 .6rem; color: #475569; font-size: .82rem; line-height: 1.4; }
        .prod-footer { display: flex; justify-content: space-between; align-items: center; }
        .prod-footer strong { color: #0f172a; }
        .prod-actions { display: flex; gap: .1rem; }

        .empty-state { grid-column: 1/-1; text-align: center; padding: 3rem; color: #94a3b8; }
        .empty-state i { font-size: 2.5rem; margin-bottom: .5rem; }

        .archives-panel { margin-top: 2rem; border: 1px solid rgba(15,23,42,.1); border-radius: 1rem; padding: 1rem; background: #fafafa; }
        .archives-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .archives-header h2 { margin: 0; font-size: 1.1rem; }

        .prod-skeleton .sk-img { width: 100%; aspect-ratio: 1; background: #f1f5f9; animation: pulse 1.5s infinite; }
        .prod-skeleton .sk-body { padding: .8rem; }
        .prod-skeleton .sk-line { height: 12px; border-radius: 4px; background: #e2e8f0; margin-bottom: .5rem; animation: pulse 1.5s infinite; }
        .prod-skeleton .sk-75 { width: 75%; }
        .prod-skeleton .sk-50 { width: 50%; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }

        /* Formulaire */
        .prod-form { display: flex; flex-direction: column; gap: .8rem; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: .8rem; }
        .field, .field-full { display: flex; flex-direction: column; gap: .3rem; }
        .field label, .field-full label { font-size: .85rem; font-weight: 600; color: #374151; }
        .field-check { display: flex; align-items: center; gap: .5rem; }
        .chk-label { font-size: .9rem; color: #374151; cursor: pointer; margin: 0; }

        .image-upload-zone { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; padding: .6rem; border: 1.5px dashed rgba(15,23,42,.2); border-radius: .75rem; background: #fafafa; }
        .image-preview { width: 100px; height: 100px; object-fit: cover; border-radius: .6rem; border: 1px solid rgba(15,23,42,.1); }
        .upload-btn-wrap { display: flex; align-items: center; gap: .5rem; }

        @media (max-width: 640px) {
            .prod-shell { padding: 1rem; }
            .prod-header h1 { font-size: 1.3rem; }
            .header-actions { flex-direction: column; width: 100%; }
            .header-actions button { width: 100%; }
            .prod-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
            .form-row { grid-template-columns: 1fr; }
        }
    `]
})
export class AdminProduitsComponent implements OnInit {
    produits: ProduitAdmin[] = [];
    produitsFiltres: ProduitAdmin[] = [];
    produitsArchives: ProduitAdmin[] = [];
    chargement = true;
    recherche = '';
    voirArchivesMode = false;

    formulaireVisible = false;
    editMode = false;
    produitEnEdition: ProduitAdmin | null = null;
    imagePreview: string | null = null;
    uploadEnCours = false;
    enregistrementEnCours = false;
    imageUploadee: string | null = null;

    form: FormGroup;

    constructor(
        private produitService: AdminProduitService,
        private messageService: MessageService,
        private fb: FormBuilder
    ) {
        this.form = this.fb.group({
            nom: ['', Validators.required],
            description: [''],
            prix: [null, [Validators.required, Validators.min(0)]],
            prixPromo: [null],
            equipe: [''],
            marque: [''],
            saison: [''],
            couleursDisponibles: ['Standard'],
            enPromotion: [false],
            nouveau: [false],
            actif: [true]
        });
    }

    get labelImageBtn(): string {
        return this.imagePreview ? "Changer l'image" : 'Choisir une image';
    }

    ngOnInit(): void { this.charger(); }

    charger(): void {
        this.chargement = true;
        this.produitService.lister().subscribe({
            next: (data) => {
                this.produits = data;
                this.filtrer();
                this.chargement = false;
            },
            error: () => { this.chargement = false; }
        });
    }

    filtrer(): void {
        const q = this.recherche.trim().toLowerCase();
        this.produitsFiltres = q
            ? this.produits.filter(p =>
                p.nom?.toLowerCase().includes(q) ||
                p.equipe?.toLowerCase().includes(q) ||
                p.marque?.toLowerCase().includes(q))
            : [...this.produits];
    }

    voirArchives(): void {
        this.voirArchivesMode = !this.voirArchivesMode;
        if (this.voirArchivesMode && this.produitsArchives.length === 0) {
            this.produitService.listerArchives().subscribe(data => this.produitsArchives = data);
        }
    }

    ouvrirFormulaireCreation(): void {
        this.editMode = false;
        this.produitEnEdition = null;
        this.imagePreview = null;
        this.imageUploadee = null;
        this.form.reset({ enPromotion: false, nouveau: false, actif: true });
        this.formulaireVisible = true;
    }

    ouvrirFormulaireEdition(produit: ProduitAdmin): void {
        this.editMode = true;
        this.produitEnEdition = produit;
        this.imagePreview = produit.imagePrincipale ? this.resolveUrl(produit.imagePrincipale) : null;
        this.imageUploadee = produit.imagePrincipale ?? null;
        this.form.patchValue({
            nom: produit.nom,
            description: produit.description,
            prix: produit.prix,
            prixPromo: produit.prixPromo,
            equipe: produit.equipe,
            marque: produit.marque,
            saison: produit.saison,
            couleursDisponibles: Array.isArray(produit.couleursDisponibles)
                ? produit.couleursDisponibles.join(', ')
                : produit.couleursDisponibles ?? 'Standard',
            enPromotion: produit.enPromotion,
            nouveau: produit.nouveau,
            actif: produit.actif
        });
        this.formulaireVisible = true;
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => this.imagePreview = e.target?.result as string;
        reader.readAsDataURL(file);

        this.uploadEnCours = true;
        this.produitService.uploadImage(file).subscribe({
            next: (res) => {
                this.imageUploadee = res.url;
                this.uploadEnCours = false;
                this.messageService.add({ severity: 'success', summary: 'Image uploadée', life: 2000 });
            },
            error: () => {
                this.uploadEnCours = false;
                this.messageService.add({ severity: 'error', summary: 'Erreur upload', life: 3000 });
            }
        });
    }

    enregistrer(): void {
        if (this.form.invalid) return;
        const v = this.form.value;
        const req: ProduitCreateRequest & { actif?: boolean } = {
            nom: v.nom,
            description: v.description,
            prix: v.prix,
            prixPromo: v.prixPromo ?? undefined,
            equipe: v.equipe,
            marque: v.marque,
            saison: v.saison,
            couleursDisponibles: v.couleursDisponibles,
            enPromotion: v.enPromotion,
            nouveau: v.nouveau,
            imagePrincipale: this.imageUploadee ?? undefined,
            actif: v.actif
        };

        this.enregistrementEnCours = true;
        const action$ = this.editMode && this.produitEnEdition
            ? this.produitService.mettreAJour(this.produitEnEdition.id, req)
            : this.produitService.creer(req);

        action$.subscribe({
            next: () => {
                this.formulaireVisible = false;
                this.enregistrementEnCours = false;
                this.charger();
                this.messageService.add({
                    severity: 'success',
                    summary: this.editMode ? 'Produit modifié' : 'Produit créé',
                    life: 3000
                });
            },
            error: () => {
                this.enregistrementEnCours = false;
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Opération échouée' });
            }
        });
    }

    archiver(produit: ProduitAdmin): void {
        this.produitService.archiver(produit.id).subscribe({
            next: () => {
                this.produits = this.produits.filter(p => p.id !== produit.id);
                this.filtrer();
                this.messageService.add({ severity: 'success', summary: 'Produit archivé', life: 3000 });
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Erreur archivage' })
        });
    }

    restaurer(produit: ProduitAdmin): void {
        this.produitService.restaurer(produit.id).subscribe({
            next: () => {
                this.produitsArchives = this.produitsArchives.filter(p => p.id !== produit.id);
                this.charger();
                this.messageService.add({ severity: 'success', summary: 'Produit restauré', life: 3000 });
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Erreur restauration' })
        });
    }

    resolveUrl(url: string): string {
        if (!url) return '/images/app/login.png';
        if (url.startsWith('http')) return url;
        return '/' + url.replace(/^\/+/, '');
    }

    onImgError(event: Event): void {
        const img = event.target as HTMLImageElement;
        if (!img.src.includes('login.png')) img.src = '/images/app/login.png';
    }
}
