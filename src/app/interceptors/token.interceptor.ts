import { Injectable } from '@angular/core';
import {HttpEvent,  HttpHandler,  HttpInterceptor,  HttpRequest,  HttpErrorResponse} from '@angular/common/http';
import { Observable, throwError, switchMap, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.authService.isTokenExpired()) {
      const refreshToken = this.authService.getRefreshToken();
      if (refreshToken) {
        return this.authService.refreshToken(refreshToken).pipe(
          switchMap((res: any) => {
            const newToken = res?.data?.token;
            this.authService.setToken(newToken);
            const cloned = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });
            return next.handle(cloned);
          }),
          catchError((err) => {
            this.authService.logout();
            return throwError(() => err);
          })
        );
      } else {
        this.authService.logout();
        return throwError(() => new Error('Sesión expirada'));
      }
    } else {
      const token = this.authService.getToken();
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(cloned);
    }
  }
}
