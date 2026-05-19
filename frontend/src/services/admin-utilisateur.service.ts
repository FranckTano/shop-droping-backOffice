import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type RoleUtilisateur = 'ADMIN' | 'SUPER_ADMIN';
export type StatutUtilisateur = 'ACTIF' | 'INACTIF';

export interface Utilisateur {
    id: number;
    nom: string;
    prenoms: string;
    username: string;
    role: RoleUtilisateur;
    statut: StatutUtilisateur;
}

export interface CreateUtilisateurRequest {
    nom: string;
    prenoms: string;
    username: string;
    password: string;
    role: RoleUtilisateur;
    statut: StatutUtilisateur;
}

@Injectable({ providedIn: 'root' })
export class AdminUtilisateurService {
    private readonly BASE = 'api/utilisateurs';

    constructor(private http: HttpClient) {}

    lister(): Observable<Utilisateur[]> {
        return this.http.get<Utilisateur[]>(this.BASE);
    }

    creer(req: CreateUtilisateurRequest): Observable<void> {
        return this.http.post<void>(this.BASE, req);
    }

    mettreAJour(id: number, req: Partial<CreateUtilisateurRequest>): Observable<void> {
        return this.http.put<void>(`${this.BASE}/${id}`, req);
    }

    changerStatut(id: number, statut: StatutUtilisateur): Observable<void> {
        return this.http.patch<void>(`${this.BASE}/${id}/statut`, { statut });
    }

    supprimer(id: number): Observable<void> {
        return this.http.delete<void>(`${this.BASE}/${id}`);
    }
}
