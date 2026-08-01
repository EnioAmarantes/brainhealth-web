import { Routes } from '@angular/router';
import { QuestionnaireScreenComponent } from '@app/pages/questionnaire/questionnaire-screen.component';

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
    path: '**',
    redirectTo: 'questionnaire'
  }
];
