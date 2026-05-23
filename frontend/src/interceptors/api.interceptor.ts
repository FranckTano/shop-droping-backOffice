import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '@environments/environment';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
    const apiBaseUrl = environment.apiUrl.replace('/api', '');
    const token = localStorage.getItem('access_token');
    const router = inject(Router);

    const isAbsoluteUrl = (url: string) => /^https?:\/\//i.test(url);
    const isAssetUrl = (url: string) =>
        ['assets', 'data', 'commits.json', '/images/'].some((kw) => url.includes(kw));

    const buildUrl = (url: string): string => {
        if (isAbsoluteUrl(url) || isAssetUrl(url)) return url;

        // Routes backend directes (ws/* et api/*)
        if (url.startsWith('ws/') || url.startsWith('api/') || url.startsWith('/ws/') || url.startsWith('/api/')) {
            const base = apiBaseUrl.replace(/\/+$/, '');
            const path = url.startsWith('/') ? url : '/' + url;
            return base + path;
        }

        return url;
    };

    const headers: Record<string, string> = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const authReq = req.clone({
        url: buildUrl(req.url),
        setHeaders: headers,
    });

    return next(authReq).pipe(
        catchError(error => {
            if (error.status === 401) {
                localStorage.removeItem('access_token');
                router.navigate(['/connexion']);
            }
            return throwError(() => error);
        })
    );
};
