import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { DividerModule } from 'primeng/divider';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { PanierService, ArticlePanier } from '@services/panier.service';
import { WhatsappService } from '@services/whatsapp.service';
import { CommandeService } from '@services/commande.service';
import { ProduitService } from '@services/produit.service';

interface InfosClient {
    nom: string;
    telephone: string;
    adresse: string;
    notes: string;
}

@Component({
    selector: 'app-shopping-cart',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        RippleModule,
        DividerModule,
        ConfirmDialogModule,
        DialogModule,
        InputTextModule,
        TextareaModule,
        CheckboxModule,
        MultiSelectModule,
        ToastModule
    ],
    providers: [ConfirmationService, MessageService],
    template: `
        <p-toast></p-toast>
        <p-confirmDialog></p-confirmDialog>

        <section class="cart-shell">
            <header class="cart-header">
                <div>
                    <p class="kicker">PANIER CLIENT</p>
                    <h1>Finalisez votre commande</h1>
                    <p>{{ panierService.nombreArticles() }} article(s) pret(s) a etre valides</p>
                </div>
                <button pButton pRipple label="Continuer mes achats" icon="pi pi-arrow-left" class="p-button-outlined" (click)="continuerAchats()"></button>
            </header>

            <div *ngIf="panierService.estVide()" class="empty-cart">
                <div class="emoji">🛒</div>
                <h2>Votre panier est vide</h2>
                <p>Ajoutez des maillots a votre selection pour lancer votre commande.</p>
                <button pButton pRipple label="Explorer la boutique" icon="pi pi-shopping-bag" (click)="continuerAchats()"></button>
            </div>

            <div *ngIf="!panierService.estVide()" class="cart-grid">
                <div class="items-zone">
                    <article *ngFor="let article of panierService.articles(); let i = index" class="item-card" [class.with-separator]="i > 0">
                        <div class="img-wrap">
                            <img *ngIf="article.produit.imageUrl" [src]="produitImage(article.produit.imageUrl)" [alt]="article.produit.nom" />
                            <span *ngIf="!article.produit.imageUrl">👕</span>
                        </div>

                        <div class="item-main">
                            <div class="line-top">
                                <div>
                                    <h3>{{ article.produit.nom }}</h3>
                                    <small>{{ article.produit.categorie }}</small>
                                </div>
                                <strong>{{ formatPrix(prixUnitaire(article)) }} FCFA</strong>
                            </div>

                            <div class="tags">
                                <span>Taille {{ article.options.taille }}</span>
                                <span>Couleur {{ article.options.couleur }}</span>
                                <span *ngIf="article.options.badgesOfficiels">Badges officiels</span>
                                <span *ngIf="article.options.flocage">Flocage: {{ article.options.flocageTexte || 'Oui' }}</span>
                            </div>

                            <div class="options-editor">
                                <div class="option-line option-line-size">
                                    <label>Choisir la taille</label>
                                    <p-multiSelect
                                        [ngModel]="taillesSelectionnees(article)"
                                        [options]="taillesOptions(article)"
                                        optionLabel="label"
                                        optionValue="value"
                                        [showToggleAll]="false"
                                        [maxSelectedLabels]="3"
                                        defaultLabel="Selectionner une taille"
                                        selectedItemsLabel="Tailles selectionnees"
                                        appendTo="body"
                                        styleClass="w-full"
                                        (ngModelChange)="changerTaille(article, $event)">
                                    </p-multiSelect>
                                </div>

                                <div class="option-line">
                                    <p-checkbox
                                        [binary]="true"
                                        [ngModel]="article.options.badgesOfficiels"
                                        (ngModelChange)="changerBadge(article, $event)">
                                    </p-checkbox>
                                    <label>Ajouter badges officiels</label>
                                </div>

                                <div class="option-line">
                                    <p-checkbox
                                        [binary]="true"
                                        [ngModel]="article.options.flocage"
                                        (ngModelChange)="changerFlocage(article, $event)">
                                    </p-checkbox>
                                    <label>Ajouter flocage</label>
                                </div>

                                <div *ngIf="article.options.flocage" class="flocage-grid">
                                    <input
                                        pInputText
                                        [ngModel]="article.options.flocageNom || ''"
                                        (ngModelChange)="changerFlocageNom(article, $event)"
                                        placeholder="Nom flocage (optionnel)" />
                                    <input
                                        pInputText
                                        [ngModel]="article.options.flocageNumero || ''"
                                        (ngModelChange)="changerFlocageNumero(article, $event)"
                                        placeholder="Numero flocage (optionnel)" />
                                </div>
                            </div>

                            <div class="line-bottom">
                                <div class="qty">
                                    <button pButton pRipple icon="pi pi-minus" class="p-button-rounded p-button-text" [disabled]="article.quantite <= 1" (click)="modifierQuantite(article, article.quantite - 1)"></button>
                                    <span>{{ article.quantite }}</span>
                                    <button pButton pRipple icon="pi pi-plus" class="p-button-rounded p-button-text" (click)="modifierQuantite(article, article.quantite + 1)"></button>
                                </div>

                                <div class="actions">
                                    <strong>{{ formatPrix(prixUnitaire(article) * article.quantite) }} FCFA</strong>
                                    <button pButton pRipple icon="pi pi-trash" class="p-button-danger p-button-text p-button-rounded" (click)="confirmerSuppression(article)"></button>
                                </div>
                            </div>
                        </div>
                    </article>

                    <div class="bottom-actions">
                        <button pButton pRipple label="Vider le panier" icon="pi pi-trash" class="p-button-danger p-button-outlined" (click)="confirmerViderPanier()"></button>
                    </div>
                </div>

                <aside class="summary-zone">
                    <h3>Resume</h3>
                    <div class="summary-line">
                        <span>Sous-total</span>
                        <strong>{{ formatPrix(panierService.montantTotal()) }} FCFA</strong>
                    </div>
                    <div class="summary-line">
                        <span>Livraison</span>
                        <strong>A confirmer</strong>
                    </div>
                    <p-divider></p-divider>
                    <div class="summary-total">
                        <span>Total</span>
                        <strong>{{ formatPrix(panierService.montantTotal()) }} FCFA</strong>
                    </div>

                    <button pButton pRipple label="Commander via WhatsApp" icon="pi pi-whatsapp" class="p-button-success w-full p-button-lg" (click)="ouvrirDialogCommande()"></button>
                    <small>Paiement securise a la livraison</small>
                </aside>
            </div>
        </section>

        <p-dialog header="Finalisez votre commande" [(visible)]="dialogCommandeVisible" [modal]="true" [style]="{width: '520px'}" [draggable]="false" [resizable]="false">
            <div class="space-y-4">
                <p>Renseignez vos coordonnees pour confirmer votre commande.</p>

                <div class="field">
                    <label for="nom" class="block font-medium mb-2">Nom complet *</label>
                    <input id="nom" type="text" pInputText [(ngModel)]="infosClient.nom" class="w-full" placeholder="Votre nom et prenom" />
                </div>

                <div class="field">
                    <label for="telephone" class="block font-medium mb-2">Numero WhatsApp *</label>
                    <input id="telephone" type="tel" pInputText [(ngModel)]="infosClient.telephone" class="w-full" placeholder="+225 XX XX XX XX" />
                </div>

                <div class="field">
                    <label for="adresse" class="block font-medium mb-2">Adresse de livraison *</label>
                    <input id="adresse" type="text" pInputText [(ngModel)]="infosClient.adresse" class="w-full" placeholder="Votre adresse complete" />
                </div>

                <div class="field">
                    <label for="notes" class="block font-medium mb-2">Notes (optionnel)</label>
                    <textarea id="notes" pTextarea [(ngModel)]="infosClient.notes" class="w-full" rows="3" placeholder="Instructions de livraison..."></textarea>
                </div>
            </div>

            <ng-template pTemplate="footer">
                <button pButton pRipple label="Annuler" icon="pi pi-times" class="p-button-text" (click)="dialogCommandeVisible = false"></button>
                <button pButton pRipple label="Envoyer sur WhatsApp" icon="pi pi-whatsapp" class="p-button-success" [disabled]="!infosClient.nom || !infosClient.telephone || !infosClient.adresse" (click)="envoyerCommande()"></button>
            </ng-template>
        </p-dialog>
    `,
    styles: [`
        :host {
            display: block;
            padding: 1rem;
            font-family: 'Poppins', 'Segoe UI', sans-serif;
        }

        .cart-shell {
            border: 1px solid rgba(15, 23, 42, 0.08);
            border-radius: 1.2rem;
            padding: 1rem;
            background: linear-gradient(150deg, #f8fafc, #ffffff 52%, #fff7ed);
        }

        .cart-header {
            display: flex;
            align-items: start;
            justify-content: space-between;
            gap: 0.8rem;
            margin-bottom: 1rem;
            flex-wrap: wrap;
        }

        .kicker {
            margin: 0;
            color: #d9480f;
            font-size: 0.72rem;
            letter-spacing: 0.16em;
            font-weight: 700;
        }

        .cart-header h1 {
            margin: 0.3rem 0;
            color: #0f172a;
            font-size: clamp(1.5rem, 3vw, 2.2rem);
        }

        .cart-header p {
            margin: 0;
            color: #64748b;
        }

        .empty-cart {
            text-align: center;
            border: 1px dashed rgba(15, 23, 42, 0.25);
            border-radius: 1rem;
            padding: 2rem 1rem;
            background: rgba(255, 255, 255, 0.8);
        }

        .emoji {
            font-size: 4rem;
        }

        .empty-cart h2 {
            margin: 0.7rem 0 0.3rem;
            color: #0f172a;
        }

        .empty-cart p {
            margin: 0 0 1rem;
            color: #64748b;
        }

        .cart-grid {
            display: grid;
            grid-template-columns: 1fr 330px;
            gap: 1rem;
        }

        .items-zone,
        .summary-zone {
            border: 1px solid rgba(15, 23, 42, 0.08);
            border-radius: 1rem;
            background: #fff;
        }

        .items-zone {
            padding: 0.9rem;
        }

        .item-card {
            display: grid;
            grid-template-columns: 100px 1fr;
            gap: 0.8rem;
            padding: 0.8rem 0;
        }

        .item-card.with-separator {
            border-top: 1px solid rgba(15, 23, 42, 0.08);
        }

        .img-wrap {
            width: 100px;
            height: 100px;
            border-radius: 0.7rem;
            overflow: hidden;
            background: linear-gradient(145deg, #f1f5f9, #e2e8f0);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .img-wrap img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .line-top,
        .line-bottom {
            display: flex;
            align-items: start;
            justify-content: space-between;
            gap: 0.6rem;
            flex-wrap: wrap;
        }

        .line-top h3 {
            margin: 0;
            color: #0f172a;
        }

        .line-top small {
            color: #64748b;
        }

        .line-top strong {
            color: #d9480f;
            font-size: 1.05rem;
        }

        .tags {
            margin: 0.6rem 0;
            display: flex;
            flex-wrap: wrap;
            gap: 0.35rem;
        }

        .options-editor {
            margin-bottom: 0.65rem;
            padding: 0.55rem;
            border: 1px solid rgba(15, 23, 42, 0.09);
            border-radius: 0.65rem;
            background: #f8fafc;
        }

        .option-line {
            display: flex;
            align-items: center;
            gap: 0.35rem;
            color: #334155;
            margin-bottom: 0.35rem;
        }

        .option-line-size {
            display: grid;
            gap: 0.35rem;
            margin-bottom: 0.55rem;
        }

        .option-line-size label {
            font-size: 0.86rem;
            font-weight: 600;
            color: #0f172a;
        }

        .option-line:last-child {
            margin-bottom: 0;
        }

        .flocage-grid {
            margin-top: 0.45rem;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.45rem;
        }

        .tags span {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            color: #1d4ed8;
            border-radius: 999px;
            font-size: 0.72rem;
            padding: 0.2rem 0.55rem;
        }

        .qty {
            display: flex;
            align-items: center;
            gap: 0.45rem;
        }

        .qty span {
            min-width: 28px;
            text-align: center;
            font-weight: 700;
            color: #0f172a;
        }

        .actions {
            display: flex;
            align-items: center;
            gap: 0.4rem;
        }

        .actions strong {
            color: #0f172a;
        }

        .bottom-actions {
            margin-top: 0.8rem;
            display: flex;
            justify-content: end;
        }

        .summary-zone {
            padding: 1rem;
            position: sticky;
            top: 0.8rem;
            align-self: start;
        }

        .summary-zone h3 {
            margin: 0 0 0.8rem;
            color: #0f172a;
            font-size: 1.2rem;
        }

        .summary-line,
        .summary-total {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.45rem;
            color: #334155;
        }

        .summary-total {
            font-size: 1.15rem;
            color: #0f172a;
            margin-bottom: 1rem;
        }

        .summary-zone small {
            display: block;
            margin-top: 0.6rem;
            color: #64748b;
            text-align: center;
        }

        @media (max-width: 991px) {
            .cart-grid {
                grid-template-columns: 1fr;
            }

            .summary-zone {
                position: static;
            }

            .item-card {
                grid-template-columns: 1fr;
            }

            .img-wrap {
                width: 100%;
                height: 220px;
            }
        }

        @media (max-width: 640px) {
            :host {
                padding: 0.7rem;
            }

            .cart-shell,
            .items-zone,
            .summary-zone {
                padding: 0.75rem;
            }

            .bottom-actions {
                width: 100%;
            }

            .bottom-actions .p-button,
            .summary-zone .p-button {
                width: 100%;
            }
        }
    `]
})
export class ShoppingCartComponent implements OnInit {
    private readonly taillesStandards = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
    private readonly taillesSelectionCache = new Map<string, { raw: string; values: string[] }>();

