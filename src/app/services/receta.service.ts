import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  constructor(private http: HttpClient) {}


  obtenerRecetaPorID(id_receta: number): Observable<{ data: Receta }> {
  return this.http.post<{ data: Receta }>(`${this.apiUrl}/recetaget`, { id_receta });
}

}
