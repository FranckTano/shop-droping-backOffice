import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EvolutionMensuelle {
    mois: string;
    totalCommandes: number;
    confirmees: number;
    annulees: number;
    livrees: number;
    caConfirmees: number;
}

export interface RepartitionStatut {
    statut: string;
    nb: number;
}

export interface TopProduit {
    nom: string;
    totalVendu: number;
    caTotal: number;
}

export interface DataPoint {
    label: string;
    valeur: number;
}

@Injectable({ providedIn: 'root' })
export class KpiService {
    constructor(private http: HttpClient) {}

    getEvolutionMensuelle(): Observable<EvolutionMensuelle[]> {
        return this.http.get<EvolutionMensuelle[]>('api/admin/kpi/evolution-mensuelle');
    }

    getRepartitionStatuts(): Observable<RepartitionStatut[]> {
        return this.http.get<RepartitionStatut[]>('api/admin/kpi/repartition-statuts');
    }

    getTopProduits(): Observable<TopProduit[]> {
        return this.http.get<TopProduit[]>('api/admin/kpi/top-produits');
    }

    getCommandesParJourSemaine(): Observable<DataPoint[]> {
        return this.http.get<DataPoint[]>('api/admin/kpi/commandes-par-jour-semaine');
    }
}
