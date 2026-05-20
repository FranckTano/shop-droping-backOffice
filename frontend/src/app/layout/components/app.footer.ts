import {Component, inject} from '@angular/core';
import {ButtonModule} from 'primeng/button';
import {LayoutService} from "@/layout/service/layout.service";
import {NgClass} from "@angular/common";

@Component({
	standalone: true,
	selector: '[app-footer]',
	imports: [ButtonModule, NgClass],
	template: `
		<div class="flex justify-start items-center gap-2">
			<i class="pi pi-shopping-bag text-primary" style="font-size: 1.1rem"></i>
			<span class="titre-logo font-semibold"
			[ngClass]="{
				'text-white': layoutService.isDarkTheme(),
				'text-primary': !layoutService.isDarkTheme()
			}">
				{{ layoutService.isSlimPlus() ? 'SD' : 'Shop Droping' }}
			</span>
		</div>
		<div class="flex gap-0 items-center">
			<small class="text-muted-color">&copy; {{ annee }} Shop Droping. Tous droits réservés.</small>
		</div>`,
	host: {
		class: 'layout-footer'
	},
	styles: `
		.titre-logo {
			font-family: "Bauhaus 93", serif;
			font-weight: normal;
			font-size: 20px;
			transition: all 0.3s ease;
			white-space: nowrap;
			overflow: hidden;
		}

		.titre-slim-plus {
			font-size: 18px;
			font-weight: bold;
			letter-spacing: 0.5px;
			text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
		}

		.titre-slim {
			font-size: 16px;
			font-weight: bold;
		}

		.titre-normal {
			font-size: 20px;
		}

		.version-info {
			font-size: 12px;
			opacity: 0.8;
		}

		.layout-footer {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 0.5rem 1rem;
			width: 100%;
		}

		@media (max-width: 768px) {
			.titre-slim-plus {
				font-size: 16px;
			}

			.titre-slim {
				font-size: 14px;
			}

			.titre-normal {
				font-size: 18px;
			}
		}
	`
})
export class AppFooter {
	layoutService = inject(LayoutService);
	readonly annee = new Date().getFullYear();
}
