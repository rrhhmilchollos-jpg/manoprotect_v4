/**
 * Add Family Member Screen
 * Add a new family member to protection plan
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';
import contactsService from '../services/contacts';

const RELATIONSHIPS = [
  { id: 'padre', label: 'Padre', icon: 'man' },
  { id: 'madre', label: 'Madre', icon: 'woman' },
  { id: 'abuelo', label: 'Abuelo', icon: 'man' },
  { id: 'abuela', label: 'Abuela', icon: 'woman' },
  { id: 'hijo', label: 'Hijo/a', icon: 'person' },
  { id: 'hermano', label: 'Hermano/a', icon: 'people' },
  { id: 'pareja', label: 'Pareja', icon: 'heart' },
  { id: 'otro', label: 'Otro', icon: 'person-add' },
];

const AddFamilyMemberScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('');
  const [isSenior, setIsSenior] = useState(false);
  const [simplifiedMode, setSimplifiedMode] = useState(false);
  const [alertLevel, setAlertLevel] = useState<'all' | 'high' | 'critical'>('all');
  const [loading, setLoading] = useState(false);

  const handleImportContact = async () => {
    try {
      const contacts = await contactsService.getAllContacts();
      // Here you would show a contact picker modal
      // For now, we'll just show an alert
      Alert.alert('Contactos', `Se encontraron ${contacts.length} contactos`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudieron cargar los contactos');
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }
    if (!relationship) {
      Alert.alert('Error', 'Selecciona una relación');
      return;
    }

    setLoading(true);
    try {
      await api.addFamilyMember({
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        relationship,
        is_senior: isSenior,
        simplified_mode: simplifiedMode,
        alert_level: alertLevel,
      });
      
      Alert.alert(
        'Miembro Añadido',
        `${name} ha sido añadido a tu plan familiar`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo añadir el miembro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Añadir Miembro</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Import from Contacts */}
          <TouchableOpacity
            style={styles.importButton}
            onPress={handleImportContact}
          >
            <Icon name="person-add" size={20} color="#6366f1" />
            <Text style={styles.importButtonText}>Importar de Contactos</Text>
          </TouchableOpacity>

          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre *</Text>
            <View style={styles.inputContainer}>
              <Icon name="person-outline" size={20} color="#6b7280" />
              <TextInput
                style={styles.input}
                placeholder="Nombre completo"
                placeholderTextColor="#6b7280"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          {/* Phone Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Teléfono</Text>
            <View style={styles.inputContainer}>
              <Icon name="call-outline" size={20} color="#6b7280" />
              <TextInput
                style={styles.input}
                placeholder="+34 600 000 000"
                placeholderTextColor="#6b7280"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <Icon name="mail-outline" size={20} color="#6b7280" />
              <TextInput
                style={styles.input}
                placeholder="email@ejemplo.com"
                placeholderTextColor="#6b7280"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Relationship Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Relación *</Text>
            <View style={styles.relationshipGrid}>
              {RELATIONSHIPS.map((rel) => (
                <TouchableOpacity
                  key={rel.id}
                  style={[
                    styles.relationshipItem,
                    relationship === rel.id && styles.relationshipItemActive,
                  ]}
                  onPress={() => setRelationship(rel.id)}
                >
                  <Icon
                    name={rel.icon as any}
                    size={24}
                    color={relationship === rel.id ? '#6366f1' : '#6b7280'}
                  />
                  <Text
                    style={[
                      styles.relationshipText,
                      relationship === rel.id && styles.relationshipTextActive,
                    ]}
                  >
                    {rel.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Senior Toggle */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Icon name="heart" size={22} color="#f59e0b" />
              <View style={styles.toggleTextContainer}>
                <Text style={styles.toggleLabel}>Persona Mayor</Text>
                <Text style={styles.toggleDescription}>
                  Activa protección especial para mayores
                </Text>
              </View>
            </View>
            <Switch
              value={isSenior}
              onValueChange={(value) => {
                setIsSenior(value);
                if (value) setSimplifiedMode(true);
              }}
              trackColor={{ false: '#3d3d5c', true: '#f59e0b' }}
              thumbColor="#fff"
            />
          </View>

          {/* Simplified Mode Toggle */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Icon name="apps" size={22} color="#3b82f6" />
              <View style={styles.toggleTextContainer}>
                <Text style={styles.toggleLabel}>Modo Simplificado</Text>
                <Text style={styles.toggleDescription}>
                  Interfaz más grande y simple
                </Text>
              </View>
            </View>
            <Switch
              value={simplifiedMode}
              onValueChange={setSimplifiedMode}
              trackColor={{ false: '#3d3d5c', true: '#3b82f6' }}
              thumbColor="#fff"
            />
          </View>

          {/* Alert Level */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nivel de Alertas</Text>
            <View style={styles.alertLevelContainer}>
              {(['all', 'high', 'critical'] as const).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.alertLevelOption,
                    alertLevel === level && styles.alertLevelOptionActive,
                  ]}
                  onPress={() => setAlertLevel(level)}
                >
                  <Text
                    style={[
                      styles.alertLevelText,
                      alertLevel === level && styles.alertLevelTextActive,
                    ]}
                  >
                    {level === 'all' ? 'Todas' : level === 'high' ? 'Altas' : 'Críticas'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <LinearGradient
              colors={['#6366f1', '#8b5cf6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitButtonGradient}
            >
              <Icon name="person-add" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>
                {loading ? 'Añadiendo...' : 'Añadir Miembro'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  keyboardView: {
    flex: 1,
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
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f120',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 24,
    gap: 10,
    borderWidth: 1,
    borderColor: '#6366f140',
  },
  importButtonText: {
    color: '#6366f1',
    fontSize: 15,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16162a',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#2d2d4a',
    gap: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 16,
  },
  relationshipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  relationshipItem: {
    width: '23%',
    aspectRatio: 1,
    backgroundColor: '#16162a',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2d2d4a',
  },
  relationshipItemActive: {
    backgroundColor: '#6366f120',
    borderColor: '#6366f1',
  },
  relationshipText: {
    color: '#6b7280',
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
  },
  relationshipTextActive: {
    color: '#6366f1',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#16162a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2d2d4a',
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  toggleTextContainer: {
    flex: 1,
  },
  toggleLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  toggleDescription: {
    color: '#6b7280',
    fontSize: 12,
  },
  alertLevelContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  alertLevelOption: {
    flex: 1,
    backgroundColor: '#16162a',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2d2d4a',
  },
  alertLevelOptionActive: {
    backgroundColor: '#6366f120',
    borderColor: '#6366f1',
  },
  alertLevelText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  alertLevelTextActive: {
    color: '#6366f1',
  },
  submitButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 24,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddFamilyMemberScreen;
