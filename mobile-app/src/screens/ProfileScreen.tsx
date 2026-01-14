/**
 * Profile Screen
 * User profile and settings
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import biometricService from '../services/biometrics';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, logout, biometricAvailable, biometricEnabled, disableBiometric } = useAuth();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoBlockEnabled, setAutoBlockEnabled] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleToggleBiometric = async () => {
    if (biometricEnabled) {
      Alert.alert(
        'Desactivar Biometría',
        '¿Deseas desactivar el acceso biométrico?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Desactivar', onPress: disableBiometric },
        ]
      );
    } else {
      navigation.navigate('Settings', { enableBiometric: true });
    }
  };

  const getPlanDetails = () => {
    switch (user?.plan) {
      case 'personal':
        return { name: 'Personal', color: ['#22c55e', '#16a34a'], price: '9.99€/mes' };
      case 'family':
        return { name: 'Familiar', color: ['#3b82f6', '#2563eb'], price: '19.99€/mes' };
      case 'business':
        return { name: 'Business', color: ['#f59e0b', '#d97706'], price: '49.99€/mes' };
      case 'enterprise':
        return { name: 'Enterprise', color: ['#8b5cf6', '#7c3aed'], price: '199.99€/mes' };
      default:
        return { name: 'Free', color: ['#6b7280', '#4b5563'], price: 'Gratis' };
    }
  };

  const planDetails = getPlanDetails();

  const menuItems = [
    {
      icon: 'person-outline',
      label: 'Editar Perfil',
      onPress: () => navigation.navigate('Settings'),
    },
    {
      icon: 'shield-checkmark-outline',
      label: 'Seguridad',
      onPress: () => navigation.navigate('Settings'),
    },
    {
      icon: 'notifications-outline',
      label: 'Notificaciones',
      onPress: () => navigation.navigate('Settings'),
    },
    {
      icon: 'people-outline',
      label: 'Contactos de Confianza',
      onPress: () => navigation.navigate('ContactsPicker'),
    },
    {
      icon: 'help-circle-outline',
      label: 'Ayuda y Soporte',
      onPress: () => {},
    },
    {
      icon: 'document-text-outline',
      label: 'Términos y Privacidad',
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Perfil</Text>
        </View>

        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            {user?.picture ? (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user.name?.charAt(0).toUpperCase()}
                </Text>
              </View>
            ) : (
              <LinearGradient
                colors={['#6366f1', '#8b5cf6']}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
            )}
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          
          {/* Plan Badge */}
          <LinearGradient
            colors={planDetails.color}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.planBadge}
          >
            <Icon name="star" size={14} color="#fff" />
            <Text style={styles.planBadgeText}>{planDetails.name}</Text>
          </LinearGradient>
          <Text style={styles.planPrice}>{planDetails.price}</Text>
        </View>

        {/* Quick Settings */}
        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Icon name="notifications" size={22} color="#6366f1" />
              <Text style={styles.settingLabel}>Notificaciones</Text>
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
            <View style={styles.settingLeft}>
              <Icon name="shield" size={22} color="#22c55e" />
              <Text style={styles.settingLabel}>Bloqueo Automático</Text>
            </View>
            <Switch
              value={autoBlockEnabled}
              onValueChange={setAutoBlockEnabled}
              trackColor={{ false: '#3d3d5c', true: '#22c55e' }}
              thumbColor="#fff"
            />
          </View>
          
          {biometricAvailable && (
            <>
              <View style={styles.settingDivider} />
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Icon name="finger-print" size={22} color="#f59e0b" />
                  <Text style={styles.settingLabel}>Acceso Biométrico</Text>
                </View>
                <Switch
                  value={biometricEnabled}
                  onValueChange={handleToggleBiometric}
                  trackColor={{ false: '#3d3d5c', true: '#f59e0b' }}
                  thumbColor="#fff"
                />
              </View>
            </>
          )}
        </View>

        {/* Menu Items */}
        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity style={styles.menuItem} onPress={item.onPress}>
                <Icon name={item.icon as any} size={22} color="#9ca3af" />
                <Text style={styles.menuItemText}>{item.label}</Text>
                <Icon name="chevron-forward" size={20} color="#6b7280" />
              </TouchableOpacity>
              {index < menuItems.length - 1 && <View style={styles.menuDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Upgrade Button (if free) */}
        {user?.plan === 'free' && (
          <TouchableOpacity style={styles.upgradeButton}>
            <LinearGradient
              colors={['#6366f1', '#8b5cf6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.upgradeButtonGradient}
            >
              <Icon name="rocket" size={20} color="#fff" />
              <Text style={styles.upgradeButtonText}>Actualizar a Premium</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="log-out-outline" size={22} color="#ef4444" />
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>MANO v1.0.0</Text>
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
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  userCard: {
    backgroundColor: '#16162a',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2d2d4a',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
  },
  planBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  planPrice: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
  },
  settingsCard: {
    backgroundColor: '#16162a',
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2d2d4a',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 15,
    color: '#fff',
  },
  settingDivider: {
    height: 1,
    backgroundColor: '#2d2d4a',
    marginHorizontal: 16,
  },
  menuCard: {
    backgroundColor: '#16162a',
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2d2d4a',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  menuItemText: {
    flex: 1,
    fontSize: 15,
    color: '#fff',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#2d2d4a',
    marginHorizontal: 16,
  },
  upgradeButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
  },
  upgradeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef444420',
    borderRadius: 14,
    paddingVertical: 16,
    gap: 10,
    marginBottom: 24,
  },
  logoutButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    color: '#4b5563',
    fontSize: 12,
  },
});

export default ProfileScreen;
