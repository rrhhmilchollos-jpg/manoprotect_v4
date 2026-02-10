/**
 * PANTALLA DE ALERTA SOS - ManoProtect
 * 
 * Esta pantalla se muestra cuando se recibe una alerta SOS de un familiar.
 * Incluye:
 * - Mapa con ubicación en tiempo real
 * - Botón grande "ENTERADO" para confirmar
 * - Botón para abrir Google Maps
 * - Botón para llamar al 112
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import sosNativeService, { SOSLocation } from '../services/sosNative';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../services/api';

const { width, height } = Dimensions.get('window');

interface SOSAlertScreenParams {
  alertId: string;
  senderName: string;
  latitude: number;
  longitude: number;
  message?: string;
}

const SOSAlertScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as SOSAlertScreenParams;

  const [location, setLocation] = useState<SOSLocation>({
    latitude: params?.latitude || 0,
    longitude: params?.longitude || 0,
  });
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const [acknowledgedBy, setAcknowledgedBy] = useState<string | null>(null);

  // Flash animation
  const flashAnim = useRef(new Animated.Value(0)).current;
  const flashAnimation = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    // Start flash animation
    flashAnimation.current = Animated.loop(
      Animated.sequence([
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }),
        Animated.timing(flashAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }),
      ])
    );
    flashAnimation.current.start();

    // Listen for location updates
    const handleLocationUpdate = (data: SOSLocation) => {
      setLocation(data);
    };

    sosNativeService.addEventListener('locationUpdate', handleLocationUpdate);

    return () => {
      flashAnimation.current?.stop();
      sosNativeService.removeEventListener('locationUpdate', handleLocationUpdate);
    };
  }, []);

  const backgroundColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#1a1a2e', '#3D1A1A'],
  });

  /**
   * MANEJAR BOTÓN "ENTERADO"
   */
  const handleAcknowledge = async () => {
    try {
      setIsAcknowledged(true);
      
      // Stop native alert
      await sosNativeService.acknowledgeAlert(params.alertId);

      // Notify server
      await api.post('/api/sos/acknowledge', {
        alert_id: params.alertId,
      });

      // Stop flash
      flashAnimation.current?.stop();

      // Navigate back after 3 seconds
      setTimeout(() => {
        navigation.goBack();
      }, 3000);

    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  /**
   * ABRIR GOOGLE MAPS
   */
  const openMaps = () => {
    const url = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
    Linking.openURL(url);
  };

  /**
   * LLAMAR AL 112
   */
  const callEmergency = () => {
    Linking.openURL('tel:112');
  };

  if (isAcknowledged) {
    return (
      <View style={styles.acknowledgedContainer}>
        <Text style={styles.acknowledgedIcon}>✅</Text>
        <Text style={styles.acknowledgedTitle}>Emergencia Atendida</Text>
        <Text style={styles.acknowledgedSubtitle}>
          Has confirmado la emergencia. ¡Ve a ayudar a {params.senderName}!
        </Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.emergencyIcon}>🆘</Text>
        <Text style={styles.title}>¡EMERGENCIA SOS!</Text>
        <Text style={styles.senderName}>
          {params.senderName || 'Familiar'} necesita ayuda
        </Text>
      </View>

      {/* Map Placeholder */}
      <View style={styles.mapContainer}>
        <Text style={styles.mapLabel}>📍 Ubicación en tiempo real</Text>
        <Text style={styles.coordinates}>
          {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
        </Text>
      </View>

      {/* Message */}
      {params.message && (
        <View style={styles.messageContainer}>
          <Text style={styles.message}>{params.message}</Text>
        </View>
      )}

      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        {/* Main Acknowledge Button */}
        <TouchableOpacity
          style={styles.acknowledgeButton}
          onPress={handleAcknowledge}
          activeOpacity={0.8}
        >
          <Text style={styles.acknowledgeButtonText}>
            ✅ ENTERADO - ESTOY EN CAMINO
          </Text>
        </TouchableOpacity>

        {/* Open Maps Button */}
        <TouchableOpacity
          style={styles.mapsButton}
          onPress={openMaps}
          activeOpacity={0.8}
        >
          <Text style={styles.mapsButtonText}>🗺️ ABRIR EN GOOGLE MAPS</Text>
        </TouchableOpacity>

        {/* Call Emergency Button */}
        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={callEmergency}
          activeOpacity={0.8}
        >
          <Text style={styles.emergencyButtonText}>📞 LLAMAR 112</Text>
        </TouchableOpacity>
      </View>

      {/* Status */}
      <Text style={styles.status}>⏳ Esperando confirmación...</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  emergencyIcon: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 10,
  },
  senderName: {
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  mapContainer: {
    backgroundColor: '#2a2a4e',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    minHeight: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  coordinates: {
    fontSize: 14,
    color: '#60A5FA',
    fontFamily: 'monospace',
  },
  messageContainer: {
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  buttonsContainer: {
    marginTop: 'auto',
  },
  acknowledgeButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
  },
  acknowledgeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  mapsButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  mapsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emergencyButton: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  emergencyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  status: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  // Acknowledged state
  acknowledgedContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  acknowledgedIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  acknowledgedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 15,
  },
  acknowledgedSubtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 26,
  },
});

export default SOSAlertScreen;
