/**
 * Settings Screen
 * App settings and preferences
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import biometricService from '../services/biometrics';
import api from '../services/api';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, refreshUser, biometricAvailable, biometricEnabled, enableBiometric, disableBiometric } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoBlockEnabled, setAutoBlockEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }

    setSaving(true);
    try {
      await api.updateProfile({
        name: name.trim(),
        phone: phone.trim() || null,
      });
      await refreshUser();
      Alert.alert('Guardado', 'Tu perfil ha sido actualizado');
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleBiometric = async () => {
    if (biometricEnabled) {
      Alert.alert(
        'Desactivar Biometría',
        '¿Deseas desactivar el acceso biométrico?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Desactivar', 
            onPress: async () => {
              await disableBiometric();
              Alert.alert('Desactivado', 'Acceso biométrico desactivado');
            }
          },
        ]
      );
    } else {
      // Need to prompt for password to enable biometric
      Alert.prompt(
        'Activar Biometría',
        'Introduce tu contraseña para activar el acceso biométrico',
        async (password) => {
          if (password && user?.email) {
            try {
              const success = await enableBiometric(user.email, password);
              if (success) {
                Alert.alert('Activado', 'Acceso biométrico activado correctamente');
              } else {
                Alert.alert('Error', 'No se pudo activar el acceso biométrico');
              }
            } catch (error) {
              Alert.alert('Error', 'Contraseña incorrecta');
            }
          }
        },
        'secure-text'
      );
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Eliminar Cuenta',
      '¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Contacto', 'Por favor contacta con soporte para eliminar tu cuenta: support@mano-protect.com');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajustes</Text>
        <TouchableOpacity onPress={handleSaveProfile} disabled={saving}>
          <Text style={[styles.saveText, saving && { opacity: 0.5 }]}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Profile Section */}
        <Text style={styles.sectionTitle}>Perfil</Text>
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre</Text>
            <View style={styles.inputContainer}>
              <Icon name="person-outline" size={20} color="#6b7280" />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Tu nombre"
                placeholderTextColor="#6b7280"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={[styles.inputContainer, styles.inputDisabled]}>
              <Icon name="mail-outline" size={20} color="#6b7280" />
              <Text style={styles.inputDisabledText}>{user?.email}</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Teléfono</Text>
            <View style={styles.inputContainer}>
              <Icon name="call-outline" size={20} color="#6b7280" />
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+34 600 000 000"
                placeholderTextColor="#6b7280"
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        {/* Security Section */}
        <Text style={styles.sectionTitle}>Seguridad</Text>
        <View style={styles.card}>
          {biometricAvailable && (
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Icon name="finger-print" size={22} color="#f59e0b" />
                <View>
                  <Text style={styles.settingLabel}>Acceso Biométrico</Text>
                  <Text style={styles.settingDescription}>Face ID / Touch ID / Huella</Text>
                </View>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={handleToggleBiometric}
                trackColor={{ false: '#3d3d5c', true: '#f59e0b' }}
                thumbColor="#fff"
              />
            </View>
          )}

          <View style={styles.settingDivider} />

          <TouchableOpacity style={styles.settingRowButton}>
            <View style={styles.settingInfo}>
              <Icon name="key-outline" size={22} color="#6366f1" />
              <Text style={styles.settingLabel}>Cambiar Contraseña</Text>
            </View>
            <Icon name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <Text style={styles.sectionTitle}>Notificaciones</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Icon name="notifications" size={22} color="#6366f1" />
              <Text style={styles.settingLabel}>Push Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#3d3d5c', true: '#6366f1' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingDivider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Icon name="shield" size={22} color="#22c55e" />
              <View>
                <Text style={styles.settingLabel}>Bloqueo Automático</Text>
                <Text style={styles.settingDescription}>Bloquear amenazas automáticamente</Text>
              </View>
            </View>
            <Switch
              value={autoBlockEnabled}
              onValueChange={setAutoBlockEnabled}
              trackColor={{ false: '#3d3d5c', true: '#22c55e' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Appearance Section */}
        <Text style={styles.sectionTitle}>Apariencia</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Icon name="moon" size={22} color="#8b5cf6" />
              <Text style={styles.settingLabel}>Modo Oscuro</Text>
            </View>
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              trackColor={{ false: '#3d3d5c', true: '#8b5cf6' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* About Section */}
        <Text style={styles.sectionTitle}>Acerca de</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.settingRowButton}>
            <View style={styles.settingInfo}>
              <Icon name="document-text-outline" size={22} color="#6b7280" />
              <Text style={styles.settingLabel}>Términos de Servicio</Text>
            </View>
            <Icon name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>

          <View style={styles.settingDivider} />

          <TouchableOpacity style={styles.settingRowButton}>
            <View style={styles.settingInfo}>
              <Icon name="shield-outline" size={22} color="#6b7280" />
              <Text style={styles.settingLabel}>Política de Privacidad</Text>
            </View>
            <Icon name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>

          <View style={styles.settingDivider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Icon name="information-circle-outline" size={22} color="#6b7280" />
              <Text style={styles.settingLabel}>Versión</Text>
            </View>
            <Text style={styles.versionText}>1.0.0</Text>
          </View>
        </View>

        {/* Developer Tools Section */}
        <Text style={styles.sectionTitle}>Herramientas de Desarrollo</Text>
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.settingRowButton}
            onPress={() => navigation.navigate('SOSTest')}
          >
            <View style={styles.settingInfo}>
              <Icon name="flask" size={22} color="#f59e0b" />
              <View>
                <Text style={styles.settingLabel}>Probar Sistema SOS</Text>
                <Text style={styles.settingDescription}>Verificar sirena y permisos</Text>
              </View>
            </View>
            <Icon name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
          <Icon name="trash-outline" size={20} color="#ef4444" />
          <Text style={styles.deleteButtonText}>Eliminar Cuenta</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  saveText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#16162a',
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2d2d4a',
    overflow: 'hidden',
  },
  inputGroup: {
    padding: 16,
  },
  label: {
    color: '#9ca3af',
    fontSize: 13,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    paddingHorizontal: 14,
    gap: 10,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 14,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  inputDisabledText: {
    flex: 1,
    color: '#9ca3af',
    fontSize: 16,
    paddingVertical: 14,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingRowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  settingLabel: {
    color: '#fff',
    fontSize: 15,
  },
  settingDescription: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 2,
  },
  settingDivider: {
    height: 1,
    backgroundColor: '#2d2d4a',
    marginHorizontal: 16,
  },
  versionText: {
    color: '#6b7280',
    fontSize: 14,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef444420',
    borderRadius: 14,
    paddingVertical: 16,
    gap: 10,
    marginTop: 20,
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen;
