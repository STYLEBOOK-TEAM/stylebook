import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { queueAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import ThemedScreen from '../../components/ThemedScreen';

export default function OwnerQueueScreen() {
  const { theme } = useTheme();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const response = await queueAPI.getShopQueue();
      setEntries(response.data);
    } catch (error) {
      // ignore polling errors
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  const callCustomer = async (entryId: string) => {
    try {
      await queueAPI.call(entryId);
      load();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to call customer');
    }
  };

  const completeCustomer = async (entryId: string) => {
    try {
      await queueAPI.complete(entryId);
      load();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to complete');
    }
  };

  const removeCustomer = (entry: any) => {
    Alert.alert('Remove from Queue', `Remove ${entry.customerName} from the queue?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          try {
            await queueAPI.remove(entry.id);
            load();
          } catch (error) {
            Alert.alert('Error', 'Failed to remove');
          }
        },
      },
    ]);
  };

  const waiting = entries.filter(e => e.status === 'WAITING');
  const inService = entries.filter(e => e.status === 'IN_SERVICE');
  const totalWait = waiting.reduce((sum, e) => sum + (e.durationMinutes || 30), 0);

  const joinedTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.accent} size="large" />
      </View>
    );
  }

  return (
    <ThemedScreen>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Walk-in Queue</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.statNumber, { color: theme.accent }]}>{waiting.length}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Waiting</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.statNumber, { color: theme.accent }]}>{inService.length}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>In Service</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.statNumber, { color: theme.accent }]}>~{totalWait}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Min Total</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={theme.accent} />}
      >
        {entries.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🪑</Text>
            <Text style={[styles.emptyText, { color: theme.text }]}>Queue is empty</Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
              Walk-in customers who join the queue will appear here
            </Text>
          </View>
        ) : (
          <>
            {inService.map((entry) => (
              <View key={entry.id} style={[styles.entryCard, { backgroundColor: theme.surface, borderColor: theme.accent, borderWidth: 1.5 }]}>
                <View style={[styles.positionBadge, { backgroundColor: theme.accent }]}>
                  <Text style={styles.positionBadgeText}>💈</Text>
                </View>
                <View style={styles.entryInfo}>
                  <Text style={[styles.entryName, { color: theme.text }]}>{entry.customerName}</Text>
                  <Text style={[styles.entryMeta, { color: theme.textSecondary }]}>
                    {entry.serviceName || 'No service picked'} • In service
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#2E7D32' }]}
                  onPress={() => completeCustomer(entry.id)}
                >
                  <Text style={styles.actionBtnText}>✓ Done</Text>
                </TouchableOpacity>
              </View>
            ))}

            {waiting.map((entry, index) => (
              <View key={entry.id} style={[styles.entryCard, { backgroundColor: theme.surface }]}>
                <View style={[styles.positionBadge, { backgroundColor: theme.surfaceSecondary }]}>
                  <Text style={[styles.positionNumber, { color: theme.accent }]}>{index + 1}</Text>
                </View>
                <View style={styles.entryInfo}>
                  <Text style={[styles.entryName, { color: theme.text }]}>{entry.customerName}</Text>
                  <Text style={[styles.entryMeta, { color: theme.textSecondary }]}>
                    {entry.serviceName || 'No service picked'}
                    {entry.durationMinutes ? ` • ${entry.durationMinutes} min` : ''} • joined {joinedTime(entry.joinedAt)}
                  </Text>
                </View>
                <View style={styles.entryActions}>
                  {index === 0 && (
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: theme.accent }]}
                      onPress={() => callCustomer(entry.id)}
                    >
                      <Text style={styles.actionBtnText}>📣 Call</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => removeCustomer(entry)}>
                    <Text style={styles.removeBtn}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </ThemedScreen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, paddingTop: 16 },
  title: { fontSize: 24, fontWeight: '900' },
  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 12 },
  statCard: { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center' },
  statNumber: { fontSize: 22, fontWeight: '900' },
  statLabel: { fontSize: 11, marginTop: 2 },
  scroll: { padding: 20, paddingTop: 8 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: '700' },
  emptySubtext: { fontSize: 13, marginTop: 8, textAlign: 'center', paddingHorizontal: 32 },
  entryCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 12, padding: 14, marginBottom: 8, gap: 12,
  },
  positionBadge: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  positionBadgeText: { fontSize: 16 },
  positionNumber: { fontSize: 16, fontWeight: '800' },
  entryInfo: { flex: 1 },
  entryName: { fontSize: 15, fontWeight: '700' },
  entryMeta: { fontSize: 12, marginTop: 2 },
  entryActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  actionBtn: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  actionBtnText: { color: '#000', fontSize: 12, fontWeight: '700' },
  removeBtn: { color: '#f44336', fontSize: 18, padding: 4 },
});