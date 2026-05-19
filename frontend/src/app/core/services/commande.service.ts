import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export type CommandeStatus = 'EN_ATTENTE' | 'EN_COURS' | 'LIVREE';

export interface Commande {
  id: number;
  date: string;
  status: CommandeStatus;
  total: number;
  clientName: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommandeService {
  private readonly apiUrl = `${environment.apiUrl}/commandes`;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Commande[]> {
    return this.http.get<Commande[]>(this.apiUrl);
  }

  updateStatus(id: number, status: CommandeStatus): Observable<Commande> {
    return this.http.put<Commande>(`${this.apiUrl}/${id}/status`, { status });
  }
}
