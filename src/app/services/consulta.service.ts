import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface ConsultaDoctor {
  id_consulta: number;
  nombre_paciente: string;
  appaterno_paciente: string;
  apmaterno_paciente: string;
  fecha_receta: { Time: string; Valid: boolean };
  medicamento: { String: string; Valid: boolean };
  dosis: { String: string; Valid: boolean };
  turno: string;
  nombre_empleado: string;
  appaterno_empleado: string;
  apmaterno_empleado: string;
  area_empleado: string;
  tipo_consultorio: string;
  nombre_consultorio: string;
  tipo: string;
  diagnostico: { String: string; Valid: boolean };
  costo: { Float64: number; Valid: boolean };
  fecha_hora: string;
  // Propiedades opcionales para la interfaz
  IDConsulta?: number;
  NombreCompleto?: string;
  FechaHora?: string;
  Diagnostico?: string;
  Costo?: number;
  IDReceta?: number;
  IDConsultorio?: number;
}
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

export interface ConsultaEnfermera {
  id_consulta: number;
  nombre_paciente: string;
  appaterno_paciente: string;
  apmaterno_paciente: string;
  nombre_completo?: string;
  fecha_receta: { Time: string; Valid: boolean };
  medicamento: { String: string; Valid: boolean };
  dosis: { String: string; Valid: boolean };
  turno: string;
  nombre_empleado: string;
  appaterno_empleado: string;
  apmaterno_empleado: string;
  area_empleado: string;
  tipo_consultorio: string;
  nombre_consultorio: string;
  tipo: string;
  diagnostico: string | { String: string; Valid: boolean }; 
  costo: number;
  fecha_hora: string;
  id_paciente?: number;
  id_receta?: number;
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
  const body = {
    id_paciente: Number(idPaciente) 
  };
  return this.http.post<ApiResponse<Consulta[]>>(`${this.apiUrl}/paciente`, body);
}
  
agendarConsulta(data: Partial<Consulta>): Observable<ApiResponse<Consulta>> {
  if (!data.tipo || !data.id_consultorio || !data.id_horario || !data.fecha_hora || !data.id_paciente) {
    throw new Error('Faltan campos requeridos para agendar la cita');
  }

  const formatFecha = (fecha: string | Date): string => {
    try {
      if (typeof fecha === 'string' && fecha.endsWith('Z')) {
        return fecha;
      }
      
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

  const payload = {
    tipo: data.tipo,
    id_consultorio: Number(data.id_consultorio),
    id_horario: Number(data.id_horario),
    fecha_hora: formatFecha(data.fecha_hora as string | Date), 
    id_paciente: Number(data.id_paciente)
  };
  console.log('Payload verificado:', payload);
  return this.http.post<ApiResponse<Consulta>>(`${this.apiUrl}/`, payload);
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

//para enfermera 
 obtenerTodasConsultas(): Observable<ApiResponse<ConsultaEnfermera[]>> {
    return this.http.get<ApiResponse<ConsultaEnfermera[]>>(this.apiUrl);
  }
//para doctor 

  obtenerConsultasDoctor(id_empleado: number): Observable<ApiResponse<ConsultaDoctor[]>> {
  const body = {
    id_empleado: Number(id_empleado) // 👈 CORRECTO
  };
  return this.http.post<ApiResponse<ConsultaDoctor[]>>(`${this.apiUrl}/doctor`, body);
}

}

