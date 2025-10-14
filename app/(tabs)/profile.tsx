// import React from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   StyleSheet,
//   Switch,
//   ActivityIndicator,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import {
//   User,
//   Settings,
//   Shield,
//   Bell,
//   HelpCircle,
//   LogOut,
//   ChevronRight,
//   Award,
//   TrendingUp,
//   Target,
//   Moon,
// } from 'lucide-react-native';
// import { useAuth } from '@/context/AuthContext';

// export default function ProfileScreen() {
//   const { user, profile, signOut, loading } = useAuth();
//   const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
//   const [darkModeEnabled, setDarkModeEnabled] = React.useState(true);

//   const stats = [
//     { label: 'Goals Completed', value: '12', icon: Target, color: '#10B981' },
//     { label: 'Total Saved', value: '$8.2K', icon: TrendingUp, color: '#3B82F6' },
//     { label: 'Achievements', value: '24', icon: Award, color: '#F59E0B' },
//   ];

//   const menuItems = [
//     {
//       title: 'Account Settings',
//       icon: Settings,
//       color: '#8B5CF6',
//       hasSwitch: false,
//     },
//     {
//       title: 'Security & Privacy',
//       icon: Shield,
//       color: '#10B981',
//       hasSwitch: false,
//     },
//     {
//       title: 'Notifications',
//       icon: Bell,
//       color: '#3B82F6',
//       hasSwitch: true,
//       switchValue: notificationsEnabled,
//       onSwitchChange: setNotificationsEnabled,
//     },
//     {
//       title: 'Dark Mode',
//       icon: Moon,
//       color: '#6B7280',
//       hasSwitch: true,
//       switchValue: darkModeEnabled,
//       onSwitchChange: setDarkModeEnabled,
//     },
//     {
//       title: 'Help & Support',
//       icon: HelpCircle,
//       color: '#F59E0B',
//       hasSwitch: false,
//     },
//   ];

//   const achievements = [
//     { title: 'First Goal', emoji: '🎯', unlocked: true },
//     { title: 'Saver', emoji: '💰', unlocked: true },
//     { title: 'Investor', emoji: '📈', unlocked: true },
//     { title: 'Streak Master', emoji: '🔥', unlocked: true },
//     { title: 'Big Spender', emoji: '💎', unlocked: false },
//     { title: 'Money Master', emoji: '👑', unlocked: false },
//   ];

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#8B5CF6" />
//       </View>
//     );
//   }

//   return (
//     <ScrollView style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <Text style={styles.title}>Profile</Text>
//         <TouchableOpacity style={styles.settingsButton}>
//           <Settings color="#9CA3AF" size={24} />
//         </TouchableOpacity>
//       </View>

//       {/* Profile Card */}
//       <LinearGradient
//         colors={['#8B5CF6', '#EC4899']}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//         style={styles.profileCard}
//       >
//         <View style={styles.profileInfo}>
//           <View style={styles.avatarContainer}>
//             <View style={styles.avatar}>
//               <Text style={styles.avatarText}>{profile?.full_name?.[0] || 'U'}</Text>
//             </View>
//             <View style={styles.onlineIndicator} />
//           </View>
//           <View style={styles.userInfo}>
//             <Text style={styles.userName}>{profile?.full_name || 'New User'}</Text>
//             <Text style={styles.userEmail}>{user?.email}</Text>
//             <Text style={styles.joinDate}>Member since {new Date(user?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</Text>
//           </View>
//         </View>
//         <TouchableOpacity style={styles.editButton}>
//           <User color="#ffffff" size={20} />
//         </TouchableOpacity>
//       </LinearGradient>

//       {/* Stats */}
//       <View style={styles.statsContainer}>
//         {stats.map((stat, index) => (
//           <View key={index} style={styles.statCard}>
//             <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
//               <stat.icon color="#ffffff" size={20} />
//             </View>
//             <Text style={styles.statValue}>{stat.value}</Text>
//             <Text style={styles.statLabel}>{stat.label}</Text>
//           </View>
//         ))}
//       </View>

