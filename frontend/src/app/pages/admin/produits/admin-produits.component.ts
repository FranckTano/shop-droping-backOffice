import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { FileUploadModule } from 'primeng/fileupload';
import { DividerModule } from 'primeng/divider';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { MessageService } from 'primeng/api';
import { AdminProduitService, ProduitAdmin, ProduitCreateRequest, CategorieAdmin } from '../../../../services/admin-produit.service';
import { environment } from '@environments/environment';

@Component({
    selector: 'app-admin-produits',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, TableModule, ButtonModule,
              TagModule, InputTextModule, TextareaModule, InputNumberModule, CheckboxModule,
              DropdownModule, DialogModule, ToastModule, TooltipModule, FileUploadModule,
              DividerModule, PaginatorModule],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>

        <div class="prod-shell">
            <div class="prod-header">
                <div>
                    <p class="kicker">CATALOGUE</p>
                    <h1>Gestion des produits</h1>
                    <p>{{ produitsFiltres.length }} produit(s) · page {{ page + 1 }}/{{ totalPages }}</p>
                </div>
                <div class="header-actions">
                    <button pButton icon="pi pi-archive" label="Archives" class="p-button-outlined p-button-secondary"
                            (click)="voirArchives()"></button>
                    <button pButton icon="pi pi-plus" label="Nouveau produit"
                            (click)="ouvrirFormulaireCreation()"></button>
                </div>
            </div>

            <!-- Barre de recherche -->
            <div class="search-bar" [class.search-bar--loading]="rechercheEnCours">
                <i class="pi pi-search" *ngIf="!rechercheEnCours"></i>
                <span *ngIf="rechercheEnCours" class="search-spinner"></span>
                <input type="text" [(ngModel)]="recherche" (input)="onRecherche()"
                       placeholder="Rechercher par nom, équipe, marque..." />
                <button *ngIf="recherche" class="search-clear" (click)="recherche=''; filtrer()" title="Effacer">
                    <i class="pi pi-times"></i>
                </button>
            </div>

            <!-- Sélecteur par page -->
            <div class="page-size-row" *ngIf="!chargement && produitsFiltres.length > 0">
                <span class="page-size-label">Afficher</span>
                <select class="page-size-select" [(ngModel)]="rowsPerPage" (ngModelChange)="onRowsChange()">
                    <option *ngFor="let opt of rowsOptions" [ngValue]="opt">{{ opt }}</option>
                </select>
                <span class="page-size-label">par page</span>
                <span class="page-count-info">— {{ debutIndex + 1 }}–{{ finIndex }} sur {{ produitsFiltres.length }}</span>
            </div>

            <!-- Grid produits -->
            <div class="prod-grid" *ngIf="!chargement">
                <div *ngFor="let p of produitsPagines" class="prod-card">
                    <div class="prod-img-wrap">
                        <img [src]="resolveUrl(p.imagePrincipale)" [alt]="p.nom" loading="lazy" (error)="onImgError($event)" />
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

            <!-- Paginator -->
            <div class="paginator-wrap" *ngIf="!chargement && produitsFiltres.length > rowsPerPage">
                <p-paginator
                    [rows]="rowsPerPage"
                    [totalRecords]="produitsFiltres.length"
                    [first]="page * rowsPerPage"
                    (onPageChange)="onPageChange($event)"
                    styleClass="prod-paginator">
                </p-paginator>
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
                            <img [src]="resolveUrl(p.imagePrincipale)" [alt]="p.nom" loading="lazy" (error)="onImgError($event)" />
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

                <div class="field-full">
                    <label>Type de maillot *</label>
                    <p-dropdown formControlName="categorieId"
                                [options]="categories"
                                optionLabel="nom"
                                optionValue="id"
                                placeholder="Choisir un type (Actuel, Vintage, Collection...)"
                                styleClass="w-full"
                                [showClear]="true"
                                emptyMessage="Chargement..."
                                [filter]="false"
                                appendTo="body">
                        <ng-template pTemplate="selectedItem" let-cat>
                            <span *ngIf="cat">{{ cat.nom | titlecase }}</span>
                        </ng-template>
                        <ng-template pTemplate="item" let-cat>
                            <span>{{ cat.nom | titlecase }}</span>
                        </ng-template>
                    </p-dropdown>
                    <small style="color:#64748b;font-size:.75rem">
                        Détermine l'onglet d'affichage dans la boutique
                    </small>
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
        .search-bar { display: flex; align-items: center; gap: .6rem; padding: .6rem 1rem; border: 1px solid rgba(15,23,42,.1); border-radius: 999px; background: #fff; margin-bottom: 1rem; max-width: 500px; transition: border-color .2s; }
        .search-bar:focus-within, .search-bar--loading { border-color: #6366f1; }
        .search-bar input { border: none; outline: none; background: transparent; flex: 1; font-family: inherit; }
        .search-spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(99,102,241,.2); border-top-color: #6366f1; border-radius: 50%; animation: admin-spin 0.7s linear infinite; flex-shrink: 0; }
        @keyframes admin-spin { to { transform: rotate(360deg); } }
        .search-clear { background: none; border: none; cursor: pointer; color: #94a3b8; padding: 0; display: flex; align-items: center; }
        .search-clear:hover { color: #0f172a; }

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

        /* Sélecteur par page */
        .page-size-row { display: flex; align-items: center; gap: .5rem; margin-bottom: .9rem; flex-wrap: wrap; }
        .page-size-label { font-size: .82rem; color: #64748b; }
        .page-size-select { padding: .3rem .65rem; border: 1.5px solid rgba(15,23,42,.12); border-radius: .5rem; font-size: .82rem; font-family: inherit; color: #0f172a; background: #fff; cursor: pointer; outline: none; transition: border-color .2s; }
        .page-size-select:focus { border-color: #6366f1; }
        .page-count-info { font-size: .8rem; color: #94a3b8; margin-left: .2rem; }

        /* Paginator */
        .paginator-wrap { margin-top: 1.5rem; display: flex; justify-content: center; }
        ::ng-deep .prod-paginator .p-paginator { background: transparent !important; border: none !important; gap: .3rem !important; }
        ::ng-deep .prod-paginator .p-paginator-page,
        ::ng-deep .prod-paginator .p-paginator-prev,
        ::ng-deep .prod-paginator .p-paginator-next,
        ::ng-deep .prod-paginator .p-paginator-first,
        ::ng-deep .prod-paginator .p-paginator-last {
            background: #fff !important; border: 1.5px solid rgba(15,23,42,.1) !important;
            color: #374151 !important; border-radius: .5rem !important;
            min-width: 2.1rem !important; height: 2.1rem !important;
            font-family: 'Poppins','Segoe UI',sans-serif !important; font-size: .82rem !important;
        }
        ::ng-deep .prod-paginator .p-paginator-page:hover,
        ::ng-deep .prod-paginator .p-paginator-prev:hover,
        ::ng-deep .prod-paginator .p-paginator-next:hover { border-color: #6366f1 !important; color: #6366f1 !important; }
        ::ng-deep .prod-paginator .p-paginator-page.p-highlight { background: #6366f1 !important; border-color: #6366f1 !important; color: #fff !important; }

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
export class AdminProduitsComponent implements OnInit, OnDestroy {
    produits: ProduitAdmin[] = [];
    produitsFiltres: ProduitAdmin[] = [];
    produitsArchives: ProduitAdmin[] = [];
    categories: CategorieAdmin[] = [];
    chargement = true;
    rechercheEnCours = false;
    recherche = '';
    private searchSubject = new Subject<string>();
    private destroy$ = new Subject<void>();
    voirArchivesMode = false;

    // Pagination
    page = 0;
    rowsPerPage = 12;
    readonly rowsOptions = [8, 12, 24, 48];

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
            categorieId: [null],
            enPromotion: [false],
            nouveau: [false],
            actif: [true]
        });
    }

    get labelImageBtn(): string {
        return this.imagePreview ? "Changer l'image" : 'Choisir une image';
    }

    ngOnInit(): void {
        this.produitService.listerCategories().subscribe({
            next: (data) => { this.categories = data.filter(c => c.actif); },
            error: () => {}
        });
        this.searchSubject.pipe(
            debounceTime(380),
            distinctUntilChanged(),
            switchMap(terme => {
                if (!terme.trim()) {
                    this.rechercheEnCours = false;
                    return of(this.produits);
                }
                this.rechercheEnCours = true;
                return this.produitService.rechercher(terme.trim());
            })
        ).subscribe({
            next: (resultats) => {
                this.rechercheEnCours = false;
                this.produitsFiltres = resultats;
                this.page = 0;
            },
            error: () => { this.rechercheEnCours = false; }
        });
        this.charger();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onRecherche(): void {
        this.searchSubject.next(this.recherche);
    }

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
        this.produitsFiltres = [...this.produits];
        this.page = 0;
    }

    // ── Pagination ──────────────────────────────────
    get debutIndex(): number { return this.page * this.rowsPerPage; }
    get finIndex(): number { return Math.min(this.debutIndex + this.rowsPerPage, this.produitsFiltres.length); }
    get totalPages(): number { return Math.max(1, Math.ceil(this.produitsFiltres.length / this.rowsPerPage)); }
    get produitsPagines(): ProduitAdmin[] {
        return this.produitsFiltres.slice(this.debutIndex, this.finIndex);
    }
    onPageChange(event: PaginatorState): void {
        this.page = event.page ?? 0;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    onRowsChange(): void {
        this.page = 0;
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
        this.form.reset({ enPromotion: false, nouveau: false, actif: true, categorieId: null, couleursDisponibles: 'Standard' });
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
            categorieId: produit.categorieId ?? null,
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
            categorieId: v.categorieId ?? undefined,
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

    resolveUrl(url: string | null | undefined): string {
        const normalized = (url ?? '').trim();
        if (!normalized) return '/images/app/login.png';

        // URL absolue (Cloudinary, externe) — protocol-relative ou http(s)://
        if (/^https?:\/\//i.test(normalized)) return normalized;
        if (normalized.startsWith('//')) return `https:${normalized}`;

        const clean = normalized.replace(/\\/g, '/').replace(/^\/+/, '');

        // Upload local → chemin relatif : le proxy Angular route vers localhost:8081
        // En prod, Cloudinary est configuré donc uploads/ n'existe jamais dans la DB
        if (clean.startsWith('uploads/')) {
            return environment.production
                ? `${environment.apiUrl.replace('/api', '')}/${clean}`
                : `/${clean}`;
        }

        // Assets images → en dev le proxy route /images → http://localhost:8080/assets/images
        // En prod on utilise l'URL absolue du FrontOffice (momo-store.shop sert /images/**)
        if (clean.startsWith('images/')) {
            return environment.production
                ? `${environment.frontOfficeUrl}/${clean}`
                : `/${clean}`;
        }

        return `/${clean}`;
    }

    onImgError(event: Event): void {
        const img = event.target as HTMLImageElement;
        if (!img.src.includes('login.png')) img.src = '/images/app/login.png';
    }
}
