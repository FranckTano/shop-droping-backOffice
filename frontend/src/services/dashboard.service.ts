import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
    totalCommandes: number;
    commandesEnAttente: number;
    commandesConfirmees: number;
    commandesEnCours: number;
    commandesExpediees: number;
    commandesValidees: number;
    commandesLivrees: number;
    commandesAnnulees: number;
    commandesStandby: number;
    chiffreAffaires: number;
    chiffreAffairesLivrees: number;
    totalProduits: number;
    produitsActifs: number;
    produitsArchives: number;
}

export interface CommandeRecente {
    id: number;
    numero: string;
    clientNom: string;
    clientTelephone: string;
    montantTotal: number;
    statut: string;
    createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
    private readonly BASE = 'api/admin/dashboard';

    constructor(private http: HttpClient) {}

    getStats(dateDebut?: Date | null, dateFin?: Date | null): Observable<DashboardStats> {
        let params = new HttpParams();
        if (dateDebut) params = params.set('dateDebut', this.formatDate(dateDebut));
        if (dateFin)   params = params.set('dateFin',   this.formatDate(dateFin));
        return this.http.get<DashboardStats>(`${this.BASE}/stats`, { params });
    }

    private formatDate(d: Date): string {
        return d.toISOString().slice(0, 10);
    }

    getCommandesRecentes(): Observable<CommandeRecente[]> {
        return this.http.get<CommandeRecente[]>(`${this.BASE}/commandes-recentes`);
    }
}
