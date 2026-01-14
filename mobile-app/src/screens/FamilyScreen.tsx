/**
 * Family Screen
 * Family protection dashboard
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
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  is_senior: boolean;
  simplified_mode: boolean;
  threats_blocked: number;
  last_activity?: string;
}

const FamilyScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboard, setDashboard] = useState<any>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);

  const hasFamilyPlan = user?.plan?.includes('family') || user?.plan === 'enterprise';

  useEffect(() => {
    if (hasFamilyPlan) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [hasFamilyPlan]);

  const loadData = async () => {
    try {
      const data = await api.getFamilyDashboard();
      setDashboard(data);
      setMembers(data.members || []);
    } catch (error) {
      console.error('Error loading family data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleDeleteMember = (memberId: string, memberName: string) => {
    Alert.alert(
      'Eliminar miembro',
      `¿Seguro que quieres eliminar a ${memberName} de tu plan familiar?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteFamilyMember(memberId);
              loadData();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el miembro');
            }
          },
        },
      ]
    );
  };

  if (!hasFamilyPlan) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.upgradeContainer}>
          <LinearGradient
            colors={['#6366f1', '#8b5cf6']}
            style={styles.upgradeIcon}
          >
            <Icon name="people" size={60} color="#fff" />
          </LinearGradient>
          <Text style={styles.upgradeTitle}>Plan Familiar</Text>
          <Text style={styles.upgradeText}>
            Protege hasta 5 miembros de tu familia con el plan familiar.
            Incluye modo simplificado para personas mayores.
          </Text>
          <TouchableOpacity style={styles.upgradeButton}>
            <LinearGradient
              colors={['#6366f1', '#8b5cf6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.upgradeButtonGradient}
            >
              <Text style={styles.upgradeButtonText}>Actualizar a Familiar</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.title}>Familia</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddFamilyMember')}
          >
            <Icon name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Icon name="people" size={24} color="#6366f1" />
            <Text style={styles.statValue}>{dashboard?.stats?.total_members || 0}</Text>
            <Text style={styles.statLabel}>Miembros</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="heart" size={24} color="#ef4444" />
            <Text style={styles.statValue}>{dashboard?.stats?.senior_members || 0}</Text>
            <Text style={styles.statLabel}>Mayores</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="shield-checkmark" size={24} color="#22c55e" />
            <Text style={styles.statValue}>{dashboard?.stats?.total_threats_blocked || 0}</Text>
            <Text style={styles.statLabel}>Bloqueadas</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="notifications" size={24} color="#f59e0b" />
            <Text style={styles.statValue}>{dashboard?.stats?.unread_alerts || 0}</Text>
            <Text style={styles.statLabel}>Alertas</Text>
          </View>
        </View>

        {/* Members List */}
        <Text style={styles.sectionTitle}>Miembros Protegidos</Text>
        {members.length === 0 ? (
          <View style={styles.emptyMembers}>
            <Icon name="people-outline" size={40} color="#6b7280" />
            <Text style={styles.emptyText}>No hay miembros todavía</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('AddFamilyMember')}
            >
              <Text style={styles.emptyButtonText}>Añadir primer miembro</Text>
            </TouchableOpacity>
          </View>
        ) : (
          members.map((member) => (
            <TouchableOpacity
              key={member.id}
              style={styles.memberCard}
              onPress={() => navigation.navigate('FamilyMember', { memberId: member.id })}
            >
              <View style={styles.memberAvatar}>
                <Text style={styles.memberAvatarText}>
                  {member.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <View style={styles.memberTags}>
                  <Text style={styles.memberRelation}>{member.relationship}</Text>
                  {member.is_senior && (
                    <View style={styles.seniorBadge}>
                      <Text style={styles.seniorBadgeText}>Mayor</Text>
                    </View>
                  )}
                  {member.simplified_mode && (
                    <View style={styles.simpleBadge}>
                      <Text style={styles.simpleBadgeText}>Modo Simple</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.memberStats}>
                <Text style={styles.memberBlockedCount}>{member.threats_blocked || 0}</Text>
                <Text style={styles.memberBlockedLabel}>bloqueadas</Text>
              </View>
              <TouchableOpacity
                style={styles.memberDelete}
                onPress={() => handleDeleteMember(member.id, member.name)}
              >
                <Icon name="trash-outline" size={18} color="#ef4444" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}

        {/* Alerts Section */}
        {dashboard?.alerts && dashboard.alerts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Alertas Recientes</Text>
            {dashboard.alerts.slice(0, 5).map((alert: any, index: number) => (
              <View key={index} style={styles.alertCard}>
                <Icon
                  name={alert.type === 'threat' ? 'warning' : 'information-circle'}
                  size={20}
                  color={alert.type === 'threat' ? '#ef4444' : '#3b82f6'}
                />
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>{alert.member_name}</Text>
                  <Text style={styles.alertMessage}>{alert.message}</Text>
                </View>
              </View>
            ))}
          </>
        )}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#6366f1',
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#16162a',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2d2d4a',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16162a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2d2d4a',
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  memberTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberRelation: {
    fontSize: 12,
    color: '#6b7280',
  },
  seniorBadge: {
    backgroundColor: '#f59e0b20',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  seniorBadgeText: {
    fontSize: 10,
    color: '#f59e0b',
    fontWeight: '600',
  },
  simpleBadge: {
    backgroundColor: '#3b82f620',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  simpleBadgeText: {
    fontSize: 10,
    color: '#3b82f6',
    fontWeight: '600',
  },
  memberStats: {
    alignItems: 'center',
    marginRight: 12,
  },
  memberBlockedCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  memberBlockedLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  memberDelete: {
    padding: 8,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#16162a',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  alertContent: {
    flex: 1,
    marginLeft: 12,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  alertMessage: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyMembers: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#16162a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2d2d4a',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 12,
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  upgradeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  upgradeIcon: {
    width: 120,
    height: 120,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  upgradeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  upgradeText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  upgradeButton: {
    borderRadius: 14,
    overflow: 'hidden',
    width: '100%',
  },
  upgradeButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FamilyScreen;
