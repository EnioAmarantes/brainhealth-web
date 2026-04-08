#!/bin/bash

# Script para inicializar o projeto Angular Brain Health Web

echo "🧠 ================================"
echo "🚀 Inicializando Brain Health Web"
echo "🧠 ================================"
echo ""

# Verifica Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado!"
    echo "   Instale Node.js 18+ em https://nodejs.org"
    exit 1
fi

echo "✅ Node.js $(node -v) encontrado"

# Verifica npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado!"
    exit 1
fi

echo "✅ npm $(npm -v) encontrado"

# Instala Angular CLI globalmente se não existir
if ! command -v ng &> /dev/null; then
    echo ""
    echo "📦 Instalando Angular CLI globalmente..."
    npm install -g @angular/cli@17
    echo "✅ Angular CLI instalado!"
fi

echo ""
echo "📦 Instalando dependências do projeto..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências!"
    exit 1
fi

echo ""
echo "✅ ================================"
echo "✅ Projeto pronto para uso!"
echo "✅ ================================"
echo ""
echo "📝 Próximos passos:"
echo ""
echo "1. Iniciar servidor de desenvolvimento:"
echo "   npm start"
echo ""
echo "2. Abrir navegador:"
echo "   http://localhost:4200"
echo ""
echo "3. Fazer login com:"
echo "   Email: teste@exemplo.com"
echo "   Senha: senha123"
echo ""
echo "4. Ou buscar profissional sem login na tela inicial"
echo ""
echo "🔧 Configuração:"
echo "   - Backend API: src/environments/environment.ts"
echo "   - Estilos: src/styles/main.scss"
echo "   - Rotas: src/app/app.routes.ts"
echo ""
echo "📚 Documentação:"
echo "   - README_IMPLEMENTATION.md"
echo "   - IMPLEMENTATION_SUMMARY.md"
echo ""
