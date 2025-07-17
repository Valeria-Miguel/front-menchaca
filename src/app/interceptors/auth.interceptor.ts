import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();
  console.log('Interceptor: Token actual:', token);

  const addToken = (request: typeof req, token: string) => {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  const handleRequest = (tokenToUse: string) => {
    const cloned = addToken(req, tokenToUse);
    return next(cloned).pipe(
      catchError((error: any) => {
        if (error.status === 401) {
          console.log('Interceptor: Recibido 401, logout');
          authService.logout();
          router.navigate(['/auth/login']);
        }
        return throwError(() => error);
      })
    );
  };

  if (!token) {
    console.log('Interceptor: No hay token, enviando petición sin token');
    return next(req);
  }

  if (authService.isTokenExpired()) {
    console.log('Interceptor: Token expirado, intentando refrescar');
    return authService.refreshToken().pipe(
      switchMap(() => {
        const newToken = authService.getToken();
        if (!newToken) {
          console.error('❌ No se pudo obtener el nuevo token');
          authService.logout();
          router.navigate(['/auth/login']);
          return throwError(() => new Error('No se pudo obtener nuevo token'));
        }
        console.log('📦 Nuevo token recibido:', newToken);
        return handleRequest(newToken);
      }),
      catchError((err) => {
        console.error('❌ Falló el refresh, cerrando sesión');
        authService.logout();
        router.navigate(['/auth/login']);
        return throwError(() => err);
      })
    );
  } else {
    console.log('Interceptor: Token válido, enviando petición con token');
    return handleRequest(token);
  }
};



/*
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  return next(req);
};
*/
