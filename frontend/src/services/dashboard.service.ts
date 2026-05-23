import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

    getStats(): Observable<DashboardStats> {
        return this.http.get<DashboardStats>(`${this.BASE}/stats`);
    }

    getCommandesRecentes(): Observable<CommandeRecente[]> {
        return this.http.get<CommandeRecente[]>(`${this.BASE}/commandes-recentes`);
    }
}
