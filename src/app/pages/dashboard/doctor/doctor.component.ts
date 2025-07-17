import { Component, OnInit, ViewChild } from '@angular/core';
import { ConsultaService, ConsultaDoctor } from '../../../services/consulta.service';
import { RecetaService, Receta } from '../../../services/receta.service';
import { ExpedienteService, Expediente, Antecedente } from '../../../services/expediente.service';
import { AuthService } from '../../../services/auth.service';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
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


@Component({
  selector: 'app-doctor',
  templateUrl: './doctor.component.html',
  styleUrls: ['./doctor.component.css'],
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
export class DoctorComponent implements OnInit {
  buscarCitas: string = '';
  buscarExpedientes: string = '';
  citas: ConsultaDoctor[] = [];
  expedientes: Expediente[] = [];
  recetaSeleccionada?: ConsultaDoctor;
  expedienteSeleccionado?: Expediente;
  nuevaReceta: Receta = { ID: 0, Fecha: '', Medicamento: '', Dosis: '', IDConsultorio: 0, NombreConsultorio: '' };
  nuevoExpediente: Expediente = {
    id_expediente: 0,
    seguro: '',
    fecha_creacion: '',
    paciente: { id_paciente: 0, nombre: '', appaterno: '', apmaterno: '' },
    antecedentes: null
  };
  nuevoAntecedente: Antecedente = { ID: 0, IDExpediente: 0, Diagnostico: '', Descripcion: '', Fecha: '' };
  loading = false;
  showReceta = false;
  showExpediente = false;
  showCrearReceta = false;
  showCrearExpediente = false;
  showCrearAntecedente = false;
  vistaActiva: 'citas' | 'expedientes' = 'citas';
  id_empleado: number = 0;

  @ViewChild('dtCitas') dtCitas!: Table;
  @ViewChild('dtExpedientes') dtExpedientes!: Table;

  constructor(
    private authService: AuthService,
    private consultaService: ConsultaService,
    private recetaService: RecetaService,
    private expedienteService: ExpedienteService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
      const usuario = this.authService.getUsuario();
      this.id_empleado = usuario?.id;
console.log("iddd", this.id_empleado);
    this.cargarCitas();
    this.cargarExpedientes();
  }


  /*cargarCitas() {
    if (!this.id_empleado) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo obtener el ID del empleado' });
      this.loading = false;
      return;
    }
    this.loading = true;
    
    this.consultaService.obtenerConsultasDoctor(this.id_empleado).subscribe({
      next: (res) => {
        console.log('Raw response from /api/consulta/doctor:', res);
        this.citas = res.data.map(cita => ({
          ...cita,
          NombreCompleto: cita.NombreCompleto || `${cita.NombrePaciente} ${cita.AppaternoPaciente} ${cita.ApmaternoPaciente}`.trim(),
          FechaHora: new Date(cita.FechaHora).toLocaleString(),
          Diagnostico: cita.Diagnostico || 'N/A',
          Costo: typeof cita.Costo === 'number' ? cita.Costo : parseFloat(String(cita.Costo)) || 0
        }));
        console.log('Transformed citas:', this.citas);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching citas:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudieron cargar las citas' });
        this.loading = false;
      }
    });
  }*/

  cargarCitas() {
  if (!this.id_empleado) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo obtener el ID del empleado' });
    this.loading = false;
    return;
  }
  this.loading = true;
  this.buscarCitas = ''; // Limpiar el filtro para mostrar todas las citas
  this.consultaService.obtenerConsultasDoctor(this.id_empleado).subscribe({
    next: (res) => {
      console.log('Raw response from /api/consulta/doctor:', res);
      this.citas = res.data.map(cita => ({
        ...cita,
        IDConsulta: cita.id_consulta,
        NombreCompleto: `${cita.nombre_paciente} ${cita.appaterno_paciente} ${cita.apmaterno_paciente}`.trim(),
        FechaHora: new Date(cita.fecha_hora).toLocaleString(),
        Diagnostico: cita.diagnostico?.String || 'N/A',
        Costo: cita.costo?.Float64 || 0,
        FechaReceta: cita.fecha_receta,
        Medicamento: cita.medicamento,
        Dosis: cita.dosis,
        NombreEmpleado: cita.nombre_empleado,
        AppaternoEmpleado: cita.appaterno_empleado,
        ApmaternoEmpleado: cita.apmaterno_empleado,
        AreaEmpleado: cita.area_empleado,
        TipoConsultorio: cita.tipo_consultorio,
        NombreConsultorio: cita.nombre_consultorio,
        Turno: cita.turno,
        Tipo: cita.tipo
      }));
      console.log('Transformed citas:', this.citas);
      this.loading = false;
    },
    error: (err) => {
      console.error('Error fetching citas:', err);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudieron cargar las citas' });
      this.loading = false;
    }
  });
}

  cargarExpedientes() {
    this.expedienteService.obtenerTodos().subscribe({
      next: (res) => {
        this.expedientes = res.data.map(exp => ({
          ...exp,
          nombre_paciente: `${exp.paciente.nombre} ${exp.paciente.appaterno} ${exp.paciente.apmaterno}`
        }));
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudieron cargar los expedientes' });
      }
    });
  }

verReceta(id_consulta: number) {
  const cita = this.citas.find(c => c.IDConsulta === id_consulta);
  if (cita && cita.fecha_receta && cita.fecha_receta.Valid && cita.medicamento && cita.medicamento.Valid && cita.dosis && cita.dosis.Valid) {
    this.recetaSeleccionada = cita;
    this.showReceta = true;
  } else {
    this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'No hay receta disponible para esta cita' });
  }
}

