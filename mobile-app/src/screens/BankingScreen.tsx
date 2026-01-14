/**
 * Banking Screen
 * Bank accounts and transaction monitoring
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import api from '../services/api';

const BankingScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [supportedBanks, setSupportedBanks] = useState<string[]>([]);
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [accountsData, summaryData, transData, banksData] = await Promise.all([
        api.getBankAccounts(),
        api.getBankingSummary(),
        api.getTransactions(undefined, 30, false),
        api.getSupportedBanks(),
      ]);
      setAccounts(accountsData.accounts || []);
      setSummary(summaryData);
      setTransactions(transData.transactions || []);
      setSupportedBanks(banksData.banks || []);
    } catch (error) {
      console.error('Error loading banking data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleConnectBank = async (bankName: string) => {
    setConnecting(true);
    try {
      await api.connectBank(bankName);
      setShowBankPicker(false);
      loadData();
    } catch (error) {
      console.error('Error connecting bank:', error);
    } finally {
      setConnecting(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      default:
        return '#22c55e';
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6366f1"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Banca Segura</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowBankPicker(true)}
          >
            <Icon name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Summary Card */}
        {summary && (
          <LinearGradient
            colors={['#16162a', '#1e1e3a']}
            style={styles.summaryCard}
          >
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Cuentas</Text>
                <Text style={styles.summaryValue}>{summary.total_accounts || 0}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Transacciones</Text>
                <Text style={styles.summaryValue}>{summary.total_transactions || 0}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Sospechosas</Text>
                <Text style={[styles.summaryValue, { color: '#ef4444' }]}>
                  {summary.suspicious_transactions || 0}
                </Text>
              </View>
            </View>
          </LinearGradient>
        )}

        {/* Connected Accounts */}
        <Text style={styles.sectionTitle}>Cuentas Conectadas</Text>
        {accounts.length === 0 ? (
          <View style={styles.emptyAccounts}>
            <Icon name="card-outline" size={40} color="#6b7280" />
            <Text style={styles.emptyText}>No hay cuentas conectadas</Text>
            <TouchableOpacity
              style={styles.connectButton}
              onPress={() => setShowBankPicker(true)}
            >
              <Text style={styles.connectButtonText}>Conectar banco</Text>
            </TouchableOpacity>
          </View>
        ) : (
          accounts.map((account, index) => (
            <View key={index} style={styles.accountCard}>
              <View style={styles.accountIcon}>
                <Icon name="business" size={24} color="#6366f1" />
              </View>
              <View style={styles.accountInfo}>
                <Text style={styles.accountBank}>{account.bank_name}</Text>
                <Text style={styles.accountNumber}>****{account.account_number_mask}</Text>
              </View>
              <View style={[
                styles.accountStatus,
                { backgroundColor: account.status === 'active' ? '#22c55e20' : '#f59e0b20' }
              ]}>
                <Text style={[
                  styles.accountStatusText,
                  { color: account.status === 'active' ? '#22c55e' : '#f59e0b' }
                ]}>
                  {account.status === 'active' ? 'Activa' : 'Pendiente'}
                </Text>
              </View>
            </View>
          ))
        )}

        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Transacciones Recientes</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Ver todas</Text>
              </TouchableOpacity>
            </View>
            {transactions.slice(0, 10).map((tx, index) => (
              <View key={index} style={styles.transactionCard}>
                <View style={[
                  styles.transactionIcon,
                  { backgroundColor: getRiskColor(tx.risk_level) + '20' }
                ]}>
                  <Icon
                    name={tx.risk_level === 'low' ? 'checkmark' : 'warning'}
                    size={18}
                    color={getRiskColor(tx.risk_level)}
                  />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionDesc} numberOfLines={1}>
                    {tx.description || 'Transacción'}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {new Date(tx.timestamp).toLocaleDateString('es-ES')}
                  </Text>
                </View>
                <Text style={[
                  styles.transactionAmount,
                  { color: tx.amount < 0 ? '#ef4444' : '#22c55e' }
                ]}>
                  {formatAmount(tx.amount)}
                </Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Bank Picker Modal */}
      <Modal
        visible={showBankPicker}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecciona tu banco</Text>
              <TouchableOpacity onPress={() => setShowBankPicker(false)}>
                <Icon name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={supportedBanks}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.bankItem}
                  onPress={() => handleConnectBank(item)}
                  disabled={connecting}
                >
                  <Icon name="business" size={20} color="#6366f1" />
                  <Text style={styles.bankItemText}>{item}</Text>
                  <Icon name="chevron-forward" size={20} color="#6b7280" />
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.bankList}
            />
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#6366f1',
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2d2d4a',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#6366f1',
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16162a',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2d2d4a',
  },
  accountIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#6366f120',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountBank: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  accountNumber: {
    fontSize: 12,
    color: '#6b7280',
  },
  accountStatus: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  accountStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16162a',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2d2d4a',
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDesc: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 11,
    color: '#6b7280',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyAccounts: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#16162a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2d2d4a',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 12,
    marginBottom: 16,
  },
  connectButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d4a',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  bankList: {
    padding: 10,
  },
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#16162a',
    borderRadius: 12,
    marginBottom: 8,
  },
  bankItemText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    marginLeft: 12,
  },
});

export default BankingScreen;
