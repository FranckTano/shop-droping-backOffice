import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { EMPTY, Observable, throwError, timer } from 'rxjs';
import { catchError, retry, switchMap } from 'rxjs/operators';

/**
 * Intercepteur de réveil Render.com
 *
 * Render.com (free tier) suspend le JVM après 15 min d'inactivité.
 * Lors du réveil, le backend renvoie status 0 (connexion refusée) ou 503.
 * Cet intercepteur attend 20 secondes et réessaie automatiquement (max 3 fois).
 */

const COLD_START_STATUSES = new Set([0, 502, 503]);
const RETRY_DELAY_MS = 20_000; // 20 secondes — délai typique de démarrage Render
const MAX_RETRIES = 3;

export const wakeUpInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<any> => {
    return next(req).pipe(
        retry({
            count: MAX_RETRIES,
            delay: (error, attemptIndex) => {
                if (!COLD_START_STATUSES.has(error.status)) {
                    // Erreur autre que cold-start → ne pas retenter
                    return throwError(() => error);
                }
                const delaySec = RETRY_DELAY_MS / 1000;
                console.warn(
                    `[WakeUp] Backend en démarrage (status ${error.status}) — ` +
                    `tentative ${attemptIndex}/${MAX_RETRIES} dans ${delaySec}s…`
                );
                return timer(RETRY_DELAY_MS);
            }
        })
    );
};
