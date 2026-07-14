import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  FlatList, ActivityIndicator, RefreshControl, TextInput,
  KeyboardAvoidingView, Platform, Modal, Image,
} from 'react-native';
import { postsAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import ThemedScreen from '../../components/ThemedScreen';

export default function FeedScreen({ navigation }: any) {
  const { theme } = useTheme();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [commentModal, setCommentModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');

  useEffect(() => { loadFeed(); }, []);

  const loadFeed = async () => {
    try {
      const response = await postsAPI.getFeed();
      setPosts(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const toggleLike = async (postId: string) => {
    try {
      const response = await postsAPI.toggleLike(postId);
      setPosts((prev: any) => prev.map((p: any) => p.id === postId ? response.data : p));
    } catch (error) {
      console.error(error);
    }
  };

  const openComments = async (post: any) => {
    setSelectedPost(post);
    setCommentModal(true);
    try {
      const response = await postsAPI.getComments(post.id);
      setComments(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const submitComment = async () => {
    if (!commentText.trim()) return;
    try {
      await postsAPI.addComment(selectedPost.id, { content: commentText });
      setCommentText('');
      const response = await postsAPI.getComments(selectedPost.id);
      setComments(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const renderPost = ({ item }: any) => (
    <View style={[styles.postCard, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
      {/* Post Header */}
      <TouchableOpacity
        style={styles.postHeader}
        onPress={() => navigation.navigate('ShopProfile', { shopId: item.shopId })}
      >
        <View style={[styles.avatar, { backgroundColor: theme.surfaceSecondary }]}>
          <Text style={styles.avatarText}>
            {item.shopCategory === 'BARBERSHOP' ? '✂️' :
             item.shopCategory === 'SALON' ? '💇' :
             item.shopCategory === 'SPA' ? '🧖' : '💅'}
          </Text>
        </View>
        <View>
          <Text style={[styles.shopName, { color: theme.text }]}>{item.shopName}</Text>
          <Text style={[styles.postTime, { color: theme.textTertiary }]}>
            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Post Image */}
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.postImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.postImagePlaceholder, { backgroundColor: theme.surfaceSecondary }]}>
          <Text style={styles.postImageText}>🖼️</Text>
          <Text style={[styles.postImageSubtext, { color: theme.textTertiary }]}>
            Photo by {item.shopName}
          </Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => toggleLike(item.id)}>
          <Text style={styles.actionBtnText}>
            {item.likedByMe ? '❤️' : '🤍'} {item.likeCount}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => openComments(item)}>
          <Text style={styles.actionBtnText}>💬 {item.commentCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bookBtn, { backgroundColor: theme.accent }]}
          onPress={() => navigation.navigate('ShopProfile', { shopId: item.shopId })}
        >
          <Text style={styles.bookBtnText}>Book Now</Text>
        </TouchableOpacity>
      </View>

      {/* Caption */}
      {item.caption && (
        <View style={styles.captionRow}>
          <Text style={[styles.captionShop, { color: theme.text }]}>{item.shopName} </Text>
          <Text style={[styles.caption, { color: theme.textSecondary }]}>{item.caption}</Text>
        </View>
      )}

      {/* Recent Comments */}
      {item.recentComments?.map((comment: any) => (
        <View key={comment.id} style={styles.commentRow}>
          <Text style={[styles.commentUser, { color: theme.text }]}>{comment.userName} </Text>
          <Text style={[styles.commentText, { color: theme.textSecondary }]}>{comment.content}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <ThemedScreen>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>
          STYLE<Text style={{ color: theme.accent }}>FEED</Text>
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color={theme.accent} size="large" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item: any) => item.id}
          renderItem={renderPost}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadFeed(); }}
              tintColor={theme.accent}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: theme.text }]}>No posts yet</Text>
              <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                Shops will post their work here
              </Text>
            </View>
          }
        />
      )}

      {/* Comments Modal */}
      <Modal visible={commentModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Comments</Text>
              <TouchableOpacity onPress={() => setCommentModal(false)}>
                <Text style={[styles.modalClose, { color: theme.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={comments}
              keyExtractor={(item: any) => item.id}
              style={styles.commentsList}
              renderItem={({ item }: any) => (
                <View style={[styles.commentItem, { borderBottomColor: theme.border }]}>
                  <Text style={[styles.commentItemUser, { color: theme.text }]}>{item.userName}</Text>
                  <Text style={[styles.commentItemText, { color: theme.textSecondary }]}>{item.content}</Text>
                  <Text style={[styles.commentItemTime, { color: theme.textTertiary }]}>
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                  </Text>
                </View>
              )}
              ListEmptyComponent={
                <Text style={[styles.noComments, { color: theme.textTertiary }]}>
                  No comments yet. Be the first!
                </Text>
              }
            />

            <View style={[styles.commentInputRow, { borderTopColor: theme.border }]}>
              <TextInput
                style={[styles.commentInput, { backgroundColor: theme.background, color: theme.text }]}
                placeholder="Add a comment..."
                placeholderTextColor={theme.textTertiary}
                value={commentText}
                onChangeText={setCommentText}
              />
              <TouchableOpacity
                style={[styles.sendBtn, { backgroundColor: theme.accent }]}
                onPress={submitComment}
              >
                <Text style={styles.sendBtnText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ThemedScreen>
  );
}

const styles = StyleSheet.create({
  header: { padding: 20, paddingTop: 16, paddingBottom: 8, borderBottomWidth: 1 },
  title: { fontSize: 24, fontWeight: '900', letterSpacing: 2 },
  postCard: { borderBottomWidth: 1, marginBottom: 4 },
  postHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 20 },
  shopName: { fontWeight: '700', fontSize: 14 },
  postTime: { fontSize: 12 },
  postImage: { width: '100%', aspectRatio: 1 },
  postImagePlaceholder: {
    width: '100%', aspectRatio: 1,
    justifyContent: 'center', alignItems: 'center',
  },
  postImageText: { fontSize: 64 },
  postImageSubtext: { fontSize: 12, marginTop: 8 },
  postActions: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 16 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionBtnText: { fontSize: 15 },
  bookBtn: { marginLeft: 'auto', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6 },
  bookBtnText: { color: '#000', fontWeight: '700', fontSize: 13 },
  captionRow: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 8, flexWrap: 'wrap' },
  captionShop: { fontWeight: '700', fontSize: 13 },
  caption: { fontSize: 13 },
  commentRow: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 4, flexWrap: 'wrap' },
  commentUser: { fontWeight: '700', fontSize: 12 },
  commentText: { fontSize: 12 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 18, fontWeight: '700' },
  emptySubtext: { fontSize: 14, marginTop: 8 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalClose: { fontSize: 18 },
  commentsList: { maxHeight: 400, paddingHorizontal: 20 },
  commentItem: { paddingVertical: 12, borderBottomWidth: 1 },
  commentItemUser: { fontWeight: '700', fontSize: 13 },
  commentItemText: { fontSize: 13, marginTop: 2 },
  commentItemTime: { fontSize: 11, marginTop: 4 },
  noComments: { textAlign: 'center', paddingVertical: 32 },
  commentInputRow: { flexDirection: 'row', padding: 16, gap: 8, borderTopWidth: 1 },
  commentInput: { flex: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14 },
  sendBtn: { borderRadius: 20, paddingHorizontal: 16, justifyContent: 'center' },
  sendBtnText: { color: '#000', fontWeight: '700' },
});