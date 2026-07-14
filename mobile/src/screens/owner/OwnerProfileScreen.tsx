import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, Alert, ActivityIndicator, Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { shopsAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import ThemedScreen from '../../components/ThemedScreen';
const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const CATEGORIES = ['SALON', 'BARBERSHOP', 'SPA', 'NAILS'];
export default function OwnerProfileScreen() {
  const { theme } = useTheme();
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingLocation, setSettingLocation] = useState(false);
  const [activeTab, setActiveTab] = useState('Profile');
  const [form, setForm] = useState({
    name: '', description: '', city: '',
    googleMapsLink: '', locationDescription: '', category: '', openingHours: {} as any,
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
        city: s.city || '',
        googleMapsLink: s.googleMapsLink || '',
        locationDescription: s.locationDescription || '',
        category: s.category || 'SALON',
        openingHours: s.openingHours ? JSON.parse(s.openingHours) : {},
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
      await shopsAPI.update({
        ...form,
        openingHours: JSON.stringify(form.openingHours),
      });
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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
  const updateHours = (day: string, hours: string) => {
    setForm(prev => ({
      ...prev,
      openingHours: { ...prev.openingHours, [day]: hours },
    }));
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
        <Text style={[styles.title, { color: theme.text }]}>My Shop</Text>
        <View style={[styles.planBadge, { backgroundColor: shop?.plan === 'PRO' ? theme.accent : theme.surfaceSecondary }]}>
          <Text style={[styles.planText, { color: shop?.plan === 'PRO' ? '#000' : theme.textSecondary }]}>
            {shop?.plan}
          </Text>
        </View>
      </View>
      <View style={[styles.tabRow, { borderBottomColor: theme.border }]}>
        {['Profile', 'Services', 'Photos', 'Hours'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && { borderBottomWidth: 2, borderBottomColor: theme.accent }]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, { color: activeTab === tab ? theme.accent : theme.textTertiary }]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {activeTab === 'Profile' && (
          <View>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Shop Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              value={form.name}
              onChangeText={(v) => setForm({ ...form, name: v })}
              placeholderTextColor={theme.textTertiary}
              placeholder="Shop name"
            />
            <Text style={[styles.label, { color: theme.textSecondary }]}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              value={form.description}
              onChangeText={(v) => setForm({ ...form, description: v })}
              placeholderTextColor={theme.textTertiary}
              placeholder="Describe your shop..."
              multiline numberOfLines={4}
            />
            <Text style={[styles.label, { color: theme.textSecondary }]}>Category</Text>
            <View style={styles.categoryRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryBtn,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                    form.category === cat && { backgroundColor: theme.accent, borderColor: theme.accent },
                  ]}
                  onPress={() => setForm({ ...form, category: cat })}
                >
                  <Text style={[
                    styles.categoryText,
                    { color: form.category === cat ? '#000' : theme.textSecondary }
                  ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.label, { color: theme.textSecondary }]}>City</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              value={form.city}
              onChangeText={(v) => setForm({ ...form, city: v })}
              placeholderTextColor={theme.textTertiary}
              placeholder="e.g. Accra"
            />
            <Text style={[styles.label, { color: theme.textSecondary }]}>Google Maps Link</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              value={form.googleMapsLink}
              onChangeText={(v) => setForm({ ...form, googleMapsLink: v })}
              placeholderTextColor={theme.textTertiary}
              placeholder="https://maps.google.com/..."
            />
            <Text style={[styles.label, { color: theme.textSecondary }]}>Location Description</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              value={form.locationDescription}
              onChangeText={(v) => setForm({ ...form, locationDescription: v })}
              placeholderTextColor={theme.textTertiary}
              placeholder="e.g. 3rd floor of Melcom Building"
            />
            <Text style={[styles.label, { color: theme.textSecondary }]}>Shop Location (for "Near me" search)</Text>
            <View style={[styles.locationCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.locationStatus, { color: shop?.latitude ? '#2E7D32' : theme.textSecondary }]}>
                {shop?.latitude
                  ? `✓ Location set (${shop.latitude.toFixed(5)}, ${shop.longitude.toFixed(5)})`
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
              <Text style={[styles.locationHint, { color: theme.textTertiary }]}>
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
          </View>
        )}
        {activeTab === 'Services' && (
          <View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Current Services</Text>
            {shop?.services?.map((service: any) => (
              <View key={service.id} style={[styles.serviceCard, { backgroundColor: theme.surface }]}>
                <View>
                  <Text style={[styles.serviceName, { color: theme.text }]}>{service.name}</Text>
                  <Text style={[styles.serviceMeta, { color: theme.textSecondary }]}>
                    GHS {service.price} • {service.durationMinutes} mins
                  </Text>
                </View>
                <View style={styles.serviceActions}>
                  <TouchableOpacity onPress={() => {
                    setEditService(service);
                    setEditForm({
                      name: service.name,
                      price: String(service.price),
                      durationMinutes: String(service.durationMinutes),
                    });
                    setEditModal(true);
                  }}>
                    <Text style={[styles.editBtn, { color: theme.accent }]}>✎</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeService(service.id)}>
                    <Text style={styles.removeBtn}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Add New Service</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              value={newService.name}
              onChangeText={(v) => setNewService({ ...newService, name: v })}
              placeholderTextColor={theme.textTertiary}
              placeholder="Service name (e.g. Fade Haircut)"
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1, backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                value={newService.price}
                onChangeText={(v) => setNewService({ ...newService, price: v })}
                placeholderTextColor={theme.textTertiary}
                placeholder="Price (GHS)"
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, { flex: 1, backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                value={newService.durationMinutes}
                onChangeText={(v) => setNewService({ ...newService, durationMinutes: v })}
                placeholderTextColor={theme.textTertiary}
                placeholder="Duration (mins)"
                keyboardType="numeric"
              />
            </View>
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.accent }]} onPress={addService}>
              <Text style={styles.saveBtnText}>Add Service</Text>
            </TouchableOpacity>
          </View>
        )}
        {activeTab === 'Photos' && (
          <View>
            <TouchableOpacity
              style={[styles.uploadBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={pickCoverPhoto}
            >
              <Text style={[styles.uploadBtnText, { color: theme.text }]}>📷 Change Cover Photo</Text>
            </TouchableOpacity>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Gallery ({shop?.photoUrls?.length || 0}{shop?.plan === 'FREE' ? '/3' : ''} photos)
            </Text>
            <View style={styles.photosGrid}>
              {shop?.photoUrls?.map((url: string, i: number) => (
                <View key={i} style={[styles.photoCard, { backgroundColor: theme.surface }]}>
                  <Text style={styles.photoEmoji}>🖼️</Text>
                </View>
              ))}
              <TouchableOpacity
                style={[styles.addPhotoCard, { borderColor: theme.border }]}
                onPress={addGalleryPhoto}
              >
                <Text style={[styles.addPhotoText, { color: theme.textTertiary }]}>+</Text>
              </TouchableOpacity>
            </View>
            {shop?.plan === 'FREE' && (
              <Text style={[styles.planNote, { color: theme.textSecondary }]}>
                Free plan: 3 photos max. Upgrade to Pro for unlimited.
              </Text>
            )}
          </View>
        )}
        {activeTab === 'Hours' && (
          <View>
            <Text style={[styles.hoursNote, { color: theme.textSecondary }]}>
              Enter hours as HH:MM-HH:MM (e.g. 09:00-18:00) or leave blank for closed
            </Text>
            {DAYS.map((day) => (
              <View key={day} style={styles.hoursRow}>
                <Text style={[styles.hoursDay, { color: theme.text }]}>{day}</Text>
                <TextInput
                  style={[styles.hoursInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                  value={form.openingHours[day] || ''}
                  onChangeText={(v) => updateHours(day, v)}
                  placeholder="09:00-18:00"
                  placeholderTextColor={theme.textTertiary}
                />
              </View>
            ))}
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: theme.accent }]}
              onPress={saveProfile}
              disabled={saving}
            >
              {saving ? <ActivityIndicator color="#000" /> :
                <Text style={styles.saveBtnText}>Save Hours</Text>}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Edit Service Modal */}
      <Modal visible={editModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Service</Text>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              value={editForm.name}
              onChangeText={(v) => setEditForm({ ...editForm, name: v })}
              placeholderTextColor={theme.textTertiary}
              placeholder="Service name"
            />
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Price (GHS)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                  value={editForm.price}
                  onChangeText={(v) => setEditForm({ ...editForm, price: v })}
                  placeholderTextColor={theme.textTertiary}
                  placeholder="Price"
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Duration (mins)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                  value={editForm.durationMinutes}
                  onChangeText={(v) => setEditForm({ ...editForm, durationMinutes: v })}
                  placeholderTextColor={theme.textTertiary}
                  placeholder="Duration"
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { backgroundColor: theme.background, borderColor: theme.border }]}
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 16 },
  title: { fontSize: 24, fontWeight: '900' },
  planBadge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  planText: { fontSize: 12, fontWeight: '700' },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, padding: 12, alignItems: 'center' },
  tabText: { fontSize: 13, fontWeight: '600' },
  scroll: { padding: 20 },
  label: { fontSize: 13, marginBottom: 8, marginTop: 16 },
  input: {
    borderRadius: 12, padding: 14, fontSize: 15,
    borderWidth: 1, marginBottom: 4,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  categoryBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  categoryText: { fontSize: 13 },
  locationCard: { borderRadius: 12, padding: 14, borderWidth: 1 },
  locationStatus: { fontSize: 13, marginBottom: 12 },
  locationBtn: { borderRadius: 10, padding: 14, alignItems: 'center' },
  locationBtnText: { color: '#000', fontSize: 13, fontWeight: '700' },
  locationHint: { fontSize: 11, textAlign: 'center', marginTop: 8 },
  saveBtn: { borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: '#000', fontSize: 15, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  serviceCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderRadius: 12, padding: 14, marginBottom: 8,
  },
  serviceName: { fontSize: 14, fontWeight: '600' },
  serviceMeta: { fontSize: 13, marginTop: 2 },
  removeBtn: { color: '#f44336', fontSize: 18, padding: 4 },
  serviceActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  editBtn: { fontSize: 18, padding: 4 },
  modalOverlay: { flex: 1, backgroundColor: '#000a', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  modalCancelBtn: { flex: 1, borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1 },
  modalCancelText: { fontWeight: '600' },
  modalSaveBtn: { flex: 1, borderRadius: 12, padding: 16, alignItems: 'center' },
  modalSaveText: { color: '#000', fontWeight: '700' },
  row: { flexDirection: 'row', gap: 8 },
  uploadBtn: {
    borderRadius: 12, padding: 16, alignItems: 'center',
    borderWidth: 1, marginBottom: 16,
  },
  uploadBtnText: { fontWeight: '600' },
  photosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  photoCard: {
    width: '31%', aspectRatio: 1, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
  },
  photoEmoji: { fontSize: 32 },
  addPhotoCard: {
    width: '31%', aspectRatio: 1, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderStyle: 'dashed',
  },
  addPhotoText: { fontSize: 32 },
  planNote: { fontSize: 12, textAlign: 'center', marginTop: 8 },
  hoursNote: { fontSize: 13, marginBottom: 16, lineHeight: 18 },
  hoursRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 12 },
  hoursDay: { fontWeight: '700', width: 40 },
  hoursInput: {
    flex: 1, borderRadius: 8, padding: 12,
    fontSize: 14, borderWidth: 1,
  },
});