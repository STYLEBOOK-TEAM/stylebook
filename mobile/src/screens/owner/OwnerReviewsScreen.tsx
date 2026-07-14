import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  FlatList, ActivityIndicator, RefreshControl, TextInput,
  Alert, Modal,
} from 'react-native';
import { reviewsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import ThemedScreen from '../../components/ThemedScreen';

export default function OwnerReviewsScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [reviews, setReviews] = useState([]);
  const [breakdown, setBreakdown] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [replyModal, setReplyModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => { loadReviews(); }, []);

  const loadReviews = async () => {
    try {
      const [reviewsRes, breakdownRes] = await Promise.all([
        reviewsAPI.getByShop(user?.shopId || ''),
        reviewsAPI.getBreakdown(user?.shopId || ''),
      ]);
      setReviews(reviewsRes.data);
      setBreakdown(breakdownRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const deleteReply = (review: any) => {
    Alert.alert('Delete Reply', 'Delete your reply to this review?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await reviewsAPI.deleteReply(review.id);
            loadReviews();
          } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to delete reply');
          }
        },
      },
    ]);
  };

  const submitReply = async () => {
    if (!replyText.trim()) {
      Alert.alert('Error', 'Please write a reply');
      return;
    }
    try {
      await reviewsAPI.addReply(selectedReview.id, { reply: replyText });
      setReplyModal(false);
      setReplyText('');
      loadReviews();
      Alert.alert('Success', 'Reply posted!');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to post reply');
    }
  };

  const renderReview = ({ item }: any) => (
    <View style={[styles.reviewCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerInfo}>
          <Text style={[styles.reviewerName, { color: theme.text }]}>{item.customerName}</Text>
          <Text style={[styles.reviewDate, { color: theme.textTertiary }]}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <Text style={styles.rating}>{'⭐'.repeat(item.rating)}</Text>
      </View>

      {item.comment && (
        <Text style={[styles.reviewComment, { color: theme.textSecondary }]}>{item.comment}</Text>
      )}

      {item.ownerReply ? (
        <View style={[styles.ownerReply, { backgroundColor: theme.background }]}>
          <Text style={[styles.ownerReplyLabel, { color: theme.accent }]}>Your Reply</Text>
          <Text style={[styles.ownerReplyText, { color: theme.textSecondary }]}>{item.ownerReply}</Text>
          <View style={styles.replyActions}>
            <TouchableOpacity onPress={() => {
              setSelectedReview(item);
              setReplyText(item.ownerReply);
              setReplyModal(true);
            }}>
              <Text style={[styles.replyActionText, { color: theme.accent }]}>✎ Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteReply(item)}>
              <Text style={[styles.replyActionText, { color: '#f44336' }]}>🗑 Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.replyBtn, { backgroundColor: theme.accentLight, borderColor: theme.accent }]}
          onPress={() => { setSelectedReview(item); setReplyModal(true); }}
        >
          <Text style={[styles.replyBtnText, { color: theme.accent }]}>Reply to Review</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ThemedScreen>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Customer Reviews</Text>
      </View>

      {breakdown && (
        <View style={[styles.breakdownCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.avgRating, { color: theme.accent }]}>
            {breakdown.averageRating?.toFixed(1) || '0.0'}
          </Text>
          <Text style={[styles.totalReviews, { color: theme.textSecondary }]}>
            {breakdown.totalReviews} reviews
          </Text>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = breakdown[`${['', 'one', 'two', 'three', 'four', 'five'][star]}Star`] || 0;
            const pct = breakdown.totalReviews > 0 ? (count / breakdown.totalReviews) * 100 : 0;
            return (
              <View key={star} style={styles.starRow}>
                <Text style={[styles.starLabel, { color: theme.textSecondary }]}>{star}⭐</Text>
                <View style={[styles.starBar, { backgroundColor: theme.surfaceSecondary }]}>
                  <View style={[styles.starFill, { width: `${pct}%`, backgroundColor: theme.accent }]} />
                </View>
                <Text style={[styles.starCount, { color: theme.textSecondary }]}>{count}</Text>
              </View>
            );
          })}
        </View>
      )}

      {loading ? (
        <ActivityIndicator color={theme.accent} size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item: any) => item.id}
          renderItem={renderReview}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadReviews(); }}
              tintColor={theme.accent} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>⭐</Text>
              <Text style={[styles.emptyText, { color: theme.text }]}>No reviews yet</Text>
              <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                Reviews from customers will appear here
              </Text>
            </View>
          }
        />
      )}

      <Modal visible={replyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Reply to Review</Text>
            {selectedReview && (
              <View style={[styles.selectedReview, { backgroundColor: theme.background }]}>
                <Text style={[styles.selectedReviewUser, { color: theme.accent }]}>
                  {selectedReview.customerName}
                </Text>
                <Text style={[styles.selectedReviewText, { color: theme.textSecondary }]}>
                  {selectedReview.comment}
                </Text>
              </View>
            )}
            <TextInput
              style={[styles.replyInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              placeholder="Write your reply..."
              placeholderTextColor={theme.textTertiary}
              value={replyText}
              onChangeText={setReplyText}
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { backgroundColor: theme.background, borderColor: theme.border }]}
                onPress={() => { setReplyModal(false); setReplyText(''); }}
              >
                <Text style={[styles.modalCancelBtnText, { color: theme.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, { backgroundColor: theme.accent }]}
                onPress={submitReply}
              >
                <Text style={styles.modalConfirmBtnText}>Post Reply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedScreen>
  );
}