    public panierService = inject(PanierService);
    private whatsappService = inject(WhatsappService);
    private commandeService = inject(CommandeService);
    private produitService = inject(ProduitService);
    private router = inject(Router);
    private confirmationService = inject(ConfirmationService);
    private messageService = inject(MessageService);

    dialogCommandeVisible = false;
    infosClient: InfosClient = {
        nom: '',
        telephone: '',
        adresse: '',
        notes: ''
    };

    ngOnInit() {}

    continuerAchats() {
        this.router.navigate(['/boutique']);
    }

    modifierQuantite(article: ArticlePanier, nouvelleQuantite: number) {
        if (nouvelleQuantite > 0) {
            this.panierService.mettreAJourQuantite(article.id, nouvelleQuantite);

            const tailles = this.taillesSelectionnees(article);
            if (tailles.length > nouvelleQuantite) {
                this.changerTaille(article, tailles.slice(0, nouvelleQuantite));
            }
        }
    }

    confirmerSuppression(article: ArticlePanier) {
        this.confirmationService.confirm({
            message: `Voulez-vous retirer "${article.produit.nom}" (Taille ${article.options.taille}) du panier ?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui, retirer',
            rejectLabel: 'Annuler',
            accept: () => {
                this.panierService.retirerDuPanier(article.id);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Retire',
                    detail: 'Article retire du panier'
                });
            }
        });
    }

    confirmerViderPanier() {
        this.confirmationService.confirm({
            message: 'Voulez-vous vraiment vider tout le panier ?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui, vider',
            rejectLabel: 'Annuler',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.panierService.viderPanier();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Panier vide',
                    detail: 'Tous les articles ont ete retires'
                });
            }
        });
    }

    ouvrirDialogCommande() {
        this.dialogCommandeVisible = true;
    }

    envoyerCommande() {
        const articles = this.panierService.articles();
        const montantTotal = this.panierService.montantTotal();

        const commande = {
            clientNom: this.infosClient.nom,
            clientTelephone: this.infosClient.telephone,
            clientAdresse: this.infosClient.adresse,
            notes: this.infosClient.notes,
            lignes: articles.map((a) => ({
                produitId: a.produit.id,
                taille: a.options.taille,
                couleur: a.options.couleur,
                quantite: a.quantite,
                badgesOfficiels: a.options.badgesOfficiels,
                flocage: a.options.flocage,
                flocageNom: a.options.flocageNom || null,
                flocageNumero: a.options.flocageNumero || null,
                prixOptionsUnitaire: a.prixOptionsUnitaire
            }))
        };

        this.commandeService.creerCommande(commande).subscribe({
            next: (res) => {
                const message = this.whatsappService.creerMessageCommande(
                    {
                        nomClient: this.infosClient.nom,
                        telephoneClient: this.infosClient.telephone,
                        adresseClient: this.infosClient.adresse,
                        note: this.infosClient.notes,
                        montantTotal,
                        articles: articles.map((a) => ({
                            produitId: a.produit.id,
                            produitNom: a.produit.nom,
                            quantite: a.quantite,
                            options: a.options
                        }))
                    },
                    res.id
                );
                this.whatsappService.envoyerMessage(message);

                this.dialogCommandeVisible = false;
                this.panierService.viderPanier();

                this.messageService.add({
                    severity: 'success',
                    summary: 'Commande envoyee',
                    detail: 'Vous allez etre redirige vers WhatsApp pour finaliser.',
                    life: 5000
                });
            },
            error: (err) => {
                console.error('Erreur lors de la creation de la commande', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur Commande',
                    detail: 'Une erreur est survenue. Veuillez reessayer.',
                    life: 5000
                });
            }
        });
    }

    formatPrix(prix: number): string {
        return new Intl.NumberFormat('fr-FR').format(prix);
    }

    prixUnitaire(article: ArticlePanier): number {
        return article.produit.prix + article.prixOptionsUnitaire;
    }

    changerBadge(article: ArticlePanier, value: boolean): void {
        const options = {
            ...article.options,
            badgesOfficiels: value
        };
        this.mettreAJourOptions(article, options);
    }

    changerTaille(article: ArticlePanier, taillesSelectionnees: string[] | null | undefined): void {
        const tailles = (taillesSelectionnees ?? [])
            .map((taille) => (taille ?? '').trim().toUpperCase())
            .filter((taille) => taille.length > 0);

        let taillesFinales = tailles;
        if (article.quantite <= 1 && tailles.length > 0) {
            taillesFinales = [tailles[tailles.length - 1]];
        } else if (tailles.length > article.quantite) {
            taillesFinales = tailles.slice(0, article.quantite);
        }

        const tailleChoisie = taillesFinales.length > 0 ? taillesFinales.join(', ') : 'M';
        const options = {
            ...article.options,
            taille: tailleChoisie
        };
        this.mettreAJourOptions(article, options);

        this.taillesSelectionCache.set(article.id, {
            raw: tailleChoisie,
            values: taillesFinales.length > 0 ? taillesFinales : ['M']
        });
    }

    changerFlocage(article: ArticlePanier, value: boolean): void {
        const options = {
            ...article.options,
            flocage: value,
            flocageNom: value ? (article.options.flocageNom ?? '') : '',
            flocageNumero: value ? (article.options.flocageNumero ?? '') : '',
            flocageTexte: value ? (article.options.flocageTexte ?? '') : ''
        };
        this.mettreAJourOptions(article, options);
    }

    changerFlocageNom(article: ArticlePanier, value: string): void {
        const options = {
            ...article.options,
            flocageNom: value
        };
        this.mettreAJourOptions(article, options);
    }

    changerFlocageNumero(article: ArticlePanier, value: string): void {
        const options = {
            ...article.options,
            flocageNumero: value
        };
        this.mettreAJourOptions(article, options);
    }

    private mettreAJourOptions(article: ArticlePanier, options: ArticlePanier['options']): void {
        const cleaned = {
            ...options,
            flocageNom: options.flocageNom?.trim() ?? '',
            flocageNumero: options.flocageNumero?.trim() ?? ''
        };

        cleaned.flocageTexte = cleaned.flocage
            ? [cleaned.flocageNom, cleaned.flocageNumero].filter((value) => !!value && value.length > 0).join(' ')
            : '';

        const prixOptions = this.calculerPrixOptions(cleaned);
        this.panierService.mettreAJourOptions(article.id, cleaned, prixOptions);
    }

    private calculerPrixOptions(options: ArticlePanier['options']): number {
        const prixBadge = options.badgesOfficiels ? 500 : 0;
        if (!options.flocage) {
            return prixBadge;
        }

        const longueurFlocage = `${options.flocageNom ?? ''}${options.flocageNumero ?? ''}`.trim().length;
        return prixBadge + (longueurFlocage * 500);
    }

    produitImage(imageUrl?: string): string {
        return this.produitService.resolveImageUrl(imageUrl);
    }

    taillesOptions(article: ArticlePanier): Array<{ label: string; value: string }> {
        const taillesProduit = Array.isArray(article.produit.taillesDisponibles)
            ? article.produit.taillesDisponibles
            : [];

        const tailles = Array.from(new Set([
            ...this.taillesStandards,
            ...taillesProduit.map((taille) => (taille ?? '').trim().toUpperCase())
        ])).filter((taille) => taille.length > 0);

        return tailles.map((taille) => ({
            label: `Taille ${taille}`,
            value: taille
        }));
    }

    taillesSelectionnees(article: ArticlePanier): string[] {
        const raw = this.normaliserValeurTaille(article.options.taille);
        const cache = this.taillesSelectionCache.get(article.id);

        if (cache && cache.raw === raw) {
            return cache.values;
        }

        const tailles = raw
            .split(',')
            .map((taille) => taille.trim().toUpperCase())
            .filter((taille) => taille.length > 0);

        const values = tailles.length > 0 ? tailles : ['M'];
        this.taillesSelectionCache.set(article.id, { raw, values });
        return values;
    }

    private normaliserValeurTaille(taille: unknown): string {
        if (Array.isArray(taille)) {
            return taille
                .map((value) => String(value ?? '').trim())
                .filter((value) => value.length > 0)
                .join(', ');
        }

        return String(taille ?? '').trim();
    }
}
