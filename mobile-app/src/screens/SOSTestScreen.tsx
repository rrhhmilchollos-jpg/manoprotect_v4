/**
 * PANTALLA DE PRUEBA SOS - ManoProtect
 * 
 * Esta pantalla permite probar el sistema de alerta crítica SOS
 * localmente SIN enviar alertas a familiares.
 * 
 * Funcionalidades de prueba:
 * 1. Probar sirena (verifica que ignora modo silencioso)
 * 2. Probar vibración (patrón SOS)
 * 3. Probar notificación crítica
 * 4. Verificar permisos
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  PermissionsAndroid,
  Linking,
} from 'react-native';
import sosNativeService from '../services/sosNative';

const SOSTestScreen: React.FC = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    checkPermissions();
    sosNativeService.initialize();
  }, []);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [`[${timestamp}] ${message}`, ...prev]);
  };

  /**
   * VERIFICAR PERMISOS
   */
  const checkPermissions = async () => {
    if (Platform.OS !== 'android') return;

    const permissionsList = [
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      PermissionsAndroid.PERMISSIONS.VIBRATE,
    ];

    const results: {[key: string]: boolean} = {};

    for (const permission of permissionsList) {
      try {
        const granted = await PermissionsAndroid.check(permission);
        const name = permission.split('.').pop() || permission;
        results[name] = granted;
      } catch (err) {
        console.error('Error checking permission:', err);
      }
    }

    setPermissions(results);
    addLog('Permisos verificados');
  };

  /**
   * SOLICITAR PERMISOS
   */
  const requestPermissions = async () => {
    if (Platform.OS !== 'android') return;

    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      ]);

      addLog('Permisos solicitados');
      checkPermissions();
    } catch (err) {
      addLog('❌ Error solicitando permisos');
    }
  };

  /**
   * PROBAR SIRENA CRÍTICA
   * Inicia el servicio nativo con sirena a volumen máximo
   */
  const testSiren = async () => {
    if (isTesting) {
      addLog('⚠️ Ya hay una prueba en curso');
      return;
    }

    setIsTesting(true);
    addLog('🔊 Iniciando prueba de sirena...');
    addLog('📢 Verificando que ignora modo silencioso...');

    try {
      // Iniciar alerta de prueba
      const success = await sosNativeService.startCriticalAlert({
        alertId: `test_${Date.now()}`,
        senderName: 'PRUEBA SOS',
        latitude: 40.4168,
        longitude: -3.7038,
        message: 'Esta es una prueba del sistema SOS',
      });

      if (success) {
        addLog('✅ Sirena iniciada correctamente');
        addLog('🔊 Volumen configurado al 100%');
        addLog('📳 Vibración iniciada (patrón SOS)');
        addLog('');
        addLog('⏱️ La sirena se detendrá en 10 segundos...');
        addLog('   O pulsa "Detener Sirena" para parar');

        // Auto-detener después de 10 segundos
        setTimeout(async () => {
          await stopSiren();
        }, 10000);
      } else {
        addLog('❌ Error iniciando sirena');
        setIsTesting(false);
      }
    } catch (error) {
      addLog(`❌ Error: ${error}`);
      setIsTesting(false);
    }
  };

  /**
   * DETENER SIRENA
   */
  const stopSiren = async () => {
    addLog('🔇 Deteniendo sirena...');

    try {
      await sosNativeService.stopCriticalAlert();
      addLog('✅ Sirena detenida');
      addLog('🔊 Volumen restaurado');
      addLog('📳 Vibración detenida');
    } catch (error) {
      addLog(`❌ Error: ${error}`);
    }

    setIsTesting(false);
  };

  /**
   * PROBAR SOLO VIBRACIÓN
   */
  const testVibration = () => {
    addLog('📳 Probando vibración...');
    
    if ('vibrate' in navigator) {
      // Patrón SOS: ... --- ...
      const sosPattern = [
        200, 100, 200, 100, 200, 300,
        400, 100, 400, 100, 400, 300,
        200, 100, 200, 100, 200, 500,
      ];
      navigator.vibrate(sosPattern);
      addLog('✅ Vibración iniciada (patrón SOS)');
    } else {
      addLog('❌ Vibración no disponible');
    }
  };

  /**
   * VERIFICAR FCM TOKEN
   */
  const checkFCMToken = async () => {
    addLog('🔑 Obteniendo token FCM...');

    try {
      const token = await sosNativeService.getFCMToken();
      if (token) {
        addLog(`✅ Token FCM: ${token.substring(0, 30)}...`);
      } else {
        addLog('❌ No se pudo obtener token FCM');
      }
    } catch (error) {
      addLog(`❌ Error: ${error}`);
    }
  };

  /**
   * ABRIR CONFIGURACIÓN DE PERMISOS
   */
  const openSettings = () => {
    Linking.openSettings();
    addLog('📱 Abriendo configuración de la app...');
  };

  /**
   * LIMPIAR LOG
   */
  const clearLog = () => {
    setTestResults([]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧪 Prueba del Sistema SOS</Text>
        <Text style={styles.subtitle}>
          Verifica que el sistema funciona antes de publicar
        </Text>
      </View>

      {/* Permisos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Estado de Permisos</Text>
        <View style={styles.permissionsList}>
          {Object.entries(permissions).map(([name, granted]) => (
            <View key={name} style={styles.permissionItem}>
              <Text style={styles.permissionName}>{name}</Text>
              <Text style={[
                styles.permissionStatus,
                { color: granted ? '#10B981' : '#DC2626' }
              ]}>
                {granted ? '✅ Concedido' : '❌ Denegado'}
              </Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.secondaryButton} onPress={requestPermissions}>
          <Text style={styles.secondaryButtonText}>Solicitar Permisos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={openSettings}>
          <Text style={styles.secondaryButtonText}>Abrir Configuración</Text>
        </TouchableOpacity>
      </View>

      {/* Pruebas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔊 Pruebas de Alerta</Text>
        
        {/* Botón principal de prueba */}
        <TouchableOpacity
          style={[styles.testButton, isTesting && styles.testButtonDisabled]}
          onPress={testSiren}
          disabled={isTesting}
        >
          <Text style={styles.testButtonText}>
            {isTesting ? '🔊 SIRENA ACTIVA...' : '🚨 PROBAR SIRENA CRÍTICA'}
          </Text>
          <Text style={styles.testButtonSubtext}>
            Verifica que suena aunque el móvil esté en silencio
          </Text>
        </TouchableOpacity>

        {/* Botón detener */}
        {isTesting && (
          <TouchableOpacity style={styles.stopButton} onPress={stopSiren}>
            <Text style={styles.stopButtonText}>🔇 DETENER SIRENA</Text>
          </TouchableOpacity>
        )}

        {/* Otros tests */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.smallButton} onPress={testVibration}>
            <Text style={styles.smallButtonText}>📳 Vibración</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallButton} onPress={checkFCMToken}>
            <Text style={styles.smallButtonText}>🔑 Token FCM</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallButton} onPress={checkPermissions}>
            <Text style={styles.smallButtonText}>🔄 Refrescar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Log de resultados */}
      <View style={styles.section}>
        <View style={styles.logHeader}>
          <Text style={styles.sectionTitle}>📝 Log de Pruebas</Text>
          <TouchableOpacity onPress={clearLog}>
            <Text style={styles.clearButton}>Limpiar</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.logContainer}>
          {testResults.length === 0 ? (
            <Text style={styles.logEmpty}>
              Pulsa un botón de prueba para comenzar
            </Text>
          ) : (
            testResults.map((log, index) => (
              <Text key={index} style={styles.logItem}>{log}</Text>
            ))
          )}
        </View>
      </View>

      {/* Instrucciones */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📖 Instrucciones de Prueba</Text>
        <View style={styles.instructions}>
          <Text style={styles.instructionItem}>
            1. Pon el móvil en <Text style={styles.bold}>modo silencioso</Text>
          </Text>
          <Text style={styles.instructionItem}>
            2. Pulsa "PROBAR SIRENA CRÍTICA"
          </Text>
          <Text style={styles.instructionItem}>
            3. Verifica que la sirena suena <Text style={styles.bold}>al máximo volumen</Text>
          </Text>
          <Text style={styles.instructionItem}>
            4. Si no suena, verifica los permisos arriba
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          ⚠️ Esta pantalla es solo para desarrollo.{'\n'}
          No se enviarán alertas a familiares.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  section: {
    margin: 15,
    padding: 15,
    backgroundColor: '#2a2a4e',
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  permissionsList: {
    marginBottom: 15,
  },
  permissionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a5e',
  },
  permissionName: {
    color: '#D1D5DB',
    fontSize: 14,
  },
  permissionStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  secondaryButton: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  testButton: {
    backgroundColor: '#DC2626',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  testButtonDisabled: {
    backgroundColor: '#991B1B',
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  testButtonSubtext: {
    color: '#FCA5A5',
    fontSize: 12,
    marginTop: 5,
  },
  stopButton: {
    backgroundColor: '#10B981',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  stopButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  smallButton: {
    flex: 1,
    backgroundColor: '#4B5563',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  smallButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clearButton: {
    color: '#60A5FA',
    fontSize: 14,
  },
  logContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    padding: 10,
    minHeight: 150,
    maxHeight: 250,
  },
  logEmpty: {
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 40,
  },
  logItem: {
    color: '#D1D5DB',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  instructions: {
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    padding: 15,
  },
  instructionItem: {
    color: '#D1D5DB',
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  bold: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#6B7280',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default SOSTestScreen;
