import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

interface TokenData {
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
  intCode?: string;
}

interface LoginResponse {
  data: TokenData;
  message: string;
  statusCode: number;
  intCode?: string;
}

interface TokenPayload {
  email: string;
  exp: number;
    id: string;
  permisos: string[];
  rol: string;
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

  getUsuario() {
  const token = this.getToken();
  if (!token) return null;

  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload; 
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
      this.setRefreshToken(res.refreshToken);
    }
    if (res.expiresIn) {
      const expiresAt = Date.now() + res.expiresIn * 1000;
      localStorage.setItem('tokenExpiresAt', expiresAt.toString());
    }
    this._isAuthenticated.next(true);
      } else if (res.tempToken) {
        localStorage.setItem(this.tempTokenKey, res.tempToken);
      }
    }),
    catchError(err =>   {
      console.error('Error en login:', err);
      return throwError(() => err); 
    })
  );
}

  verifyMFA(data: { tempToken: string; totp: string }): Observable<LoginResponse> {
  return this.http.post<LoginResponse>(`${this.apiUrl}/verify-mfa`, {
    tempToken: data.tempToken,
    totp: data.totp
  }).pipe(
    tap(res => {
    const data = res.data;
      console.log(' Token:', data.token);
      console.log(' Refresh:', data.refreshToken);
      console.log(' Expira en:', data.expiresIn);

      if (data.token) {
        this.setToken(data.token);
        if (data.refreshToken) {
          this.setRefreshToken(data.refreshToken);
        }
        if (data.expiresIn) {
          const expiresAt = Date.now() + data.expiresIn * 1000;
          localStorage.setItem('tokenExpiresAt', expiresAt.toString());
        }
        this._isAuthenticated.next(true);
      }
    })
  );
}

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  public setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.tempTokenKey);
    this._isAuthenticated.next(false);
    this.router.navigate(['/auth/login']);
  }

  private setRefreshToken(token: string): void {
  localStorage.setItem(this.refreshTokenKey, token);
}

refreshToken(): Observable<any> {
  console.log("🔁 Intentando refrescar token...");
  const refreshToken = localStorage.getItem('refresh_token');

  if (!refreshToken) {
    console.warn("⚠️ No hay refresh_token en localStorage");
    return throwError(() => new Error('No refresh token'));
  }

  return this.http.post<any>(`${this.apiUrl}/auth/refresh`, { refreshToken }).pipe(
    tap((response) => {
      console.log("✅ Refresh token exitoso:", response);
      this.setToken(response.accessToken);
    }),
    catchError((error) => {
      console.error("❌ Error al refrescar token:", error);
      return throwError(() => error);
    })
  );
}

  getRefreshToken(): string | null {
  return localStorage.getItem(this.refreshTokenKey);
}

getTokenExpiration(): number | null {
  const token = this.getToken();
  if (!token) {
    console.warn("⚠️ No se encontró token");
    return null;
  }

  try {
    const decoded: any = jwtDecode(token);
    const expMillis = decoded.exp * 1000;
    console.log("🕒 Fecha actual:", new Date().toISOString());
    console.log("📅 Token expira en:", new Date(expMillis).toISOString());
    console.log("⏳ Expira en (minutos):", Math.round((expMillis - Date.now()) / 60000));
    return expMillis;
  } catch (e) {
    console.error('❌ Error al decodificar token para obtener expiración:', e);
    return null;
  }
}

isTokenExpired(): boolean {
  const expiresAt = this.getTokenExpiration();
  return !expiresAt || Date.now() > expiresAt;
}

getDecodedToken(): TokenPayload | null {
  const token = this.getToken();
  if (!token) return null;

  try {
    return jwtDecode<TokenPayload>(token);
  } catch (e) {
    console.error('Error al decodificar token:', e);
    return null;
  }
}

getIdEmpleado(): number {
    const decoded = this.getDecodedToken();
    return decoded && decoded.id ? parseInt(decoded.id, 10) : 0;
  }

hasPermission(required: string): boolean {
  const payload = this.getDecodedToken(); 
  return payload?.permisos.includes(required) || false;
}

hasAnyPermission(perms: string[]): boolean {
  const payload = this.getDecodedToken();
  return perms.some(p => payload?.permisos.includes(p));
}
}

