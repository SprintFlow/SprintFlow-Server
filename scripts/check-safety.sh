#!/bin/bash

echo "🔍 Verificando configuración de seguridad..."
echo ""

# Verificar .env
if [ -f ".env" ]; then
    if grep -q "mongodb.net" .env; then
        echo "✅ .env contiene MongoDB Atlas (correcto)"
    else
        echo "⚠️  .env no parece tener MongoDB Atlas"
    fi
else
    echo "❌ .env no existe"
    exit 1
fi

# Verificar .env.test
if [ -f ".env.test" ]; then
    if grep -q "MONGO_URI" .env.test; then
        echo "❌ .env.test NO debe contener MONGO_URI"
        exit 1
    else
        echo "✅ .env.test está limpio (correcto)"
    fi
else
    echo "⚠️  .env.test no existe (se creará automáticamente)"
fi

# Verificar setup.test.js
if [ -f "src/test/setup.test.js" ]; then
    if grep -q "MongoMemoryServer" "src/test/setup.test.js"; then
        echo "✅ setup.test.js usa MongoMemoryServer (correcto)"
    else
        echo "❌ setup.test.js NO usa MongoMemoryServer"
        exit 1
    fi
else
    echo "❌ setup.test.js no existe"
    exit 1
fi

# Verificar index.js
if [ -f "index.js" ]; then
    if grep -q "NODE_ENV === 'test'" "index.js"; then
        echo "✅ index.js tiene protección de test (correcto)"
    else
        echo "⚠️  index.js podría no tener protección de test"
    fi
else
    echo "❌ index.js no existe"
    exit 1
fi

echo ""
echo "✅ Configuración de seguridad verificada"
echo "🚀 Puedes ejecutar: npm run test:safe"