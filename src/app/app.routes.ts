import { Routes } from '@angular/router';
import { AppComponent } from './app.component';

export const routes: Routes = [
  {
    path: '',
    component: AppComponent,
    data: { title: 'Brain Health - Triagem Inteligente' }
  },
  {
    path: '**',
    redirectTo: ''
  }
];
