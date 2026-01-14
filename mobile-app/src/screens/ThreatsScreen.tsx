/**
 * Threats Screen
 * List and manage detected threats
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';

interface Threat {
  id: string;
  content: string;
  content_type: string;
  risk_level: string;
  is_threat: boolean;
  threat_types: string[];
  recommendation: string;
  created_at: string;
}

const ThreatsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'threats' | 'safe'>('all');

  useEffect(() => {
    loadThreats();
  }, []);

  const loadThreats = async () => {
    try {
      const data = await api.getThreats(50);
      setThreats(data);
    } catch (error) {
      console.error('Error loading threats:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadThreats();
    setRefreshing(false);
  };

  const filteredThreats = threats.filter(threat => {
    const matchesSearch = threat.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      threat.threat_types?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (filter === 'threats') return matchesSearch && threat.is_threat;
    if (filter === 'safe') return matchesSearch && !threat.is_threat;
    return matchesSearch;
  });

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return '#ef4444';
      case 'high':
        return '#f97316';
      case 'medium':
        return '#f59e0b';
      default:
        return '#22c55e';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Hace un momento';
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days}d`;
    return date.toLocaleDateString('es-ES');
  };

  const renderThreat = ({ item }: { item: Threat }) => (
    <TouchableOpacity
      style={styles.threatCard}
      onPress={() => navigation.navigate('ThreatDetail', { threatId: item.id })}
    >
      <View style={styles.threatHeader}>
        <View style={[
          styles.riskBadge,
          { backgroundColor: getRiskLevelColor(item.risk_level) + '20' }
        ]}>
          <Icon
            name={item.is_threat ? 'warning' : 'checkmark-circle'}
            size={16}
            color={getRiskLevelColor(item.risk_level)}
          />
          <Text style={[styles.riskText, { color: getRiskLevelColor(item.risk_level) }]}>
            {item.risk_level?.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.threatDate}>{formatDate(item.created_at)}</Text>
      </View>

      <Text style={styles.threatContent} numberOfLines={2}>
        {item.content}
      </Text>

      {item.threat_types && item.threat_types.length > 0 && (
        <View style={styles.threatTypes}>
          {item.threat_types.slice(0, 3).map((type, index) => (
            <View key={index} style={styles.typeTag}>
              <Text style={styles.typeTagText}>{type}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.threatFooter}>
        <Text style={styles.contentType}>
          <Icon name={
            item.content_type === 'sms' ? 'chatbubble' :
            item.content_type === 'email' ? 'mail' :
            item.content_type === 'url' ? 'link' :
            item.content_type === 'call' ? 'call' :
            'document-text'
          } size={12} color="#6b7280" />
          {' '}{item.content_type?.toUpperCase()}
        </Text>
        <Icon name="chevron-forward" size={16} color="#6b7280" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Amenazas</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Icon name="filter" size={20} color="#6366f1" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#6b7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar amenazas..."
          placeholderTextColor="#6b7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={20} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {(['all', 'threats', 'safe'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
              {f === 'all' ? 'Todos' : f === 'threats' ? 'Amenazas' : 'Seguros'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats */}
      <View style={styles.statsBar}>
        <View style={styles.statChip}>
          <Icon name="shield" size={14} color="#6366f1" />
          <Text style={styles.statChipText}>{threats.length} análisis</Text>
        </View>
        <View style={styles.statChip}>
          <Icon name="warning" size={14} color="#ef4444" />
          <Text style={styles.statChipText}>
            {threats.filter(t => t.is_threat).length} amenazas
          </Text>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filteredThreats}
        renderItem={renderThreat}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6366f1"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="shield-checkmark" size={60} color="#6366f1" />
            <Text style={styles.emptyTitle}>No hay amenazas</Text>
            <Text style={styles.emptyText}>
              Cuando analices contenido sospechoso, aparecerá aquí
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  filterButton: {
    padding: 8,
    backgroundColor: '#16162a',
    borderRadius: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16162a',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 14,
    marginLeft: 12,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#16162a',
  },
  filterTabActive: {
    backgroundColor: '#6366f1',
  },
  filterTabText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#fff',
  },
  statsBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16162a',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  statChipText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  threatCard: {
    backgroundColor: '#16162a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2d2d4a',
  },
  threatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    gap: 4,
  },
  riskText: {
    fontSize: 11,
    fontWeight: '600',
  },
  threatDate: {
    color: '#6b7280',
    fontSize: 12,
  },
  threatContent: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  threatTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  typeTag: {
    backgroundColor: '#2d2d4a',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  typeTagText: {
    color: '#9ca3af',
    fontSize: 11,
  },
  threatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contentType: {
    color: '#6b7280',
    fontSize: 11,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default ThreatsScreen;
