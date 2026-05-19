import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
	selector: 'app-tableau-de-bord-statistiques',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		ChartModule,
		DropdownModule,
		CardModule,
		ButtonModule,
		ProgressSpinnerModule
	],
	templateUrl: './tableau-de-bord.component.html',
	styleUrl: './tableau-de-bord.component.scss'
})
export class TableauDeBordStatistiquesComponent {

}
