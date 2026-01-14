/**
 * Root Navigator
 * Main navigation structure for the app
 */
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Main App Navigator
import MainTabNavigator from './MainTabNavigator';

// Other Screens
import QRScannerScreen from '../screens/QRScannerScreen';
import ThreatDetailScreen from '../screens/ThreatDetailScreen';
import FamilyMemberScreen from '../screens/FamilyMemberScreen';
import AddFamilyMemberScreen from '../screens/AddFamilyMemberScreen';
import ContactsPickerScreen from '../screens/ContactsPickerScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

export type RootStackParamList = {
  // Auth
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  // Main
  MainTabs: undefined;
  // Other
  QRScanner: undefined;
  ThreatDetail: { threatId: string };
  FamilyMember: { memberId: string };
  AddFamilyMember: undefined;
  ContactsPicker: { onSelect: (contact: any) => void };
  Settings: undefined;
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#1a1a2e' },
      }}
    >
      {!isAuthenticated ? (
        // Auth Stack
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      ) : (
        // Main App Stack
        <>
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen 
            name="QRScanner" 
            component={QRScannerScreen}
            options={{ animation: 'slide_from_bottom' }}
          />
          <Stack.Screen name="ThreatDetail" component={ThreatDetailScreen} />
          <Stack.Screen name="FamilyMember" component={FamilyMemberScreen} />
          <Stack.Screen 
            name="AddFamilyMember" 
            component={AddFamilyMemberScreen}
            options={{ animation: 'slide_from_bottom' }}
          />
          <Stack.Screen 
            name="ContactsPicker" 
            component={ContactsPickerScreen}
            options={{ animation: 'slide_from_bottom' }}
          />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
