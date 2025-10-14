import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  ColorValue,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  MoreHorizontal,
  Eye,
  EyeOff,
  Plus,
  Banknote,
  X,
} from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Tables, Enums } from "@/lib/database.types";

type Wallet = Tables<"wallets">;
type Transaction = Tables<"transactions">;

export default function WalletScreen() {
  const { user } = useAuth();
  const [showBalance, setShowBalance] = useState(true);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [walletsRes, transactionsRes] = await Promise.all([
        supabase.from("wallets").select("*").eq("user_id", user.id),
        supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      if (walletsRes.error) throw walletsRes.error;
      if (transactionsRes.error) throw transactionsRes.error;

      setWallets(walletsRes.data || []);
      setTransactions(transactionsRes.data || []);
    } catch (error) {
      Alert.alert("Error", "Could not fetch wallet data.");
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

  return (
    <View style={{ flex: 1, backgroundColor: "#0F172A" }}>
      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} size="large" color="#8B5CF6" />
      ) : (
        <ScrollView
          style={styles.container}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#8B5CF6"
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>My Wallet</Text>
            <TouchableOpacity
              style={styles.addCardButton}
              onPress={() => setShowWalletModal(true)}
            >
              <Plus color="#ffffff" size={24} />
            </TouchableOpacity>
          </View>

          {/* Cards Section */}
          <View style={styles.cardsSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {wallets.map((wallet) => (
                <CardComponent
                  key={wallet.id}
                  wallet={wallet}
                  showBalance={showBalance}
                />
              ))}
              <AddCardButton onPress={() => setShowWalletModal(true)} />
            </ScrollView>
          </View>

          {/* Balance Visibility Toggle */}
          <View style={styles.balanceToggle}>
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setShowBalance(!showBalance)}
            >
              {showBalance ? (
                <EyeOff color="#9CA3AF" size={20} />
              ) : (
                <Eye color="#9CA3AF" size={20} />
              )}
              <Text style={styles.toggleText}>
                {showBalance ? "Hide Balance" : "Show Balance"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => setShowTransactionModal(true)}
              >
                <View
                  style={[styles.actionIcon, { backgroundColor: "#10B981" }]}
                >
                  <ArrowDownLeft color="#ffffff" size={24} />
                </View>
                <Text style={styles.actionTitle}>Add Income</Text>
                <Text style={styles.actionSubtitle}>Log a payment</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => setShowTransactionModal(true)}
              >
                <View
                  style={[styles.actionIcon, { backgroundColor: "#EF4444" }]}
                >
                  <ArrowUpRight color="#ffffff" size={24} />
                </View>
                <Text style={styles.actionTitle}>Add Expense</Text>
                <Text style={styles.actionSubtitle}>Log a purchase</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Transactions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
            </View>
            <View style={styles.transactionsList}>
              {transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                  />
                ))
              ) : (
                <Text style={styles.emptyText}>No transactions yet.</Text>
              )}
            </View>
          </View>
        </ScrollView>
      )}
      <CreateWalletModal
        visible={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onCreated={fetchData}
      />
      <CreateTransactionModal
        visible={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        onCreated={fetchData}
        wallets={wallets}
      />
    </View>
  );
}

