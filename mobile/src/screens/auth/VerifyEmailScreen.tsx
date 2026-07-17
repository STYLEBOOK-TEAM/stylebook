import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Animated, Easing,
} from 'react-native';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import ThemedScreen from '../../components/ThemedScreen';

export default function VerifyEmailScreen({ route, navigation }: any) {
  const { email } = route.params;
  const { login } = useAuth();
  const { theme } = useTheme();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(30);

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const verify = async () => {
    if (code.trim().length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit code');
      return;
    }
    setLoading(true);
    try {
      const response = await authAPI.verifyOtp({ email, code: code.trim() });
      const { token, ...user } = response.data;
      await login(token, user);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setResending(true);
    try {
      const response = await authAPI.resendOtp({ email });
      setCooldown(30);
      Alert.alert('Code Sent', response.data.message || 'A new code is on its way');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Could not resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <ThemedScreen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.container}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={[styles.backText, { color: theme.accent }]}>← Back</Text>
          </TouchableOpacity>

          <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }], alignItems: 'center' }}>
            <View style={[styles.iconCircle, { backgroundColor: theme.accentLight, borderColor: theme.accent }]}>
              <Text style={styles.iconEmoji}>📧</Text>
            </View>
            <Text style={[styles.title, { color: theme.text }]}>Check your email</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              We sent a 6-digit verification code to
            </Text>
            <Text style={[styles.email, { color: theme.accent }]}>{email}</Text>

            <TextInput
              style={[styles.codeInput, {
                backgroundColor: theme.surface, color: theme.text, borderColor: theme.accent,
              }]}
              value={code}
              onChangeText={(v) => setCode(v.replace(/[^0-9]/g, ''))}
              placeholder="••••••"
              placeholderTextColor={theme.textTertiary}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />

            <TouchableOpacity
              style={[styles.verifyBtn, { backgroundColor: code.length === 6 ? theme.accent : theme.surfaceSecondary }]}
              onPress={verify}
              disabled={loading || code.length !== 6}
            >
              {loading ? <ActivityIndicator color="#000" /> :
                <Text style={[styles.verifyBtnText, { color: code.length === 6 ? '#000' : theme.textTertiary }]}>
                  Verify & Continue
                </Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={resend} disabled={cooldown > 0 || resending} style={styles.resend}>
              {resending ? (
                <ActivityIndicator color={theme.accent} size="small" />
              ) : (
                <Text style={[styles.resendText, { color: cooldown > 0 ? theme.textTertiary : theme.accent }]}>
                  {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </ThemedScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  back: { marginBottom: 32 },
  backText: { fontSize: 16 },
  iconCircle: {
    width: 84, height: 84, borderRadius: 42, borderWidth: 1.5,
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
  },
  iconEmoji: { fontSize: 36 },
  title: { fontSize: 28, fontWeight: '900', marginBottom: 10 },
  subtitle: { fontSize: 14 },
  email: { fontSize: 15, fontWeight: '700', marginTop: 4, marginBottom: 32 },
  codeInput: {
    width: 220, borderRadius: 14, borderWidth: 1.5, padding: 16,
    fontSize: 30, fontWeight: '800', textAlign: 'center', letterSpacing: 12,
  },
  verifyBtn: {
    borderRadius: 12, padding: 18, alignItems: 'center',
    marginTop: 24, width: '100%',
  },
  verifyBtnText: { fontSize: 16, fontWeight: '700' },
  resend: { marginTop: 20, padding: 8 },
  resendText: { fontSize: 14, fontWeight: '600' },
});
