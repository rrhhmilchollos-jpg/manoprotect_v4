#!/bin/bash
# ManoProtect - Script de compilacion de apps Electron
# Ejecutar en Windows (Git Bash) o Mac

echo "================================================"
echo "  ManoProtect - Compilador de Apps de Escritorio"
echo "  Dominio: manoprotectt.com"
echo "================================================"

# Verificar node y npm
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js no encontrado. Instala Node.js 18+ desde https://nodejs.org"
    exit 1
fi

echo ""
echo "Compilando CRA Operador..."
cd desktop-apps/cra-operador
npm install
npx electron-builder --win --publish never
echo "CRA compilado en: desktop-apps/cra-operador/dist/"

echo ""
echo "Compilando CRM Ventas..."
cd ../crm-ventas
npm install
npx electron-builder --win --publish never
echo "CRM compilado en: desktop-apps/crm-ventas/dist/"

echo ""
echo "================================================"
echo "  Instaladores generados:"
echo "  - CRA: desktop-apps/cra-operador/dist/*.exe"
echo "  - CRM: desktop-apps/crm-ventas/dist/*.exe"
echo "================================================"
echo ""
echo "Los instaladores apuntan a: https://www.manoprotectt.com"
echo "Distribuyelos a los operadores y comerciales."
