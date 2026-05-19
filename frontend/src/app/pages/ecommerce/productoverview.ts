import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProduitService, Produit } from '@services/produit.service';
import { PanierService, OptionsMaillot } from '@services/panier.service';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
    selector: 'app-product-overview',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        InputNumberModule,
        ButtonModule,
        RippleModule,
        TabViewModule,
        CheckboxModule,
        InputTextModule,
        ToastModule,
        SkeletonModule
    ],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>

        <section class="detail-shell">
            <div class="detail-topbar">
                <button pButton pRipple icon="pi pi-arrow-left" label="Retour a la boutique" class="p-button-text" (click)="retourBoutique()"></button>
                <button pButton pRipple icon="pi pi-shopping-cart" label="Voir le panier" class="p-button-outlined" (click)="allerAuPanier()"></button>
            </div>

            <div *ngIf="chargement" class="detail-loader">
                <p-skeleton height="380px"></p-skeleton>
                <div>
                    <p-skeleton width="65%" height="2rem" styleClass="mb-3"></p-skeleton>
                    <p-skeleton width="30%" styleClass="mb-4"></p-skeleton>
                    <p-skeleton height="5.5rem" styleClass="mb-3"></p-skeleton>
                    <p-skeleton height="6.5rem" styleClass="mb-3"></p-skeleton>
                    <p-skeleton height="3rem"></p-skeleton>
                </div>
            </div>

            <div *ngIf="!chargement && produit" class="detail-grid">
                <div class="media-card">
                    <div class="media-chip">{{ produit.categorie | uppercase }}</div>
                    <img
                        [src]="produitService.resolveImageUrl(produit.imageUrl)"
                        [alt]="produit.nom"
                        loading="lazy"
                        (error)="onImageError($event)" />
                </div>

                <div class="info-card">
                    <h1>{{ produit.nom }}</h1>
                    <p class="subtitle">Creez votre maillot ideal avec vos options de personnalisation.</p>
                    <div class="price">{{ formatPrix(produit.prix) }} FCFA</div>

                    <div class="selector-group">
                        <span>Taille</span>
                        <div class="chip-row">
                            <button
                                *ngFor="let taille of taillesDisponibles"
                                pButton
                                pRipple
                                [label]="taille"
                                [ngClass]="{ 'p-button-outlined': tailleSelectionnee !== taille }"
                                (click)="tailleSelectionnee = taille">
                            </button>
                        </div>
                    </div>

                    <div class="selector-group">
                        <span>Couleur</span>
                        <div class="chip-row">
                            <button
                                *ngFor="let couleur of couleursDisponibles"
                                pButton
                                pRipple
                                [label]="couleur"
                                [ngClass]="{ 'p-button-outlined': couleurSelectionnee !== couleur }"
                                (click)="couleurSelectionnee = couleur">
                            </button>
                        </div>
                    </div>

                    <div class="options-box">
                        <h3>Options premium</h3>
                        <div class="option-line">
                            <p-checkbox [(ngModel)]="badgesOfficiels" [binary]="true" inputId="badges"></p-checkbox>
                            <label for="badges">Badges officiels (+{{ formatPrix(prixBadgesOfficiels) }} FCFA)</label>
                        </div>
                        <div class="option-line">
                            <p-checkbox [(ngModel)]="flocage" [binary]="true" inputId="flocage"></p-checkbox>
                            <label for="flocage">Flocage (+{{ formatPrix(prixFlocageParLettre) }} FCFA / lettre)</label>
                        </div>
                        <div *ngIf="flocage" class="flocage-input">
                            <input pInputText [(ngModel)]="flocageNom" class="w-full mb-2" placeholder="Nom a floquer (optionnel)" />
                            <input pInputText [(ngModel)]="flocageNumero" class="w-full" placeholder="Numero a floquer (optionnel)" />
                            <small>Cout flocage: {{ formatPrix(prixFlocageTotal()) }} FCFA</small>
                        </div>
                    </div>

                    <div class="qty-row">
                        <span>Quantite</span>
                        <p-inputNumber
                            [showButtons]="true"
                            buttonLayout="horizontal"
                            [min]="1"
                            [(ngModel)]="quantite"
                            inputStyleClass="w-12 text-center py-2 px-1 border-transparent outline-0 shadow-none"
                            styleClass="border border-surface-200 rounded"
                            decrementButtonClass="p-button-text"
                            incrementButtonClass="p-button-text"
                            incrementButtonIcon="pi pi-plus"
                            decrementButtonIcon="pi pi-minus">
                        </p-inputNumber>
                    </div>

                    <div class="summary-box">
                        <div><span>Prix maillot</span><strong>{{ formatPrix(produit.prix) }} FCFA</strong></div>
                        <div><span>Options</span><strong>{{ formatPrix(prixOptionsUnitaire()) }} FCFA</strong></div>
                        <div class="total"><span>Total</span><strong>{{ formatPrix(prixTotal()) }} FCFA</strong></div>
                    </div>

                    <div class="actions">
                        <button pButton pRipple label="Ajouter au panier" icon="pi pi-shopping-cart" (click)="ajouterAuPanier()"></button>
                        <button pButton pRipple label="Commander maintenant" icon="pi pi-whatsapp" class="p-button-success p-button-outlined" (click)="ajouterAuPanier(true)"></button>
                    </div>
                </div>
            </div>

            <div *ngIf="!chargement && produit" class="detail-tabs">
                <p-tabView>
                    <p-tabPanel header="Description">
                        <p>{{ produit.description || 'Maillot officiel de haute qualite avec finitions premium.' }}</p>
                    </p-tabPanel>
                    <p-tabPanel header="Livraison">
                        <p>Livraison a domicile ou point relais. Les frais exacts sont confirmes lors de la validation via WhatsApp.</p>
                    </p-tabPanel>
                </p-tabView>
            </div>
        </section>
    `,
    styles: [`
        :host {
            display: block;
            padding: 1rem;
            font-family: 'Poppins', 'Segoe UI', sans-serif;
        }

        .detail-shell {
            background: linear-gradient(160deg, #fff7ed, #ffffff 45%, #f0f9ff);
            border: 1px solid rgba(15, 23, 42, 0.08);
            border-radius: 1.2rem;
            padding: 1rem;
            position: relative;
            overflow: hidden;
        }

        .detail-shell::after {
            content: '';
            position: absolute;
            width: 460px;
            height: 460px;
            right: -180px;
            top: -170px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255, 154, 81, 0.22), rgba(255, 154, 81, 0));
            pointer-events: none;
        }

        .detail-topbar {
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 0.7rem;
            margin-bottom: 1rem;
        }

        .detail-loader,
        .detail-grid {
            display: grid;
            grid-template-columns: 1.1fr 1fr;
            gap: 1rem;
        }

        .media-card,
        .info-card,
        .detail-tabs {
            border: 1px solid rgba(15, 23, 42, 0.08);
            border-radius: 1rem;
            background: rgba(255, 255, 255, 0.92);
            position: relative;
            z-index: 1;
        }

        .media-card {
            position: relative;
            padding: 1rem;
        }

        .media-card img {
            width: 100%;
            max-height: 620px;
            object-fit: cover;
            border-radius: 0.9rem;
            aspect-ratio: 4 / 5;
        }

        .media-chip {
            position: absolute;
            top: 1.6rem;
            left: 1.6rem;
            z-index: 1;
            background: rgba(17, 88, 165, 0.92);
            color: #fff;
            font-size: 0.72rem;
            padding: 0.3rem 0.6rem;
            border-radius: 999px;
        }

        .info-card {
            padding: 1rem;
        }

        .info-card h1 {
            margin: 0;
            font-size: clamp(1.5rem, 3vw, 2.2rem);
            color: #0f172a;
        }

        .subtitle {
            margin: 0.4rem 0;
            color: #64748b;
        }

        .price {
            font-size: 2rem;
            font-weight: 700;
            color: #d9480f;
            margin-bottom: 0.8rem;
        }

        .selector-group {
            margin-bottom: 0.9rem;
        }

        .selector-group span {
            display: block;
            font-weight: 600;
            margin-bottom: 0.45rem;
            color: #0f172a;
        }

        .chip-row {
            display: flex;
            flex-wrap: wrap;
            gap: 0.45rem;
        }

        .options-box,
        .summary-box {
            margin-top: 0.9rem;
            border: 1px solid rgba(15, 23, 42, 0.1);
            border-radius: 0.85rem;
            padding: 0.8rem;
            background: #fff;
        }

        .options-box h3 {
            margin: 0 0 0.5rem;
            color: #0f172a;
        }

        .option-line {
            display: flex;
            align-items: center;
            gap: 0.45rem;
            margin-bottom: 0.45rem;
            color: #334155;
        }

        .flocage-input small {
            color: #64748b;
        }

        .qty-row {
            margin-top: 0.9rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.9rem;
        }

        .summary-box div {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.3rem;
        }

        .summary-box .total {
            margin-top: 0.35rem;
            padding-top: 0.4rem;
            border-top: 1px solid rgba(15, 23, 42, 0.1);
            font-size: 1.1rem;
            color: #0f172a;
        }

        .actions {
            margin-top: 1rem;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.6rem;
        }

        .detail-tabs {
            margin-top: 1rem;
            padding: 0.7rem;
        }

        @media (max-width: 991px) {
            .detail-loader,
            .detail-grid {
                grid-template-columns: 1fr;
            }

            .actions {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 640px) {
            :host {
                padding: 0.75rem;
            }

            .detail-shell {
                padding: 0.8rem;
            }

            .media-card,
            .info-card {
                padding: 0.75rem;
            }

            .qty-row {
                align-items: flex-start;
                flex-direction: column;
            }
        }
    `]
})
export class ProductOverviewComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    public produitService = inject(ProduitService);
    private panierService = inject(PanierService);
    private messageService = inject(MessageService);

    produit: Produit | null = null;
    chargement = true;

    quantite = 1;
    tailleSelectionnee = '';
    couleurSelectionnee = 'Blanc';
    badgesOfficiels = false;
    flocage = false;
    flocageNom = '';
    flocageNumero = '';

    taillesDisponibles: string[] = ['S', 'M', 'L', 'XL'];
    couleursDisponibles: string[] = ['Standard'];
    readonly prixBadgesOfficiels = 500;
    readonly prixFlocageParLettre = 500;
    private readonly fallbackImage = '/images/app/login.png';

    ngOnInit() {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (!id) {
            this.chargement = false;
            this.router.navigate(['/boutique']);
            return;
        }

        this.produitService.getProduitById(id).subscribe({
            next: (data) => {
                this.produit = data;
                this.taillesDisponibles = data.taillesDisponibles?.length ? data.taillesDisponibles : ['S', 'M', 'L', 'XL'];
                this.couleursDisponibles = data.couleursDisponibles?.length ? data.couleursDisponibles : ['Standard'];
                this.tailleSelectionnee = this.taillesDisponibles[0];
                this.couleurSelectionnee = this.couleursDisponibles[0];
                this.chargement = false;
            },
            error: (err) => {
                console.error('Erreur lors de la recuperation du produit', err);
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Produit introuvable',
                    detail: 'Ce produit n\'est plus disponible. Retour a la boutique.',
                    life: 3000
                });
                this.router.navigate(['/boutique']);
                this.chargement = false;
            }
        });
    }

    prixOptionsUnitaire(): number {
        let total = 0;
        if (this.badgesOfficiels) {
            total += this.prixBadgesOfficiels;
        }
        total += this.prixFlocageTotal();
        return total;
    }

    prixFlocageTotal(): number {
        if (!this.flocage) return 0;
        const nom = (this.flocageNom || '').trim();
        const numero = (this.flocageNumero || '').trim();
        return (nom.length + numero.length) * this.prixFlocageParLettre;
    }

    prixTotal(): number {
        if (!this.produit) return 0;
        return (this.produit.prix + this.prixOptionsUnitaire()) * this.quantite;
    }

    ajouterAuPanier(allerPanier: boolean = false) {
        if (!this.produit || !this.tailleSelectionnee || !this.couleurSelectionnee) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Selection incomplete',
                detail: 'Veuillez choisir une taille et une couleur.'
            });
            return;
        }

        if (this.flocage && !(this.flocageNom || '').trim() && !(this.flocageNumero || '').trim()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Flocage manquant',
                detail: 'Veuillez saisir un nom ou un numero de flocage.'
            });
            return;
        }

        const options: OptionsMaillot = {
            taille: this.tailleSelectionnee,
            couleur: this.couleurSelectionnee,
            badgesOfficiels: this.badgesOfficiels,
            flocage: this.flocage,
            flocageNom: this.flocage ? this.flocageNom : undefined,
            flocageNumero: this.flocage ? this.flocageNumero : undefined,
            flocageTexte: this.flocage
                ? [this.flocageNom, this.flocageNumero].filter((value) => !!value && value.trim().length > 0).join(' ')
                : undefined
        };

        this.panierService.ajouterAuPanier(this.produit, options, this.quantite, this.prixOptionsUnitaire());

        this.messageService.add({
            severity: 'success',
            summary: 'Ajoute au panier',
            detail: 'Votre maillot a ete ajoute avec vos options.'
        });

        if (allerPanier) {
            this.allerAuPanier();
        }
    }

    retourBoutique() {
        this.router.navigate(['/boutique']);
    }

    onImageError(event: Event): void {
        const image = event.target as HTMLImageElement | null;
        if (!image || image.src.includes(this.fallbackImage)) {
            return;
        }

        image.src = this.fallbackImage;
    }

    allerAuPanier() {
        this.router.navigate(['/boutique/panier']);
    }

    formatPrix(prix: number): string {
        return new Intl.NumberFormat('fr-FR').format(prix);
    }
}
