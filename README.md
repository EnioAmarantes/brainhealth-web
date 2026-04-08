# Frontend Web - Angular

## Configuração

### Setup Inicial

```bash
# Instalar Angular CLI
npm install -g @angular/cli

# Criar projeto
ng new brain-health-web
cd brain-health-web

# Servir localmente
ng serve
# Navegue para http://localhost:4200/
```

### Estrutura do Projeto

```
src/
├── app/
│   ├── components/
│   ├── services/
│   ├── models/
│   ├── pages/
│   └── app.module.ts
├── assets/
├── styles/
├── index.html
└── main.ts
```

### Dependências Principais

- Angular Material (UI Components)
- RxJS (Reactive Programming)
- HttpClient (Chamadas HTTP)

### Build para Produção

```bash
ng build --configuration production
```

## Funcionalidades Planejadas

- [ ] Dashboard de monitoramento
- [ ] Gráficos de análise
- [ ] Relatórios
- [ ] Configurações de usuário
