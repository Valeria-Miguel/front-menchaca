import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Receta {
  id_receta: number;
  fecha: string;
  medicamento: string;
  dosis: string;
  id_consultorio: number;
}

@Injectable({
  providedIn: 'root'
})
export class RecetaService {
  private apiUrl = 'http://localhost:3000/api/recetas';

  constructor(private http: HttpClient) {}

  obtenerRecetaPorID(id_receta: number): Observable<Receta> {
    return this.http.post<Receta>(`${this.apiUrl}/recetaget`, { id_receta });
  }
}
