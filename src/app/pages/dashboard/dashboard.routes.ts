import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { PacienteComponent } from './paciente/paciente.component';
import { DoctorComponent } from './doctor/doctor.component';
import { EnfermeraComponent } from './enfermera/enfermera.component';
//import { permissionGuard,authGuard } from '../../guards/permission.guard';
import { permissionGuard } from '../../guards/permission.guard';
import { AdminComponent } from './administrador/administrador.component';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: 'paciente',
        component: PacienteComponent,
         canActivate: [permissionGuard],
         data: { permissions: ['solicitar_cita'] }
      },
      {
        path: 'doctor',
        component: DoctorComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['ver_expedientes'] }
      },

      {
        path: 'enfermera',
        component: EnfermeraComponent,
       // canActivate: [permissionGuard, authGuard],
       canActivate: [permissionGuard],
        data: { permissions: ['solicitar_cita'] }
      },
       {
        path: 'administrador',
        component: AdminComponent,
       // canActivate: [permissionGuard, authGuard],
       canActivate: [permissionGuard],
        data: { permissions: ['solicitar_cita'] }
      },

      {
    path: '**',
    redirectTo: '/auth/login'
  }
    ]
  }
];
