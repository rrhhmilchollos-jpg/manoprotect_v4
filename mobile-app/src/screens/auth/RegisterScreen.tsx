/**
 * Register Screen
 * New user registration
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { register } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const validatePassword = (pass: string): boolean => {
    return pass.length >= 8;
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (!acceptedTerms) {
      Alert.alert('Error', 'Debes aceptar los términos y condiciones');
      return;
    }

    setLoading(true);
    try {
      await register(email, name, password);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>
              Únete a MANO y protege tu vida digital
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Icon name="person-outline" size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nombre completo"
                placeholderTextColor="#6b7280"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="mail-outline" size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#6b7280"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="lock-closed-outline" size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña (mín. 8 caracteres)"
                placeholderTextColor="#6b7280"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Icon
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Icon name="lock-closed-outline" size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirmar contraseña"
                placeholderTextColor="#6b7280"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
            </View>

            {/* Password strength indicator */}
            {password.length > 0 && (
              <View style={styles.passwordStrength}>
                <View style={[
                  styles.strengthBar,
                  { backgroundColor: password.length >= 8 ? '#22c55e' : '#ef4444' }
                ]} />
                <Text style={[
                  styles.strengthText,
                  { color: password.length >= 8 ? '#22c55e' : '#ef4444' }
                ]}>
                  {password.length >= 8 ? 'Contraseña segura' : 'Mínimo 8 caracteres'}
                </Text>
              </View>
            )}

            {/* Terms checkbox */}
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
            >
              <Icon
                name={acceptedTerms ? 'checkbox' : 'square-outline'}
                size={24}
                color="#6366f1"
              />
              <Text style={styles.termsText}>
                Acepto los{' '}
                <Text style={styles.termsLink}>Términos de Servicio</Text>
                {' '}y la{' '}
                <Text style={styles.termsLink}>Política de Privacidad</Text>
              </Text>
            </TouchableOpacity>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerButton, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              <LinearGradient
                colors={['#6366f1', '#8b5cf6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Inicia sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16162a',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2d2d4a',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 16,
  },
  passwordStrength: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  strengthBar: {
    width: 50,
    height: 4,
    borderRadius: 2,
    marginRight: 8,
  },
  strengthText: {
    fontSize: 12,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  termsText: {
    flex: 1,
    color: '#9ca3af',
    fontSize: 14,
    marginLeft: 8,
    lineHeight: 20,
  },
  termsLink: {
    color: '#6366f1',
  },
  registerButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  loginLink: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RegisterScreen;
