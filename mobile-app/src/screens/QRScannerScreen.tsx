/**
 * QR Scanner Screen
 * Scan and analyze QR codes for threats
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RNCamera } from 'react-native-camera';
import QRCodeScanner from 'react-native-qrcode-scanner';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import qrScannerService, { ScanResult } from '../services/qrScanner';
import api from '../services/api';

const QRScannerScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const handleScan = async (e: any) => {
    const data = e.data;
    setAnalyzing(true);

    // Analyze QR content
    const result = qrScannerService.analyzeQRCode(data);
    
    // If it's a URL, also analyze with backend
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
  };

  const handleOpenURL = async () => {
    if (scanResult?.type === 'url' && scanResult.data) {
      if (scanResult.threatLevel === 'danger') {
        Alert.alert(
          '⚠️ Advertencia',
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
    // Copy to clipboard would go here
    Alert.alert('Copiado', 'El contenido ha sido copiado al portapapeles');
  };

  const getThreatLevelColor = () => {
    switch (scanResult?.threatLevel) {
      case 'danger':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      default:
        return '#22c55e';
    }
  };

  const getThreatLevelIcon = () => {
    switch (scanResult?.threatLevel) {
      case 'danger':
        return 'close-circle';
      case 'warning':
        return 'warning';
      default:
        return 'checkmark-circle';
    }
  };

  const getThreatLevelText = () => {
    switch (scanResult?.threatLevel) {
      case 'danger':
        return 'PELIGROSO';
      case 'warning':
        return 'PRECAUCIÓN';
      default:
        return 'SEGURO';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Escáner QR</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Scanner */}
      <View style={styles.scannerContainer}>
        <QRCodeScanner
          onRead={handleScan}
          reactivate={!showResult}
          reactivateTimeout={2000}
          showMarker={true}
          customMarker={
            <View style={styles.marker}>
              <View style={[styles.markerCorner, styles.topLeft]} />
              <View style={[styles.markerCorner, styles.topRight]} />
              <View style={[styles.markerCorner, styles.bottomLeft]} />
              <View style={[styles.markerCorner, styles.bottomRight]} />
            </View>
          }
          cameraStyle={styles.camera}
          topContent={
            <Text style={styles.scanInstructions}>
              Apunta la cámara al código QR
            </Text>
          }
        />
        
        {analyzing && (
          <View style={styles.analyzingOverlay}>
            <Text style={styles.analyzingText}>Analizando...</Text>
          </View>
        )}
      </View>

      {/* Result Modal */}
      <Modal
        visible={showResult}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.resultCard}>
            {/* Status Icon */}
            <View style={[styles.statusIcon, { backgroundColor: getThreatLevelColor() + '20' }]}>
              <Icon name={getThreatLevelIcon()} size={60} color={getThreatLevelColor()} />
            </View>

            {/* Status Text */}
            <Text style={[styles.statusText, { color: getThreatLevelColor() }]}>
              {getThreatLevelText()}
            </Text>

            {/* Content Type */}
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

            {/* Content */}
            <View style={styles.contentBox}>
              <Text style={styles.contentText} numberOfLines={3}>
                {scanResult?.data}
              </Text>
            </View>

            {/* Reason if suspicious */}
            {scanResult?.reason && (
              <View style={styles.reasonBox}>
                <Icon name="information-circle" size={20} color="#f59e0b" />
                <Text style={styles.reasonText}>{scanResult.reason}</Text>
              </View>
            )}

            {/* Actions */}
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

            {/* Scan Again */}
            <TouchableOpacity
              style={styles.scanAgainButton}
              onPress={() => {
                setShowResult(false);
                setScanResult(null);
              }}
            >
              <Text style={styles.scanAgainText}>Escanear otro código</Text>
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
  },
  camera: {
    height: '100%',
  },
  scanInstructions: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
