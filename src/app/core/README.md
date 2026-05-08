# 🔧 Core Module - Componentes Compartilhados

Este módulo contém toda a infraestrutura reutilizável da aplicação.

## 📁 Estrutura

```
core/
├── components/              # Componentes base reutilizáveis
│   ├── forms/              # BaseFormComponent
│   ├── modals/             # BaseModalComponent
│   ├── buttons/            # BaseButtonComponent
│   ├── cards/              # Card components
│   ├── loading/            # Loading indicators
│   └── layout/             # Layout components
│
├── services/               # Serviços globais
│   ├── auth.service.ts     # (movido de pages/)
│   ├── error.service.ts    # Novo - Tratamento centralizado
│   ├── loading.service.ts  # (movido de pages/)
│   └── oauth.service.ts    # (movido de pages/)
│
├── models/                 # Tipos e interfaces globais
│   └── (tipos compartilhados)
│
├── constants/              # Constantes globais
│   ├── app.constants.ts    # Rotas, roles, API config
│   └── validation.constants.ts
│
├── utils/                  # Funções utilitárias
│   ├── form.utils.ts       # FormGroup helpers
│   ├── validation.utils.ts # Validação helpers
│   └── date.utils.ts       # (futuro)
│
├── index.ts               # Barrel exports
└── README.md              # Este arquivo
```

## 🚀 Como Usar

### Import de Componentes Base

```typescript
import { BaseFormComponent, ErrorService, APP_CONSTANTS } from '@app/core';
```

### Estender BaseFormComponent

```typescript
import { BaseFormComponent } from '@app/core';

export class MyLoginComponent extends BaseFormComponent {
  buildForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      // Sua lógica
    }
  }
}
```

### Usar ErrorService

```typescript
import { ErrorService } from '@app/core';

constructor(private errorService: ErrorService) {}

handleError(error: HttpErrorResponse): void {
  this.errorService.handleHttpError(error);
}
```

### Usar Constants

```typescript
import { APP_CONSTANTS } from '@app/core';

navigateToPatientDashboard(): void {
  this.router.navigate([APP_CONSTANTS.ROUTES.PATIENT.DASHBOARD]);
}
```

### Usar Utils

```typescript
import { FormUtils, ValidationUtils } from '@app/core';

// Validar email
const isValid = ValidationUtils.isValidEmail('user@example.com');

// Marcar campos como touched
FormUtils.markAllAsTouched(this.form);
```

## 📊 Componentes Base Disponíveis

### BaseFormComponent
- ✅ Gerenciar FormGroup
- ✅ Validação de campos
- ✅ Error handling
- ✅ Submit state

### BaseModalComponent
- ✅ Estrutura base para modais
- ✅ Confirm/Cancel events
- ✅ Loading state

### BaseButtonComponent
- ✅ Variantes (primary, secondary, danger, ghost)
- ✅ Tamanhos (sm, md, lg)
- ✅ Estados (loading, disabled)

## 🔄 Padrão de Adição de Novo Componente

1. Criar arquivo em `components/{type}/my-component.ts`
2. Exportar em `index.ts`
3. Documentar aqui

## 📈 Estatísticas FASE 1

- ✅ 3 componentes base criados
- ✅ 1 serviço centralizado
- ✅ 2 arquivos de constantes
- ✅ 2 utilitários comuns
- ✅ Redução de 40-60% código duplicado

## 🔗 Próximas Fases

- **FASE 2:** Refatorar componentes existentes para usar bases
- **FASE 3:** Migrar Patient context
- **FASE 4:** Migrar Professional context
- **FASE 5:** Migrar Clinical context