const styles = StyleSheet.create({
  header: { padding: 20, paddingTop: 16 },
  title: { fontSize: 24, fontWeight: '900' },
  breakdownCard: { borderRadius: 16, padding: 16, marginHorizontal: 20, marginBottom: 16 },
  avgRating: { fontSize: 48, fontWeight: '900', textAlign: 'center' },
  totalReviews: { textAlign: 'center', marginBottom: 12 },
  starRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  starLabel: { width: 40, fontSize: 12 },
  starBar: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  starFill: { height: '100%', borderRadius: 3 },
  starCount: { width: 24, fontSize: 12, textAlign: 'right' },
  list: { padding: 20 },
  reviewCard: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  reviewerInfo: { flex: 1 },
  reviewerName: { fontWeight: '700', fontSize: 14 },
  reviewDate: { fontSize: 12, marginTop: 2 },
  rating: { fontSize: 13 },
  reviewComment: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  ownerReply: { borderRadius: 8, padding: 12 },
  ownerReplyLabel: { fontSize: 12, fontWeight: '700', marginBottom: 4 },
  ownerReplyText: { fontSize: 13 },
  replyActions: { flexDirection: 'row', gap: 20, marginTop: 8 },
  replyActionText: { fontSize: 12, fontWeight: '600' },
  replyBtn: { borderRadius: 8, padding: 10, alignItems: 'center', borderWidth: 1 },
  replyBtnText: { fontSize: 13, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: '700' },
  emptySubtext: { fontSize: 14, marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: '#000a', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  selectedReview: { borderRadius: 8, padding: 12, marginBottom: 16 },
  selectedReviewUser: { fontWeight: '700', marginBottom: 4 },
  selectedReviewText: { fontSize: 13 },
  replyInput: {
    borderRadius: 12, padding: 14, fontSize: 14,
    borderWidth: 1, minHeight: 100, textAlignVertical: 'top', marginBottom: 16,
  },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalCancelBtn: { flex: 1, borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1 },
  modalCancelBtnText: { fontWeight: '600' },
  modalConfirmBtn: { flex: 1, borderRadius: 12, padding: 16, alignItems: 'center' },
  modalConfirmBtnText: { color: '#000', fontWeight: '700' },
});