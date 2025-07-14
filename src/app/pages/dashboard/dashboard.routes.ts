import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { PacienteComponent } from './paciente/paciente.component';
import { DoctorComponent } from './doctor/doctor.component';
import { EnfermeraComponent } from './enfermera/enfermera.component';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: 'paciente',
        component: PacienteComponent,
      },
      {
        path: 'doctor',
        component: DoctorComponent,
      },
      {
        path: 'enfermera',
        component: EnfermeraComponent,
      },
      {
    path: '**',
    redirectTo: '/auth/login'
  }
    ]
  }
];
