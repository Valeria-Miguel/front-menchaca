import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { PacienteService } from '../../../services/paciente.service';
import { Router } from '@angular/router';
import { ConsultaService } from '../../../services/consulta.service';
import { AuthService } from '../../../services/auth.service';
import { Consulta } from '../../../services/consulta.service';
import { Receta, RecetaService } from '../../../services/receta.service';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-paciente',
  standalone: true,
  templateUrl: './paciente.component.html',
  styleUrls: ['./paciente.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    MessageModule,
    DropdownModule,
     CalendarModule,
    ToastModule,
  ],
  providers: [MessageService]
})

export class PacienteComponent implements OnInit {
  consultorios: any[] = [];
horarios: any[] = [];

  citas: Consulta[] = [];
  citasPasadas: Consulta[] = [];
  idPaciente!: number;
  loading = false;

  showAgregarCita = false;
  showHistorial = false;
  showRecetas = false;
  recetaSeleccionada!: Receta;

   nuevaCita: Partial<Consulta> = {
    tipo: '',
    id_consultorio: 0,
    id_horario: 0,
    fecha_hora: new Date() // Inicializa con fecha actual
  };

  constructor(
    private authService: AuthService,
    private consultaService: ConsultaService,
    private messageService: MessageService,
    private recetaService: RecetaService,
    private router: Router 
  ) {}

  ngOnInit(): void {
  const usuario = this.authService.getUsuario();
  this.idPaciente = usuario?.id;

  this.cargarCitas();
  this.cargarConsultorios();
  this.cargarHorarios();
}

cerrarSesion() {
  this.authService.logout();  // Ya redirige internamente
}

cargarCitas() {
  this.loading = true;
  console.log('Paciente ID a enviar:', this.idPaciente);
  this.consultaService.obtenerConsultasPaciente(this.idPaciente).subscribe({
    next: (response) => {
      console.log('Respuesta completa del backend:', response); 
      const consultas = response.data;
      const ahora = new Date();
      this.citas = consultas.filter(c => new Date(c.fecha_hora) >= ahora);
      this.citasPasadas = consultas.filter(c => new Date(c.fecha_hora) < ahora);
      this.loading = false;
    },
    error: (error) => {
      console.error('Error completo:', error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las citas' });
      this.loading = false;
    }
  });
}

agendarCita() {
  if (!this.validarCita()) {
    return;
  }

  // Asegurar que fecha_hora no sea undefined
  if (!this.nuevaCita.fecha_hora) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'La fecha y hora son requeridas'
    });
    return;
  }

  // Preparar payload con conversión explícita
  const payload: Partial<Consulta> = {
    tipo: this.nuevaCita.tipo,
    id_consultorio: Number(this.nuevaCita.id_consultorio),
    id_horario: Number(this.nuevaCita.id_horario),
    fecha_hora: this.nuevaCita.fecha_hora, // Ya manejado por p-calendar como Date
    id_paciente: Number(this.idPaciente)
  };

  console.log('Payload con tipos verificados:', payload);

  this.consultaService.agendarConsulta(payload).subscribe({
    next: (response) => {
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Cita agendada correctamente'
      });
      this.showAgregarCita = false;
      this.cargarCitas();
    },
    error: (error) => {
      console.error('Error detallado:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: this.obtenerMensajeError(error)
      });
    }
  });
}

private validarCita(): boolean {
  let valido = true;

  if (!this.nuevaCita.tipo || this.nuevaCita.tipo.trim() === '') {
    this.messageService.add({
      severity: 'warn',
      summary: 'Validación',
      detail: 'El tipo de consulta es requerido'
    });
    valido = false;
  }

  if (!this.nuevaCita.id_consultorio || this.nuevaCita.id_consultorio === 0) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Validación',
      detail: 'Debe seleccionar un consultorio'
    });
    valido = false;
  }

  if (!this.nuevaCita.id_horario || this.nuevaCita.id_horario === 0) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Validación',
      detail: 'Debe seleccionar un horario'
    });
    valido = false;
  }

  if (!this.nuevaCita.fecha_hora) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Validación',
      detail: 'Debe seleccionar fecha y hora'
    });
    valido = false;
  }

  return valido;
}
private obtenerMensajeError(error: any): string {
  if (error.error?.message) {
    return error.error.message;
  }
  if (error.status === 400) {
    return 'Datos de la cita inválidos';
  }
  if (error.status === 401) {
    return 'No autorizado - por favor inicie sesión nuevamente';
  }
  return 'Error desconocido al agendar la cita';
}

verReceta(id_receta: number) {
  this.recetaService.obtenerRecetaPorID(id_receta).subscribe({
    next: (res: any) => {
      console.log('Receta recibida:', res);
      this.recetaSeleccionada = res.data; // asegurado
      this.showRecetas = true;
    },
    error: () => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo obtener la receta' });
    }
  });
}



cargarConsultorios() {
  this.consultaService.obtenerConsultoriosDisponibles().subscribe({
    next: (response) => {
      this.consultorios = response.data;
      console.log('Consultorios cargados:', this.consultorios);
    },
    error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los consultorios' })
  });
}

cargarHorarios() {
  this.consultaService.obtenerHorariosDisponibles().subscribe({
    next: (response) => {
      this.horarios = response.data;
      console.log('Horarios cargados:', this.horarios);
    },
    error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los horarios' })
  });
}


resetearCita() {
  this.nuevaCita = {
    tipo: '',
    id_consultorio: 0,
    id_horario: 0,
    fecha_hora: new Date()
  };
}



}
