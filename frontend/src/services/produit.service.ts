import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

// Correspond au modèle Produit du backend
export interface Produit {
  id: number;
  nom: string;
  description: string;
  prix: number;
  imageUrl: string;
  categorie: string;
  equipe: string;
  saison: string;
  marque: string;
  taillesDisponibles: string[];
  couleursDisponibles: string[];
  stockTotal: number;
  enStock: boolean;
}

interface ApiTaille {
  taille?: string;
  stock?: number;
  enStock?: boolean;
}

interface ApiCategorie {
  nom?: string;
}

interface ApiProduit {
  id?: number;
  nom?: string;
  description?: string;
  prix?: number;
  prixEffectif?: number;
  imageUrl?: string;
  imagePrincipale?: string;
  equipe?: string;
  saison?: string;
  marque?: string;
  couleursDisponibles?: string[];
  tailles?: ApiTaille[];
  stockTotal?: number;
  enStock?: boolean;
  categorieNom?: string;
  categorie?: string | ApiCategorie;
  images?: Array<{ url?: string }> | string[];
}

@Injectable({
  providedIn: 'root'
})
export class ProduitService {
  private apiUrl = `${environment.apiUrl}/produits`;
  private readonly apiBaseUrl = environment.apiUrl.replace(/\/api$/, '');
  private readonly imagePlaceholder = '/images/app/login.png';

  constructor(private http: HttpClient) { }

  getProduits(): Observable<Produit[]> {
    return this.http.get<ApiProduit[]>(this.apiUrl).pipe(
      map((items) => (Array.isArray(items) ? items : []).map((item) => this.mapProduit(item)))
    );
  }

  getProduitById(id: number): Observable<Produit> {
    return this.http.get<ApiProduit>(`${this.apiUrl}/${id}`).pipe(
      map((item) => this.mapProduit(item))
    );
  }

  resolveImageUrl(imageUrl?: string): string {
    const normalized = (imageUrl ?? '').trim();

    if (!normalized) {
      return this.imagePlaceholder;
    }

    if (/^https?:\/\//i.test(normalized)) {
      return encodeURI(normalized);
    }

    const cleaned = normalized.replace(/\\/g, '/').replace(/^\/+/, '');

    // Toutes les images metier sont servies par le backend via /assets/images/**.
    if (cleaned.startsWith('assets/images/')) {
      return this.buildAssetImageUrl(cleaned.replace(/^assets\/images\//, ''));
    }

    if (cleaned.startsWith('assets/')) {
      return `${this.apiBaseUrl}/${this.encodePath(cleaned)}`;
    }

    if (cleaned.startsWith('images/')) {
      return this.buildAssetImageUrl(cleaned.replace(/^images\//, ''));
    }

    return this.buildAssetImageUrl(cleaned);
  }

  private mapProduit(item: ApiProduit): Produit {
    const categorie = item?.categorieNom ?? (typeof item?.categorie === 'string'
      ? item.categorie
      : item?.categorie?.nom) ?? 'collection';

    const imageFromCollection = Array.isArray(item?.images)
      ? item.images.find((img) => typeof img === 'string' ? !!img : !!img?.url)
      : undefined;

    const imageFromCollectionUrl = typeof imageFromCollection === 'string'
      ? imageFromCollection
      : imageFromCollection?.url;

    return {
      id: Number(item?.id ?? 0),
      nom: item?.nom ?? 'Produit',
      description: item?.description ?? this.buildFallbackDescription(item),
      prix: Number(item?.prixEffectif ?? item?.prix ?? 0),
      imageUrl: item?.imageUrl ?? item?.imagePrincipale ?? imageFromCollectionUrl ?? this.imagePlaceholder,
      categorie,
      equipe: item?.equipe ?? 'Equipe officielle',
      saison: item?.saison ?? 'Saison en cours',
      marque: item?.marque ?? 'Marque officielle',
      taillesDisponibles: this.mapTailles(item?.tailles),
      couleursDisponibles: this.mapCouleurs(item?.couleursDisponibles),
      stockTotal: Number(item?.stockTotal ?? 0),
      enStock: Boolean(item?.enStock ?? true)
    };
  }

  private mapTailles(tailles?: ApiTaille[]): string[] {
    const mapped = Array.isArray(tailles)
      ? tailles
          .filter((taille) => (taille?.enStock ?? true) && !!taille?.taille)
          .map((taille) => (taille?.taille ?? '').trim())
      : [];

    return mapped.length > 0 ? mapped : ['S', 'M', 'L', 'XL'];
  }

  private mapCouleurs(couleurs?: string[]): string[] {
    const mapped = Array.isArray(couleurs)
      ? couleurs.map((color) => (color ?? '').trim()).filter((color) => color.length > 0)
      : [];

    return mapped.length > 0 ? mapped : ['Standard'];
  }

  private buildFallbackDescription(item: ApiProduit): string {
    const equipe = item?.equipe ?? 'Equipe officielle';
    const saison = item?.saison ?? 'Saison en cours';
    const marque = item?.marque ?? 'Marque officielle';
    const couleurs = this.mapCouleurs(item?.couleursDisponibles).join(', ');
    const tailles = this.mapTailles(item?.tailles).join(', ');
    return `Maillot ${equipe}, marque ${marque}, saison ${saison}. Tailles disponibles: ${tailles}. Couleurs disponibles: ${couleurs}.`;
  }

  private buildAssetImageUrl(relativeImagePath: string): string {
    const safePath = this.encodePath(relativeImagePath.replace(/^\/+/, ''));
    return `${this.apiBaseUrl}/assets/images/${safePath}`;
  }

  private encodePath(path: string): string {
    return path
      .split('/')
      .filter((segment) => segment.length > 0)
      .map((segment) => {
        try {
          return encodeURIComponent(decodeURIComponent(segment));
        } catch {
          return encodeURIComponent(segment);
        }
      })
      .join('/');
  }
}

