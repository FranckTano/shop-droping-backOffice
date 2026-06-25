import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-menu, [app-menu]',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `
        <ul class="layout-menu" #menuContainer>
            <ng-container *ngFor="let item of model; let i = index">
                <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
                <li *ngIf="item.separator" class="menu-separator"></li>
            </ng-container>
        </ul>`
})
export class AppMenu implements OnInit {
    el: ElementRef = inject(ElementRef);
    private authService = inject(AuthService);

    @ViewChild('menuContainer') menuContainer!: ElementRef;

    model: MenuItem[] = [];

    ngOnInit(): void {
        const items: MenuItem[] = [
            {
                label: 'Navigation',
                items: [
                    {
                        label: 'Tableau de bord',
                        icon: 'pi pi-home',
                        routerLink: ['/admin/dashboard']
                    },
                    {
                        label: 'Produits',
                        icon: 'pi pi-box',
                        routerLink: ['/admin/produits']
                    },
                    {
                        label: 'Commandes',
                        icon: 'pi pi-shopping-cart',
                        routerLink: ['/admin/commandes']
                    },
                    {
                        label: 'Analytiques',
                        icon: 'pi pi-chart-line',
                        routerLink: ['/admin/analytiques']
                    }
                ]
            }
        ];

        if (this.authService.isSuperAdmin()) {
            items.push({
                label: 'Administration',
                items: [
                    {
                        label: 'Utilisateurs',
                        icon: 'pi pi-users',
                        routerLink: ['/admin/utilisateurs']
                    },
                    {
                        label: 'Journal d\'audit',
                        icon: 'pi pi-shield',
                        routerLink: ['/admin/audit-log']
                    }
                ]
            });
        }

        this.model = items;
    }
}
