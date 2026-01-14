/**
 * Card Component
 * Reusable card container
 */
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: 'none' | 'small' | 'medium' | 'large';
}

const Card: React.FC<CardProps> = ({ children, style, padding = 'medium' }) => {
  const getPadding = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'small':
        return 12;
      case 'large':
        return 24;
      default:
        return 16;
    }
  };

  return (
    <View style={[styles.card, { padding: getPadding() }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#16162a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2d2d4a',
  },
});

export default Card;
