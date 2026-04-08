#!/bin/bash

# Script para inicializar o projeto Angular

echo "🚀 Inicializando Brain Health Web (Angular)..."

if ! command -v ng &> /dev/null; then
    echo "⚠️  Angular CLI não encontrado. Instalando..."
    npm install -g @angular/cli
fi

echo "📦 Instalando dependências..."
npm install

echo "✅ Projeto Angular pronto!"
echo "Para iniciar o servidor de desenvolvimento, execute:"
echo "  ng serve"
