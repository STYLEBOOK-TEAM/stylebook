import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import ThemedScreen from '../../components/ThemedScreen';

export default function CustomerProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme, theme } = useTheme();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ThemedScreen>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: theme.surface }]}>
          <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
            <Text style={styles.avatarText}>
              {user?.fullName?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.name, { color: theme.text }]}>{user?.fullName}</Text>
          <Text style={[styles.email, { color: theme.textSecondary }]}>{user?.email}</Text>
          <Text style={[styles.phone, { color: theme.textSecondary }]}>{user?.phone}</Text>
        </View>

        {/* Menu Items */}
        <View style={[styles.menu, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: theme.border }]}
            onPress={() => navigation.navigate('Bookings')}
          >
            <Ionicons name="calendar-outline" size={20} color={theme.accent} style={styles.menuIcon} />
            <Text style={[styles.menuText, { color: theme.text }]}>My Bookings</Text>
            <Text style={[styles.menuArrow, { color: theme.textTertiary }]}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: theme.border }]}
            onPress={() => navigation.navigate('SavedShops')}
          >
            <Ionicons name="heart-outline" size={20} color={theme.accent} style={styles.menuIcon} />
            <Text style={[styles.menuText, { color: theme.text }]}>Saved Shops</Text>
            <Text style={[styles.menuArrow, { color: theme.textTertiary }]}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: theme.border }]}
            onPress={() => navigation.navigate('MyReviews')}
          >
            <Ionicons name="star-outline" size={20} color={theme.accent} style={styles.menuIcon} />
            <Text style={[styles.menuText, { color: theme.text }]}>My Reviews</Text>
            <Text style={[styles.menuArrow, { color: theme.textTertiary }]}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: theme.border }]}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={20} color={theme.accent} style={styles.menuIcon} />
            <Text style={[styles.menuText, { color: theme.text }]}>Settings</Text>
            <Text style={[styles.menuArrow, { color: theme.textTertiary }]}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Quick theme toggle */}
        <View style={styles.section}>
          <View style={[styles.settingItem, { backgroundColor: theme.surface }]}>
            <Text style={[styles.settingText, { color: theme.text }]}>
              {isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#ddd', true: theme.accent }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: theme.surface }]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutBtnText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </ThemedScreen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20 },
  profileHeader: {
    alignItems: 'center', paddingVertical: 32,
    borderRadius: 20, marginBottom: 20,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '900' },
  name: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  email: { fontSize: 14, marginBottom: 2 },
  phone: { fontSize: 14 },
  menu: {
    borderRadius: 16, marginBottom: 24,
    overflow: 'hidden', borderWidth: 1,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    borderBottomWidth: 1,
  },
  menuIcon: { fontSize: 20, marginRight: 12 },
  menuText: { flex: 1, fontSize: 15, fontWeight: '600' },
  menuArrow: { fontSize: 16 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 13, marginBottom: 12,
    textTransform: 'uppercase', letterSpacing: 1,
  },
  settingItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, marginBottom: 2, borderRadius: 8,
  },
  settingText: { fontSize: 15 },
  settingValue: { fontSize: 14 },
  logoutBtn: {
    borderRadius: 12, padding: 18,
    alignItems: 'center', borderWidth: 1, borderColor: '#f44336',
  },
  logoutBtnText: { color: '#f44336', fontSize: 16, fontWeight: '700' },
});