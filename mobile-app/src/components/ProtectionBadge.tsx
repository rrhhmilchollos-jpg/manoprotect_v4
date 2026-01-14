/**
 * Protection Badge Component
 * Shows protection status
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface ProtectionBadgeProps {
  level: 'active' | 'warning' | 'danger';
  size?: 'small' | 'medium' | 'large';
}

const ProtectionBadge: React.FC<ProtectionBadgeProps> = ({ level, size = 'medium' }) => {
  const getConfig = () => {
    switch (level) {
      case 'danger':
        return { color: '#ef4444', icon: 'shield-outline', text: 'En riesgo' };
      case 'warning':
        return { color: '#f59e0b', icon: 'shield-half', text: 'Alerta' };
      default:
        return { color: '#22c55e', icon: 'shield-checkmark', text: 'Protegido' };
    }
  };

  const getSize = () => {
    switch (size) {
      case 'small':
        return { iconSize: 14, fontSize: 11, padding: 4 };
      case 'large':
        return { iconSize: 20, fontSize: 14, padding: 10 };
      default:
        return { iconSize: 16, fontSize: 12, padding: 6 };
    }
  };

  const config = getConfig();
  const sizeConfig = getSize();

  return (
    <View style={[
      styles.container,
      { backgroundColor: config.color + '20', paddingVertical: sizeConfig.padding, paddingHorizontal: sizeConfig.padding * 2 }
    ]}>
      <Icon name={config.icon as any} size={sizeConfig.iconSize} color={config.color} />
      <Text style={[styles.text, { color: config.color, fontSize: sizeConfig.fontSize }]}>
        {config.text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    gap: 4,
  },
  text: {
    fontWeight: '600',
  },
});

export default ProtectionBadge;
