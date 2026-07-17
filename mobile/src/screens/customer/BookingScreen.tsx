import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { bookingsAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import ThemedScreen from '../../components/ThemedScreen';

export default function BookingScreen({ route, navigation }: any) {
  const { shop } = route.params;
  const { theme } = useTheme();
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<any>(null);

  const dayKeys = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const parseHours = () => {
    try {
      return shop.openingHours ? JSON.parse(shop.openingHours) : {};
    } catch {
      return {};
    }
  };

  const getNext7Days = () => {
    const hours = parseHours();
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const key = dayKeys[date.getDay()];
      const value = hours[key];
      const closed = !value || value === 'CLOSED' || !String(value).includes('-');
      days.push({
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' :
          date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        value: date.toISOString().split('T')[0],
        closed,
        hours: closed ? 'Closed' : String(value),
      });
    }
    return days;
  };

  const selectDate = async (day: any) => {
    if (day.closed) return;
    setSelectedDate(day.value);
    setSelectedTime('');
    setSlots([]);
    setSlotsLoading(true);
    try {
      const response = await bookingsAPI.getSlots(shop.id, day.value, selectedService.id);
      setSlots(response.data.open ? (response.data.slots || []) : []);
    } catch (error) {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const selectService = (service: any) => {
    setSelectedService(service);
    setSelectedDate('');
    setSelectedTime('');
    setSlots([]);
  };

  const confirmBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please complete all steps');
      return;
    }
    setLoading(true);
    try {
      const response = await bookingsAPI.create({
        shopId: shop.id,
        serviceId: selectedService.id,
        bookingDate: selectedDate,
        bookingTime: selectedTime + ':00',
      });
      setBooking(response.data);
      setStep(4);
      setTimeout(() => navigation.goBack(), 2000);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedScreen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step > 1 && step < 4 ? setStep(step - 1) : navigation.goBack()}>
          <Text style={[styles.backText, { color: theme.accent }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Book Appointment</Text>
        <Text style={[styles.shopName, { color: theme.textSecondary }]}>{shop.name}</Text>
      </View>

      {step < 4 && (
        <View style={styles.progressRow}>
          {[1, 2, 3].map((s) => (
            <View key={s} style={[
              styles.progressDot,
              { backgroundColor: s <= step ? theme.accent : theme.surfaceSecondary }
            ]} />
          ))}
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scroll}>
        {step === 1 && (
          <View>
            <Text style={[styles.stepTitle, { color: theme.text }]}>Choose a Service</Text>
            {shop.services?.map((service: any) => (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceCard,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                  selectedService?.id === service.id && { borderColor: theme.accent, backgroundColor: theme.accentLight },
                ]}
                onPress={() => selectService(service)}
              >
                <View>
                  <Text style={[styles.serviceName, { color: theme.text }]}>{service.name}</Text>
                  <Text style={[styles.serviceDuration, { color: theme.textSecondary }]}>⏱ {service.durationMinutes} mins</Text>
                </View>
                <Text style={[styles.servicePrice, { color: theme.accent }]}>GHS {service.price}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.nextBtn, { backgroundColor: selectedService ? theme.accent : theme.surfaceSecondary }]}
              onPress={() => selectedService && setStep(2)}
              disabled={!selectedService}
            >
              <Text style={[styles.nextBtnText, { color: selectedService ? '#000' : theme.textTertiary }]}>Next →</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={[styles.stepTitle, { color: theme.text }]}>Choose Date & Time</Text>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datesRow}>
              {getNext7Days().map((day) => (
                <TouchableOpacity
                  key={day.value}
                  style={[
                    styles.dateChip,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                    day.closed && { opacity: 0.4 },
                    selectedDate === day.value && { backgroundColor: theme.accent, borderColor: theme.accent },
                  ]}
                  onPress={() => selectDate(day)}
                  disabled={day.closed}
                >
                  <Text style={[
                    styles.dateChipText,
                    { color: selectedDate === day.value ? '#000' : theme.textSecondary }
                  ]}>
                    {day.label}
                  </Text>
                  <Text style={[
                    styles.dateChipHours,
                    { color: selectedDate === day.value ? '#000' : day.closed ? '#f44336' : theme.textTertiary }
                  ]}>
                    {day.hours}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Available Times</Text>
            {!selectedDate ? (
              <Text style={[styles.slotsHint, { color: theme.textTertiary }]}>
                Pick a date to see available times
              </Text>
            ) : slotsLoading ? (
              <ActivityIndicator color={theme.accent} style={{ marginVertical: 20 }} />
            ) : slots.length === 0 ? (
              <Text style={[styles.slotsHint, { color: theme.textTertiary }]}>
                No available times left on this day — try another date
              </Text>
            ) : (
              <View style={styles.timesGrid}>
                {slots.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeChip,
                      { backgroundColor: theme.surface, borderColor: theme.border },
                      selectedTime === time && { backgroundColor: theme.accent, borderColor: theme.accent },
                    ]}
                    onPress={() => setSelectedTime(time)}
                  >
                    <Text style={[
                      styles.timeChipText,
                      { color: selectedTime === time ? '#000' : theme.textSecondary }
                    ]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={[styles.nextBtn, { backgroundColor: (!selectedDate || !selectedTime) ? theme.surfaceSecondary : theme.accent }]}
              onPress={() => selectedDate && selectedTime && setStep(3)}
              disabled={!selectedDate || !selectedTime}
            >
              <Text style={[styles.nextBtnText, { color: (!selectedDate || !selectedTime) ? theme.textTertiary : '#000' }]}>
                Next →
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={[styles.stepTitle, { color: theme.text }]}>Confirm Booking</Text>
            <View style={[styles.confirmCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.confirmShop, { color: theme.accent }]}>{shop.name}</Text>
              {[
                { label: 'Service', value: selectedService?.name },
                { label: 'Duration', value: selectedService?.durationMinutes + ' mins' },
                { label: 'Price', value: 'GHS ' + selectedService?.price },
                { label: 'Date', value: selectedDate },
                { label: 'Time', value: selectedTime },
              ].map((row) => (
                <View key={row.label} style={[styles.confirmRow, { borderBottomColor: theme.border }]}>
                  <Text style={[styles.confirmLabel, { color: theme.textSecondary }]}>{row.label}</Text>
                  <Text style={[styles.confirmValue, { color: theme.text }]}>{row.value}</Text>
                </View>
              ))}
            </View>
            <View style={[styles.pendingNotice, { backgroundColor: theme.accentLight, borderColor: theme.border }]}>
              <Text style={[styles.pendingNoticeTitle, { color: theme.accent }]}>ℹ️ How booking works</Text>
              <Text style={[styles.pendingNoticeText, { color: theme.textSecondary }]}>
                1. Your request is sent to the shop{'\n'}
                2. The shop can confirm it right away{'\n'}
                3. If they don't respond in 45 seconds, it's confirmed automatically{'\n'}
                4. Find it under Bookings — you'll get a reminder 10 minutes before
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: theme.accent }]}
              onPress={confirmBooking}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#000" /> :
                <Text style={styles.confirmBtnText}>Confirm Booking</Text>}
            </TouchableOpacity>
          </View>
        )}

        {step === 4 && booking && (
          <View style={styles.successContainer}>
            <Text style={styles.successEmoji}>🎉</Text>
            <Text style={[styles.successTitle, { color: theme.text }]}>Booking Successful!</Text>
            <Text style={[styles.successSubtitle, { color: theme.textSecondary }]}>
              {booking.serviceName} · {booking.bookingDate} · {booking.bookingTime}
            </Text>
            <Text style={[styles.successNote, { color: theme.textTertiary }]}>
              Track it anytime in your Bookings tab
            </Text>
          </View>
        )}
      </ScrollView>
    </ThemedScreen>
  );
}

const styles = StyleSheet.create({
  header: { padding: 20, paddingTop: 16 },
  backText: { fontSize: 24, marginBottom: 8 },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  shopName: { fontSize: 14, marginTop: 4 },
  progressRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 16 },
  progressDot: { width: 32, height: 4, borderRadius: 2 },
  scroll: { padding: 20 },
  stepTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20 },
  serviceCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 1,
  },
  serviceName: { fontSize: 15, fontWeight: '600' },
  serviceDuration: { fontSize: 13, marginTop: 4 },
  servicePrice: { fontSize: 16, fontWeight: '700' },
  sectionLabel: { fontSize: 13, marginBottom: 12, marginTop: 8 },
  datesRow: { marginBottom: 20 },
  dateChip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1, marginRight: 8, alignItems: 'center',
  },
  dateChipText: { fontSize: 13, fontWeight: '600' },
  dateChipHours: { fontSize: 11, marginTop: 2 },
  timesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  timeChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  timeChipText: { fontSize: 13 },
  slotsHint: { fontSize: 14, textAlign: 'center', paddingVertical: 24 },
  nextBtn: { borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 8 },
  nextBtnText: { fontSize: 16, fontWeight: '700' },
  confirmCard: { borderRadius: 16, padding: 20, borderWidth: 1, marginBottom: 16 },
  confirmShop: { fontSize: 18, fontWeight: '800', marginBottom: 16 },
  confirmRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1 },
  confirmLabel: { fontSize: 14 },
  confirmValue: { fontSize: 14, fontWeight: '600' },
  pendingNotice: { borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1 },
  pendingNoticeTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  pendingNoticeText: { fontSize: 13, lineHeight: 22 },
  confirmBtn: { borderRadius: 12, padding: 18, alignItems: 'center' },
  confirmBtnText: { color: '#000', fontSize: 16, fontWeight: '700' },
  successContainer: { alignItems: 'center', paddingTop: 60 },
  successEmoji: { fontSize: 64, marginBottom: 16 },
  successTitle: { fontSize: 28, fontWeight: '900', marginBottom: 8 },
  successSubtitle: { fontSize: 16, marginBottom: 12, textAlign: 'center' },
  successNote: { fontSize: 13 },
});
