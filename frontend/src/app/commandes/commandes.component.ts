import { Component, OnInit } from '@angular/core';
import { Commande, CommandeService, CommandeStatus } from '../core/services/commande.service';

@Component({
  selector: 'app-commandes',
  standalone: false,
  templateUrl: './commandes.component.html'
})
export class CommandesComponent implements OnInit {
  commandes: Commande[] = [];
  readonly statusOptions = [
    { label: 'EN_ATTENTE', value: 'EN_ATTENTE' },
    { label: 'EN_COURS', value: 'EN_COURS' },
    { label: 'LIVREE', value: 'LIVREE' }
  ];

  constructor(private readonly commandeService: CommandeService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.commandeService.getAll().subscribe((data) => {
      this.commandes = data;
    });
  }

  onStatusChange(commande: Commande, status: CommandeStatus): void {
    this.commandeService.updateStatus(commande.id, status).subscribe((updated) => {
      commande.status = updated.status;
    });
  }
}
