import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from './api';

interface RegistroPacienteResponse {
  data: {
    id: number;
    correo: string;
    nombre: string;
    mfaSecret: string;
    mfaUrl: string;
  };
  message: string;
  statusCode: number;
  from?: string;
  intCode?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private apiUrl = `${environment.apiUrl}/pacientes`;

  constructor(private http: HttpClient) {}

  registrarPaciente(paciente: any): Observable<RegistroPacienteResponse> {
    return this.http.post<RegistroPacienteResponse>(this.apiUrl, paciente);
  }

  verificarMFA(data: { userId: number, code: string }) {
    return this.http.post(`${this.apiUrl}/verify-mfa`, data);
  }
}
