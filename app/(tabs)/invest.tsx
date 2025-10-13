import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Zap,
  X,
} from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Tables } from '@/lib/database.types';

type Investment = Tables<'investments'>;

const { width } = Dimensions.get('window');

export default function InvestScreen() {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const portfolioValue = investments.reduce((sum, inv) => sum + inv.current_value * inv.quantity, 0);

  const fetchInvestments = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setInvestments(data || []);
    } catch (error) {
      Alert.alert('Error', 'Could not fetch your investments.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    fetchInvestments();
  }, [fetchInvestments]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchInvestments();
  }, [fetchInvestments]);

  return (
    <View style={{ flex: 1, backgroundColor: '#0F172A' }}>
      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} size="large" color="#8B5CF6" />
      ) : (
        <ScrollView
          style={styles.container}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B5CF6" />}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Invest & Grow</Text>
            <TouchableOpacity style={styles.analyticsButton} onPress={() => setShowModal(true)}>
              <Zap color="#8B5CF6" size={24} />
            </TouchableOpacity>
          </View>

          {/* Portfolio Overview */}
          <LinearGradient
            colors={['#1E293B', '#374151']}
            style={styles.portfolioCard}
          >
            <View style={styles.portfolioHeader}>
              <Text style={styles.portfolioLabel}>Portfolio Value</Text>
            </View>
            <Text style={styles.portfolioValue}>
              ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <Text style={styles.portfolioChange}>
              +${(portfolioValue * 0.0152).toFixed(2)} today (+1.52%)
            </Text>
          </LinearGradient>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Invest</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.quickAction}>
                <View style={[styles.quickActionIcon, { backgroundColor: '#10B981' }]}>
                  <Zap color="#ffffff" size={24} />
                </View>
                <Text style={styles.quickActionText}>Auto Invest</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickAction}>
                <View style={[styles.quickActionIcon, { backgroundColor: '#3B82F6' }]}>
                  <PieChart color="#ffffff" size={24} />
                </View>
                <Text style={styles.quickActionText}>Balanced</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickAction}>
                <View style={[styles.quickActionIcon, { backgroundColor: '#8B5CF6' }]}>
                  <TrendingUp color="#ffffff" size={24} />
                </View>
                <Text style={styles.quickActionText}>Aggressive</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Holdings */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Holdings</Text>
            </View>
            <View style={styles.holdingsList}>
              {investments.length > 0 ? (
                investments.map((investment) => (
                  <InvestmentCard key={investment.id} investment={investment} />
                ))
              ) : (
                <Text style={styles.emptyText}>No investments yet. Tap the ✨ button to add one.</Text>
              )}
            </View>
          </View>

          {/* Learning Section */}
          <View style={styles.learningSection}>
            <Text style={styles.learnTitle}>📚 Learn as You Grow</Text>
            <Text style={styles.learnDescription}>
              Check out our bite-sized lessons on investing basics
            </Text>
            <TouchableOpacity style={styles.learnButton}>
              <Text style={styles.learnButtonText}>Start Learning</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
      <CreateInvestmentModal visible={showModal} onClose={() => setShowModal(false)} onCreated={fetchInvestments} />
    </View>
  );
}

function InvestmentCard({ investment }: { investment: Investment }) {
  const totalValue = investment.current_value * investment.quantity;
  const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6'];
  const color = colors[investment.symbol.length % colors.length];

  return (
    <View style={styles.investmentCard}>
      <View style={styles.investmentHeader}>
        <View>
          <Text style={styles.investmentName}>{investment.name}</Text>
          <Text style={styles.investmentSymbol}>{investment.symbol}</Text>
        </View>
        <View style={styles.investmentValues}>
          <Text style={styles.investmentValue}>
            ${totalValue.toLocaleString()}
          </Text>
          <Text style={styles.investmentSubValue}>
            {investment.quantity} @ ${investment.current_value.toFixed(2)}
          </Text>
        </View>
      </View>
      <View style={styles.investmentBar}>
        <View
          style={[
            styles.investmentBarFill,
            { backgroundColor: color, width: `${Math.random() * 40 + 60}%` } // Visual variety
          ]}
        />
      </View>
    </View>
  );
}