//       {/* Achievements */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Recent Achievements</Text>
//         <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//           {achievements.map((achievement, index) => (
//             <View
//               key={index}
//               style={[
//                 styles.achievementCard,
//                 !achievement.unlocked && styles.achievementLocked,
//               ]}
//             >
//               <Text
//                 style={[
//                   styles.achievementEmoji,
//                   !achievement.unlocked && styles.achievementEmojiLocked,
//                 ]}
//               >
//                 {achievement.emoji}
//               </Text>
//               <Text
//                 style={[
//                   styles.achievementTitle,
//                   !achievement.unlocked && styles.achievementTitleLocked,
//                 ]}
//               >
//                 {achievement.title}
//               </Text>
//             </View>
//           ))}
//         </ScrollView>
//       </View>

//       {/* Menu Items */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Settings</Text>
//         <View style={styles.menuList}>
//           {menuItems.map((item, index) => (
//             <TouchableOpacity key={index} style={styles.menuItem}>
//               <View style={styles.menuItemLeft}>
//                 <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
//                   <item.icon color="#ffffff" size={20} />
//                 </View>
//                 <Text style={styles.menuItemTitle}>{item.title}</Text>
//               </View>
//               <View style={styles.menuItemRight}>
//                 {item.hasSwitch ? (
//                   <Switch
//                     value={item.switchValue}
//                     onValueChange={item.onSwitchChange}
//                     trackColor={{ false: '#374151', true: '#8B5CF6' }}
//                     thumbColor="#ffffff"
//                   />
//                 ) : (
//                   <ChevronRight color="#9CA3AF" size={20} />
//                 )}
//               </View>
//             </TouchableOpacity>
//           ))}
//         </View>
//       </View>

//       {/* Financial Summary */}
//       <View style={styles.summaryCard}>
//         <Text style={styles.summaryTitle}>This Month Summary</Text>
//         <View style={styles.summaryStats}>
//           <View style={styles.summaryItem}>
//             <Text style={styles.summaryLabel}>Income</Text>
//             <Text style={[styles.summaryValue, { color: '#10B981' }]}>+$3,200</Text>
//           </View>
//           <View style={styles.summaryItem}>
//             <Text style={styles.summaryLabel}>Expenses</Text>
//             <Text style={[styles.summaryValue, { color: '#EF4444' }]}>-$1,450</Text>
//           </View>
//           <View style={styles.summaryItem}>
//             <Text style={styles.summaryLabel}>Saved</Text>
//             <Text style={[styles.summaryValue, { color: '#8B5CF6' }]}>+$1,750</Text>
//           </View>
//         </View>
//       </View>

