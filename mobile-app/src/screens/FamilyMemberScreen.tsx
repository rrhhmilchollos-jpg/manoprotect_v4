/**
 * Family Member Screen
 * View and manage individual family member
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../services/api';

const FamilyMemberScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { memberId } = route.params;
  
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState<any[]>([]);

  useEffect(() => {
    loadMember();
  }, [memberId]);

  const loadMember = async () => {
    try {
      const dashboard = await api.getFamilyDashboard();
      const found = dashboard.members?.find((m: any) => m.id === memberId);
      setMember(found);
      // Load activity/alerts for this member
      setActivity(dashboard.alerts?.filter((a: any) => a.member_id === memberId) || []);
    } catch (error) {
      console.error('Error loading member:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSetting = async (key: string, value: any) => {
    try {
      await api.updateFamilyMember(memberId, { [key]: value });
      setMember((prev: any) => ({ ...prev, [key]: value }));
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Miembro',
      `¿Seguro que quieres eliminar a ${member?.name} de tu plan familiar?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteFamilyMember(memberId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar');
            }
          },
        },
      ]
    );
  };

  if (loading || !member) {
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
        <Text style={styles.headerTitle}>Miembro Familiar</Text>
        <TouchableOpacity onPress={handleDelete}>
          <Icon name="trash-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <LinearGradient
            colors={['#6366f1', '#8b5cf6']}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>
              {member.name?.charAt(0).toUpperCase()}
            </Text>
          </LinearGradient>
          <Text style={styles.memberName}>{member.name}</Text>
          <Text style={styles.memberRelation}>{member.relationship}</Text>
          
          <View style={styles.badges}>
            {member.is_senior && (
              <View style={styles.seniorBadge}>
                <Icon name="heart" size={14} color="#f59e0b" />
                <Text style={styles.badgeText}>Mayor</Text>
              </View>
            )}
            {member.simplified_mode && (
              <View style={styles.simpleBadge}>
                <Icon name="apps" size={14} color="#3b82f6" />
                <Text style={styles.badgeTextBlue}>Modo Simple</Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{member.threats_blocked || 0}</Text>
            <Text style={styles.statLabel}>Bloqueadas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{activity.length}</Text>
            <Text style={styles.statLabel}>Alertas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#22c55e' }]}>100%</Text>
            <Text style={styles.statLabel}>Protección</Text>
          </View>
        </View>

        {/* Settings */}
        <Text style={styles.sectionTitle}>Configuración</Text>
        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Icon name="heart" size={20} color="#f59e0b" />
              <Text style={styles.settingLabel}>Persona Mayor</Text>
            </View>
            <Switch
              value={member.is_senior}
              onValueChange={(value) => handleUpdateSetting('is_senior', value)}
              trackColor={{ false: '#3d3d5c', true: '#f59e0b' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingDivider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Icon name="apps" size={20} color="#3b82f6" />
              <Text style={styles.settingLabel}>Modo Simplificado</Text>
            </View>
            <Switch
              value={member.simplified_mode}
              onValueChange={(value) => handleUpdateSetting('simplified_mode', value)}
              trackColor={{ false: '#3d3d5c', true: '#3b82f6' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Actividad Reciente</Text>
        {activity.length === 0 ? (
          <View style={styles.emptyActivity}>
            <Icon name="checkmark-circle" size={40} color="#22c55e" />
            <Text style={styles.emptyText}>Sin alertas recientes</Text>
          </View>
        ) : (
          activity.map((item, index) => (
            <View key={index} style={styles.activityCard}>
              <Icon
                name={item.type === 'threat' ? 'warning' : 'information-circle'}
                size={20}
                color={item.type === 'threat' ? '#ef4444' : '#3b82f6'}
              />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{item.title || 'Alerta'}</Text>
                <Text style={styles.activityMessage}>{item.message}</Text>
                <Text style={styles.activityTime}>
                  {new Date(item.timestamp).toLocaleString('es-ES')}
                </Text>
              </View>
            </View>
          ))
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
  profileCard: {
    backgroundColor: '#16162a',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2d2d4a',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  memberName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  memberRelation: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  badges: {
    flexDirection: 'row',
    gap: 10,
  },
  seniorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f59e0b20',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  simpleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f620',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  badgeText: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: '600',
  },
  badgeTextBlue: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#16162a',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2d2d4a',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  settingsCard: {
    backgroundColor: '#16162a',
    borderRadius: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2d2d4a',
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    color: '#fff',
    fontSize: 15,
  },
  settingDivider: {
    height: 1,
    backgroundColor: '#2d2d4a',
    marginHorizontal: 16,
  },
  emptyActivity: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#16162a',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2d2d4a',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 12,
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: '#16162a',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: '#2d2d4a',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  activityMessage: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 6,
  },
  activityTime: {
    fontSize: 11,
    color: '#6b7280',
  },
});

export default FamilyMemberScreen;
