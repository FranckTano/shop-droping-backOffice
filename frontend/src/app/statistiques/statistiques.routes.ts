import {Routes} from '@angular/router';

export default [
	{
		path: 'tableau-de-bord',
		loadComponent: () => import('./tableau-de-bord/tableau-de-bord.component').then((c) => c.TableauDeBordStatistiquesComponent)
	}
] as Routes;
