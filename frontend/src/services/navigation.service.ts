import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class NavigationService {
    constructor(private readonly router: Router) {}

    async goTo(route: string): Promise<void> {
        await this.router.navigate([route]);
    }

    goToHome(): void {
        this.goTo('/admin/dashboard');
    }

    goTologin(): void {
        this.goTo('/connexion');
    }

    getCurrentUrl(): string {
        return this.router.url;
    }

    isLogin(): boolean {
        return this.router.url === '/connexion';
    }
}
