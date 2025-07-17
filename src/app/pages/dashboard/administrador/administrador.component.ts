import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ListboxModule } from 'primeng/listbox';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-admin',
  templateUrl: './administrador.component.html',
  styleUrls: ['./administrador.component.css'],
 imports: [
    DialogModule,
    TableModule,
    CardModule,
    DividerModule,
    ListboxModule,
    ButtonModule,
    TooltipModule,
    ToastModule,
    FormsModule,
    CommonModule,
    InputTextModule,
    CalendarModule,
  ],
  providers: [MessageService]
})

export class AdminComponent {
  vistaActiva: string = 'consultas';
  loading: boolean = false;
  buscarConsultas: string = '';
  buscarConsultorios: string = '';
  buscarHorarios: string = '';
  buscarEmpleados: string = '';
  buscarExpedientes: string = '';
  buscarPacientes: string = '';

  // Static Data
  consultas: any[] = [
    {
      id_consulta: 1,
      nombre_completo: 'Juan Pérez Gómez',
      fecha_hora: new Date('2025-07-20T10:00:00'),
      tipo: 'General',
      diagnostico: 'Gripe',
      turno: 'Matutino',
      nombre_empleado: 'Ana',
      appaterno_empleado: 'López',
      apmaterno_empleado: 'Martínez',
      area_empleado: 'Medicina General',
      nombre_consultorio: 'Consultorio 1',
      costo: 500,
      fecha_receta: { Valid: true }
    }
  ];

  consultorios: any[] = [
    { id_consultorio: 1, nombre: 'Consultorio 1', tipo: 'General' },
    { id_consultorio: 2, nombre: 'Consultorio 2', tipo: 'Pediatría' }
  ];

  horarios: any[] = [
    { id_horario: 1, turno: 'Matutino', fecha_hora: new Date('2025-07-20T08:00:00') },
    { id_horario: 2, turno: 'Vespertino', fecha_hora: new Date('2025-07-20T14:00:00') }
  ];

  empleados: any[] = [
    { id_empleado: 1, nombre_completo: 'Ana López Martínez', area: 'Medicina General' },
    { id_empleado: 2, nombre_completo: 'Carlos Gómez Ruiz', area: 'Pediatría' }
  ];

  expedientes: any[] = [
    {
      id_expediente: 1,
      nombre_paciente: 'Juan Pérez Gómez',
      seguro: 'IMSS',
      fecha_creacion: new Date('2025-01-15'),
      antecedentes: [
        { diagnostico: 'Hipertensión', descripcion: 'Presión alta recurrente' }
      ]
    }
  ];

  pacientes: any[] = [
    { id_paciente: 1, nombre_completo: 'Juan Pérez Gómez' },
    { id_paciente: 2, nombre_completo: 'María García López' }
  ];

  showCrearConsulta: boolean = false;
  showCrearReceta: boolean = false;
  showReceta: boolean = false;
  showCrearConsultorio: boolean = false;
  showCrearHorario: boolean = false;
  showCrearEmpleado: boolean = false;
  showCrearExpediente: boolean = false;
  showExpediente: boolean = false;
  showCrearPaciente: boolean = false;

  nuevaConsulta: any = {};
  nuevaReceta: any = {};
  recetaSeleccionada: any = {
    nombre_completo: 'Juan Pérez Gómez',
    fecha_hora: new Date('2025-07-20T10:00:00'),
    fecha_receta: new Date('2025-07-20'),
    medicamento: 'Paracetamol',
    dosis: '500mg cada 8 horas',
    diagnostico: 'Gripe',
    tipo: 'General',
    nombre_consultorio: 'Consultorio 1',
    turno: 'Matutino',
    nombre_empleado: 'Ana',
    appaterno_empleado: 'López',
    apmaterno_empleado: 'Martínez',
    area_empleado: 'Medicina General',
    costo: 500
  };
  nuevoConsultorio: any = {};
  nuevoHorario: any = {};
  nuevoEmpleado: any = {};
  nuevoExpediente: any = { paciente: {} };
  expedienteSeleccionado: any = {
    id_expediente: 1,
    nombre_paciente: 'Juan Pérez Gómez',
    seguro: 'IMSS',
    fecha_creacion: new Date('2025-01-15'),
    antecedentes: [
      { diagnostico: 'Hipertensión', descripcion: 'Presión alta recurrente' }
    ]
  };
  nuevoPaciente: any = {};

  cambiarVista(vista: string) {
    this.vistaActiva = vista;
  }

  cerrarSesion() {
    // Implement logout logic
  }

  filtrarConsultas(event: any) {}
  filtrarConsultorios(event: any) {}
  filtrarHorarios(event: any) {}
  filtrarEmpleados(event: any) {}
  filtrarExpedientes(event: any) {}
  filtrarPacientes(event: any) {}

  abrirCrearConsulta() { this.showCrearConsulta = true; }
  abrirCrearReceta(id: number) { this.showCrearReceta = true; }
  verReceta(id: number) { this.showReceta = true; }
  abrirCrearConsultorio() { this.showCrearConsultorio = true; }
  abrirCrearHorario() { this.showCrearHorario = true; }
  abrirCrearEmpleado() { this.showCrearEmpleado = true; }
  abrirCrearExpediente() { this.showCrearExpediente = true; }
  verExpediente(id: number) { this.showExpediente = true; }
  abrirCrearPaciente() { this.showCrearPaciente = true; }

  abrirActualizarConsulta(id: number) { this.showCrearConsulta = true; }
  abrirActualizarConsultorio(id: number) { this.showCrearConsultorio = true; }
  abrirActualizarHorario(id: number) { this.showCrearHorario = true; }
  abrirActualizarEmpleado(id: number) { this.showCrearEmpleado = true; }
  abrirActualizarExpediente(id: number) { this.showCrearExpediente = true; }
  abrirActualizarPaciente(id: number) { this.showCrearPaciente = true; }

  eliminarConsulta(id: number) {}
  eliminarConsultorio(id: number) {}
  eliminarHorario(id: number) {}
  eliminarEmpleado(id: number) {}
  eliminarExpediente(id: number) {}
  eliminarPaciente(id: number) {}

  guardarConsulta() { this.showCrearConsulta = false; }
  guardarReceta() { this.showCrearReceta = false; }
  guardarConsultorio() { this.showCrearConsultorio = false; }
  guardarHorario() { this.showCrearHorario = false; }
  guardarEmpleado() { this.showCrearEmpleado = false; }
  guardarExpediente() { this.showCrearExpediente = false; }
  guardarPaciente() { this.showCrearPaciente = false; }
}