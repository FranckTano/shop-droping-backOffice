import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommandeService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/commandes';

  creerCommande(commande: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, commande);
  }
}
