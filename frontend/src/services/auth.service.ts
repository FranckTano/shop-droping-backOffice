import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject, Observable } from 'rxjs';
import { Utilisateur } from '../models/utilisateur.model';
import { LoginPassword } from '../models/login-password.model';
import { NavigationService } from './navigation.service';
import { Token } from '../models/token.model';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private static readonly TOKEN_KEY = 'access_token';
    private readonly AUTH_URL = '/ws/securite/auth/login';

    utilisateur = new BehaviorSubject<Utilisateur | null>(null);
    utilisateurObservable = this.utilisateur.asObservable();

    constructor(
        private readonly http: HttpClient,
        private readonly jwtHelper: JwtHelperService,
        private readonly navigationService: NavigationService
    ) {}

    static updateAccessToken(token: string): void {
        // Le backend renvoie "Bearer <token>", on stocke le token brut
        const rawToken = token?.startsWith('Bearer ') ? token.substring(7) : token;
        localStorage.removeItem(AuthService.TOKEN_KEY);
        localStorage.setItem(AuthService.TOKEN_KEY, rawToken);
    }

    static getStoredToken(): string | null {
        return localStorage.getItem(AuthService.TOKEN_KEY);
    }

    getUtilisateurConnecte(): Utilisateur | null {
        if (this.isAuthenticated()) {
            return this.decodeToken(AuthService.getStoredToken()!);
        }
        return null;
    }

    decodeToken(jwt: string): Utilisateur {
        const utilisateur = new Utilisateur();
        const token = this.jwtHelper.decodeToken(jwt);
        utilisateur.id = token.id;
        utilisateur.nom = token.nom;
        utilisateur.prenoms = token.prenoms;
        utilisateur.login = token.username;
        utilisateur.role = token.role;
        utilisateur.fonctionnalites = token.fonctionnalites ?? [];
        utilisateur.statut = token.statut;
        return utilisateur;
    }

    getRole(): string | null {
        return this.getUtilisateurConnecte()?.role ?? null;
    }

    isSuperAdmin(): boolean {
        return this.getRole() === 'SUPER_ADMIN';
    }

    isAdmin(): boolean {
        const role = this.getRole();
        return role === 'ADMIN' || role === 'SUPER_ADMIN';
    }

    authentifier(loginPassword: LoginPassword): Observable<Token> {
        return this.http.post<Token>(this.AUTH_URL, loginPassword);
    }

    isAuthenticated(): boolean {
        const token = AuthService.getStoredToken();
        if (!token) return false;
        try {
            return !this.jwtHelper.isTokenExpired(token);
        } catch {
            return false;
        }
    }

    updateUtilisateurConnecte(): void {
        this.utilisateur.next(this.getUtilisateurConnecte());
    }

    deconnecter(): void {
        localStorage.removeItem(AuthService.TOKEN_KEY);
        this.utilisateur.next(null);
        this.navigationService.goTologin();
    }
}
