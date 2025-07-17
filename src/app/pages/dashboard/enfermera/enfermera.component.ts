import { Component, OnInit, ViewChild } from '@angular/core';
import { ConsultaService, ConsultaEnfermera } from '../../../services/consulta.service';
import { RecetaService, Receta } from '../../../services/receta.service';
import { ExpedienteService, Expediente } from '../../../services/expediente.service';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../../services/auth.service';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ListboxModule } from 'primeng/listbox';


@Component({
  selector: 'app-enfermera',
  templateUrl: './enfermera.component.html',
  styleUrls: ['./enfermera.component.css'],
  imports: [
    DialogModule,
      CardModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    ToastModule,
    DividerModule,
    ListboxModule,
    FormsModule,
    CommonModule,
    InputTextModule
  ],
  providers: [MessageService]
})
export class EnfermeraComponent implements OnInit {
  buscarCitas: string = '';
  buscarExpedientes: string = '';
  citas: ConsultaEnfermera[] = [];
  expedientes: Expediente[] = [];
  recetaSeleccionada?: ConsultaEnfermera;
  expedienteSeleccionado?: Expediente;
  loading = false;
  showReceta = false;
  showExpediente = false;
  vistaActiva: 'citas' | 'expedientes' = 'citas';

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
    this.cargarCitas();
    this.cargarExpedientes();
  }

  cargarCitas() {
    this.loading = true;
    this.consultaService.obtenerTodasConsultas().subscribe({
      next: (res) => {
        this.citas = res.data.map(cita => {
          // Handle diagnostico as string or object
          let diagnostico: string;
          if (typeof cita.diagnostico === 'string') {
            diagnostico = cita.diagnostico || 'N/A';
          } else if (cita.diagnostico && typeof cita.diagnostico === 'object' && 'String' in cita.diagnostico) {
            diagnostico = cita.diagnostico.String || 'N/A';
          } else {
            diagnostico = 'N/A';
          }

          return {
            ...cita,
            nombre_completo: `${cita.nombre_paciente} ${cita.appaterno_paciente} ${cita.apmaterno_paciente}`,
            fecha_hora: new Date(cita.fecha_hora).toLocaleString(),
            diagnostico,
            costo: typeof cita.costo === 'number' ? cita.costo : parseFloat(cita.costo) || 0
          };
        });
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las citas' });
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
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los expedientes' });
      }
    });
  }

  verReceta(id_consulta: number) {
    const cita = this.citas.find(c => c.id_consulta === id_consulta);
    if (cita && cita.fecha_receta.Valid && cita.medicamento.Valid && cita.dosis.Valid) {
      this.recetaSeleccionada = cita;
      this.showReceta = true;
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'No hay receta disponible para esta cita' });
    }
  }

  cerrarSesion() {
    this.authService.logout();
  }

  verExpediente(id_expediente: number) {
    this.expedienteService.obtenerPorID(id_expediente).subscribe({
      next: (res) => {
        this.expedienteSeleccionado = {
          ...res.data,
          nombre_paciente: `${res.data.paciente.nombre} ${res.data.paciente.appaterno} ${res.data.paciente.apmaterno}`
        };
        this.showExpediente = true;
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo obtener el expediente' })
    });
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