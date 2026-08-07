# Frontend Web - Angular

## Stack

- Angular 18
- Angular Material
- RxJS

## Arquitetura

O frontend está organizado por responsabilidades de interface, com separação entre páginas, componentes reutilizáveis e serviços de integração.

## Estrutura principal

```
frontend-web/src/app/
├── components/
│   ├── question-group/
│   │   ├── components/
│   │   └── strategies/
│   ├── checkbox.component.ts
│   ├── field-error.component.ts
│   └── required-span.component.ts
├── models/
│   └── questionnaire.model.ts
├── pages/
│   ├── questionnaire/
│   └── questionnaire-result/
├── services/
│   ├── questionnaire.service.ts
│   ├── ai-analysis.service.ts
│   ├── questionnaire-result-session.service.ts
│   └── whatsapp.service.ts
├── app.routes.ts
└── app.config.ts
```

## Fluxo principal de triagem

1. Página de questionário carrega template pela API.
2. Usuário responde e envia formulário.
3. Frontend chama `POST /api/Questionnaires/submit`.
4. Backend persiste triagem (questionário, lead e assessment) antes da resposta.
5. Frontend usa o retorno para montar contexto e buscar recomendação de profissionais.
6. Resultado é salvo em sessão (`questionnaire-result-session.service`) e exibido na página de resultado.

## Responsabilidades por camada de UI

- `pages`: composição de fluxo e navegação.
- `components`: blocos reutilizáveis de formulário e exibição.
- `services`: comunicação HTTP e estado transitório do resultado.
- `models`: contratos tipados com backend.

## Execução local

```bash
cd frontend-web
npm install
npm start
```

Aplicação disponível em `http://localhost:4200` no modo dev local.

## Build

```bash
cd frontend-web
npm run build -- --configuration production
```
