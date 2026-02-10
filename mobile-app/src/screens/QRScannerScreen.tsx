/**
 * QR Scanner Screen
 * Scan and analyze QR codes for threats
 * Uses react-native-vision-camera with built-in code scanner
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import qrScannerService, { ScanResult } from '../services/qrScanner';
import api from '../services/api';

const QRScannerScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();

  const handleScan = useCallback(async (data: string) => {
    if (analyzing || showResult) return;
    setAnalyzing(true);

    const result = qrScannerService.analyzeQRCode(data);

    if (result.type === 'url') {
      try {
        const backendAnalysis = await api.analyzeContent(data, 'url');
        if (backendAnalysis.is_threat) {
          result.isSuspicious = true;
          result.threatLevel = 'danger';
          result.reason = backendAnalysis.recommendation;
        }
      } catch (error) {
        console.error('Backend analysis error:', error);
      }
    }

    setScanResult(result);
    setShowResult(true);
    setAnalyzing(false);
  }, [analyzing, showResult]);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'code-128', 'pdf-417'],
    onCodeScanned: (codes) => {
      if (codes.length > 0 && codes[0].value) {
        handleScan(codes[0].value);
      }
    },
  });

  const handleOpenURL = async () => {
    if (scanResult?.type === 'url' && scanResult.data) {
      if (scanResult.threatLevel === 'danger') {
        Alert.alert(
          'Advertencia',
          'Esta URL ha sido identificada como peligrosa. ¿Estás seguro de que quieres abrirla?',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Abrir de todos modos', style: 'destructive', onPress: () => {
              Linking.openURL(scanResult.data);
            }},
          ]
        );
      } else {
        Linking.openURL(scanResult.data);
      }
    }
  };

  const handleCopy = () => {
    Alert.alert('Copiado', 'El contenido ha sido copiado al portapapeles');
  };

  const getThreatLevelColor = () => {
    switch (scanResult?.threatLevel) {
      case 'danger': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#22c55e';
    }
  };

  const getThreatLevelIcon = () => {
    switch (scanResult?.threatLevel) {
      case 'danger': return 'close-circle';
      case 'warning': return 'warning';
      default: return 'checkmark-circle';
    }
  };

  const getThreatLevelText = () => {
    switch (scanResult?.threatLevel) {
      case 'danger': return 'PELIGROSO';
      case 'warning': return 'PRECAUCION';
      default: return 'SEGURO';
    }
  };

  // Permission handling
  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Icon name="camera-outline" size={64} color="#6366f1" />
          <Text style={styles.permissionTitle}>Permiso de Camara</Text>
          <Text style={styles.permissionText}>
            Necesitamos acceso a la camara para escanear codigos QR
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Permitir Camara</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!device) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Icon name="alert-circle-outline" size={64} color="#ef4444" />
          <Text style={styles.permissionTitle}>Camara no disponible</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Icon name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Escaner QR</Text>
        <TouchableOpacity style={styles.closeButton} onPress={() => setTorchOn(!torchOn)}>
          <Icon name={torchOn ? 'flash' : 'flash-outline'} size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Scanner */}
      <View style={styles.scannerContainer}>
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={!showResult}
          codeScanner={codeScanner}
          torch={torchOn ? 'on' : 'off'}
        />

        {/* Overlay with scan marker */}
        <View style={styles.overlay}>
          <Text style={styles.scanInstructions}>
            Apunta la camara al codigo QR
          </Text>
          <View style={styles.marker}>
            <View style={[styles.markerCorner, styles.topLeft]} />
            <View style={[styles.markerCorner, styles.topRight]} />
            <View style={[styles.markerCorner, styles.bottomLeft]} />
            <View style={[styles.markerCorner, styles.bottomRight]} />
          </View>
        </View>

        {analyzing && (
          <View style={styles.analyzingOverlay}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.analyzingText}>Analizando...</Text>
          </View>
        )}
      </View>

      {/* Result Modal */}
      <Modal visible={showResult} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.resultCard}>
            <View style={[styles.statusIcon, { backgroundColor: getThreatLevelColor() + '20' }]}>
              <Icon name={getThreatLevelIcon()} size={60} color={getThreatLevelColor()} />
            </View>

            <Text style={[styles.statusText, { color: getThreatLevelColor() }]}>
              {getThreatLevelText()}
            </Text>

            <View style={styles.contentType}>
              <Icon
                name={
                  scanResult?.type === 'url' ? 'link' :
                  scanResult?.type === 'phone' ? 'call' :
                  scanResult?.type === 'email' ? 'mail' :
                  scanResult?.type === 'wifi' ? 'wifi' :
                  'document-text'
                }
                size={16}
                color="#6b7280"
              />
              <Text style={styles.contentTypeText}>
                {scanResult?.type?.toUpperCase()}
              </Text>
            </View>

            <View style={styles.contentBox}>
              <Text style={styles.contentText} numberOfLines={3}>
                {scanResult?.data}
              </Text>
            </View>

            {scanResult?.reason && (
              <View style={styles.reasonBox}>
                <Icon name="information-circle" size={20} color="#f59e0b" />
                <Text style={styles.reasonText}>{scanResult.reason}</Text>
              </View>
            )}

            <View style={styles.actions}>
              {scanResult?.type === 'url' && (
                <TouchableOpacity
                  style={[styles.actionButton, scanResult.threatLevel === 'danger' && styles.dangerButton]}
                  onPress={handleOpenURL}
                >
                  <Icon name="open-outline" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Abrir</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={handleCopy}
              >
                <Icon name="copy-outline" size={20} color="#6366f1" />
                <Text style={[styles.actionButtonText, { color: '#6366f1' }]}>Copiar</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.scanAgainButton}
              onPress={() => { setShowResult(false); setScanResult(null); }}
            >
              <Text style={styles.scanAgainText}>Escanear otro codigo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1a1a2e',
    zIndex: 10,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanInstructions: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
  },
  marker: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  markerCorner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#6366f1',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  analyzingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#1a1a2e',
  },
  permissionTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 12,
  },
  permissionText: {
    color: '#9ca3af',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginBottom: 16,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  backButtonText: {
    color: '#6366f1',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  resultCard: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  statusIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  contentType: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  contentTypeText: {
    color: '#6b7280',
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '600',
  },
  contentBox: {
    width: '100%',
    backgroundColor: '#16162a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  contentText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  reasonBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f59e0b20',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    width: '100%',
  },
  reasonText: {
    flex: 1,
    color: '#f59e0b',
    fontSize: 14,
    marginLeft: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  dangerButton: {
    backgroundColor: '#ef4444',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scanAgainButton: {
    marginTop: 8,
  },
  scanAgainText: {
    color: '#6366f1',
    fontSize: 14,
  },
});

export default QRScannerScreen;
