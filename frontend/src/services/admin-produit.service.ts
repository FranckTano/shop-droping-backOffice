import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProduitAdmin {
    id: number;
    nom: string;
    description: string;
    prix: number;
    prixPromo: number | null;
    prixEffectif: number;
    imagePrincipale: string;
    actif: boolean;
    enPromotion: boolean;
    nouveau: boolean;
    equipe: string;
    saison: string;
    marque: string;
    couleursDisponibles: string | null;
    categorieId: number | null;
    categorieNom: string;
}

export interface ProduitCreateRequest {
    nom: string;
    description: string;
    prix: number;
    prixPromo?: number;
    categorieId?: number;
    imagePrincipale?: string;
    equipe?: string;
    saison?: string;
    marque?: string;
    couleursDisponibles?: string;
    enPromotion?: boolean;
    nouveau?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminProduitService {
    private readonly BASE = 'api/admin/produits';

    constructor(private http: HttpClient) {}

    lister(): Observable<ProduitAdmin[]> {
        return this.http.get<ProduitAdmin[]>(this.BASE);
    }

    rechercher(terme: string): Observable<ProduitAdmin[]> {
        return this.http.get<ProduitAdmin[]>(`${this.BASE}/rechercher`, { params: { q: terme } });
    }

    listerArchives(): Observable<ProduitAdmin[]> {
        return this.http.get<ProduitAdmin[]>(`${this.BASE}/archives`);
    }

    getById(id: number): Observable<ProduitAdmin> {
        return this.http.get<ProduitAdmin>(`${this.BASE}/${id}`);
    }

    creer(req: ProduitCreateRequest): Observable<ProduitAdmin> {
        return this.http.post<ProduitAdmin>(this.BASE, req);
    }

    mettreAJour(id: number, req: ProduitCreateRequest & { actif?: boolean }): Observable<ProduitAdmin> {
        return this.http.put<ProduitAdmin>(`${this.BASE}/${id}`, req);
    }

    archiver(id: number): Observable<void> {
        return this.http.delete<void>(`${this.BASE}/${id}`);
    }

    restaurer(id: number): Observable<ProduitAdmin> {
        return this.http.patch<ProduitAdmin>(`${this.BASE}/${id}/restaurer`, {});
    }

    uploadImage(file: File): Observable<{ url: string; filename: string }> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<{ url: string; filename: string }>('api/admin/upload/image', formData);
    }
}
