import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ArticlePanier } from './panier.service';

@Injectable({
  providedIn: 'root'
})
export class WhatsappService {
  private readonly numeroVendeur = '+2250799136306'; // Numéro du vendeur

  constructor() {}

  creerMessageCommande(commande: any, commandeId: number): string {
    let message = `🛒 *NOUVELLE COMMANDE #${commandeId} - Shop Droping*\n\n`;
    message += `👤 *Client:* ${commande.nomClient}\n`;
    message += `📱 *Téléphone:* ${commande.telephoneClient}\n`;
    message += `📍 *Adresse:* ${commande.adresseClient}\n`;
    if (commande.note) {
        message += `📝 *Notes:* ${commande.note}\n`;
    }
    message += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `📦 *ARTICLES COMMANDÉS:*\n\n`;

    commande.articles.forEach((article: any, index: number) => {
      message += `${index + 1}. *${article.produitNom || ('Produit ID: ' + article.produitId)}*\n`;
        message += `   📏 Taille: ${article.options.taille}\n`;
        message += `   🎨 Couleur: ${article.options.couleur}\n`;
        if (article.options.badgesOfficiels) {
            message += `   ✅ Badges officiels\n`;
        }
        if (article.options.flocage) {
        const detailFlocage = [article.options.flocageNom, article.options.flocageNumero]
          .filter((value: string) => !!value && value.trim().length > 0)
          .join(' ');
        message += `   🧵 Flocage: ${detailFlocage || article.options.flocageTexte || 'Oui'}\n`;
        }
        message += `   🔢 Quantité: ${article.quantite}\n\n`;
    });

    message += `━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `💵 *TOTAL: ${this.formatPrix(commande.montantTotal)} FCFA*\n\n`;
    message += `Merci pour votre commande ! 🙏`;

    return message;
  }

  /**
   * Ouvre WhatsApp avec le message pré-rempli
   */
  envoyerMessage(message: string): void {
    const encodedMessage = encodeURIComponent(message);
    const cleanNumero = this.numeroVendeur.replace(/[^0-9]/g, '');
    const lienWhatsApp = `https://wa.me/${cleanNumero}?text=${encodedMessage}`;
    window.open(lienWhatsApp, '_blank');
  }

  private formatPrix(prix: number): string {
    return new Intl.NumberFormat('fr-FR').format(prix);
  }
}

