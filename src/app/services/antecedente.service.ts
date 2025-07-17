import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Antecedente {
  ID: number;
  IDExpediente: number;
  Diagnostico: string;
  Descripcion: string;
  Fecha: string;
}


@Injectable({
  providedIn: 'root'
})
export class AntecedenteService {
  private baseUrl = 'http://localhost:3000/api/antecedentes';

  constructor(private http: HttpClient) {}

  crearAntecedente(antecedente: Antecedente): Observable<any> {
    return this.http.post(`${this.baseUrl}/`, antecedente);
  }

  actualizarAntecedente(antecedente: Antecedente): Observable<any> {
    return this.http.post(`${this.baseUrl}/update`, antecedente);
  }
}