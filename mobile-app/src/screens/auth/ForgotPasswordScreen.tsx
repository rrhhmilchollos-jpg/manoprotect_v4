/**
 * Forgot Password Screen
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Por favor introduce tu email');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1500);
  };

  if (sent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.successIcon}>
            <Icon name="mail-open" size={60} color="#22c55e" />
          </View>
          <Text style={styles.successTitle}>Email enviado</Text>
          <Text style={styles.successText}>
            Hemos enviado un enlace para restablecer tu contraseña a {email}
          </Text>
          <TouchableOpacity
            style={styles.backToLogin}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.backToLoginText}>Volver al inicio de sesión</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.iconContainer}>
          <Icon name="key-outline" size={60} color="#6366f1" />
        </View>

        <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
        <Text style={styles.subtitle}>
          Introduce tu email y te enviaremos un enlace para restablecerla
        </Text>

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

        <TouchableOpacity
          style={[styles.resetButton, loading && styles.buttonDisabled]}
          onPress={handleResetPassword}
          disabled={loading}
        >
          <LinearGradient
            colors={['#6366f1', '#8b5cf6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Enviando...' : 'Enviar enlace'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  backButton: {
    marginBottom: 32,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16162a',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
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
  resetButton: {
    borderRadius: 12,
    overflow: 'hidden',
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
  successIcon: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  successText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  backToLogin: {
    alignItems: 'center',
  },
  backToLoginText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;