function CreateInvestmentModal({ visible, onClose, onCreated }: { visible: boolean, onClose: () => void, onCreated: () => void }) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [currentValue, setCurrentValue] = useState('');

  const handleCreate = async () => {
    if (!name || !symbol || !quantity || !currentValue || !user) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }
    const { error } = await supabase.from('investments').insert({
      name,
      symbol: symbol.toUpperCase(),
      quantity: parseFloat(quantity),
      current_value: parseFloat(currentValue),
      user_id: user.id
    });
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Investment added!');
      onCreated();
      onClose();
      setName(''); setSymbol(''); setQuantity(''); setCurrentValue('');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={modalStyles.modalOverlay}>
        <View style={modalStyles.modalContent}>
          <View style={modalStyles.modalHeader}>
            <Text style={modalStyles.modalTitle}>Add Investment</Text>
            <TouchableOpacity onPress={onClose}><X color="#9CA3AF" size={24} /></TouchableOpacity>
          </View>
          <TextInput style={modalStyles.input} placeholder="Name (e.g., Apple Inc.)" placeholderTextColor="#9CA3AF" value={name} onChangeText={setName} />
          <TextInput style={modalStyles.input} placeholder="Symbol (e.g., AAPL)" placeholderTextColor="#9CA3AF" value={symbol} onChangeText={setSymbol} autoCapitalize="characters" />
          <TextInput style={modalStyles.input} placeholder="Quantity (e.g., 10.5)" placeholderTextColor="#9CA3AF" value={quantity} onChangeText={setQuantity} keyboardType="numeric" />
          <TextInput style={modalStyles.input} placeholder="Current Price per Unit" placeholderTextColor="#9CA3AF" value={currentValue} onChangeText={setCurrentValue} keyboardType="numeric" />
          <TouchableOpacity style={modalStyles.createButton} onPress={handleCreate}><Text style={modalStyles.createButtonText}>Add Investment</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1E293B', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#ffffff' },
  input: { backgroundColor: '#374151', borderRadius: 12, padding: 16, color: '#ffffff', fontSize: 16, marginBottom: 16 },
  createButton: { backgroundColor: '#8B5CF6', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 16 },
  createButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#ffffff' },
  analyticsButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' },
  portfolioCard: { marginHorizontal: 20, borderRadius: 20, padding: 24, marginBottom: 24 },
  portfolioHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  portfolioLabel: { color: '#9CA3AF', fontSize: 16 },
  portfolioValue: { color: '#ffffff', fontSize: 36, fontWeight: 'bold', marginBottom: 4 },
  portfolioChange: { color: '#10B981', fontSize: 16, fontWeight: '600' },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#ffffff', marginBottom: 16 },
  quickActions: { flexDirection: 'row', gap: 12 },
  quickAction: { flex: 1, backgroundColor: '#1E293B', borderRadius: 16, padding: 16, alignItems: 'center' },
  quickActionIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  quickActionText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  holdingsList: { gap: 12 },
  investmentCard: { backgroundColor: '#1E293B', borderRadius: 12, padding: 16 },
  investmentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  investmentName: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  investmentSymbol: { color: '#9CA3AF', fontSize: 14, marginTop: 2 },
  investmentValues: { alignItems: 'flex-end' },
  investmentValue: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  investmentSubValue: { color: '#9CA3AF', fontSize: 12, marginTop: 2 },
  investmentBar: { height: 4, backgroundColor: '#374151', borderRadius: 2 },
  investmentBarFill: { height: '100%', borderRadius: 2 },
  learningSection: { backgroundColor: '#1E293B', borderRadius: 16, padding: 20, marginHorizontal: 20, marginBottom: 40, alignItems: 'center' },
  learnTitle: { fontSize: 18, fontWeight: 'bold', color: '#ffffff', marginBottom: 8 },
  learnDescription: { color: '#9CA3AF', fontSize: 14, textAlign: 'center', marginBottom: 16 },
  learnButton: { backgroundColor: '#8B5CF6', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  learnButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  emptyText: { color: '#9CA3AF', textAlign: 'center', marginTop: 20 },
});