//       {/* Logout Button */}
//       <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
//         <LogOut color="#EF4444" size={20} />
//         <Text style={styles.logoutText}>Sign Out</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#0F172A',
//   },
//   container: {
//     flex: 1,
//     backgroundColor: '#0F172A',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingTop: 60,
//     paddingBottom: 20,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#ffffff',
//   },
//   settingsButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: '#1E293B',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   profileCard: {
//     marginHorizontal: 20,
//     borderRadius: 20,
//     padding: 24,
//     marginBottom: 24,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   profileInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   avatarContainer: {
//     position: 'relative',
//     marginRight: 16,
//   },
//   avatar: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   avatarText: {
//     color: '#ffffff',
//     fontSize: 24,
//     fontWeight: 'bold',
//   },
//   onlineIndicator: {
//     position: 'absolute',
//     bottom: 2,
//     right: 2,
//     width: 16,
//     height: 16,
//     borderRadius: 8,
//     backgroundColor: '#10B981',
//     borderWidth: 2,
//     borderColor: '#ffffff',
//   },
//   userInfo: {
//     flex: 1,
//   },
//   userName: {
//     color: '#ffffff',
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   userEmail: {
//     color: 'rgba(255, 255, 255, 0.8)',
//     fontSize: 14,
//     marginTop: 2,
//   },
//   joinDate: {
//     color: 'rgba(255, 255, 255, 0.6)',
//     fontSize: 12,
//     marginTop: 4,
//   },
//   editButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   statsContainer: {
//     flexDirection: 'row',
//     paddingHorizontal: 20,
//     marginBottom: 24,
//     gap: 12,
//   },
//   statCard: {
//     flex: 1,
//     backgroundColor: '#1E293B',
//     borderRadius: 16,
//     padding: 16,
//     alignItems: 'center',
//   },
//   statIcon: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 8,
//   },
//   statValue: {
//     color: '#ffffff',
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 4,
//   },
//   statLabel: {
//     color: '#9CA3AF',
//     fontSize: 12,
//     textAlign: 'center',
//   },
//   section: {
//     paddingHorizontal: 20,
//     marginBottom: 24,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#ffffff',
//     marginBottom: 16,
//   },
//   achievementCard: {
//     backgroundColor: '#1E293B',
//     borderRadius: 12,
//     padding: 16,
//     marginRight: 12,
//     alignItems: 'center',
//     width: 100,
//   },
//   achievementLocked: {
//     opacity: 0.5,
//   },
//   achievementEmoji: {
//     fontSize: 24,
//     marginBottom: 8,
//   },
//   achievementEmojiLocked: {
//     opacity: 0.3,
//   },
//   achievementTitle: {
//     color: '#ffffff',
//     fontSize: 12,
//     fontWeight: '600',
//     textAlign: 'center',
//   },
//   achievementTitleLocked: {
//     color: '#6B7280',
//   },
//   menuList: {
//     gap: 12,
//   },
//   menuItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     backgroundColor: '#1E293B',
//     borderRadius: 12,
//     padding: 16,
//   },
//   menuItemLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   menuIcon: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 16,
//   },
//   menuItemTitle: {
//     color: '#ffffff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   menuItemRight: {
//     alignItems: 'center',
//   },
//   summaryCard: {
//     backgroundColor: '#1E293B',
//     borderRadius: 16,
//     padding: 20,
//     marginHorizontal: 20,
//     marginBottom: 24,
//   },
//   summaryTitle: {
//     color: '#ffffff',
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 16,
//   },
//   summaryStats: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   summaryItem: {
//     alignItems: 'center',
//   },
//   summaryLabel: {
//     color: '#9CA3AF',
//     fontSize: 14,
//     marginBottom: 4,
//   },
//   summaryValue: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   logoutButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#1E293B',
//     borderRadius: 12,
//     padding: 16,
//     marginHorizontal: 20,
//     marginBottom: 40,
//     borderWidth: 1,
//     borderColor: '#374151',
//   },
//   logoutText: {
//     color: '#EF4444',
//     fontSize: 16,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
// });



import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User,
  Settings,
  Shield,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Award,
  TrendingUp,
  Target,
  Moon,
} from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { EditProfileModal, SecurityModal, HelpModal } from '@/components/ProfileModals';

