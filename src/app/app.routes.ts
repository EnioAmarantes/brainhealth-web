import { Routes } from '@angular/router';
import { LoginComponent } from '@app/pages/login/login.component';
import { QuestionnaireScreenComponent } from '@app/pages/questionnaire/questionnaire-screen.component';
import { QuestionnaireResultComponent } from '@app/pages/questionnaire-result/questionnaire-result.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'questionnaire',
    pathMatch: 'full'
  },
  {
    path: 'questionnaire',
    component: QuestionnaireScreenComponent,
    data: { title: 'Questionario de Triagem' }
  },
  {
    path: 'questionnaire/result',
    component: QuestionnaireResultComponent,
    data: { title: 'Profissionais Recomendados' }
  },
  {
    path: 'login/paciente',
    component: LoginComponent,
    data: { title: 'Login Paciente', role: 'paciente' }
  },
  {
    path: 'login/profissional',
    component: LoginComponent,
    data: { title: 'Login Profissional', role: 'profissional' }
  },
  {
    path: '**',
    redirectTo: 'questionnaire'
  }
];
