import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http'; 
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Receta {
  ID: number;
  Fecha: string;
  Medicamento: string;
  Dosis: string;
  IDConsultorio: number;
  NombreConsultorio: string;
}


@Injectable({
  providedIn: 'root'
})
export class RecetaService {
  private apiUrl = 'http://localhost:3000/api/recetas';

  constructor(
    private http: HttpClient,
    private authService: AuthService 
  ) {}

  obtenerRecetaPorID(id_receta: number): Observable<{ data: Receta }> {
  return this.http.post<{ data: Receta }>(`${this.apiUrl}/recetaget`, { id_receta });
}

 crearReceta(receta: Receta): Observable<{ data: Receta }> {
    return this.http.post<{ data: Receta }>(this.apiUrl, receta);
  }

  actualizarReceta(receta: Receta): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.apiUrl}/update`, receta);
  }
}
