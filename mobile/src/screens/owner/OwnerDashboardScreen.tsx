import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { shopsAPI, bookingsAPI, postsAPI, reviewsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import ThemedScreen from '../../components/ThemedScreen';

export default function OwnerDashboardScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [shop, setShop] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    try {
      const [shopRes, bookingsRes, postsRes, reviewsRes] = await Promise.all([
        shopsAPI.getMyShop(),
        bookingsAPI.getShopUpcoming(),
        postsAPI.getByShop(user?.shopId || ''),
        reviewsAPI.getByShop(user?.shopId || ''),
      ]);
      setShop(shopRes.data);
      setBookings(bookingsRes.data);
      setPosts(postsRes.data);
      setReviews(reviewsRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const deletePost = (postId: string) => {
    Alert.alert('Delete Post', 'Delete this post permanently?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await postsAPI.delete(postId);
            loadDashboard();
          } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to delete post');
          }
        },
      },
    ]);
  };

  const pendingBookings = bookings.filter((b) => b.status === 'PENDING');
  const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED');

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.accent} size="large" />
      </View>
    );
  }

  return (
    <ThemedScreen>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadDashboard(); }} tintColor={theme.accent} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.shopName, { color: theme.text }]}>{shop?.name}</Text>
            <View style={[styles.planBadge, { backgroundColor: shop?.plan === 'PRO' ? theme.accent : theme.surfaceSecondary }]}>
              <Text style={[styles.planBadgeText, { color: shop?.plan === 'PRO' ? '#000' : theme.textSecondary }]}>
                {shop?.plan} Plan
              </Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.settingsBtn, { backgroundColor: theme.surfaceSecondary }]}
              onPress={() => navigation.navigate('OwnerSettings')}
            >
              <Text style={styles.settingsBtnText}>⚙️</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout}>
              <Text style={styles.logoutBtn}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pending Alert */}
        {pendingBookings.length > 0 && (
          <TouchableOpacity
            style={[styles.pendingAlert, { backgroundColor: theme.accentLight, borderColor: theme.accent }]}
            onPress={() => navigation.navigate('OwnerBookings')}
          >
            <Text style={[styles.pendingAlertText, { color: theme.accent }]}>
              ⚠️ {pendingBookings.length} pending booking{pendingBookings.length > 1 ? 's' : ''} — auto-confirms in 45 seconds
            </Text>
          </TouchableOpacity>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { number: bookings.length, label: 'Total Bookings' },
            { number: confirmedBookings.length, label: 'Confirmed' },
            { number: posts.length, label: 'Posts' },
            { number: reviews.length, label: 'Reviews' },
          ].map((stat) => (
            <View key={stat.label} style={[styles.statCard, { backgroundColor: theme.surface }]}>
              <Text style={[styles.statNumber, { color: theme.accent }]}>{stat.number}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {[
              { emoji: '📅', label: 'Bookings', screen: 'OwnerBookings' },
              { emoji: '🏪', label: 'My Shop', screen: 'OwnerProfile' },
              { emoji: '➕', label: 'Create Post', screen: 'CreatePost' },
              { emoji: '⭐', label: 'Reviews', screen: 'OwnerReviews' },
            ].map((action) => (
              <TouchableOpacity
                key={action.label}
                style={[styles.actionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => navigation.navigate(action.screen)}
              >
                <Text style={styles.actionEmoji}>{action.emoji}</Text>
                <Text style={[styles.actionText, { color: theme.text }]}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* My Posts */}
        {posts.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>My Posts</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {posts.slice(0, 5).map((post: any) => (
                <View key={post.id} style={[styles.postThumb, { backgroundColor: theme.surface }]}>
                  <TouchableOpacity style={styles.postDeleteBtn} onPress={() => deletePost(post.id)}>
                    <Text style={styles.postDeleteText}>✕</Text>
                  </TouchableOpacity>
                  <Text style={styles.postThumbEmoji}>🖼️</Text>
                  <Text style={[styles.postThumbLikes, { color: theme.textSecondary }]}>❤️ {post.likeCount}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Recent Reviews */}
        {reviews.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Reviews</Text>
              <TouchableOpacity onPress={() => navigation.navigate('OwnerReviews')}>
                <Text style={[styles.seeAll, { color: theme.accent }]}>See All</Text>
              </TouchableOpacity>
            </View>
            {reviews.slice(0, 2).map((review: any) => (
              <View key={review.id} style={[styles.reviewCard, { backgroundColor: theme.surface }]}>
                <View style={styles.reviewHeader}>
                  <Text style={[styles.reviewerName, { color: theme.text }]}>{review.customerName}</Text>
                  <Text style={styles.reviewRating}>{'⭐'.repeat(review.rating)}</Text>
                </View>
                <Text style={[styles.reviewComment, { color: theme.textSecondary }]}>{review.comment}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Recent Bookings */}
        {bookings.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Bookings</Text>
              <TouchableOpacity onPress={() => navigation.navigate('OwnerBookings')}>
                <Text style={[styles.seeAll, { color: theme.accent }]}>See All</Text>
              </TouchableOpacity>
            </View>
            {bookings.slice(0, 3).map((booking: any) => (
              <View key={booking.id} style={[styles.bookingCard, { backgroundColor: theme.surface }]}>
                <View style={styles.bookingInfo}>
                  <Text style={[styles.bookingCustomer, { color: theme.text }]}>{booking.customerName}</Text>
                  <Text style={[styles.bookingService, { color: theme.accent }]}>{booking.serviceName}</Text>
                  <Text style={[styles.bookingTime, { color: theme.textSecondary }]}>
                    {booking.bookingDate} at {booking.bookingTime}
                  </Text>
                </View>
                <View style={[styles.statusBadge, {
                  backgroundColor: booking.status === 'CONFIRMED' ? '#4CAF5022' : '#FF980022'
                }]}>
                  <Text style={[styles.statusText, {
                    color: booking.status === 'CONFIRMED' ? '#4CAF50' : '#FF9800'
                  }]}>{booking.status}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedScreen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 20, paddingTop: 16 },
  shopName: { fontSize: 22, fontWeight: '900', marginBottom: 6 },
  planBadge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  planBadgeText: { fontSize: 12, fontWeight: '700' },
  logoutBtn: { color: '#f44336', fontSize: 14, fontWeight: '600' },
  headerActions: { alignItems: 'flex-end', gap: 10 },
  settingsBtn: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  settingsBtnText: { fontSize: 16 },
  pendingAlert: { borderRadius: 12, margin: 20, marginTop: 0, padding: 14, borderWidth: 1 },
  pendingAlertText: { fontSize: 13, fontWeight: '600' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 8 },
  statCard: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '900' },
  statLabel: { fontSize: 11, marginTop: 2, textAlign: 'center' },
  section: { padding: 20, paddingTop: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  seeAll: { fontSize: 13 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionCard: {
    width: '48%', borderRadius: 12, padding: 20,
    alignItems: 'center', borderWidth: 1,
  },
  actionEmoji: { fontSize: 32, marginBottom: 8 },
  actionText: { fontSize: 13, fontWeight: '600' },
  postThumb: {
    width: 100, height: 100, borderRadius: 12,
    marginRight: 8, justifyContent: 'center', alignItems: 'center',
  },
  postThumbEmoji: { fontSize: 36 },
  postThumbLikes: { fontSize: 12, marginTop: 4 },
  postDeleteBtn: {
    position: 'absolute', top: 4, right: 4, zIndex: 1,
    backgroundColor: '#000a', borderRadius: 10,
    width: 20, height: 20, justifyContent: 'center', alignItems: 'center',
  },
  postDeleteText: { color: '#f44336', fontSize: 12, fontWeight: '700' },
  reviewCard: { borderRadius: 12, padding: 14, marginBottom: 8 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  reviewerName: { fontWeight: '700' },
  reviewRating: { fontSize: 12 },
  reviewComment: { fontSize: 13 },
  bookingCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 12, padding: 14, marginBottom: 8 },
  bookingInfo: { flex: 1 },
  bookingCustomer: { fontWeight: '700', fontSize: 14 },
  bookingService: { fontSize: 13, marginTop: 2 },
  bookingTime: { fontSize: 12, marginTop: 2 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
});