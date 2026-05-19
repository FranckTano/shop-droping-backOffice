import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProduitService, Produit } from '@services/produit.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { PanierService } from '@services/panier.service';

type OngletId = 'tous' | 'actuel' | 'vintage-court' | 'vintage-long' | 'collection';

@Component({
    selector: 'app-product-list',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, SkeletonModule, RippleModule, ToastModule, DialogModule],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>

        <section class="shop-shell">
            <div class="hero-layer"></div>

            <header class="shop-hero">
                <p class="shop-kicker">NOUVELLE COLLECTION</p>
                <h1>Maillots d'exception pour supporters passionnes</h1>
                <p>
                    Trouvez votre style, personnalisez chaque detail et commandez en quelques clics.
                    Une boutique pensee pour convertir et fideliser vos clients.
                </p>
                <div class="hero-ctas">
                    <button pButton pRipple label="Voir les best sellers" icon="pi pi-star-fill" (click)="changerOnglet('collection')"></button>
                    <button pButton pRipple class="p-button-outlined" label="Acceder au panier" icon="pi pi-shopping-cart" (click)="allerAuPanier()"></button>
                </div>
                <div class="hero-stats">
                    <div>
                        <span>{{ produits.length }}</span>
                        <small>Maillots en ligne</small>
                    </div>
                    <div>
                        <span>24h</span>
                        <small>Preparation rapide</small>
                    </div>
                    <div>
                        <span>100%</span>
                        <small>Personnalisable</small>
                    </div>
                </div>
            </header>

            <section class="category-strip" *ngIf="!chargement && produits.length">
                <button
                    *ngFor="let onglet of onglets.slice(1)"
                    type="button"
                    class="category-card"
                    [class.active]="onglet.id === ongletActif"
                    (click)="changerOnglet(onglet.id)">
                    <span class="title">{{ onglet.label }}</span>
                    <strong>{{ countByTab(onglet.id) }} articles</strong>
                </button>
            </section>

            <div class="toolbar">
                <div class="filter-tabs">
                    <button
                        *ngFor="let onglet of onglets"
                        pButton
                        pRipple
                        [label]="onglet.label"
                        [ngClass]="{ 'p-button-outlined': ongletActif !== onglet.id }"
                        (click)="changerOnglet(onglet.id)">
                    </button>
                </div>

                <div class="search-wrap">
                    <i class="pi pi-search"></i>
                    <input
                        type="text"
                        [(ngModel)]="recherche"
                        (input)="filtrerProduits()"
                        placeholder="Rechercher un maillot, une equipe, une categorie..." />
                </div>
            </div>

            <div *ngIf="!chargement && produitsFiltres.length > 0" class="product-grid">
                <article *ngFor="let produit of produitsFiltres" class="product-card">
                    <div class="product-image-wrap" (click)="ouvrirApercuProduit(produit)">
                        <span class="product-badge">{{ labelCategorie(produit.categorie) }}</span>
                        <img
                            [src]="produitService.resolveImageUrl(produit.imageUrl)"
                            [alt]="produit.nom"
                            class="product-image"
                            loading="lazy"
                            (error)="onImageError($event)" />
                    </div>

                    <div class="product-content" (click)="ouvrirApercuProduit(produit)">
                        <h3>{{ produit.nom }}</h3>
                        <p>{{ produit.description | slice:0:95 }}{{ produit.description?.length > 95 ? '...' : '' }}</p>

                        <div class="product-meta">
                            <span>{{ produit.equipe }}</span>
                            <span [class.low-stock]="produit.stockTotal > 0 && produit.stockTotal < 8">
                                {{ stockLabel(produit) }}
                            </span>
                        </div>

                        <div class="product-footer">
                            <div>
                                <small>Prix TTC</small>
                                <strong>{{ produit.prix | number:'1.0-0' }} FCFA</strong>
                            </div>
                            <button
                                pButton
                                icon="pi pi-check"
                                class="p-button-rounded p-button-text"
                                (click)="ajouterRapideAuPanier(produit, $event)">
                            </button>
                        </div>
                    </div>
                </article>
            </div>

            <p-dialog
                [modal]="true"
                [draggable]="false"
                [resizable]="false"
                [dismissableMask]="true"
                [style]="{ width: 'min(92vw, 820px)' }"
                [visible]="apercuVisible"
                (visibleChange)="apercuVisible = $event"
                [header]="produitSelectionne?.nom || 'Apercu produit'">
                <ng-container *ngIf="produitSelectionne as produit">
                    <div class="product-modal-body">
                        <img
                            [src]="produitService.resolveImageUrl(produit.imageUrl)"
                            [alt]="produit.nom"
                            class="product-modal-image"
                            (error)="onImageError($event)" />

                        <div class="product-modal-content">
                            <p class="product-modal-category">{{ labelCategorie(produit.categorie) }}</p>
                            <h2>{{ produit.nom }}</h2>
                            <p class="product-modal-description">{{ produit.description }}</p>

                            <div class="product-modal-meta">
                                <span>{{ produit.equipe }}</span>
                                <span>{{ stockLabel(produit) }}</span>
                            </div>

                            <div class="product-modal-footer">
                                <strong>{{ produit.prix | number:'1.0-0' }} FCFA</strong>
                                <button
                                    pButton
                                    icon="pi pi-check"
                                    label="Ajouter au panier"
                                    (click)="ajouterRapideAuPanier(produit, $event)">
                                </button>
                            </div>
                        </div>
                    </div>
                </ng-container>
            </p-dialog>

            <div *ngIf="!chargement && produitsFiltres.length === 0" class="empty-state">
                <h2>Aucun maillot ne correspond a votre recherche</h2>
                <p>Essayez un autre mot-cle ou revenez sur "Tous" pour explorer toute la collection.</p>
                <button pButton pRipple label="Reinitialiser" icon="pi pi-refresh" (click)="reinitialiserFiltres()"></button>
            </div>

            <div *ngIf="chargement" class="product-grid">
                <div *ngFor="let i of [1,2,3,4]" class="col">
                    <div class="skeleton-card">
                        <p-skeleton height="220px" styleClass="mb-3"></p-skeleton>
                        <p-skeleton width="10rem" styleClass="mb-2"></p-skeleton>
                        <p-skeleton height="3.4rem" styleClass="mb-3"></p-skeleton>
                        <div class="flex justify-between items-center">
                            <p-skeleton width="5rem" height="2rem"></p-skeleton>
                            <p-skeleton width="3rem" height="2rem"></p-skeleton>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `,
    styles: [`
        :host {
            display: block;
            padding: 1.25rem;
            font-family: 'Poppins', 'Segoe UI', sans-serif;
        }

        .shop-shell {
            position: relative;
            overflow: hidden;
            border-radius: 1.5rem;
            padding: 1.2rem;
            background:
                radial-gradient(circle at 85% 0%, rgba(255, 178, 71, 0.25), transparent 42%),
                radial-gradient(circle at 0% 100%, rgba(255, 95, 109, 0.2), transparent 45%),
                linear-gradient(130deg, #fff9f3 0%, #ffffff 48%, #f7fbff 100%);
        }

        .hero-layer {
            position: absolute;
            inset: auto -20% -55% auto;
            width: 540px;
            height: 540px;
            border-radius: 50%;
            background: linear-gradient(140deg, rgba(255, 107, 53, 0.2), rgba(17, 88, 165, 0.15));
            filter: blur(40px);
            pointer-events: none;
        }

        .shop-hero {
            position: relative;
            z-index: 1;
            padding: 1.2rem;
            margin-bottom: 1.6rem;
            background: rgba(255, 255, 255, 0.62);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(15, 23, 42, 0.08);
            border-radius: 1.2rem;
        }

        .shop-kicker {
            margin: 0;
            font-size: 0.75rem;
            letter-spacing: 0.16em;
            color: #d9480f;
            font-weight: 700;
        }

        .shop-hero h1 {
            margin: 0.6rem 0;
            max-width: 24ch;
            font-size: clamp(1.6rem, 4vw, 2.8rem);
            line-height: 1.05;
            color: #111827;
        }

        .shop-hero p {
            margin: 0;
            max-width: 70ch;
            color: #374151;
        }

        .hero-ctas {
            display: flex;
            flex-wrap: wrap;
            gap: 0.8rem;
            margin-top: 1.2rem;
        }

        .hero-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 0.8rem;
            margin-top: 1rem;
        }

        .hero-stats div {
            background: #ffffff;
            border-radius: 0.8rem;
            padding: 0.7rem 0.85rem;
            border: 1px solid rgba(15, 23, 42, 0.08);
        }

        .hero-stats span {
            display: block;
            font-size: 1.25rem;
            font-weight: 700;
            color: #0f172a;
        }

        .hero-stats small {
            color: #64748b;
        }

        .toolbar {
            position: relative;
            z-index: 1;
            margin-bottom: 1.2rem;
            display: grid;
            gap: 0.9rem;
        }

        .category-strip {
            position: relative;
            z-index: 1;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 0.8rem;
            margin-bottom: 1rem;
        }

        .category-card {
            border: 1px solid rgba(15, 23, 42, 0.12);
            border-radius: 0.9rem;
            background: rgba(255, 255, 255, 0.72);
            backdrop-filter: blur(6px);
            padding: 0.7rem 0.8rem;
            text-align: left;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .category-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 22px rgba(2, 6, 23, 0.08);
        }

        .category-card.active {
            border-color: rgba(217, 72, 15, 0.4);
            background: linear-gradient(145deg, rgba(255, 237, 213, 0.95), rgba(255, 255, 255, 0.98));
        }

        .category-card .title {
            display: block;
            color: #334155;
            font-size: 0.82rem;
            margin-bottom: 0.3rem;
        }

        .category-card strong {
            font-size: 1.02rem;
            color: #0f172a;
        }

        .filter-tabs {
            display: flex;
            gap: 0.7rem;
            flex-wrap: wrap;
        }

        .search-wrap {
            display: flex;
            align-items: center;
            gap: 0.65rem;
            padding: 0.72rem 0.9rem;
            border: 1px solid rgba(15, 23, 42, 0.1);
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.88);
            max-width: 520px;
        }

        .search-wrap i {
            color: #64748b;
        }

        .search-wrap input {
            flex: 1;
            border: none;
            outline: none;
            background: transparent;
            font-size: 0.95rem;
            color: #0f172a;
        }

        .product-grid {
            position: relative;
            z-index: 1;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 1rem;
        }

        .product-card {
            background: #ffffff;
            border: 1px solid rgba(15, 23, 42, 0.08);
            border-radius: 1rem;
            overflow: hidden;
            cursor: pointer;
            transition: transform 0.24s ease, box-shadow 0.24s ease;
            animation: reveal 0.45s ease;
        }

        .product-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 30px rgba(2, 6, 23, 0.12);
        }

        .product-image-wrap {
            position: relative;
            aspect-ratio: 1 / 1;
            background: linear-gradient(155deg, #f9fafb, #edf2f7);
            cursor: pointer;
        }

        .product-badge {
            position: absolute;
            top: 0.65rem;
            left: 0.65rem;
            z-index: 1;
            padding: 0.3rem 0.55rem;
            border-radius: 999px;
            background: rgba(17, 88, 165, 0.9);
            color: #fff;
            font-size: 0.7rem;
            font-weight: 600;
        }

        .product-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .product-content {
            padding: 0.9rem;
            cursor: pointer;
        }

        .product-content h3 {
            margin: 0;
            font-size: 1.08rem;
            color: #111827;
        }

        .product-content p {
            margin: 0.5rem 0 0;
            min-height: 2.8rem;
            color: #4b5563;
            font-size: 0.9rem;
            line-height: 1.35;
        }

        .product-meta {
            margin-top: 0.55rem;
            display: flex;
            justify-content: space-between;
            gap: 0.5rem;
            color: #475569;
            font-size: 0.79rem;
        }

        .product-meta .low-stock {
            color: #b45309;
            font-weight: 600;
        }

        .product-footer {
            margin-top: 0.8rem;
            display: flex;
            align-items: end;
            justify-content: space-between;
        }

        .product-footer button {
            z-index: 2;
        }

        .product-modal-body {
            display: grid;
            grid-template-columns: minmax(220px, 320px) 1fr;
            gap: 1rem;
            align-items: start;
        }

        .product-modal-image {
            width: 100%;
            border-radius: 0.9rem;
            border: 1px solid rgba(15, 23, 42, 0.1);
            object-fit: cover;
            aspect-ratio: 1 / 1;
        }

        .product-modal-content h2 {
            margin: 0.1rem 0 0.6rem;
            font-size: 1.4rem;
            line-height: 1.2;
            color: #0f172a;
        }

        .product-modal-category {
            margin: 0;
            color: #c2410c;
            font-size: 0.8rem;
            letter-spacing: 0.08em;
            font-weight: 700;
            text-transform: uppercase;
        }

        .product-modal-description {
            margin: 0;
            color: #334155;
            line-height: 1.5;
        }

        .product-modal-meta {
            margin-top: 0.7rem;
            display: flex;
            justify-content: space-between;
            gap: 0.6rem;
            color: #475569;
            font-size: 0.86rem;
        }

        .product-modal-footer {
            margin-top: 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 0.8rem;
        }

        .product-modal-footer strong {
            color: #0f172a;
            font-size: 1.2rem;
        }

        .product-footer small {
            display: block;
            color: #64748b;
            font-size: 0.72rem;
        }

        .product-footer strong {
            font-size: 1.1rem;
            color: #0f172a;
        }

        .empty-state {
            text-align: center;
            background: #fff;
            border: 1px dashed rgba(15, 23, 42, 0.25);
            border-radius: 1rem;
            padding: 2rem 1rem;
        }

        .empty-state h2 {
            margin: 0;
            font-size: 1.4rem;
            color: #0f172a;
        }

        .empty-state p {
            margin: 0.7rem auto 1.1rem;
            max-width: 52ch;
            color: #64748b;
        }

        .skeleton-card {
            background: #fff;
            border: 1px solid rgba(15, 23, 42, 0.08);
            border-radius: 1rem;
            padding: 0.9rem;
        }

        @media (max-width: 991px) {
            :host {
                padding: 0.9rem;
            }

            .shop-shell {
                border-radius: 1rem;
                padding: 0.9rem;
            }

            .shop-hero {
                padding: 0.9rem;
            }

            .search-wrap {
                max-width: 100%;
            }
        }

        @media (max-width: 640px) {
            .hero-ctas {
                display: grid;
                grid-template-columns: 1fr;
            }

            .hero-ctas button {
                width: 100%;
            }

            .filter-tabs {
                display: grid;
                grid-template-columns: 1fr 1fr;
            }

            .filter-tabs button {
                width: 100%;
            }

            .category-strip {
                grid-template-columns: 1fr 1fr;
            }

            .product-grid {
                grid-template-columns: 1fr;
            }

            .product-modal-body {
                grid-template-columns: 1fr;
            }
        }

        @keyframes reveal {
            from {
                opacity: 0;
                transform: translateY(8px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `]
})
export class ProductListComponent implements OnInit {
    produits: Produit[] = [];
    produitsFiltres: Produit[] = [];
    chargement = true;
    recherche = '';
    apercuVisible = false;
    produitSelectionne: Produit | null = null;
    private readonly fallbackImage = '/images/app/login.png';

    ongletActif: OngletId = 'tous';
    onglets: { id: OngletId; label: string }[] = [
        { id: 'tous', label: 'Tous' },
        { id: 'actuel', label: 'Actuels' },
        { id: 'vintage-court', label: 'Vintage Court' },
        { id: 'vintage-long', label: 'Vintage Long' },
        { id: 'collection', label: 'Collection' }
    ];

    constructor(
        public produitService: ProduitService,
        private router: Router,
        private panierService: PanierService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.chargement = true;
        this.produitService.getProduits().subscribe({
            next: (data) => {
                this.produits = data;
                this.changerOnglet('tous');
                this.chargement = false;
            },
            error: (err) => {
                console.error('Erreur lors de la recuperation des produits', err);
                this.chargement = false;
            }
        });
    }

    changerOnglet(ongletId: OngletId): void {
        this.ongletActif = ongletId;
        this.filtrerProduits();
    }

    filtrerProduits(): void {
        const terme = this.recherche.trim().toLowerCase();
        const base = this.ongletActif === 'tous'
            ? this.produits
            : this.produits.filter((p) => this.categoryMatchesTab(p.categorie, this.ongletActif));

        if (!terme) {
            this.produitsFiltres = base;
            return;
        }

        this.produitsFiltres = base.filter((p) => {
            return [p.nom, p.description, p.categorie]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()
                .includes(terme);
        });
    }

    private normalizeCategorie(categorie?: string): string {
        return (categorie ?? '')
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '-')
            .replace(/_/g, '-')
            .replace(/-+/g, '-');
    }

    private categoryMatchesTab(categorie: string, onglet: OngletId): boolean {
        const normalized = this.normalizeCategorie(categorie);

        if (normalized === onglet) {
            return true;
        }

        if (onglet === 'vintage-court') {
            return normalized.includes('vintage') && (normalized.includes('court') || normalized.includes('courte'));
        }

        if (onglet === 'vintage-long') {
            return normalized.includes('vintage') && (normalized.includes('long') || normalized.includes('longue'));
        }

        if (onglet === 'actuel') {
            return normalized.includes('actuel') || normalized.includes('nouveau');
        }

        if (onglet === 'collection') {
            return normalized.includes('collection') || normalized.includes('retro') || normalized.includes('collector');
        }

        return false;
    }

    reinitialiserFiltres(): void {
        this.recherche = '';
        this.changerOnglet('tous');
    }

    labelCategorie(categorie: string): string {
        switch (categorie) {
            case 'actuel':
                return 'Actuel';
            case 'vintage-court':
                return 'Vintage Court';
            case 'vintage-long':
                return 'Vintage Long';
            case 'collection':
                return 'Collection';
            default:
                return 'Edition';
        }
    }

    countByTab(ongletId: OngletId): number {
        if (ongletId === 'tous') {
            return this.produits.length;
        }

        return this.produits.filter((p) => this.categoryMatchesTab(p.categorie, ongletId)).length;
    }

    stockLabel(produit: Produit): string {
        if (!produit.enStock || produit.stockTotal <= 0) {
            return 'Rupture';
        }

        if (produit.stockTotal < 8) {
            return `Stock faible (${produit.stockTotal})`;
        }

        return `${produit.stockTotal} en stock`;
    }

    onImageError(event: Event): void {
        const image = event.target as HTMLImageElement | null;
        if (!image || image.src.includes(this.fallbackImage)) {
            return;
        }

        image.src = this.fallbackImage;
    }

    allerAuPanier(): void {
        this.router.navigate(['/boutique/panier']);
    }

    ajouterRapideAuPanier(produit: Produit, event: MouseEvent): void {
        event.stopPropagation();

        this.panierService.ajouterAuPanier(
            produit,
            {
                taille: 'M',
                couleur: 'Standard',
                badgesOfficiels: false,
                flocage: false
            },
            1,
            0
        );

        this.messageService.add({
            severity: 'success',
            summary: 'Ajoute au panier',
            detail: `${produit.nom} a ete ajoute.`
        });
    }

    ouvrirApercuProduit(produit: Produit): void {
        this.produitSelectionne = produit;
        this.apercuVisible = true;
    }

    voirProduit(id: number, event?: Event): void {
        event?.stopPropagation();
        this.router.navigate(['/boutique/product-overview', id]);
    }
}
