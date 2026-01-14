/**
 * Network Alert Component
 * Shows when device is offline
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface NetworkAlertProps {
  isVisible: boolean;
}

const NetworkAlert: React.FC<NetworkAlertProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <Icon name="cloud-offline" size={16} color="#fff" />
      <Text style={styles.text}>Sin conexión a internet</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  text: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
});

export default NetworkAlert;
