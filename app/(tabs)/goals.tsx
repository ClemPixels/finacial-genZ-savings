import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Plus, Target, Calendar, DollarSign, X } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Tables } from "@/lib/database.types";

type Goal = Tables<"goals">;
type Wallet = Tables<"wallets">;

export default function GoalsScreen() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [newGoal, setNewGoal] = useState({
    name: "",
    target_amount: "",
    emoji: "🎯",
    color: "#8B5CF6",
  });

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [goalsRes, walletsRes] = await Promise.all([
        supabase
          .from("goals")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase.from("wallets").select("*").eq("user_id", user.id),
      ]);

      if (goalsRes.error) throw goalsRes.error;
      if (walletsRes.error) throw walletsRes.error;

      setGoals(goalsRes.data || []);
      setWallets(walletsRes.data || []);
    } catch (error) {
      Alert.alert("Error", "Could not fetch your data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const stats = useMemo(() => {
    const totalSaved = goals.reduce(
      (sum, goal) => sum + goal.current_amount,
      0
    );
    const totalTarget = goals.reduce(
      (sum, goal) => sum + goal.target_amount,
      0
    );
    const avgProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
    return {
      activeGoals: goals.length,
      totalSaved,
      avgProgress,
    };
  }, [goals]);

  const handleCreateGoal = async () => {
    if (!newGoal.name || !newGoal.target_amount || !user) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    const targetAmount = parseFloat(newGoal.target_amount);
    if (isNaN(targetAmount) || targetAmount <= 0) {
      Alert.alert("Error", "Please enter a valid target amount.");
      return;
    }

    const { error } = await supabase.from("goals").insert({
      user_id: user.id,
      title: newGoal.name,
      target_amount: targetAmount,
      current_amount: 0,
      emoji: newGoal.emoji,
      color: newGoal.color,
    });

    if (error) {
      console.error("Error creating goal", error);
      Alert.alert("Error", "Could not create goal.");
    } else {
      Alert.alert("Success", "Goal created successfully!");
      setShowCreateModal(false);
      setNewGoal({
        name: "",
        target_amount: "",
        emoji: "🎯",
        color: "#8B5CF6",
      });
      fetchData();
    }
  };

  const openAddMoneyModal = (goal: Goal) => {
    setSelectedGoal(goal);
    setShowAddMoneyModal(true);
  };

  const goalColors = [
    "#8B5CF6",
    "#EC4899",
    "#10B981",
    "#F59E0B",
    "#3B82F6",
    "#EF4444",
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Goals</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Plus color="#ffffff" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.activeGoals}</Text>
          <Text style={styles.statLabel}>Active Goals</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            ${stats.totalSaved.toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Total Saved</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{Math.round(stats.avgProgress)}%</Text>
          <Text style={styles.statLabel}>Avg Progress</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator
          style={{ marginTop: 50 }}
          size="large"
          color="#8B5CF6"
        />
      ) : (
        <ScrollView
          style={styles.goalsList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#8B5CF6"
            />
          }
        >
          {goals.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Target color="#475569" size={64} />
              <Text style={styles.emptyStateTitle}>No Goals Yet</Text>
              <Text style={styles.emptyStateSubtitle}>
                Tap the '+' button to create your first savings goal.
              </Text>
            </View>
          ) : (
            goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onAddMoney={openAddMoneyModal}
              />
            ))
          )}
        </ScrollView>
      )}

      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Goal</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <X color="#9CA3AF" size={24} />
              </TouchableOpacity>
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>Icon & Color</Text>
              <View style={styles.emojiSelector}>
                {["🎯", "📱", "🏖️", "🎮", "🚗", "🏠", "💍", "🎓"].map(
                  (emoji) => (
                    <TouchableOpacity
                      key={emoji}
                      style={[
                        styles.emojiOption,
                        newGoal.emoji === emoji && {
                          backgroundColor: newGoal.color,
                          borderColor: "#fff",
                        },
                      ]}
                      onPress={() => setNewGoal({ ...newGoal, emoji })}
                    >
                      <Text style={styles.emojiText}>{emoji}</Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
              <View style={styles.colorSelector}>
                {goalColors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      newGoal.color === color && styles.colorSelected,
                    ]}
                    onPress={() => setNewGoal({ ...newGoal, color })}
                  />
                ))}
              </View>
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>Goal Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., New Gaming PC"
                placeholderTextColor="#9CA3AF"
                value={newGoal.name}
                onChangeText={(name) => setNewGoal({ ...newGoal, name })}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>Target Amount</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 2500"
                placeholderTextColor="#9CA3AF"
                value={newGoal.target_amount}
                onChangeText={(target) =>
                  setNewGoal({ ...newGoal, target_amount: target })
                }
                keyboardType="numeric"
              />
            </View>
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateGoal}
            >
              <Text style={styles.createButtonText}>Create Goal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {selectedGoal && (
        <AddMoneyModal
          visible={showAddMoneyModal}
          onClose={() => setShowAddMoneyModal(false)}
          goal={selectedGoal}
          wallets={wallets}
          onSuccess={fetchData}
        />
      )}
    </View>
  );
}

