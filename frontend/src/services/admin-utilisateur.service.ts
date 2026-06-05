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
    telephone: string | null;
    recevoirCommandes: boolean;
}

export interface CreateUtilisateurRequest {
    nom: string;
    prenoms: string;
    username: string;
    password: string;
    role: RoleUtilisateur;
    telephone?: string;
}

export interface UpdateUtilisateurRequest {
    nom?: string;
    prenoms?: string;
    username?: string;
    password?: string;
    role?: RoleUtilisateur;
    statut?: StatutUtilisateur;
    telephone?: string;
}

export interface AdminActif {
    telephone: string;
    nom: string;
    configure: string;
}

@Injectable({ providedIn: 'root' })
export class AdminUtilisateurService {
    private readonly BASE = 'api/utilisateurs';

    constructor(private http: HttpClient) {}

    lister(): Observable<Utilisateur[]> {
        return this.http.get<Utilisateur[]>(this.BASE);
    }

    creer(req: CreateUtilisateurRequest): Observable<Utilisateur> {
        return this.http.post<Utilisateur>(this.BASE, req);
    }

    mettreAJour(id: number, req: UpdateUtilisateurRequest): Observable<Utilisateur> {
        return this.http.put<Utilisateur>(`${this.BASE}/${id}`, req);
    }

    changerStatut(id: number, statut: StatutUtilisateur): Observable<Utilisateur> {
        return this.http.patch<Utilisateur>(`${this.BASE}/${id}/statut`, { statut });
    }

    definirAdminActif(id: number): Observable<Utilisateur> {
        return this.http.patch<Utilisateur>(`${this.BASE}/${id}/definir-admin-actif`, {});
    }

    supprimer(id: number): Observable<void> {
        return this.http.delete<void>(`${this.BASE}/${id}`);
    }

    getAdminActif(): Observable<AdminActif> {
        return this.http.get<AdminActif>('api/admin/admin-actif');
    }
}
