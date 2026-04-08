# Brain Health - Frontend Web (Angular 17+)

Aplicação web moderna para conectar pacientes com profissionais de saúde mental, desenvolvida com Angular 17 e design responsivo.

## 🚀 Características

✨ **Interface Moderna e Responsiva**
- Design mobile-first com Material Design
- Animações suaves e indicadores de carregamento
- Acessibilidade WCAG 2.1 completa
- Tema claro/escuro (em desenvolvimento)

🔐 **Autenticação e Segurança**
- Login para profissionais e pacientes
- JWT token management
- Refresh token automático
- Guards e interceptores

🎯 **Funcionalidades Principais**
- Seleção de tipo de login (profissional/paciente)
- Questionário de triagem interativo
- Busca de profissionais com filtros avançados
- Agendamento de consultas
- Dashboard personalizado

⚡ **Performance**
- Change Detection OnPush em todos os componentes
- Lazy loading de rotas
- Debouncing de buscas (RxJS)
- Code splitting automático

## 📋 Pré-requisitos

- Node.js 18+ 
- npm 9+ ou yarn
- Angular CLI 17+

## 🔧 Instalação e Setup

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Ambiente

Editar `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

### 3. Iniciar Servidor de Desenvolvimento

```bash
npm start
```

Navegue para `http://localhost:4200/`. A aplicação fará reload automático ao alterar arquivos.

## 📂 Estrutura do Projeto

```
src/
├── app/
│   ├── components/
│   │   └── shared/              # Componentes reutilizáveis
│   │       ├── primary-button.component.ts
│   │       ├── secondary-button.component.ts
│   │       ├── card.component.ts
│   │       └── loading-indicator.component.ts
│   │
│   ├── pages/                   # Componentes de página (rotas)
│   │   ├── login-selector/
│   │   ├── login/
│   │   ├── questionnaire/
│   │   ├── professionals/
│   │   ├── dashboard/
│   │   ├── professional-detail/
│   │   └── schedule/
│   │
│   ├── services/                # Serviços compartilhados
│   │   ├── auth.service.ts
│   │   ├── professional.service.ts
│   │   ├── questionnaire.service.ts
│   │   └── loading.service.ts
│   │
│   ├── guards/                  # Route guards
│   │   ├── auth.guard.ts
│   │   └── professional.guard.ts
│   │
│   ├── interceptors/            # HTTP interceptors
│   │   └── auth.interceptor.ts
│   │
│   ├── models/                  # TypeScript interfaces
│   │   ├── auth.model.ts
│   │   ├── professional.model.ts
│   │   └── questionnaire.model.ts
│   │
│   ├── theme/                   # Temas Material
│   ├── app.routes.ts            # Rotas da aplicação
│   ├── app.config.ts            # Configuração do app
│   └── app.component.ts         # Componente raiz
│
├── styles/
│   ├── main.scss                # Estilos globais
│   └── _variables.scss          # Variáveis SCSS
│
├── environments/
│   ├── environment.ts           # Config dev
│   └── environment.prod.ts      # Config prod
│
├── index.html                   # HTML principal
└── main.ts                      # Entry point
```

## 🔀 Rotas da Aplicação

| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/` | LoginSelector | Tela inicial com opções de login |
| `/login/professional` | ProfessionalLogin | Login para profissionais |
| `/login/patient` | PatientLogin | Login para pacientes |
| `/questionnaire` | QuestionnaireScreen | Questionário de triagem |
| `/professionals` | ProfessionalsList | Lista de profissionais recomendados |
| `/professional/:id` | ProfessionalDetail | Detalhes do profissional (lazy) |
| `/schedule/:professionalId` | Schedule | Agendamento de consulta (lazy) |
| `/dashboard` | Dashboard | Dashboard do usuário (protegido) |

## 🔐 Autenticação

### Fluxo de Login

1. Usuário seleciona tipo (profissional/paciente)
2. Insere credenciais (email/senha)
3. Backend valida e retorna JWT token
4. Token armazenado em localStorage
5. Interceptor adiciona token em requisições
6. AuthGuard protege rotas autenticadas

### Token Management

```typescript
// AuthService manipula:
- loginProfessional(credentials)
- loginPatient(credentials)
- refreshToken()
- logout()
- getToken()
- isAuthenticated()
```

## 🎨 Componentes Compartilhados

### PrimaryButton
Botão principal com estilo gradiente e loading indicator.

```typescript
<app-primary-button
  label="Entrar"
  [disabled]="isLoading"
  [isLoading]="isLoading$ | async"
  (onClick)="onSubmit()"
