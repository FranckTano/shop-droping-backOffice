import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type StatutCommande = 'EN_ATTENTE' | 'CONFIRMEE' | 'EN_COURS' | 'EXPEDIEE' | 'VALIDEE' | 'LIVREE' | 'ANNULEE' | 'STANDBY';

export interface LigneCommande {
    id: number;
    produitNom: string;
    produitImage: string | null;
    taille: string;
    couleur: string;
    quantite: number;
    prixUnitaire: number;
    prixTotal: number;
    badgesOfficiels: boolean;
    flocage: boolean;
    flocageNom: string;
    flocageNumero: string;
}

export interface Commande {
    id: number;
    numero: string;
    clientNom: string;
    clientTelephone: string;
    clientEmail: string;
    clientAdresse: string;
    montantTotal: number;
    statut: StatutCommande;
    notes: string;
    whatsappMessageSent: boolean;
    createdAt: string;
    lignes: LigneCommande[];
}

@Injectable({ providedIn: 'root' })
export class AdminCommandeService {
    private readonly BASE = 'api/admin/commandes';

    constructor(private http: HttpClient) {}

    listerToutes(): Observable<Commande[]> {
        return this.http.get<Commande[]>(this.BASE);
    }

    getById(id: number): Observable<Commande> {
        return this.http.get<Commande>(`${this.BASE}/${id}`);
    }

    listerParStatut(statut: StatutCommande): Observable<Commande[]> {
        return this.http.get<Commande[]>(`${this.BASE}/statut/${statut}`);
    }

    changerStatut(id: number, statut: StatutCommande): Observable<Commande> {
        return this.http.patch<Commande>(`${this.BASE}/${id}/statut`, { statut });
    }

    getLienWhatsApp(id: number): Observable<{ lien: string; message: string }> {
        return this.http.get<{ lien: string; message: string }>(`${this.BASE}/whatsapp/${id}`);
    }

    supprimer(id: number): Observable<void> {
        return this.http.delete<void>(`${this.BASE}/${id}`);
    }
}