abrirCrearReceta(id_consulta: number) {
  const cita = this.citas.find(c => c.IDConsulta === id_consulta);
  if (cita) {
    this.nuevaReceta = {
      ID: cita.IDReceta || 0,
      Fecha: cita.fecha_receta?.Valid ? cita.fecha_receta.Time : new Date().toISOString(),
      Medicamento: cita.medicamento?.Valid ? cita.medicamento.String : '',
      Dosis: cita.dosis?.Valid ? cita.dosis.String : '',
      IDConsultorio: cita.IDConsultorio || 0,
      NombreConsultorio: cita.nombre_consultorio || ''
    };
    this.showCrearReceta = true;
  }
}

  guardarReceta() {
    if (!this.nuevaReceta.Medicamento || !this.nuevaReceta.Dosis) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Medicamento y dosis son requeridos' });
      return;
    }
    const receta: Receta = {
      ID: this.nuevaReceta.ID,
      Fecha: this.nuevaReceta.Fecha,
      Medicamento: this.nuevaReceta.Medicamento,
      Dosis: this.nuevaReceta.Dosis,
      IDConsultorio: this.nuevaReceta.IDConsultorio || 1,
      NombreConsultorio: this.nuevaReceta.NombreConsultorio || 'Consultorio General'
    };
    if (receta.ID) {
      this.recetaService.actualizarReceta(receta).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Receta actualizada' });
          this.showCrearReceta = false;
          this.cargarCitas();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error al actualizar receta' });
        }
      });
    } else {
      this.recetaService.crearReceta(receta).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Receta creada' });
          this.showCrearReceta = false;
          this.cargarCitas();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error al crear receta' });
        }
      });
    }
  }

  abrirCrearExpediente() {
    this.nuevoExpediente = {
      id_expediente: 0,
      seguro: '',
      fecha_creacion: new Date().toISOString().split('T')[0],
      paciente: { id_paciente: 0, nombre: '', appaterno: '', apmaterno: '' },
      antecedentes: null
    };
    this.showCrearExpediente = true;
  }

  guardarExpediente() {
    if (!this.nuevoExpediente.paciente.id_paciente || !this.nuevoExpediente.seguro) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'ID de paciente y seguro son requeridos' });
      return;
    }
    const expediente: Expediente = {
      ...this.nuevoExpediente,
      paciente: {
        id_paciente: this.nuevoExpediente.paciente.id_paciente,
        nombre: this.nuevoExpediente.paciente.nombre,
        appaterno: this.nuevoExpediente.paciente.appaterno,
        apmaterno: this.nuevoExpediente.paciente.apmaterno
      }
    };
    if (expediente.id_expediente) {
      this.expedienteService.actualizarExpediente(expediente).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Expediente actualizado' });
          this.showCrearExpediente = false;
          this.cargarExpedientes();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error al actualizar expediente' });
        }
      });
    } else {
      this.expedienteService.crearExpediente(expediente).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Expediente creado' });
          this.showCrearExpediente = false;
          this.cargarExpedientes();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error al crear expediente' });
        }
      });
    }
  }

  abrirCrearAntecedente(id_expediente: number) {
    this.nuevoAntecedente = {
      ID: 0,
      IDExpediente: id_expediente,
      Diagnostico: '',
      Descripcion: '',
      Fecha: new Date().toISOString().split('T')[0]
    };
    this.showCrearAntecedente = true;
  }

  guardarAntecedente() {
    if (!this.nuevoAntecedente.Diagnostico || !this.nuevoAntecedente.Descripcion) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Diagnóstico y descripción son requeridos' });
      return;
    }
    const antecedente: Antecedente = { ...this.nuevoAntecedente };
    if (antecedente.ID) {
      this.expedienteService.actualizarAntecedente(antecedente).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Antecedente actualizado' });
          this.showCrearAntecedente = false;
          this.cargarExpedientes();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error al actualizar antecedente' });
        }
      });
    } else {
      this.expedienteService.crearAntecedente(antecedente).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Antecedente creado' });
          this.showCrearAntecedente = false;
          this.cargarExpedientes();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error al crear antecedente' });
        }
      });
    }
  }

  verExpediente(id_expediente: number) {
    this.expedienteService.obtenerPorID(id_expediente).subscribe({
      next: (res) => {
        this.expedienteSeleccionado = {
          ...res.data,
          nombre_paciente: `${res.data.paciente.nombre} ${res.data.paciente.appaterno} ${res.data.paciente.apmaterno}`
        };
        console.log('Expediente seleccionado:', this.expedienteSeleccionado);
        this.showExpediente = true;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo obtener el expediente' });
      }
    });
  }

  cerrarSesion() {
    this.authService.logout();
  }

  filtrarCitas(event: Event) {
    const valor = (event.target as HTMLInputElement).value;
    this.dtCitas.filterGlobal(valor, 'contains');
  }

  filtrarExpedientes(event: Event) {
    const valor = (event.target as HTMLInputElement).value;
    this.dtExpedientes.filterGlobal(valor, 'contains');
  }

  cambiarVista(vista: 'citas' | 'expedientes') {
    this.vistaActiva = vista;
  }
}