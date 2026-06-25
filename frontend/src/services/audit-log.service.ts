import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type TypeAction = 'CREATION' | 'MODIFICATION' | 'SUPPRESSION' | 'CHANGEMENT_STATUT';
export type TypeEntite = 'COMMANDE' | 'PRODUIT' | 'UTILISATEUR';

export interface AuditLogEntry {
    id: number;
    adminUsername: string;
    adminNom: string;
    typeAction: TypeAction;
    typeEntite: TypeEntite;
    entiteId: number | null;
    entiteReference: string | null;
    description: string;
    createdAt: string;
}

export interface PageResult<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

@Injectable({ providedIn: 'root' })
export class AuditLogService {
    constructor(private http: HttpClient) {}

    lister(params: {
        username?: string;
        typeEntite?: TypeEntite;
        joursHistorique?: number;
        page?: number;
        taille?: number;
    }): Observable<PageResult<AuditLogEntry>> {
        let p = new HttpParams();
        if (params.username)        p = p.set('username',        params.username);
        if (params.typeEntite)      p = p.set('typeEntite',      params.typeEntite);
        if (params.joursHistorique) p = p.set('joursHistorique', params.joursHistorique);
        if (params.page !== undefined) p = p.set('page',   params.page);
        if (params.taille)          p = p.set('taille',         params.taille);
        return this.http.get<PageResult<AuditLogEntry>>('api/admin/audit-log', { params: p });
    }
}
