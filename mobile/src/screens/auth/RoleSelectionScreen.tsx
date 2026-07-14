import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Easing, Dimensions,
} from 'react-native';
import Svg, { Circle, Ellipse, Line, Path, Rect } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import ThemedScreen from '../../components/ThemedScreen';

const { width } = Dimensions.get('window');

function Sparkle({ x, y, s, color }: { x: number; y: number; s: number; color: string }) {
  return (
    <Path
      d={`M ${x} ${y - s} L ${x + s * 0.3} ${y - s * 0.3} L ${x + s} ${y} L ${x + s * 0.3} ${y + s * 0.3} L ${x} ${y + s} L ${x - s * 0.3} ${y + s * 0.3} L ${x - s} ${y} L ${x - s * 0.3} ${y - s * 0.3} Z`}
      fill={color}
    />
  );
}

function CustomerArt({ gold, ink, surface }: { gold: string; ink: string; surface: string }) {
  return (
    <Svg width={110} height={90} viewBox="0 0 110 90">
      <Circle cx={55} cy={40} r={30} fill={surface} stroke={gold} strokeWidth={3} />
      <Path d="M 40 26 Q 48 18 58 20" stroke={gold} strokeWidth={2.5} strokeLinecap="round" fill="none" opacity={0.6} />
      <Rect x={52} y={70} width={6} height={12} rx={3} fill={gold} />
      <Rect x={40} y={82} width={30} height={5} rx={2.5} fill={gold} />
      <Line x1={12} y1={20} x2={30} y2={48} stroke={ink} strokeWidth={3} strokeLinecap="round" />
      <Line x1={30} y1={20} x2={12} y2={48} stroke={ink} strokeWidth={3} strokeLinecap="round" />
      <Circle cx={10} cy={52} r={5} stroke={ink} strokeWidth={3} fill="none" />
      <Circle cx={32} cy={52} r={5} stroke={ink} strokeWidth={3} fill="none" />
      <Sparkle x={95} y={18} s={6} color={gold} />
      <Sparkle x={88} y={60} s={4} color={gold} />
    </Svg>
  );
}

function OwnerArt({ gold, ink, surface }: { gold: string; ink: string; surface: string }) {
  return (
    <Svg width={110} height={90} viewBox="0 0 110 90">
      {/* barber pole */}
      <Rect x={20} y={14} width={14} height={56} rx={7} fill={surface} stroke={gold} strokeWidth={2.5} />
      <Line x1={14} y1={26} x2={40} y2={40} stroke={gold} strokeWidth={5} />
      <Line x1={14} y1={42} x2={40} y2={56} stroke={ink} strokeWidth={5} />
      <Circle cx={27} cy={10} r={5} fill={gold} />
      <Circle cx={27} cy={74} r={5} fill={gold} />
      {/* clippers */}
      <Rect x={62} y={28} width={22} height={42} rx={8} fill={surface} stroke={ink} strokeWidth={3} />
      <Rect x={65} y={18} width={16} height={10} rx={2} fill={ink} />
      <Circle cx={73} cy={48} r={4} fill={gold} />
      <Line x1={92} y1={12} x2={98} y2={17} stroke={gold} strokeWidth={2.5} strokeLinecap="round" />
      <Line x1={98} y1={26} x2={105} y2={28} stroke={gold} strokeWidth={2.5} strokeLinecap="round" />
      <Sparkle x={98} y={64} s={5} color={gold} />
    </Svg>
  );
}

