#!/bin/bash
# Script para deploy a Firebase Hosting
# Ejecutar desde tu máquina local

echo "🔥 Deploy a Firebase Hosting - MANO"
echo ""

# Verificar Firebase CLI
if ! command -v firebase &> /dev/null; then
    echo "Instalando Firebase CLI..."
    npm install -g firebase-tools
fi

# Login (abrirá navegador)
echo "1. Iniciando sesión en Firebase..."
firebase login

# Build
echo ""
echo "2. Construyendo la aplicación..."
cd frontend
yarn install
yarn build

# Deploy
echo ""
echo "3. Desplegando a Firebase Hosting..."
firebase deploy --only hosting

echo ""
echo "✅ Deploy completado!"
echo "🌐 Tu app está en: https://manoprotect-f889b.web.app"
