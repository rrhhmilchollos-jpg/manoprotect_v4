#!/bin/bash
# Build script for Mano Android app

echo "🔨 Building Mano Android App..."
echo ""

# Navigate to mobile app directory
cd /app/mobile-app

# Install dependencies
echo "📦 Installing dependencies..."
yarn install

# Navigate to android folder
cd android

# Clean previous builds
echo "🧹 Cleaning previous builds..."
./gradlew clean

# Build debug APK
echo "🏗️ Building debug APK..."
./gradlew assembleDebug

# Check if build was successful
if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
    echo ""
    echo "✅ Build successful!"
    echo "📱 APK location: /app/mobile-app/android/app/build/outputs/apk/debug/app-debug.apk"
    
    # Get APK size
    size=$(du -h app/build/outputs/apk/debug/app-debug.apk | cut -f1)
    echo "📊 APK size: $size"
else
    echo ""
    echo "❌ Build failed!"
    exit 1
fi

echo ""
echo "📋 Next steps:"
echo "1. Transfer the APK to your Android device"
echo "2. Enable 'Install from unknown sources' in settings"
echo "3. Install and test the app"
