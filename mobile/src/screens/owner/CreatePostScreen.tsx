import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  TextInput, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { postsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import ThemedScreen from '../../components/ThemedScreen';

export default function CreatePostScreen({ navigation }: any) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [caption, setCaption] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'post.jpg',
        } as any);
        const response = await postsAPI.uploadImage(formData);
        setImageUrl(response.data);
      } catch (error) {
        Alert.alert('Error', 'Failed to upload image');
        setImageUri('');
      } finally {
        setUploading(false);
      }
    }
  };

  const createPost = async () => {
    if (!imageUrl) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }
    setPosting(true);
    try {
      await postsAPI.create({ caption, imageUrl });
      setCaption('');
      setImageUri('');
      setImageUrl('');
      Alert.alert('Posted!', 'Your post is now live in the feed', [
        { text: 'OK', onPress: () => navigation.navigate('Dashboard') },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to create post');
    } finally {
      setPosting(false);
    }
  };

  return (
    <ThemedScreen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: theme.text }]}>Create Post</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Share your work with the StyleBook community
        </Text>

        {/* Image Picker */}
        <TouchableOpacity
          style={[styles.imagePicker, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={pickImage}
        >
          {uploading ? (
            <ActivityIndicator color={theme.accent} size="large" />
          ) : imageUri ? (
            <View style={styles.imagePreview}>
              <Text style={styles.imagePreviewEmoji}>🖼️</Text>
              <Text style={[styles.imagePreviewText, { color: '#4CAF50' }]}>
                Image selected ✓
              </Text>
              <Text style={[styles.changeText, { color: theme.textSecondary }]}>
                Tap to change
              </Text>
            </View>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderEmoji}>📷</Text>
              <Text style={[styles.imagePlaceholderText, { color: theme.text }]}>
                Tap to select photo
              </Text>
              <Text style={[styles.imagePlaceholderSub, { color: theme.textTertiary }]}>
                Square images work best
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Caption */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>Caption</Text>
        <TextInput
          style={[styles.captionInput, {
            backgroundColor: theme.surface,
            color: theme.text,
            borderColor: theme.border,
          }]}
          placeholder="Write a caption for your post..."
          placeholderTextColor={theme.textTertiary}
          value={caption}
          onChangeText={setCaption}
          multiline
          numberOfLines={4}
          maxLength={2000}
        />
        <Text style={[styles.charCount, { color: theme.textTertiary }]}>
          {caption.length}/2000
        </Text>

        {/* Plan Notice */}
        <View style={[styles.planNotice, {
          backgroundColor: theme.accentLight,
          borderColor: theme.border,
        }]}>
          <Text style={[styles.planNoticeText, { color: theme.accent }]}>
            📊 Free plan: 5 posts maximum. Upgrade to Pro for unlimited posts.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.postBtn, {
            backgroundColor: (!imageUrl || posting) ? theme.surfaceSecondary : theme.accent,
          }]}
          onPress={createPost}
          disabled={!imageUrl || posting}
        >
          {posting ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={[styles.postBtnText, {
              color: (!imageUrl || posting) ? theme.textTertiary : '#000',
            }]}>
              Share Post
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ThemedScreen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20 },
  title: { fontSize: 28, fontWeight: '900', marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 24 },
  imagePicker: {
    width: '100%', aspectRatio: 1, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderStyle: 'dashed', marginBottom: 20,
  },
  imagePreview: { alignItems: 'center' },
  imagePreviewEmoji: { fontSize: 64, marginBottom: 8 },
  imagePreviewText: { fontSize: 16, fontWeight: '700' },
  changeText: { fontSize: 13, marginTop: 4 },
  imagePlaceholder: { alignItems: 'center' },
  imagePlaceholderEmoji: { fontSize: 64, marginBottom: 12 },
  imagePlaceholderText: { fontSize: 16, fontWeight: '600' },
  imagePlaceholderSub: { fontSize: 13, marginTop: 4 },
  label: { fontSize: 13, marginBottom: 8 },
  captionInput: {
    borderRadius: 12, padding: 14, fontSize: 15,
    borderWidth: 1, minHeight: 100, textAlignVertical: 'top',
  },
  charCount: { fontSize: 12, textAlign: 'right', marginTop: 4, marginBottom: 16 },
  planNotice: { borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1 },
  planNoticeText: { fontSize: 13 },
  postBtn: { borderRadius: 12, padding: 18, alignItems: 'center' },
  postBtnText: { fontSize: 16, fontWeight: '700' },
});