function CardComponent({
  wallet,
  showBalance,
}: {
  wallet: Wallet;
  showBalance: boolean;
}) {
  const gradients: { [key: string]: string[] } = {
    spending: ["#8B5CF6", "#EC4899"],
    savings: ["#10B981", "#059669"],
    default: ["#6B7280", "#4B5563"],
  };
  return (
    <LinearGradient
      colors={
        (gradients[wallet.type] || gradients.default) as [
          ColorValue,
          ColorValue,
          ...ColorValue[]
        ]
      }
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardType}>
          {wallet.type.charAt(0).toUpperCase() + wallet.type.slice(1)}
        </Text>
        <TouchableOpacity>
          <MoreHorizontal color="#ffffff" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardName}>{wallet.name}</Text>
        <Text style={styles.cardBalance}>
          {showBalance
            ? `$${wallet.balance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : "••••••"}
        </Text>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.cardNumber}>Account</Text>
        <CreditCard color="rgba(255, 255, 255, 0.8)" size={32} />
      </View>
      <View style={styles.cardDecoration}>
        <View style={styles.decorationDot} />
      </View>
    </LinearGradient>
  );
}

function AddCardButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.addCard} onPress={onPress}>
      <View style={styles.addCardContent}>
        <Plus color="#9CA3AF" size={32} />
        <Text style={styles.addCardText}>Add New Wallet</Text>
      </View>
    </TouchableOpacity>
  );
}

function TransactionItem({ transaction }: { transaction: Transaction }) {
  const isPositive = transaction.type === "income";
  return (
    <TouchableOpacity style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        <Text style={styles.transactionEmoji}>{isPositive ? "💰" : "💸"}</Text>
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionTitle}>{transaction.description}</Text>
        <Text style={styles.transactionTime}>
          {new Date(transaction.created_at).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.transactionAmount}>
        <Text
          style={[
            styles.amountText,
            { color: isPositive ? "#10B981" : "#ffffff" },
          ]}
        >
          {isPositive ? "+" : "-"}${transaction.amount.toFixed(2)}
        </Text>
        {transaction.category && (
          <Text style={styles.categoryText}>{transaction.category}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

function CreateWalletModal({
  visible,
  onClose,
  onCreated,
}: {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [type, setType] = useState<Enums<"wallet_type">>("spending");

  const handleCreate = async () => {
    if (!name || !user) {
      Alert.alert("Error", "Please provide a name for the wallet.");
      return;
    }
    const { error } = await supabase
      .from("wallets")
      .insert({ name, type, user_id: user.id });
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Wallet created!");
      onCreated();
      onClose();
      setName("");
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={modalStyles.modalOverlay}>
        <View style={modalStyles.modalContent}>
          <View style={modalStyles.modalHeader}>
            <Text style={modalStyles.modalTitle}>New Wallet</Text>
            <TouchableOpacity onPress={onClose}>
              <X color="#9CA3AF" size={24} />
            </TouchableOpacity>
          </View>
          <TextInput
            style={modalStyles.input}
            placeholder="Wallet Name (e.g., Daily Spending)"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
          />
          <View style={modalStyles.toggleContainer}>
            <TouchableOpacity
              style={[
                modalStyles.toggleButton,
                type === "spending" && modalStyles.toggleActive,
              ]}
              onPress={() => setType("spending")}
            >
              <Text style={modalStyles.toggleText}>Spending</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                modalStyles.toggleButton,
                type === "savings" && modalStyles.toggleActive,
              ]}
              onPress={() => setType("savings")}
            >
              <Text style={modalStyles.toggleText}>Savings</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={modalStyles.createButton}
            onPress={handleCreate}
          >
            <Text style={modalStyles.createButtonText}>Create Wallet</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function CreateTransactionModal({
  visible,
  onClose,
  onCreated,
  wallets,
}: {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
  wallets: Wallet[];
}) {
  const { user } = useAuth();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<Enums<"transaction_type">>("expense");
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);

  useEffect(() => {
    if (wallets.length > 0) {
      setSelectedWalletId(wallets[0].id);
    }
  }, [wallets]);

  const handleCreate = async () => {
    if (!description || !amount || !selectedWalletId || !user) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }
    const numericAmount = parseFloat(amount);
    const selectedWallet = wallets.find((w) => w.id === selectedWalletId);
    if (!selectedWallet) return;

    const newBalance =
      type === "income"
        ? selectedWallet.balance + numericAmount
        : selectedWallet.balance - numericAmount;

    const { error: txError } = await supabase.from("transactions").insert({
      title: type,
      description,
      amount: numericAmount,
      type,
      user_id: user.id,
    });
    if (txError) {
      Alert.alert("Error", txError.message);
      return;
    }

    const { error: walletError } = await supabase
      .from("wallets")
      .update({ balance: newBalance })
      .eq("id", selectedWalletId);
    if (walletError) {
      Alert.alert(
        "Error",
        `Transaction logged, but failed to update wallet: ${walletError.message}`
      );
    } else {
      Alert.alert("Success", "Transaction created!");
    }

    onCreated();
    onClose();
    setDescription("");
    setAmount("");
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={modalStyles.modalOverlay}>
        <View style={modalStyles.modalContent}>
          <View style={modalStyles.modalHeader}>
            <Text style={modalStyles.modalTitle}>New Transaction</Text>
            <TouchableOpacity onPress={onClose}>
              <X color="#9CA3AF" size={24} />
            </TouchableOpacity>
          </View>
          <View style={modalStyles.toggleContainer}>
            <TouchableOpacity
              style={[
                modalStyles.toggleButton,
                type === "expense" && modalStyles.toggleActive,
              ]}
              onPress={() => setType("expense")}
            >
              <Text style={modalStyles.toggleText}>Expense</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                modalStyles.toggleButton,
                type === "income" && modalStyles.toggleActive,
              ]}
              onPress={() => setType("income")}
            >
              <Text style={modalStyles.toggleText}>Income</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={modalStyles.input}
            placeholder="Description (e.g., Coffee)"
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDescription}
          />
          <TextInput
            style={modalStyles.input}
            placeholder="Amount"
            placeholderTextColor="#9CA3AF"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          <Text style={modalStyles.inputLabel}>Wallet</Text>
          <View style={modalStyles.toggleContainer}>
            {wallets.map((w) => (
              <TouchableOpacity
                key={w.id}
                style={[
                  modalStyles.toggleButton,
                  selectedWalletId === w.id && modalStyles.toggleActive,
                ]}
                onPress={() => setSelectedWalletId(w.id)}
              >
                <Text style={modalStyles.toggleText}>{w.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={modalStyles.createButton}
            onPress={handleCreate}
          >
            <Text style={modalStyles.createButtonText}>Add Transaction</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
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
  input: {
    backgroundColor: "#374151",
    borderRadius: 12,
    padding: 16,
    color: "#ffffff",
    fontSize: 16,
    marginBottom: 16,
  },
  inputLabel: { color: "#9CA3AF", fontSize: 14, marginBottom: 8, marginTop: 8 },
  createButton: {
    backgroundColor: "#8B5CF6",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
  },
  createButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
  toggleContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#374151",
    borderRadius: 20,
  },
  toggleActive: { backgroundColor: "#8B5CF6" },
  toggleText: { color: "#ffffff", fontWeight: "600" },
});

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
  addCardButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#8B5CF6",
    alignItems: "center",
    justifyContent: "center",
  },
  cardsSection: { paddingLeft: 20, marginBottom: 16 },
  card: {
    width: 300,
    height: 180,
    borderRadius: 20,
    padding: 20,
    marginRight: 16,
    position: "relative",
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  cardType: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    fontWeight: "600",
  },
  cardContent: { flex: 1, justifyContent: "center" },
  cardName: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  cardBalance: { color: "#ffffff", fontSize: 24, fontWeight: "bold" },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardNumber: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
    fontWeight: "600",
  },
  cardDecoration: { position: "absolute", top: -20, right: -20 },
  decorationDot: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  addCard: {
    width: 300,
    height: 180,
    borderRadius: 20,
    backgroundColor: "#1E293B",
    borderWidth: 2,
    borderColor: "#374151",
    borderStyle: "dashed",
    marginRight: 16,
  },
  addCardContent: { flex: 1, alignItems: "center", justifyContent: "center" },
  addCardText: {
    color: "#9CA3AF",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  balanceToggle: { paddingHorizontal: 20, marginBottom: 24 },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  toggleText: { color: "#9CA3AF", fontSize: 14, marginLeft: 8 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 16,
  },
  seeAll: { color: "#8B5CF6", fontSize: 14, fontWeight: "600" },
  actionsGrid: { flexDirection: "row", gap: 12 },
  actionCard: {
    flex: 1,
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  actionTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  actionSubtitle: { color: "#9CA3AF", fontSize: 12, textAlign: "center" },
  transactionsList: { gap: 12 },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 16,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#374151",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  transactionEmoji: { fontSize: 20 },
  transactionDetails: { flex: 1 },
  transactionTitle: { color: "#ffffff", fontSize: 16, fontWeight: "600" },
  transactionTime: { color: "#6B7280", fontSize: 12, marginTop: 2 },
  transactionAmount: { alignItems: "flex-end" },
  amountText: { fontSize: 16, fontWeight: "bold" },
  categoryText: { color: "#9CA3AF", fontSize: 12, marginTop: 2 },
  emptyText: { color: "#9CA3AF", textAlign: "center", marginTop: 20 },
});
