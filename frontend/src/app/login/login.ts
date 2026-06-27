import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {ButtonModule} from 'primeng/button';
import {CheckboxModule} from 'primeng/checkbox';
import {InputTextModule} from 'primeng/inputtext';
import {PasswordModule} from 'primeng/password';
import {RippleModule} from 'primeng/ripple';
import {DialogModule} from 'primeng/dialog';
import {AppConfigurator} from '@/layout/components/app.configurator';
import {InputGroup} from 'primeng/inputgroup';
import {InputGroupAddon} from 'primeng/inputgroupaddon';
import {Image} from "primeng/image";
import {LoginPassword} from "../../models/login-password.model";
import {CustomValidators} from "../../validators/custom-validators";
import {AuthService} from "../../services/auth.service";
import {MessageModule} from "primeng/message";
import {NgIf} from "@angular/common";
import {NavigationService} from "../../services/navigation.service";
import {HttpClient} from "@angular/common/http";

@Component({
	selector: 'app-login-2',
	standalone: true,
	imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule,
		AppConfigurator, InputGroup, InputGroupAddon, Image, ReactiveFormsModule, MessageModule, NgIf, DialogModule],
	templateUrl: './login.html'
})
export class Login implements OnInit {

	formAuthentification = new FormGroup({
		username: new FormControl('', CustomValidators.notBlank),
		password: new FormControl('', CustomValidators.notBlank),
	});
	erreurMessage = '';
	loading = false;

	// ── Mot de passe oublié ───────────────────────────────────────────────
	resetVisible      = false;
	resetUsername     = '';
	resetLoading      = false;
	resetErreur       = '';
	resetTempPassword = '';
	resetSuccess      = false;

	constructor(
		private readonly authService: AuthService,
		private readonly navigationService: NavigationService,
		private readonly http: HttpClient
	) {}

	ngOnInit(): void {
		if (this.authService.isAuthenticated()) {
			this.authService.updateUtilisateurConnecte();
			this.navigationService.goToHome();
		}
	}

	authentifier() {
		if (this.formAuthentification.invalid || this.loading) return;
		this.loading = true;
		this.erreurMessage = '';
		this.authService.authentifier(new LoginPassword(this.formAuthentification.value)).subscribe({
			next: (data) => {
				AuthService.updateAccessToken(data.token);
				this.authService.updateUtilisateurConnecte();
				this.navigationService.goToHome();
			},
			error: (err) => {
				this.loading = false;
				const msg: string = err.error?.message ?? '';
				if (err.status === 0) {
					this.erreurMessage = 'Impossible de joindre le serveur. Vérifiez votre connexion.';
				} else if (err.status === 429) {
					this.erreurMessage = 'Trop de tentatives échouées. Veuillez réessayer dans quelques minutes.';
				} else if (err.status === 401) {
					this.erreurMessage = msg.includes('désactivé')
						? 'Votre compte est désactivé. Contactez un Super Admin.'
						: 'Nom d\'utilisateur ou mot de passe incorrect.';
				} else {
					this.erreurMessage = msg || 'Une erreur est survenue. Veuillez réessayer.';
				}
			}
		});
	}

	ouvrirReset(): void {
		this.resetVisible      = true;
		this.resetUsername     = '';
		this.resetErreur       = '';
		this.resetTempPassword = '';
		this.resetSuccess      = false;
	}

	demanderReset(): void {
		if (!this.resetUsername.trim()) {
			this.resetErreur = 'Veuillez saisir votre nom d\'utilisateur.';
			return;
		}
		this.resetLoading = true;
		this.resetErreur  = '';
		this.http.post<{ tempPassword?: string; error?: string }>(
			'/ws/securite/auth/reset-password',
			{ username: this.resetUsername.trim() }
		).subscribe({
			next: (res) => {
				this.resetLoading      = false;
				this.resetTempPassword = res.tempPassword ?? '';
				this.resetSuccess      = true;
			},
			error: (err) => {
				this.resetLoading = false;
				if (err.status === 0) {
					this.resetErreur = 'Impossible de joindre le serveur.';
				} else if (err.status === 404) {
					this.resetErreur = 'Aucun compte trouvé avec ce nom d\'utilisateur.';
				} else {
					this.resetErreur = err?.error?.error ?? 'Une erreur est survenue. Réessayez.';
				}
			}
		});
	}
}
