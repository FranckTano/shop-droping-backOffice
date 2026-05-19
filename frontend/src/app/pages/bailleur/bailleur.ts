import {Component, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ButtonModule} from 'primeng/button';
import {CardModule} from 'primeng/card';
import {Table, TableModule} from 'primeng/table';
import {InputTextModule} from 'primeng/inputtext';
import {DialogModule} from 'primeng/dialog';
import {InputIconModule} from 'primeng/inputicon';
import {IconFieldModule} from 'primeng/iconfield';
import {TagModule} from 'primeng/tag';
import {TooltipModule} from 'primeng/tooltip';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ConfirmationService, MessageService} from 'primeng/api';
import {ToastModule} from 'primeng/toast';


@Component({
	selector: 'app-bailleur',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		ButtonModule,
		CardModule,
		TableModule,
		InputTextModule,
		DialogModule,
		InputIconModule,
		IconFieldModule,
		TagModule,
		TooltipModule,
		ConfirmDialogModule,
		ToastModule
	],
	providers: [ConfirmationService, MessageService],
	templateUrl: './bailleur.html',
	styleUrls: ['./bailleur.scss']
})
export class BailleurComponent {

}
