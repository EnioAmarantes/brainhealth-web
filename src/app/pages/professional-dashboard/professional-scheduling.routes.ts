import { Routes } from '@angular/router';
import { ScheduleSettingsComponent } from './schedule-settings.component';
import { ScheduleViewerComponent } from './schedule-viewer.component';
import { SchedulingDashboardComponent } from './scheduling-dashboard.component';

export const PROFESSIONAL_SCHEDULING_ROUTES: Routes = [
  {
    path: '',
    component: SchedulingDashboardComponent,
    data: { title: 'Agendamento de Consultas' }
  },
  {
    path: 'settings',
    component: ScheduleSettingsComponent,
    data: { title: 'Configurar Agenda' }
  },
  {
    path: 'agenda',
    component: ScheduleViewerComponent,
    data: { title: 'Visualizar Agenda' }
  }
];
