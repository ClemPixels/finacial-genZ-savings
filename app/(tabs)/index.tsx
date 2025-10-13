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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  PlusCircle,
  ArrowUpRight,
  Target,
  TrendingUp,
  Award,
  Zap,
  Repeat,
} from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Tables } from '@/lib/database.types';

type Goal = Tables<'goals'>;
type Transaction = Tables<'transactions'>;

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { profile, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<{
    totalBalance: number;
    recentGoals: Goal[];
    recentTransactions: Transaction[];
  }>({
    totalBalance: 0,
    recentGoals: [],
    recentTransactions: [],
  });

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    try {
      const [walletsRes, goalsRes, transactionsRes] = await Promise.all([
        supabase.from('wallets').select('balance').eq('user_id', user.id),
        supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
        supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
      ]);

      if (walletsRes.error) throw walletsRes.error;
      if (goalsRes.error) throw goalsRes.error;
      if (transactionsRes.error) throw transactionsRes.error;

      const totalBalance = walletsRes.data.reduce((sum, wallet) => sum + wallet.balance, 0);

      setDashboardData({
        totalBalance: totalBalance,
        recentGoals: goalsRes.data,
        recentTransactions: transactionsRes.data,
      });

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchDashboardData();
    }
  }, [authLoading, fetchDashboardData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading || authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B5CF6" />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hey {profile?.full_name?.split(' ')[0] || 'User'}! 👋</Text>
          <Text style={styles.subtitle}>Ready to grow your money?</Text>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/(tabs)/profile')}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileText}>{profile?.full_name?.[0] || 'U'}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Balance Card */}
      <LinearGradient
        colors={['#8B5CF6', '#EC4899', '#F59E0B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.balanceCard}
      >
        <View style={styles.balanceContent}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>${dashboardData.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          <View style={styles.balanceChange}>
            <TrendingUp color="#ffffff" size={16} />
            <Text style={styles.changeText}>Let's grow it!</Text>
          </View>
        </View>
        <View style={styles.cardDecoration}>
          <View style={styles.decorationCircle} />
          <View style={styles.decorationCircle2} />
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/wallet')}>
            <View style={[styles.actionIcon, { backgroundColor: '#10B981' }]}>
              <PlusCircle color="#ffffff" size={24} />
            </View>
            <Text style={styles.actionText}>Add Money</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/wallet')}>
            <View style={[styles.actionIcon, { backgroundColor: '#3B82F6' }]}>
              <ArrowUpRight color="#ffffff" size={24} />
            </View>
            <Text style={styles.actionText}>Send</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/goals')}>
            <View style={[styles.actionIcon, { backgroundColor: '#8B5CF6' }]}>
              <Target color="#ffffff" size={24} />
            </View>
            <Text style={styles.actionText}>New Goal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/invest')}>
            <View style={[styles.actionIcon, { backgroundColor: '#F59E0B' }]}>
              <Zap color="#ffffff" size={24} />
            </View>
            <Text style={styles.actionText}>Invest</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Savings Goals */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Goals</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/goals')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {dashboardData.recentGoals.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {dashboardData.recentGoals.map(goal => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.emptySectionText}>No active goals yet. Create one!</Text>
        )}
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/wallet')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.transactionsList}>
          {dashboardData.recentTransactions.length > 0 ? (
            dashboardData.recentTransactions.map(tx => (
              <TransactionItem key={tx.id} transaction={tx} />
            ))
          ) : (
            <Text style={styles.emptySectionText}>No recent transactions.</Text>
          )}
        </View>
      </View>

      {/* Achievement */}
      <View style={styles.achievementCard}>
        <View style={styles.achievementIcon}>
          <Award color="#F59E0B" size={24} />
        </View>
        <View style={styles.achievementContent}>
          <Text style={styles.achievementTitle}>Streak Master! 🔥</Text>
          <Text style={styles.achievementText}>
            You've saved money for 7 days straight!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function GoalCard({ goal }: { goal: Goal }) {
  const progress = (goal.current_amount / goal.target_amount) * 100;

  return (
    <View style={[styles.goalCard, { borderLeftColor: goal.color || '#8B5CF6' }]}>
      <View style={styles.goalHeader}>
        <Text style={styles.goalEmoji}>{goal.emoji}</Text>
        <Text style={styles.goalTitle}>{goal.name}</Text>
      </View>
      <Text style={styles.goalAmount}>${goal.current_amount.toLocaleString()}</Text>
      <Text style={styles.goalTarget}>of ${goal.target_amount.toLocaleString()}</Text>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.min(progress, 100)}%`, backgroundColor: goal.color || '#8B5CF6' },
          ]}
        />
      </View>
      <Text style={styles.progressText}>{Math.round(progress)}% complete</Text>
    </View>
  );
}

function TransactionItem({ transaction }: { transaction: Transaction }) {
  const isIncome = transaction.type === 'income';
  const isTransfer = transaction.type === 'transfer';
  
  const iconMap: { [key: string]: React.ReactNode } = {
    'income': <PlusCircle size={20} color="#10B981" />,
    'expense': <ArrowUpRight size={20} color="#EF4444" />,
    'transfer': <Repeat size={20} color="#3B82F6" />,
  };

  const categoryIconMap: { [key: string]: string } = {
    'Food & Drink': '☕',
    'Shopping': '🛍️',
    'Transportation': '🚗',
    'Income': '💼',
    'Health': '💪',
    'Goals': '🎯',
    'Investment': '📈',
    'Default': '💸'
  };

  const amountColor = isIncome ? '#10B981' : isTransfer ? '#9CA3AF' : '#EF4444';
  const amountPrefix = isIncome ? '+' : isTransfer ? '' : '-';

  return (
    <View style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        <Text style={styles.transactionEmoji}>{categoryIconMap[transaction.category || 'Default'] || '💸'}</Text>
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionTitle}>{transaction.description}</Text>
        <Text style={styles.transactionTime}>{new Date(transaction.created_at).toLocaleDateString()}</Text>
      </View>
      <View style={{alignItems: 'flex-end'}}>
        <Text style={[styles.transactionAmount, { color: amountColor }]}>
          {amountPrefix}${transaction.amount.toFixed(2)}
        </Text>
        <View style={styles.transactionTypeIcon}>
          {iconMap[transaction.type]}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 4,
  },
  profileButton: {
    padding: 4,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  balanceCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    overflow: 'hidden',
  },
  balanceContent: {
    zIndex: 1,
  },
  balanceLabel: {
    color: '#ffffff',
    fontSize: 16,
    opacity: 0.9,
  },
  balanceAmount: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 12,
  },
  balanceChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    color: '#ffffff',
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '600',
  },
  cardDecoration: {
    position: 'absolute',
    right: -20,
    top: -20,
  },
  decorationCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  decorationCircle2: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    position: 'absolute',
    right: 40,
    top: 40,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  seeAll: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  goalCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    width: width * 0.65,
    borderLeftWidth: 4,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  goalTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  goalAmount: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  goalTarget: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionEmoji: {
    fontSize: 20,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  transactionTime: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionTypeIcon: {
    marginTop: 4,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  achievementText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 2,
  },
  emptySectionText: {
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
  },
});
