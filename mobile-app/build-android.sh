#!/bin/bash
set -e

echo "🔨 Building Mano Android App"
echo ""

APP_DIR="/app/mobile-app"
APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"

# Check app directory
if [ ! -d "$APP_DIR" ]; then
  echo "❌ App directory not found: $APP_DIR"
  exit 1
fi

cd "$APP_DIR"

# Install dependencies
echo "📦 Installing dependencies..."
yarn install --frozen-lockfile

# Android build
cd android

echo "🧹 Cleaning previous builds..."
./gradlew clean

echo "🏗️ Building debug APK..."
./gradlew assembleDebug

# Verify APK
if [ -f "$APK_PATH" ]; then
  echo ""
  echo "✅ Build successful"
  echo "📱 APK: $APP_DIR/$APK_PATH"
  echo "📊 Size: $(du -h "$APK_PATH" | cut -f1)"
else
  echo "❌ APK not generated"
  exit 1
fi

echo ""
echo "📋 Next steps:"
echo "adb install $APK_PATH"
