import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface Expediente {
  id_expediente: number;
  seguro: string;
  fecha_creacion: string;
  paciente: {
    id_paciente: number;
    nombre: string;
    appaterno: string;
    apmaterno: string;
  };
  antecedentes: {  diagnostico: string; descripcion: string }[] | null;
  nombre_paciente?: string;
}

export interface Antecedente {
  ID: number;
  IDExpediente: number;
  Diagnostico: string;
  Descripcion: string;
  Fecha?: string; // Made optional to handle cases where backend may not return fecha
}


@Injectable({
  providedIn: 'root'
})
export class ExpedienteService {
  private baseUrl = 'http://localhost:3000/api/expediente';
  private antecedentesUrl = 'http://localhost:3000/api/antecedentes';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private mapAntecedente(apiAntecedente: any): Antecedente {
    return {
      ID: apiAntecedente.ID,
      IDExpediente: apiAntecedente.IDExpediente,
      Diagnostico: apiAntecedente.diagnostico || '',
      Descripcion: apiAntecedente.descripcion || '',
      Fecha: apiAntecedente.fecha || ''
    };
  }

  private toApiAntecedente(antecedente: Antecedente): any {
    return {
      ID: antecedente.ID,
      IDExpediente: antecedente.IDExpediente,
      diagnostico: antecedente.Diagnostico,
      descripcion: antecedente.Descripcion,
      fecha: antecedente.Fecha
    };
  }

  obtenerTodos(): Observable<{ data: Expediente[] }> {
    return this.http.get<{ data: Expediente[] }>(`${this.baseUrl}/get`);
  }

  obtenerPorID(id_expediente: number): Observable<{ data: Expediente }> {
    return this.http.post<{ data: Expediente }>(`${this.baseUrl}/getExp`, { id_expediente });
  }

  crearExpediente(expediente: Expediente): Observable<{ data: Expediente }> {
    return this.http.post<{ data: Expediente }>(this.baseUrl, expediente);
  }

  actualizarExpediente(expediente: Expediente): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.baseUrl}/update`, expediente);
  }
  
crearAntecedente(antecedente: Antecedente): Observable<{ data: Antecedente }> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
    const apiAntecedente = this.toApiAntecedente(antecedente);
    return this.http.post<{ data: any }>(this.antecedentesUrl, apiAntecedente, { headers }).pipe(
      map(response => ({
        ...response,
        data: this.mapAntecedente(response.data)
      }))
    );
  }

  actualizarAntecedente(antecedente: Antecedente): Observable<{ mensaje: string }> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
    const apiAntecedente = this.toApiAntecedente(antecedente);
    return this.http.post<{ mensaje: string }>(`${this.antecedentesUrl}/update`, apiAntecedente, { headers });
  }
}