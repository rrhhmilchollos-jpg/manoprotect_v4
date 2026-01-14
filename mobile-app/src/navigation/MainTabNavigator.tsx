/**
 * Main Tab Navigator
 * Bottom tab navigation for authenticated users
 */
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

// Tab Screens
import HomeScreen from '../screens/HomeScreen';
import ThreatsScreen from '../screens/ThreatsScreen';
import FamilyScreen from '../screens/FamilyScreen';
import BankingScreen from '../screens/BankingScreen';
import ProfileScreen from '../screens/ProfileScreen';

import { useNotifications } from '../context/NotificationContext';

export type MainTabParamList = {
  Home: undefined;
  Threats: undefined;
  Family: undefined;
  Banking: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator: React.FC = () => {
  const { unreadCount } = useNotifications();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#6b7280',
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
              break;
            case 'Threats':
              iconName = focused ? 'warning' : 'warning-outline';
              break;
            case 'Family':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Banking':
              iconName = focused ? 'card' : 'card-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return (
            <View>
              <Icon name={iconName} size={size} color={color} />
              {route.name === 'Threats' && unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          );
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ tabBarLabel: 'Inicio' }}
      />
      <Tab.Screen 
        name="Threats" 
        component={ThreatsScreen}
        options={{ tabBarLabel: 'Amenazas' }}
      />
      <Tab.Screen 
        name="Family" 
        component={FamilyScreen}
        options={{ tabBarLabel: 'Familia' }}
      />
      <Tab.Screen 
        name="Banking" 
        component={BankingScreen}
        options={{ tabBarLabel: 'Banca' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Perfil' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#16162a',
    borderTopColor: '#2d2d4a',
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 85 : 65,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    right: -8,
    top: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default MainTabNavigator;
