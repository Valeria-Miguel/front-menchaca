import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http'; 
import { AuthService } from './auth.service';

export interface Consulta {
  id_consulta: number;
  id_paciente: number; // No puede ser string
  tipo: string;
  id_receta?: number;
  id_horario: number;
  id_consultorio: number;
  diagnostico?: string;
  costo?: number;
  fecha_hora: string | Date;
}

interface ApiResponse<T> {
  data: T;
  from: string;
  intCode: string;
  message: string;
  status: string;
  statusCode: number;
}

@Injectable({
  providedIn: 'root'
})

export class ConsultaService {
  private apiUrl = 'http://localhost:3000/api/consultas';

  constructor(
    private http: HttpClient,
    private authService: AuthService 
  ) {}

 obtenerConsultasPaciente(idPaciente: number): Observable<ApiResponse<Consulta[]>> {
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.authService.getToken()}`
  });

  const body = {
    id_paciente: Number(idPaciente) 
  };

  return this.http.post<ApiResponse<Consulta[]>>(
    `${this.apiUrl}/paciente`,
    body,
    { headers }
  );
}
  

agendarConsulta(data: Partial<Consulta>): Observable<ApiResponse<Consulta>> {
  // Validación de campos requeridos
  if (!data.tipo || !data.id_consultorio || !data.id_horario || !data.fecha_hora || !data.id_paciente) {
    throw new Error('Faltan campos requeridos para agendar la cita');
  }

  // Función segura para formatear fecha
  const formatFecha = (fecha: string | Date): string => {
    try {
      // Si ya es un string ISO, devolverlo directamente
      if (typeof fecha === 'string' && fecha.endsWith('Z')) {
        return fecha;
      }
      
      // Convertir a Date y luego a ISO string
      const dateObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
      if (isNaN(dateObj.getTime())) {
        throw new Error('Fecha inválida');
      }
      return dateObj.toISOString();
    } catch (e) {
      console.error('Error formateando fecha:', e);
      throw new Error('Formato de fecha inválido');
    }
  };

  // Crear payload con tipos correctos
  const payload = {
    tipo: data.tipo,
    id_consultorio: Number(data.id_consultorio),
    id_horario: Number(data.id_horario),
    fecha_hora: formatFecha(data.fecha_hora as string | Date), 
    id_paciente: Number(data.id_paciente)
  };

  console.log('Payload verificado:', payload);

  return this.http.post<ApiResponse<Consulta>>(
    `${this.apiUrl}/`,
    payload
  );
}

  obtenerConsultaPorID(id_consulta: number): Observable<Consulta> {
    return this.http.post<Consulta>(`${this.apiUrl}/getConsl`, { id_consulta });
  }

obtenerConsultoriosDisponibles(): Observable<ApiResponse<any[]>> {
  return this.http.get<ApiResponse<any[]>>('http://localhost:3000/api/consultorios/get');
}

obtenerHorariosDisponibles(): Observable<ApiResponse<any[]>> {
  return this.http.get<ApiResponse<any[]>>('http://localhost:3000/api/horarios/get');
}


}