export default function ProfileScreen() {
  const { user, profile, signOut, loading, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [modalVisible, setModalVisible] = useState<'edit' | 'security' | 'help' | null>(null);

  const handleNotificationsToggle = async (value: boolean) => {
    try {
      await updateProfile({ notifications_enabled: value });
      Alert.alert('Success', `Email notifications have been ${value ? 'enabled' : 'disabled'}.`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update notification settings.');
    }
  };

  const stats = [
    { label: 'Goals Completed', value: '12', icon: Target, color: '#10B981' },
    { label: 'Total Saved', value: '$8.2K', icon: TrendingUp, color: '#3B82F6' },
    { label: 'Achievements', value: '24', icon: Award, color: '#F59E0B' },
  ];

  const menuItems = [
    {
      title: 'Account Settings',
      icon: Settings,
      color: '#8B5CF6',
      onPress: () => setModalVisible('edit'),
    },
    {
      title: 'Security & Privacy',
      icon: Shield,
      color: '#10B981',
      onPress: () => setModalVisible('security'),
    },
    {
      title: 'Help & Support',
      icon: HelpCircle,
      color: '#F59E0B',
      onPress: () => setModalVisible('help'),
    },
  ];

  const achievements = [
    { title: 'First Goal', emoji: '🎯', unlocked: true },
    { title: 'Saver', emoji: '💰', unlocked: true },
    { title: 'Investor', emoji: '📈', unlocked: true },
    { title: 'Streak Master', emoji: '🔥', unlocked: true },
    { title: 'Big Spender', emoji: '💎', unlocked: false },
    { title: 'Money Master', emoji: '👑', unlocked: false },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* Profile Card */}
        <LinearGradient
          colors={['#8B5CF6', '#EC4899']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{profile?.full_name?.[0] || 'U'}</Text>
              </View>
              <View style={styles.onlineIndicator} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{profile?.full_name || 'New User'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <Text style={styles.joinDate}>Member since {new Date(user?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={() => setModalVisible('edit')}>
            <Settings color="#ffffff" size={20} />
          </TouchableOpacity>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
                <stat.icon color="#ffffff" size={20} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {achievements.map((achievement, index) => (
              <View key={index} style={[styles.achievementCard, !achievement.unlocked && styles.achievementLocked]}>
                <Text style={[styles.achievementEmoji, !achievement.unlocked && styles.achievementEmojiLocked]}>{achievement.emoji}</Text>
                <Text style={[styles.achievementTitle, !achievement.unlocked && styles.achievementTitleLocked]}>{achievement.title}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.menuList}>
            {menuItems.map((item, index) => (
              <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
                    <item.icon color="#ffffff" size={20} />
                  </View>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                </View>
                <ChevronRight color="#9CA3AF" size={20} />
              </TouchableOpacity>
            ))}
            {/* Toggles */}
            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#3B82F6' }]}>
                  <Bell color="#ffffff" size={20} />
                </View>
                <Text style={styles.menuItemTitle}>Notifications</Text>
              </View>
              <Switch
                value={!!profile?.notifications_enabled}
                onValueChange={handleNotificationsToggle}
                trackColor={{ false: '#374151', true: '#8B5CF6' }}
                thumbColor="#ffffff"
              />
            </View>
            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#6B7280' }]}>
                  <Moon color="#ffffff" size={20} />
                </View>
                <Text style={styles.menuItemTitle}>Dark Mode</Text>
              </View>
              <Switch
                value={theme === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{ false: '#767577', true: '#8B5CF6' }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <LogOut color="#EF4444" size={20} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {profile && <EditProfileModal visible={modalVisible === 'edit'} onClose={() => setModalVisible(null)} />}
      <SecurityModal visible={modalVisible === 'security'} onClose={() => setModalVisible(null)} />
      <HelpModal visible={modalVisible === 'help'} onClose={() => setModalVisible(null)} />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' },
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#ffffff' },
  profileCard: { marginHorizontal: 20, borderRadius: 20, padding: 24, marginBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  profileInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatarContainer: { position: 'relative', marginRight: 16 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255, 255, 255, 0.2)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#ffffff', fontSize: 24, fontWeight: 'bold' },
  onlineIndicator: { position: 'absolute', bottom: 2, right: 2, width: 16, height: 16, borderRadius: 8, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#ffffff' },
  userInfo: { flex: 1 },
  userName: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' },
  userEmail: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 14, marginTop: 2 },
  joinDate: { color: 'rgba(255, 255, 255, 0.6)', fontSize: 12, marginTop: 4 },
  editButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.2)', alignItems: 'center', justifyContent: 'center' },
  statsContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 24, gap: 12 },
  statCard: { flex: 1, backgroundColor: '#1E293B', borderRadius: 16, padding: 16, alignItems: 'center' },
  statIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { color: '#9CA3AF', fontSize: 12, textAlign: 'center' },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#ffffff', marginBottom: 16 },
  achievementCard: { backgroundColor: '#1E293B', borderRadius: 12, padding: 16, marginRight: 12, alignItems: 'center', width: 100 },
  achievementLocked: { opacity: 0.5 },
  achievementEmoji: { fontSize: 24, marginBottom: 8 },
  achievementEmojiLocked: { opacity: 0.3 },
  achievementTitle: { color: '#ffffff', fontSize: 12, fontWeight: '600', textAlign: 'center' },
  achievementTitleLocked: { color: '#6B7280' },
  menuList: { gap: 12 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1E293B', borderRadius: 12, padding: 16 },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  menuIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  menuItemTitle: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E293B', borderRadius: 12, padding: 16, marginHorizontal: 20, marginBottom: 40, borderWidth: 1, borderColor: '#374151' },
  logoutText: { color: '#EF4444', fontSize: 16, fontWeight: '600', marginLeft: 8 },
});
