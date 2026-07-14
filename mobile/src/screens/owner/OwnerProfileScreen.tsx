import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, Alert, ActivityIndicator, Modal, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { shopsAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import ThemedScreen from '../../components/ThemedScreen';

const CATEGORIES = [
  { id: 'SALON', label: 'Salon' },
  { id: 'BARBERSHOP', label: 'Barbershop' },
  { id: 'SPA', label: 'Spa' },
  { id: 'NAILS', label: 'Nails' },
];
const CITIES = ['Accra', 'Kumasi', 'Takoradi', 'Tema', 'Cape Coast', 'Tamale'];

export default function OwnerProfileScreen({ navigation }: any) {
  const { theme } = useTheme();
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingLocation, setSettingLocation] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', city: '',
    googleMapsLink: '', locationDescription: '', category: 'SALON',
  });
  const [newService, setNewService] = useState({ name: '', price: '', durationMinutes: '' });
  const [editModal, setEditModal] = useState(false);
  const [editService, setEditService] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: '', price: '', durationMinutes: '' });

  useEffect(() => { loadShop(); }, []);

  const loadShop = async () => {
    try {
      const response = await shopsAPI.getMyShop();
      const s = response.data;
      setShop(s);
      setForm({
        name: s.name || '',
        description: s.description || '',
        city: (s.city || '').trim(),
        googleMapsLink: s.googleMapsLink || '',
        locationDescription: s.locationDescription || '',
        category: s.category || 'SALON',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to load shop');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await shopsAPI.update(form);
      Alert.alert('Saved', 'Shop profile updated!');
      loadShop();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const setShopLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow location access so customers can find your shop with "Near me".');
      return;
    }
    setSettingLocation(true);
    try {
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      await shopsAPI.update({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      Alert.alert('Location Saved', 'Customers can now find your shop with "Near me" search!');
      loadShop();
    } catch (error) {
      Alert.alert('Error', 'Could not get your location. Make sure GPS is on and try again.');
    } finally {
      setSettingLocation(false);
    }
  };

  const pickCoverPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) {
      const formData = new FormData();
      formData.append('file', {
        uri: result.assets[0].uri,
        type: 'image/jpeg',
        name: 'cover.jpg',
      } as any);
      try {
        await shopsAPI.uploadCover(formData);
        loadShop();
        Alert.alert('Success', 'Cover photo updated!');
      } catch (error) {
        Alert.alert('Error', 'Failed to upload photo');
      }
    }
  };

  const addGalleryPhoto = async () => {
    if (shop?.plan === 'FREE' && (shop?.photoUrls?.length || 0) >= 3) {
      Alert.alert('Limit Reached', 'Free plan allows 3 gallery photos. Upgrade to Pro for unlimited.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      const formData = new FormData();
      formData.append('file', {
        uri: result.assets[0].uri,
        type: 'image/jpeg',
        name: 'gallery.jpg',
      } as any);
      try {
        await shopsAPI.addGalleryPhoto(formData);
        loadShop();
        Alert.alert('Success', 'Photo added!');
      } catch (error) {
        Alert.alert('Error', 'Failed to upload photo');
      }
    }
  };

  const deleteGalleryPhoto = (photoId: string) => {
    Alert.alert('Delete Photo', 'Remove this photo from your gallery?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await shopsAPI.deleteGalleryPhoto(photoId);
            loadShop();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete photo');
          }
        },
      },
    ]);
  };

  const addService = async () => {
    if (!newService.name || !newService.price || !newService.durationMinutes) {
      Alert.alert('Error', 'Please fill in all service fields');
      return;
    }
    try {
      await shopsAPI.addService({
        name: newService.name,
        price: parseFloat(newService.price),
        durationMinutes: parseInt(newService.durationMinutes),
      });
      setNewService({ name: '', price: '', durationMinutes: '' });
      loadShop();
      Alert.alert('Success', 'Service added!');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to add service');
    }
  };

  const saveEditedService = async () => {
    if (!editForm.name || !editForm.price || !editForm.durationMinutes) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      await shopsAPI.updateService(editService.id, {
        name: editForm.name,
        price: parseFloat(editForm.price),
        durationMinutes: parseInt(editForm.durationMinutes),
      });
      setEditModal(false);
      loadShop();
      Alert.alert('Success', 'Service updated!');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update service');
    }
  };

  const removeService = async (serviceId: string) => {
    Alert.alert('Remove Service', 'Remove this service?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          try {
            await shopsAPI.removeService(serviceId);
            loadShop();
          } catch (error) {
            Alert.alert('Error', 'Failed to remove service');
          }
        },
      },
    ]);
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
        <Text style={[styles.title, { color: theme.text }]}>Profile & Services</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Cover photo */}
        <Text style={[styles.h2, { color: theme.text }]}>Cover Photo</Text>
        {shop?.coverImageUrl ? (
          <Image source={{ uri: shop.coverImageUrl }} style={[styles.coverImage, { backgroundColor: theme.surfaceSecondary }]} />
        ) : (
          <View style={[styles.coverImage, styles.coverPlaceholder, { backgroundColor: theme.surfaceSecondary }]}>
            <Text style={{ fontSize: 40 }}>🏪</Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.uploadBtn, { borderColor: theme.accent }]}
          onPress={pickCoverPhoto}
        >
          <Text style={[styles.uploadBtnText, { color: theme.accent }]}>📷 Upload Cover Photo</Text>
        </TouchableOpacity>

        {/* Gallery */}
        <View style={styles.galleryHeader}>
          <Text style={[styles.h2, { color: theme.text, marginTop: 0 }]}>Gallery Photos</Text>
          <Text style={[styles.galleryCount, { color: theme.textSecondary }]}>
            {shop?.photoUrls?.length || 0}{shop?.plan === 'FREE' ? '/3 free' : ' photos'}
          </Text>
        </View>
        <View style={styles.photosGrid}>
          {(shop?.photos || []).map((photo: any) => (
            <View key={photo.id}>
              <Image source={{ uri: photo.imageUrl }} style={[styles.photoTile, { backgroundColor: theme.surfaceSecondary }]} />
              <TouchableOpacity style={styles.photoDeleteBtn} onPress={() => deleteGalleryPhoto(photo.id)}>
                <Text style={styles.photoDeleteText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={[styles.addPhotoTile, { borderColor: theme.accent, backgroundColor: theme.surfaceSecondary }]}
            onPress={addGalleryPhoto}
          >
            <Text style={[styles.addPhotoPlus, { color: theme.accent }]}>+</Text>
            <Text style={[styles.addPhotoText, { color: theme.textSecondary }]}>Add Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Opening hours */}
        <TouchableOpacity
          style={[styles.hoursCard, { backgroundColor: theme.surface }]}
          onPress={() => navigation.navigate('OpeningHours')}
        >
          <View style={[styles.hoursIcon, { backgroundColor: theme.surfaceSecondary }]}>
            <Text style={{ fontSize: 20 }}>🕐</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.hoursTitle, { color: theme.text }]}>Opening Hours</Text>
            <Text style={[styles.hoursSub, { color: theme.textSecondary }]}>
              Set your daily opening & closing times
            </Text>
          </View>
          <Text style={[styles.chevron, { color: theme.textTertiary }]}>›</Text>
        </TouchableOpacity>

        {/* Shop details */}
        <Text style={[styles.h2, { color: theme.text }]}>Edit Shop Details</Text>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Shop Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text }]}
          value={form.name}
          onChangeText={(v) => setForm({ ...form, name: v })}
          placeholderTextColor={theme.textTertiary}
          placeholder="Shop name"
        />
        <Text style={[styles.label, { color: theme.textSecondary }]}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea, { backgroundColor: theme.surfaceSecondary, color: theme.text }]}
          value={form.description}
          onChangeText={(v) => setForm({ ...form, description: v })}
          placeholderTextColor={theme.textTertiary}
          placeholder="Describe your shop..."
          multiline numberOfLines={3}
        />
        <Text style={[styles.label, { color: theme.textSecondary }]}>Category</Text>
        <View style={styles.chipRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.chip,
                { backgroundColor: theme.surfaceSecondary },
                form.category === cat.id && { backgroundColor: theme.accent },
              ]}
              onPress={() => setForm({ ...form, category: cat.id })}
            >
              <Text style={[
                styles.chipText,
                { color: form.category === cat.id ? '#000' : theme.textSecondary },
                form.category === cat.id && { fontWeight: '700' },
              ]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.label, { color: theme.textSecondary }]}>City</Text>
        <View style={styles.chipRow}>
          {CITIES.map((city) => (
            <TouchableOpacity
              key={city}
              style={[
                styles.chip,
                { backgroundColor: theme.surfaceSecondary },
                form.city === city && { backgroundColor: theme.accent },
              ]}
              onPress={() => setForm({ ...form, city })}
            >
              <Text style={[
                styles.chipText,
                { color: form.city === city ? '#000' : theme.textSecondary },
                form.city === city && { fontWeight: '700' },
              ]}>
                {city}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Google Maps Link</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text }]}
          value={form.googleMapsLink}
          onChangeText={(v) => setForm({ ...form, googleMapsLink: v })}
          placeholderTextColor={theme.textTertiary}
          placeholder="https://maps.google.com/..."
          autoCapitalize="none"
        />
        <Text style={[styles.hint, { color: theme.textTertiary }]}>
          Open Google Maps → search your location → Share → Copy link
        </Text>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Location Description</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text }]}
          value={form.locationDescription}
          onChangeText={(v) => setForm({ ...form, locationDescription: v })}
          placeholderTextColor={theme.textTertiary}
          placeholder="e.g. 3rd floor of Melcom Building"
        />

        {/* GPS location */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>Shop Location (for "Near me" search)</Text>
        <View style={[styles.locationCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.locationStatus, { color: shop?.latitude ? '#2E7D32' : theme.textSecondary }]}>
            {shop?.latitude
              ? '✓ Location set (' + shop.latitude.toFixed(5) + ', ' + shop.longitude.toFixed(5) + ')'
              : 'Not set — customers can\'t find you with "Near me" yet'}
          </Text>
          <TouchableOpacity
            style={[styles.locationBtn, { backgroundColor: theme.accent }]}
            onPress={setShopLocation}
            disabled={settingLocation}
          >
            {settingLocation ? <ActivityIndicator color="#000" /> :
              <Text style={styles.locationBtnText}>
                📍 {shop?.latitude ? 'Update' : 'Set'} location (use my current position)
              </Text>}
          </TouchableOpacity>
          <Text style={[styles.hint, { color: theme.textTertiary, textAlign: 'center', marginTop: 8 }]}>
            Tap this while you are at your shop
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: theme.accent }]}
          onPress={saveProfile}
          disabled={saving}
        >
          {saving ? <ActivityIndicator color="#000" /> :
            <Text style={styles.saveBtnText}>Save Changes</Text>}
        </TouchableOpacity>

        {/* Services */}
        <Text style={[styles.h2, { color: theme.text }]}>Your Services</Text>
        {shop?.services?.map((service: any) => (
          <View key={service.id} style={[styles.serviceCard, { backgroundColor: theme.surface }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.serviceName, { color: theme.text }]}>{service.name}</Text>
              <Text style={[styles.serviceMeta, { color: theme.textSecondary }]}>
                {service.durationMinutes} min
              </Text>
            </View>
            <Text style={[styles.servicePrice, { color: theme.accent }]}>GHS {service.price}</Text>
            <TouchableOpacity
              style={[styles.serviceBtn, { backgroundColor: theme.surfaceSecondary }]}
              onPress={() => {
                setEditService(service);
                setEditForm({
                  name: service.name,
                  price: String(service.price),
                  durationMinutes: String(service.durationMinutes),
                });
                setEditModal(true);
              }}
            >
              <Text style={{ fontSize: 16 }}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.serviceBtn, { backgroundColor: '#FDECEA' }]}
              onPress={() => removeService(service.id)}
            >
              <Text style={{ fontSize: 16 }}>🗑</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Add service */}
        <Text style={[styles.h2, { color: theme.text }]}>Add New Service</Text>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Service name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text }]}
          value={newService.name}
          onChangeText={(v) => setNewService({ ...newService, name: v })}
          placeholderTextColor={theme.textTertiary}
          placeholder="e.g. Box Braids"
        />
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Price (GHS)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text }]}
              value={newService.price}
              onChangeText={(v) => setNewService({ ...newService, price: v })}
              placeholderTextColor={theme.textTertiary}
              placeholder="150"
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Duration (min)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text }]}
              value={newService.durationMinutes}
              onChangeText={(v) => setNewService({ ...newService, durationMinutes: v })}
              placeholderTextColor={theme.textTertiary}
              placeholder="60"
              keyboardType="numeric"
            />
          </View>
        </View>
        <TouchableOpacity
          style={[styles.addServiceBtn, { borderColor: theme.accent }]}
          onPress={addService}
        >
          <Text style={[styles.addServiceText, { color: theme.accent }]}>+ Add Service</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Edit service modal */}
      <Modal visible={editModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Service</Text>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
              value={editForm.name}
              onChangeText={(v) => setEditForm({ ...editForm, name: v })}
              placeholderTextColor={theme.textTertiary}
              placeholder="Service name"
            />
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Price (GHS)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                  value={editForm.price}
                  onChangeText={(v) => setEditForm({ ...editForm, price: v })}
                  placeholderTextColor={theme.textTertiary}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Duration (mins)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                  value={editForm.durationMinutes}
                  onChangeText={(v) => setEditForm({ ...editForm, durationMinutes: v })}
                  placeholderTextColor={theme.textTertiary}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { backgroundColor: theme.background }]}
                onPress={() => setEditModal(false)}
              >
                <Text style={[styles.modalCancelText, { color: theme.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveBtn, { backgroundColor: theme.accent }]}
                onPress={saveEditedService}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedScreen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '900' },
  scroll: { padding: 20, paddingTop: 8 },
  h2: { fontSize: 19, fontWeight: '800', marginTop: 24, marginBottom: 12 },
  coverImage: { width: '100%', height: 180, borderRadius: 16 },
  coverPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  uploadBtn: {
    borderRadius: 12, padding: 14, alignItems: 'center',
    borderWidth: 1.5, marginTop: 12,
  },
  uploadBtnText: { fontWeight: '700', fontSize: 15 },
  galleryHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    marginTop: 24, marginBottom: 12,
  },
  galleryCount: { fontSize: 13 },
  photosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photoTile: { width: 100, height: 110, borderRadius: 12 },
  addPhotoTile: {
    width: 100, height: 110, borderRadius: 12,
    borderWidth: 1.5, borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center',
  },
  addPhotoPlus: { fontSize: 26, fontWeight: '700' },
  photoDeleteBtn: {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: '#000a', borderRadius: 11,
    width: 22, height: 22, justifyContent: 'center', alignItems: 'center',
  },
  photoDeleteText: { color: '#f44336', fontSize: 12, fontWeight: '700' },
  addPhotoText: { fontSize: 12, marginTop: 4 },
  hoursCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 16, padding: 14, marginTop: 24,
  },
  hoursIcon: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  hoursTitle: { fontSize: 16, fontWeight: '700' },
  hoursSub: { fontSize: 13, marginTop: 2 },
  chevron: { fontSize: 22, fontWeight: '600' },
  label: { fontSize: 13, marginBottom: 8, marginTop: 14 },
  input: { borderRadius: 12, padding: 14, fontSize: 15 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  hint: { fontSize: 12, marginTop: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 22 },
  chipText: { fontSize: 14 },
  locationCard: { borderRadius: 16, padding: 14 },
  locationStatus: { fontSize: 13, marginBottom: 12 },
  locationBtn: { borderRadius: 10, padding: 14, alignItems: 'center' },
  locationBtnText: { color: '#000', fontSize: 13, fontWeight: '700' },
  saveBtn: { borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20 },
  saveBtnText: { color: '#000', fontSize: 15, fontWeight: '700' },
  serviceCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 16, padding: 14, marginBottom: 10,
  },
  serviceName: { fontSize: 15, fontWeight: '700' },
  serviceMeta: { fontSize: 13, marginTop: 2 },
  servicePrice: { fontSize: 15, fontWeight: '800', marginRight: 4 },
  serviceBtn: {
    width: 38, height: 38, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  row: { flexDirection: 'row', gap: 12 },
  addServiceBtn: {
    borderRadius: 12, padding: 16, alignItems: 'center',
    borderWidth: 1.5, marginTop: 16,
  },
  addServiceText: { fontWeight: '700', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: '#000a', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  modalCancelBtn: { flex: 1, borderRadius: 12, padding: 16, alignItems: 'center' },
  modalCancelText: { fontWeight: '600' },
  modalSaveBtn: { flex: 1, borderRadius: 12, padding: 16, alignItems: 'center' },
  modalSaveText: { color: '#000', fontWeight: '700' },
});
