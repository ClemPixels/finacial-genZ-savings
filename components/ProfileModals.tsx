import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';

type ModalProps = {
  visible: boolean;
  onClose: () => void;
};

export const EditProfileModal = ({ visible, onClose }: ModalProps) => {
  const { profile, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({ full_name: fullName });
      Alert.alert('Success', 'Your profile has been updated.');
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Account Settings</Text>
            <TouchableOpacity onPress={onClose}>
              <X color="#9CA3AF" size={24} />
            </TouchableOpacity>
          </View>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export const SecurityModal = ({ visible, onClose }: ModalProps) => (
  <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Security & Privacy</Text>
          <TouchableOpacity onPress={onClose}>
            <X color="#9CA3AF" size={24} />
          </TouchableOpacity>
        </View>
        <ScrollView>
          <Text style={styles.paragraph}>
            Your security and privacy are our top priorities. We employ state-of-the-art encryption to protect your data, both in transit and at rest. All communication between your device and our servers is secured using TLS (Transport Layer Security), the industry standard for secure internet communication.
          </Text>
          <Text style={styles.paragraph}>
            We do not sell your personal information to third parties. The data you provide is used solely to enhance your experience within the app, provide personalized insights, and improve our services. We may collect anonymized usage data to help us identify bugs and understand how our features are used, but this data is never linked to your personal identity.
          </Text>
          <Text style={styles.paragraph}>
            You have full control over your data. You can request to view, edit, or delete your personal information at any time by contacting our support team. We adhere to strict data protection regulations, including GDPR and CCPA, to ensure your rights are respected, no matter where you are.
          </Text>
           <Text style={styles.paragraph}>
            For added security, we recommend enabling two-factor authentication (2FA) on your account if available, and always using a strong, unique password. Be cautious of phishing attempts and never share your login credentials with anyone.
          </Text>
        </ScrollView>
      </View>
    </View>
  </Modal>
);

export const HelpModal = ({ visible, onClose }: ModalProps) => (
  <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Help & Support</Text>
          <TouchableOpacity onPress={onClose}>
            <X color="#9CA3AF" size={24} />
          </TouchableOpacity>
        </View>
         <ScrollView>
          <Text style={styles.paragraph}>
            Welcome to the help center for our GenZ Financial App! We're here to assist you on your journey to financial freedom. Our mission is to provide you with the tools and knowledge to save, invest, and manage your money with confidence.
          </Text>
          <Text style={styles.paragraph}>
            If you have any questions, encounter a problem, or have feedback on how we can improve, please don't hesitate to reach out. Our dedicated support team is available to help you.
          </Text>
          <Text style={styles.paragraph}>
            You can contact us via email at <Text style={{color: '#8B5CF6'}}>support@genzfinance.app</Text>. We strive to respond to all inquiries within 24 hours. For more immediate assistance, you can also visit our FAQ section on our website at <Text style={{color: '#8B5CF6'}}>www.genzfinance.app/help</Text>.
          </Text>
        </ScrollView>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  inputLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 24,
  },
  saveButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  paragraph: {
    color: '#D1D5DB',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
});
