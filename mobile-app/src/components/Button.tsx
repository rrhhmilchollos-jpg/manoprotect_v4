/**
 * Button Component
 * Reusable button with gradient and loading states
 */
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const getGradientColors = (): [string, string] => {
    switch (variant) {
      case 'danger':
        return ['#ef4444', '#dc2626'];
      case 'secondary':
        return ['#6b7280', '#4b5563'];
      default:
        return ['#6366f1', '#8b5cf6'];
    }
  };

  const getSize = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 10, paddingHorizontal: 16 };
      case 'large':
        return { paddingVertical: 18, paddingHorizontal: 32 };
      default:
        return { paddingVertical: 14, paddingHorizontal: 24 };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'large':
        return 18;
      default:
        return 16;
    }
  };

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        style={[
          styles.outlineButton,
          getSize(),
          disabled && styles.disabled,
          style,
        ]}
        onPress={onPress}
        disabled={disabled || loading}
      >
        {loading ? (
          <ActivityIndicator color="#6366f1" />
        ) : (
          <>
            {icon && (
              <Icon name={icon} size={getTextSize()} color="#6366f1" style={styles.icon} />
            )}
            <Text style={[styles.outlineText, { fontSize: getTextSize() }, textStyle]}>
              {title}
            </Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, getSize()]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            {icon && (
              <Icon name={icon} size={getTextSize()} color="#fff" style={styles.icon} />
            )}
            <Text style={[styles.text, { fontSize: getTextSize() }, textStyle]}>
              {title}
            </Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: '600',
  },
  icon: {
    marginRight: 8,
  },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  outlineText: {
    color: '#6366f1',
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Button;