></app-primary-button>
```

### SecondaryButton
Botão secundário com borda.

### Card
Container com sombra e bordas.

```typescript
<app-card [elevated]="true">
  <!-- conteúdo -->
</app-card>
```

### LoadingIndicator
Indicador global de carregamento com overlay.

## 📡 Serviços

### AuthService
Gerencia autenticação e usuário atual.

```typescript
// Observable pattern
this.authService.currentUser$.subscribe(user => {
  console.log('Usuário atual:', user);
});

this.authService.isAuthenticated$.subscribe(isAuth => {
  console.log('Autenticado:', isAuth);
});
```

### ProfessionalService
Busca e filtra profissionais com debouncing.

```typescript
// Busca com debouncing automático (300ms)
this.professionalService.searchProfessionals('psicólogo');

// Aplica filtros
this.professionalService.applyFilters({
  specialties: ['Psicanálise'],
  maxPrice: 200,
  city: 'São Paulo'
});
```

### QuestionnaireService
Gerencia questionários de triagem.

### LoadingService
Controla indicador global de loading.

```typescript
this.loadingService.show('Carregando...');
this.loadingService.hide();
```

## 🎯 Padrões Utilizados

### OnPush Change Detection
Todos os componentes usam `ChangeDetectionStrategy.OnPush` para melhor performance.

### Reactive Forms
Formulários com validação em tempo real.

```typescript
this.form = this.fb.group({
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(6)]]
});
```

### RxJS Operators
- `debounceTime`: Debouncing de buscas
- `distinctUntilChanged`: Evita requisições duplicadas
- `switchMap`: Cancela requisições anteriores
- `shareReplay`: Compartilha resultados

### Standalone Components
Todos os componentes são standalone (sem módulos).

```typescript
@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ...]
})
```

## 🧪 Testes

```bash
# Rodar testes unitários
npm test

# Testes com coverage
ng test --code-coverage

# Testes e2e
ng e2e
```

## 🚀 Build para Produção

```bash
# Build otimizado
npm run build:prod

# Resultado em dist/brain-health-web/
```

### Otimizações de Produção
- Bundling e minificação
- Tree-shaking de código não utilizado
- Lazy loading de rotas
- Compressão gzip

## ♿ Acessibilidade

- ✅ Labels semânticas em formulários
- ✅ ARIA labels para botões e inputs
- ✅ Cores contrastantes (WCAG AA)
- ✅ Navegação por teclado
- ✅ Focus indicators visíveis

## 📱 Responsividade

Breakpoints:
- `xs`: até 480px (mobile pequeno)
- `sm`: até 768px (tablet)
- `md`: até 1024px (desktop pequeno)
- `lg`: até 1200px (desktop)

## 🎨 Temas

Cores principais:
- Primária: `#667eea` (roxo)
- Secundária: `#764ba2` (roxo escuro)
- Acentos: `#f093fb` (rosa)

## 🔍 Performance Checklist

- [x] OnPush change detection
- [x] Lazy loading de rotas
- [x] Debouncing de buscas
- [x] Images otimizadas
- [x] Bundle size < 500KB
- [x] Lighthouse > 90

## 🛠️ Debugging

### VS Code Extensions Recomendadas
- Angular Language Service
- Prettier
- ESLint
- RxJS DevTools

### DevTools
```typescript
// Observables
ng.probe(element).componentInstance.observable$.subscribe(console.log)

// Global state
window.ng.probe(document.body).injector.get(AuthService)
```

## 📦 Dependências Principais

```json
{
  "@angular/core": "^17.0.0",
  "@angular/forms": "^17.0.0",
  "@angular/router": "^17.0.0",
  "rxjs": "^7.8.0",
  "tslib": "^2.6.0"
}
```

## 🔗 Integração com Backend

### Esperado do Backend

```
POST   /api/auth/login/professional
POST   /api/auth/login/patient
POST   /api/auth/register/professional
POST   /api/auth/register/patient
POST   /api/auth/refresh-token
GET    /api/professionals
GET    /api/professionals/:id
GET    /api/professionals/recommended
GET    /api/professionals/specialties
GET    /api/questionnaires/screening
POST   /api/questionnaires/submit
```

## 🤝 Contribuindo

1. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
2. Commit: `git commit -am 'Add nova funcionalidade'`
3. Push: `git push origin feature/nova-funcionalidade`
4. Abra um Pull Request

## 📄 Licença

MIT License - veja LICENSE para detalhes

## 📞 Suporte

Para questões ou sugestões: suporte@brain-health.com

---

**Desenvolvido com ❤️ para saúde mental**
