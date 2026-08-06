import { Routes } from '@angular/router';
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
    path: '**',
    redirectTo: 'questionnaire'
  }
];
