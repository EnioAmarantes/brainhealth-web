import { Routes } from '@angular/router';
import { AuthGuard } from '@app/guards/auth.guard';
import { ProfessionalGuard } from '@app/guards/professional.guard';

import { LoginSelectorComponent } from '@app/pages/login-selector/login-selector.component';
import { ProfessionalLoginComponent } from '@app/pages/login/professional-login.component';
import { PatientLoginComponent } from '@app/pages/login/patient-login.component';
import { QuestionnaireScreenComponent } from '@app/pages/questionnaire/questionnaire-screen.component';
import { ProfessionalsListComponent } from '@app/pages/professionals/professionals-list.component';

export const routes: Routes = [
  {
    path: '',
    component: LoginSelectorComponent,
    data: { title: 'Brain Health - Login' }
  },
  {
    path: 'login',
    children: [
      {
        path: 'professional',
        component: ProfessionalLoginComponent,
        data: { title: 'Login Profissional' }
      },
      {
        path: 'patient',
        component: PatientLoginComponent,
        data: { title: 'Login Paciente' }
      }
    ]
  },
  {
    path: 'questionnaire',
    component: QuestionnaireScreenComponent,
    data: { title: 'Questionário de Triagem' }
  },
  {
    path: 'professionals',
    component: ProfessionalsListComponent,
    data: { title: 'Profissionais Recomendados' }
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
        data: { title: 'Dashboard' }
      },
      {
        path: 'professional',
        loadComponent: () => import('./pages/professional-dashboard/professional-dashboard.component').then(m => m.ProfessionalDashboardComponent),
        data: { title: 'Dashboard Profissional' }
      },
      {
        path: 'patient',
        loadComponent: () => import('./pages/patient-dashboard/patient-dashboard.component').then(m => m.PatientDashboardComponent),
        data: { title: 'Meu Dashboard' }
      },
      {
        path: 'admin',
        loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        data: { title: 'Painel Administrativo' }
      }
    ]
  },
  {
    path: 'professional/:id',
    loadComponent: () => import('./pages/professional-detail/professional-detail.component').then(m => m.ProfessionalDetailComponent),
    data: { title: 'Detalhes do Profissional' }
  },
  {
    path: 'schedule/:professionalId',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/schedule/schedule.component').then(m => m.ScheduleComponent),
    data: { title: 'Agendar Consulta' }
  },
  {
    path: '**',
    redirectTo: ''
  }
];
