// ✅ Servicio adaptado: auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';

interface LoginResponse {
  data: LoginResponse;
  message: string;
  statusCode: number;

  token?: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
  tempToken?: string;
  mfaRequired?: boolean;
  mfaConfigured?: boolean;
  qrUrl?: string;
  secret?: string;
  rol?: string;
   intCode?: string; // ✅ NUEVO
}



@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:3000/api/auth';
  private tokenKey = 'authToken';
  private refreshTokenKey = 'refreshToken';
  private tempTokenKey = 'tempToken';

  private _isAuthenticated = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this._isAuthenticated.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    const token = this.getToken();
    this._isAuthenticated.next(!!token);
  }

login(credentials: { correo: string; password: string; totp?: string }): Observable<LoginResponse> {
  return this.http.post<LoginResponse>(`${this.apiUrl}/login`, {
    correo: credentials.correo,
    contrasena: credentials.password,
    totp: credentials.totp || ''
  }).pipe(
    tap(response => {
      const res = response.data;

      if (res.token) {
        this.setToken(res.token);
        if (res.refreshToken) {
          localStorage.setItem(this.refreshTokenKey, res.refreshToken);
        }
        this._isAuthenticated.next(true);
      } else if (res.tempToken) {
        localStorage.setItem(this.tempTokenKey, res.tempToken);
      }
    }),
    catchError(err =>   {
      console.error('Error en login:', err);
      return throwError(() => err); // ❗️ Lanza el error para que se capture en login.component.ts
    })
  );
}



  verifyMFA(data: { tempToken: string; totp: string }): Observable<LoginResponse> {
  return this.http.post<LoginResponse>(`${this.apiUrl}/verify-mfa`, {
    tempToken: data.tempToken,
    totp: data.totp
  }).pipe(
    tap(res => {
      if (res.token) {
        this.setToken(res.token);
        if (res.refreshToken) {
          localStorage.setItem(this.refreshTokenKey, res.refreshToken);
        }
        this._isAuthenticated.next(true);
        localStorage.removeItem(this.tempTokenKey);
      }
    })
  );
}


  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.tempTokenKey);
    this._isAuthenticated.next(false);
    this.router.navigate(['/auth/login']);
  }
}