export default function RoleSelectionScreen({ navigation }: any) {
  const { theme } = useTheme();

  const blob = useRef(new Animated.Value(0)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(24)).current;
  const customerX = useRef(new Animated.Value(-width)).current;
  const ownerX = useRef(new Animated.Value(width)).current;
  const customerScale = useRef(new Animated.Value(1)).current;
  const ownerScale = useRef(new Animated.Value(1)).current;
  const screenFade = useRef(new Animated.Value(1)).current;

  const playEntrance = () => {
    blob.setValue(0);
    titleFade.setValue(0);
    titleSlide.setValue(24);
    customerX.setValue(-width);
    ownerX.setValue(width);
    customerScale.setValue(1);
    ownerScale.setValue(1);
    screenFade.setValue(1);

    Animated.sequence([
      Animated.spring(blob, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(titleFade, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(titleSlide, {
          toValue: 0, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true,
        }),
      ]),
      Animated.stagger(150, [
        Animated.spring(customerX, { toValue: 0, friction: 9, tension: 45, useNativeDriver: true }),
        Animated.spring(ownerX, { toValue: 0, friction: 9, tension: 45, useNativeDriver: true }),
      ]),
    ]).start();
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', playEntrance);
    return unsubscribe;
  }, [navigation]);

  const choose = (role: 'customer' | 'owner') => {
    const pressedScale = role === 'customer' ? customerScale : ownerScale;
    const otherX = role === 'customer' ? ownerX : customerX;
    const otherTarget = role === 'customer' ? width : -width;

    Animated.parallel([
      Animated.sequence([
        Animated.timing(pressedScale, { toValue: 1.05, duration: 160, useNativeDriver: true }),
        Animated.timing(pressedScale, { toValue: 1.02, duration: 120, useNativeDriver: true }),
      ]),
      Animated.timing(otherX, {
        toValue: otherTarget, duration: 280, easing: Easing.in(Easing.cubic), useNativeDriver: true,
      }),
      Animated.timing(titleFade, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start(() => {
      Animated.timing(screenFade, { toValue: 0, duration: 160, useNativeDriver: true }).start(() => {
        navigation.navigate(role === 'customer' ? 'CustomerLogin' : 'OwnerLogin');
      });
    });
  };

  return (
    <ThemedScreen>
      <Animated.View style={[styles.container, { opacity: screenFade }]}>
        {/* header */}
        <View style={styles.header}>
          <Animated.View
            style={[
              styles.blob,
              { backgroundColor: theme.accent, opacity: 0.14, transform: [{ scale: blob }] },
            ]}
          />
          <Animated.View style={{ opacity: titleFade, transform: [{ translateY: titleSlide }], alignItems: 'center' }}>
            <Text style={[styles.brand, { color: theme.text }]}>
              Style<Text style={{ color: theme.accent }}>Book</Text>
            </Text>
            <Text style={[styles.tagline, { color: theme.textSecondary }]}>
              Book your next look in seconds
            </Text>
          </Animated.View>
        </View>

        {/* role cards */}
        <View style={styles.cards}>
          <Animated.View style={{ flex: 1, transform: [{ translateX: customerX }, { scale: customerScale }] }}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.accent }]}
              onPress={() => choose('customer')}
            >
              <CustomerArt gold={theme.accent} ink={theme.text} surface={theme.background} />
              <View style={styles.cardText}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>I'm a Customer</Text>
                <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
                  Discover shops, book appointments, leave reviews
                </Text>
              </View>
              <Text style={[styles.arrow, { color: theme.accent }]}>→</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ flex: 1, transform: [{ translateX: ownerX }, { scale: ownerScale }] }}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.accent }]}
              onPress={() => choose('owner')}
            >
              <OwnerArt gold={theme.accent} ink={theme.text} surface={theme.background} />
              <View style={styles.cardText}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>I'm a Business Owner</Text>
                <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
                  Manage bookings, grow your shop, reach new clients
                </Text>
              </View>
              <Text style={[styles.arrow, { color: theme.accent }]}>→</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.View>
    </ThemedScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 40, paddingBottom: 24 },
  header: { alignItems: 'center', justifyContent: 'center', height: 200 },
  blob: {
    position: 'absolute', width: 260, height: 260, borderRadius: 130, top: -30,
  },
  brand: { fontSize: 42, fontWeight: '800', letterSpacing: 0.5 },
  tagline: { fontSize: 15, marginTop: 8 },
  cards: { flex: 1, gap: 16, justifyContent: 'center' },
  card: {
    flex: 1, borderRadius: 24, borderWidth: 1.5, padding: 24,
    alignItems: 'center', justifyContent: 'center', maxHeight: 240,
  },
  cardText: { alignItems: 'center', marginTop: 12 },
  cardTitle: { fontSize: 22, fontWeight: '800' },
  cardDesc: { fontSize: 13, textAlign: 'center', marginTop: 6, lineHeight: 19 },
  arrow: { fontSize: 22, marginTop: 10, fontWeight: '700' },
});