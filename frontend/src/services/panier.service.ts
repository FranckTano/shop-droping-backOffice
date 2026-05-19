import { Injectable, signal, computed } from '@angular/core';
import { Produit } from './produit.service';

export interface OptionsMaillot {
  taille: string;
  couleur: string;
  badgesOfficiels: boolean;
  flocage: boolean;
  flocageNom?: string;
  flocageNumero?: string;
  flocageTexte?: string;
}

export interface ArticlePanier {
  id: string;
  produit: Produit;
  quantite: number;
  options: OptionsMaillot;
  prixOptionsUnitaire: number;
}

@Injectable({
  providedIn: 'root'
})
export class PanierService {
  private readonly STORAGE_KEY = 'shop_droping_panier';

  private articlesSignal = signal<ArticlePanier[]>(this.chargerDuLocalStorage());

  // Signals calculés
  readonly articles = this.articlesSignal.asReadonly();

  readonly nombreArticles = computed(() =>
    this.articlesSignal().reduce((total, item) => total + item.quantite, 0)
  );

  readonly montantTotal = computed(() =>
    this.articlesSignal().reduce((total, item) =>
      total + ((item.produit.prix + item.prixOptionsUnitaire) * item.quantite), 0
    )
  );

  readonly estVide = computed(() => this.articlesSignal().length === 0);

  constructor() {}

  private chargerDuLocalStorage(): ArticlePanier[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      const parsed = data ? JSON.parse(data) : [];
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.map((item: Partial<ArticlePanier> & { taille?: string }) => {
        if (!item.options) {
          const options: OptionsMaillot = {
            taille: item.taille ?? 'M',
            couleur: 'Standard',
            badgesOfficiels: false,
            flocage: false,
            flocageNom: '',
            flocageNumero: '',
            flocageTexte: ''
          };
          const optionsKey = this.getOptionsKey(options);
          return {
            id: this.getArticleId(item.produit?.id ?? 0, optionsKey),
            produit: item.produit as Produit,
            quantite: item.quantite ?? 1,
            options,
            prixOptionsUnitaire: item.prixOptionsUnitaire ?? 0
          } as ArticlePanier;
        }

        const optionsKey = this.getOptionsKey(item.options);
        return {
          ...item,
          id: item.id ?? this.getArticleId(item.produit?.id ?? 0, optionsKey)
        } as ArticlePanier;
      });
    } catch {
      return [];
    }
  }

  private sauvegarderDansLocalStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.articlesSignal()));
  }

  ajouterAuPanier(
    produit: Produit,
    options: OptionsMaillot,
    quantite: number = 1,
    prixOptionsUnitaire: number = 0
  ): void {
    const articles = [...this.articlesSignal()];
    const optionsKey = this.getOptionsKey(options);
    const articleId = this.getArticleId(produit.id, optionsKey);
    const index = articles.findIndex(item => item.id === articleId);

    if (index > -1) {
      articles[index] = {
        ...articles[index],
        quantite: articles[index].quantite + quantite,
        prixOptionsUnitaire
      };
    } else {
      articles.push({
        id: articleId,
        produit,
        quantite,
        options,
        prixOptionsUnitaire
      });
    }

    this.articlesSignal.set(articles);
    this.sauvegarderDansLocalStorage();
  }

  retirerDuPanier(articleId: string): void {
    const articles = this.articlesSignal().filter(item => item.id !== articleId);
    this.articlesSignal.set(articles);
    this.sauvegarderDansLocalStorage();
  }

  mettreAJourQuantite(articleId: string, quantite: number): void {
    if (quantite <= 0) {
      this.retirerDuPanier(articleId);
      return;
    }

    const articles = this.articlesSignal().map(item => {
      if (item.id === articleId) {
        return { ...item, quantite };
      }
      return item;
    });

    this.articlesSignal.set(articles);
    this.sauvegarderDansLocalStorage();
  }

  mettreAJourOptions(articleId: string, options: OptionsMaillot, prixOptionsUnitaire: number): void {
    const oldArticle = this.getArticle(articleId);
    if (!oldArticle) {
      return;
    }

    const cleanedOptions: OptionsMaillot = {
      ...options,
      flocageNom: options.flocageNom?.trim() ?? '',
      flocageNumero: options.flocageNumero?.trim() ?? '',
      flocageTexte: options.flocageTexte?.trim() ?? ''
    };

    const newOptionsKey = this.getOptionsKey(cleanedOptions);
    const newArticleId = this.getArticleId(oldArticle.produit.id, newOptionsKey);

    const remaining = this.articlesSignal().filter(item => item.id !== articleId);
    const duplicateIndex = remaining.findIndex(item => item.id === newArticleId);

    if (duplicateIndex > -1) {
      const duplicate = remaining[duplicateIndex];
      remaining[duplicateIndex] = {
        ...duplicate,
        quantite: duplicate.quantite + oldArticle.quantite,
        prixOptionsUnitaire
      };
      this.articlesSignal.set(remaining);
      this.sauvegarderDansLocalStorage();
      return;
    }

    this.articlesSignal.set(
      remaining.concat({
        ...oldArticle,
        id: newArticleId,
        options: cleanedOptions,
        prixOptionsUnitaire
      })
    );
    this.sauvegarderDansLocalStorage();
  }

  viderPanier(): void {
    this.articlesSignal.set([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  getArticle(articleId: string): ArticlePanier | undefined {
    return this.articlesSignal().find(item => item.id === articleId);
  }

  private getOptionsKey(options: OptionsMaillot): string {
    return JSON.stringify({
      taille: options.taille,
      couleur: options.couleur,
      badgesOfficiels: options.badgesOfficiels,
      flocage: options.flocage,
      flocageNom: options.flocageNom ?? '',
      flocageNumero: options.flocageNumero ?? '',
      flocageTexte: options.flocageTexte ?? ''
    });
  }

  private getArticleId(produitId: number, optionsKey: string): string {
    return `${produitId}:${optionsKey}`;
  }
}

