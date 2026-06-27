import { ErrorHandler, Injectable, NgZone } from '@angular/core';

@Injectable()
export class GlobalErrorHandlerService implements ErrorHandler {

    constructor(private readonly zone: NgZone) {}

    handleError(error: unknown): void {
        const err = error instanceof Error ? error : new Error(String(error));

        if (err.message?.includes('ChunkLoadError') || err.message?.includes('Loading chunk')) {
            console.warn('[GlobalError] Erreur de chargement de module — rechargement', err.message);
            this.zone.run(() => window.location.reload());
            return;
        }

        if (err.message?.includes('401') || err.message?.includes('token')) {
            return;
        }

        console.error('[GlobalError] Erreur non gérée:', err);
    }
}