function GoalCard({
  goal,
  onAddMoney,
}: {
  goal: Goal;
  onAddMoney: (goal: Goal) => void;
}) {
  const progress = (goal.current_amount / goal.target_amount) * 100;
  const remaining = goal.target_amount - goal.current_amount;

  return (
    <View
      style={[styles.goalCard, { borderLeftColor: goal.color || "#8B5CF6" }]}
    >
      <View style={styles.goalHeader}>
        <View style={styles.goalTitleRow}>
          <Text style={styles.goalEmoji}>{goal.emoji}</Text>
          <View style={styles.goalInfo}>
            <Text style={styles.goalTitle}>{goal.name}</Text>
            {goal.deadline && (
              <Text style={styles.goalDeadline}>
                Target: {new Date(goal.deadline).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>
        <TouchableOpacity
          style={styles.addMoneyButton}
          onPress={() => onAddMoney(goal)}
        >
          <Plus color="#8B5CF6" size={20} />
        </TouchableOpacity>
      </View>
      <View style={styles.goalProgress}>
        <View style={styles.amountRow}>
          <Text style={styles.currentAmount}>
            ${goal.current_amount.toLocaleString()}
          </Text>
          <Text style={styles.targetAmount}>
            of ${goal.target_amount.toLocaleString()}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={[goal.color || "#8B5CF6", (goal.color || "#8B5CF6") + "80"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.progressFill,
              { width: `${Math.min(progress, 100)}%` },
            ]}
          />
        </View>
        <View style={styles.progressStats}>
          <Text style={styles.progressPercent}>
            {Math.round(progress)}% complete
          </Text>
          <Text style={styles.remainingAmount}>
            ${remaining.toLocaleString()} to go
          </Text>
        </View>
      </View>
      <View style={styles.goalActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onAddMoney(goal)}
        >
          <DollarSign color="#10B981" size={16} />
          <Text style={styles.actionText}>Add Money</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Calendar color="#8B5CF6" size={16} />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function AddMoneyModal({
  visible,
  onClose,
  goal,
  wallets,
  onSuccess,
}: {
  visible: boolean;
  onClose: () => void;
  goal: Goal;
  wallets: Wallet[];
  onSuccess: () => void;
}) {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);

  useEffect(() => {
    if (wallets.length > 0) {
      setSelectedWalletId(wallets[0].id);
    }
  }, [wallets]);

  const handleAddMoney = async () => {
    if (!amount || !user || !selectedWalletId) {
      Alert.alert("Error", "Please enter an amount and select a wallet.");
      return;
    }
    const addedAmount = parseFloat(amount);
    const selectedWallet = wallets.find((w) => w.id === selectedWalletId);
    if (!selectedWallet) {
      Alert.alert("Error", "Selected wallet not found.");
      return;
    }
    if (isNaN(addedAmount) || addedAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount.");
      return;
    }
    if (selectedWallet.balance < addedAmount) {
      Alert.alert("Error", "Insufficient funds in the selected wallet.");
      return;
    }

    const newGoalAmount = goal.current_amount + addedAmount;
    const newWalletBalance = selectedWallet.balance - addedAmount;

    const [goalUpdate, walletUpdate, txInsert] = await Promise.all([
      supabase
        .from("goals")
        .update({ current_amount: newGoalAmount })
        .eq("id", goal.id),
      supabase
        .from("wallets")
        .update({ balance: newWalletBalance })
        .eq("id", selectedWalletId),
      supabase.from("transactions").insert({
        title: `Transfer to ${goal.name}`,
        user_id: user.id,
        description: `Transfer to "${goal.name}"`,
        amount: addedAmount,
        type: "transfer",
        category: "Goals",
      }),
    ]);

    if (goalUpdate.error || walletUpdate.error || txInsert.error) {
      Alert.alert(
        "Error",
        "Could not complete the transfer. Please try again."
      );
      // Here you might want to add logic to revert any successful parts of the transaction
    } else {
      Alert.alert("Success", `Transferred $${addedAmount} to your goal!`);
      onSuccess();
      onClose();
      setAmount("");
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add to "{goal.name}"</Text>
            <TouchableOpacity onPress={onClose}>
              <X color="#9CA3AF" size={24} />
            </TouchableOpacity>
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.inputLabel}>Amount to Add</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 50"
              placeholderTextColor="#9CA3AF"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.inputLabel}>From Wallet</Text>
            <View style={styles.walletSelector}>
              {wallets.map((w) => (
                <TouchableOpacity
                  key={w.id}
                  style={[
                    styles.walletOption,
                    selectedWalletId === w.id && styles.walletSelected,
                  ]}
                  onPress={() => setSelectedWalletId(w.id)}
                >
                  <Text style={styles.walletOptionText}>{w.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleAddMoney}
          >
            <Text style={styles.createButtonText}>Confirm Transfer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: { fontSize: 28, fontWeight: "bold", color: "#ffffff" },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#8B5CF6",
    alignItems: "center",
    justifyContent: "center",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statValue: { fontSize: 24, fontWeight: "bold", color: "#ffffff" },
  statLabel: { fontSize: 12, color: "#9CA3AF", marginTop: 4 },
  goalsList: { flex: 1, paddingHorizontal: 20 },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 16,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
    textAlign: "center",
    maxWidth: "70%",
  },
  goalCard: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  goalTitleRow: { flexDirection: "row", alignItems: "center", flex: 1 },
  goalEmoji: { fontSize: 32, marginRight: 12 },
  goalInfo: { flex: 1 },
  goalTitle: { fontSize: 18, fontWeight: "bold", color: "#ffffff" },
  goalDeadline: { fontSize: 14, color: "#9CA3AF", marginTop: 2 },
  addMoneyButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#374151",
    alignItems: "center",
    justifyContent: "center",
  },
  goalProgress: { marginBottom: 16 },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  currentAmount: { fontSize: 24, fontWeight: "bold", color: "#ffffff" },
  targetAmount: { fontSize: 16, color: "#9CA3AF" },
  progressBar: {
    height: 8,
    backgroundColor: "#374151",
    borderRadius: 4,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 4 },
  progressStats: { flexDirection: "row", justifyContent: "space-between" },
  progressPercent: { fontSize: 14, fontWeight: "600", color: "#10B981" },
  remainingAmount: { fontSize: 14, color: "#9CA3AF" },
  goalActions: {
    flexDirection: "row",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#374151",
    paddingTop: 16,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#374151",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  actionText: { color: "#ffffff", fontSize: 14, fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1E293B",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#ffffff" },
  fieldGroup: { marginBottom: 20 },
  inputLabel: { color: "#9CA3AF", fontSize: 14, marginBottom: 8 },
  emojiSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
  },
  emojiOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#374151",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  emojiText: { fontSize: 20 },
  colorSelector: { flexDirection: "row", gap: 12 },
  colorOption: { width: 32, height: 32, borderRadius: 16 },
  colorSelected: { borderWidth: 2, borderColor: "#ffffff" },
  input: {
    backgroundColor: "#374151",
    borderRadius: 12,
    padding: 16,
    color: "#ffffff",
    fontSize: 16,
  },
  createButton: {
    backgroundColor: "#8B5CF6",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
  },
  createButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
  walletSelector: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  walletOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#374151",
    borderRadius: 20,
  },
  walletSelected: { backgroundColor: "#8B5CF6" },
  walletOptionText: { color: "#ffffff", fontWeight: "600" },
});
