# ProGuard rules for MANO Protect app
# Add these rules to your android/app/proguard-rules.pro

# React Native
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# React Native Navigation
-keep class com.reactnavigation.** { *; }
-keep class com.swmansion.** { *; }

# Firebase
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }

# Keychain / Biometrics
-keep class com.oblador.keychain.** { *; }
-keep class rnbiometrics.** { *; }

# Camera / QR Scanner
-keep class com.google.mlkit.** { *; }
-keep class org.reactnative.camera.** { *; }

# AsyncStorage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# Vector Icons
-keep class com.oblador.vectoricons.** { *; }

# Linear Gradient
-keep class com.BV.LinearGradient.** { *; }

# Reanimated
-keep class com.swmansion.reanimated.** { *; }

# Safe Area
-keep class com.th3rdwave.safeareacontext.** { *; }

# Screens
-keep class com.swmansion.rnscreens.** { *; }

# Gesture Handler
-keep class com.swmansion.gesturehandler.** { *; }

# Keep generic signatures for Kotlin coroutines
-keepattributes Signature
-keepattributes *Annotation*

# OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn javax.annotation.**
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }
-keep class okio.** { *; }

# Retrofit
-dontwarn retrofit2.**
-keep class retrofit2.** { *; }

# Gson
-keep class com.google.gson.** { *; }
-keepattributes EnclosingMethod
