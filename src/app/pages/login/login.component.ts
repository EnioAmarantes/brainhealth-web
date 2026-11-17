import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent {
    private readonly route = inject(ActivatedRoute);

    protected readonly role = this.route.snapshot.data['role'] as string | undefined;

    protected get title(): string {
        return this.role === 'profissional' ? 'Login de Profissional' : 'Login de Paciente';
    }

    protected get subtitle(): string {
        return this.role === 'profissional'
            ? 'Acesse sua area para gerenciar perfil e novos contatos.'
            : 'Acesse para acompanhar sua triagem e recomendacoes.';
    }
}