/**
 * Threat Detail Screen
 * Full details of a detected threat
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../services/api';

const ThreatDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { threatId } = route.params;
  
  const [threat, setThreat] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadThreat();
  }, [threatId]);

  const loadThreat = async () => {
    try {
      const threats = await api.getThreats(100);
      const found = threats.find((t: any) => t.id === threatId);
      setThreat(found);
    } catch (error) {
      console.error('Error loading threat:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `⚠️ ALERTA Mano: He detectado una amenaza de tipo ${threat.threat_types?.join(', ')}. Ten cuidado con mensajes similares.`,
        title: 'Alerta de Mano Protect',
      });
      await api.shareThreat(threatId, 'native');
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleReportFalsePositive = () => {
    Alert.alert(
      'Reportar Falso Positivo',
      '¿Crees que este contenido fue marcado incorrectamente como amenaza?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reportar',
          onPress: async () => {
            try {
              await api.reportFalsePositive(threatId, 'Falso positivo reportado desde app');
              Alert.alert('Gracias', 'Tu reporte nos ayuda a mejorar');
            } catch (error) {
              Alert.alert('Error', 'No se pudo enviar el reporte');
            }
          },
        },
      ]
    );
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#f59e0b';
      default: return '#22c55e';
    }
  };

  const getRiskGradient = (level: string): [string, string] => {
    switch (level) {
      case 'critical': return ['#ef4444', '#dc2626'];
      case 'high': return ['#f97316', '#ea580c'];
      case 'medium': return ['#f59e0b', '#d97706'];
      default: return ['#22c55e', '#16a34a'];
    }
  };

  if (loading || !threat) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle de Amenaza</Text>
        <TouchableOpacity onPress={handleShare}>
          <Icon name="share-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Risk Level Card */}
        <LinearGradient
          colors={getRiskGradient(threat.risk_level)}
          style={styles.riskCard}
        >
          <Icon
            name={threat.is_threat ? 'warning' : 'checkmark-circle'}
            size={50}
            color="#fff"
          />
          <Text style={styles.riskLevel}>
            {threat.risk_level?.toUpperCase() || 'BAJO'}
          </Text>
          <Text style={styles.riskLabel}>Nivel de Riesgo</Text>
        </LinearGradient>

        {/* Threat Types */}
        {threat.threat_types && threat.threat_types.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tipos de Amenaza</Text>
            <View style={styles.tagsContainer}>
              {threat.threat_types.map((type: string, index: number) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{type}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contenido Analizado</Text>
          <View style={styles.contentBox}>
            <View style={styles.contentTypeRow}>
              <Icon
                name={
                  threat.content_type === 'sms' ? 'chatbubble' :
                  threat.content_type === 'email' ? 'mail' :
                  threat.content_type === 'url' ? 'link' :
                  'document-text'
                }
                size={16}
                color="#6b7280"
              />
              <Text style={styles.contentType}>{threat.content_type?.toUpperCase()}</Text>
            </View>
            <Text style={styles.contentText}>{threat.content}</Text>
          </View>
        </View>

        {/* Analysis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Análisis</Text>
          <View style={styles.analysisBox}>
            <Text style={styles.analysisText}>{threat.analysis}</Text>
          </View>
        </View>

        {/* Recommendation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recomendación</Text>
          <View style={styles.recommendationBox}>
            <Icon name="bulb" size={24} color="#f59e0b" />
            <Text style={styles.recommendationText}>{threat.recommendation}</Text>
          </View>
        </View>

        {/* Metadata */}
        <View style={styles.metaSection}>
          <View style={styles.metaItem}>
            <Icon name="time-outline" size={16} color="#6b7280" />
            <Text style={styles.metaText}>
              {new Date(threat.created_at).toLocaleString('es-ES')}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="share-social-outline" size={16} color="#6b7280" />
            <Text style={styles.metaText}>
              Compartido {threat.shared_count || 0} veces
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
          >
            <Icon name="share-social" size={20} color="#fff" />
            <Text style={styles.shareButtonText}>Compartir Alerta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.reportButton}
            onPress={handleReportFalsePositive}
          >
            <Icon name="flag-outline" size={20} color="#6366f1" />
            <Text style={styles.reportButtonText}>Reportar Error</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  riskCard: {
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 24,
  },
  riskLevel: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
  },
  riskLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#6366f120',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#6366f140',
  },
  tagText: {
    color: '#6366f1',
    fontSize: 13,
    fontWeight: '500',
  },
  contentBox: {
    backgroundColor: '#16162a',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2d2d4a',
  },
  contentTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  contentType: {
    color: '#6b7280',
    fontSize: 11,
    fontWeight: '600',
  },
  contentText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 22,
  },
  analysisBox: {
    backgroundColor: '#16162a',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2d2d4a',
  },
  analysisText: {
    color: '#9ca3af',
    fontSize: 14,
    lineHeight: 22,
  },
  recommendationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f59e0b10',
    borderRadius: 14,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#f59e0b30',
  },
  recommendationText: {
    flex: 1,
    color: '#f59e0b',
    fontSize: 14,
    lineHeight: 22,
  },
  metaSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: '#6b7280',
    fontSize: 12,
  },
  actions: {
    gap: 12,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    borderRadius: 14,
    paddingVertical: 16,
    gap: 10,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 14,
    paddingVertical: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  reportButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ThreatDetailScreen;
