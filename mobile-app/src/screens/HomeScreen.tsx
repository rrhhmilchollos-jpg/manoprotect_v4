/**
 * Home Screen
 * Main dashboard with protection status and quick actions
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total_analyzed: 0,
    threats_blocked: 0,
    protection_rate: 100,
  });
  const [recentThreats, setRecentThreats] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, threatsData] = await Promise.all([
        api.getStats(),
        api.getThreats(5),
      ]);
      setStats(statsData);
      setRecentThreats(threatsData.filter((t: any) => t.is_threat));
    } catch (error) {
      console.error('Error loading home data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getPlanBadgeColor = () => {
    switch (user?.plan) {
      case 'premium':
      case 'personal':
        return ['#f59e0b', '#d97706'];
      case 'family':
        return ['#3b82f6', '#2563eb'];
      case 'business':
      case 'enterprise':
        return ['#8b5cf6', '#7c3aed'];
      default:
        return ['#6b7280', '#4b5563'];
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6366f1"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola, {user?.name?.split(' ')[0]} 👋</Text>
            <View style={styles.planBadge}>
              <LinearGradient
                colors={getPlanBadgeColor()}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.planBadgeGradient}
              >
                <Text style={styles.planText}>
                  {user?.plan?.toUpperCase() || 'FREE'}
                </Text>
              </LinearGradient>
            </View>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Icon name="notifications-outline" size={24} color="#fff" />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Protection Status Card */}
        <LinearGradient
          colors={['#6366f1', '#8b5cf6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.protectionCard}
        >
          <View style={styles.protectionHeader}>
            <Icon name="shield-checkmark" size={40} color="#fff" />
            <Text style={styles.protectionTitle}>Protección Activa</Text>
          </View>
          <Text style={styles.protectionRate}>{stats.protection_rate}%</Text>
          <Text style={styles.protectionSubtitle}>Tasa de protección</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.total_analyzed}</Text>
              <Text style={styles.statLabel}>Analizados</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.threats_blocked}</Text>
              <Text style={styles.statLabel}>Bloqueados</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('QRScanner')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#3b82f620' }]}>
              <Icon name="qr-code" size={24} color="#3b82f6" />
            </View>
            <Text style={styles.quickActionText}>Escanear QR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('Threats')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#ef444420' }]}>
              <Icon name="warning" size={24} color="#ef4444" />
            </View>
            <Text style={styles.quickActionText}>Amenazas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('Family')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#22c55e20' }]}>
              <Icon name="people" size={24} color="#22c55e" />
            </View>
            <Text style={styles.quickActionText}>Familia</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#6366f120' }]}>
              <Icon name="settings" size={24} color="#6366f1" />
            </View>
            <Text style={styles.quickActionText}>Ajustes</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Threats */}
        {recentThreats.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Amenazas Recientes</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Threats')}>
                <Text style={styles.seeAllText}>Ver todas</Text>
              </TouchableOpacity>
            </View>
            {recentThreats.map((threat, index) => (
              <TouchableOpacity
                key={index}
                style={styles.threatCard}
                onPress={() => navigation.navigate('ThreatDetail', { threatId: threat.id })}
              >
                <View style={[
                  styles.threatIcon,
                  { backgroundColor: threat.risk_level === 'critical' ? '#ef444420' : '#f59e0b20' }
                ]}>
                  <Icon
                    name="warning"
                    size={20}
                    color={threat.risk_level === 'critical' ? '#ef4444' : '#f59e0b'}
                  />
                </View>
                <View style={styles.threatInfo}>
                  <Text style={styles.threatTitle} numberOfLines={1}>
                    {threat.threat_types?.join(', ') || 'Amenaza detectada'}
                  </Text>
                  <Text style={styles.threatContent} numberOfLines={1}>
                    {threat.content}
                  </Text>
                </View>
                <Icon name="chevron-forward" size={20} color="#6b7280" />
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* SOS Button */}
        <TouchableOpacity
          style={styles.sosButton}
          onPress={() => {
            Alert.alert(
              'Alerta SOS',
              '¿Enviar alerta de emergencia a tus contactos de confianza?',
              [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Enviar SOS', style: 'destructive', onPress: () => {
                  api.sendSOSAlert().then(() => {
                    Alert.alert('SOS Enviado', 'Tus contactos de confianza han sido notificados.');
                  });
                }},
              ]
            );
          }}
        >
          <Icon name="alert-circle" size={24} color="#fff" />
          <Text style={styles.sosButtonText}>Botón SOS de Emergencia</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  planBadge: {
    alignSelf: 'flex-start',
  },
  planBadgeGradient: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  planText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  protectionCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  protectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  protectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 12,
  },
  protectionRate: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  protectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#6366f1',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickActionButton: {
    alignItems: 'center',
    width: '22%',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  threatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16162a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2d2d4a',
  },
  threatIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  threatInfo: {
    flex: 1,
  },
  threatTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  threatContent: {
    fontSize: 12,
    color: '#6b7280',
  },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    borderRadius: 16,
    padding: 18,
    marginTop: 24,
  },
  sosButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default HomeScreen;
