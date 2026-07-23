import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Image,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import ThemedScreen from '../components/ThemedScreen';

const { width } = Dimensions.get('window');

interface SlideData {
  title: string;
  description: string;
  emoji: string;
}

const slides: SlideData[] = [
  { title: 'Find Expert Stylists', description: 'Discover the best barbers, salons, and beauty professionals directly in your neighborhood.', emoji: '🔍' },
  { title: 'Book in Seconds', description: 'Select services, pick your preferred professional, and reserve your slot instantly.', emoji: '📅' },
  { title: 'Elevate Your Look', description: 'Read verified reviews, view portfolios, and step out feeling confident and styled.', emoji: '✨' },
];

export default function WelcomeScreen({ navigation }: any) {
  const { theme, isDark, toggleTheme } = useTheme();
  const [slideIndex, setSlideIndex] = useState(0);

  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textFade = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(20)).current;
  const slideFade = useRef(new Animated.Value(1)).current;
  const slideTranslate = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;
  const btnFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 6.5, tension: 40, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(textFade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(textSlide, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.timing(btnFade, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const changeSlide = (nextIndex: number) => {
    Animated.parallel([
      Animated.timing(slideFade, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideTranslate, { toValue: -15, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setSlideIndex(nextIndex);
      slideTranslate.setValue(15);
      Animated.parallel([
        Animated.timing(slideFade, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(slideTranslate, { toValue: 0, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (slideIndex + 1) % slides.length;
      changeSlide(nextIndex);
    }, 4500);
    return () => clearInterval(timer);
  }, [slideIndex]);

  const handleGetStarted = () => {
    Animated.sequence([
      Animated.timing(btnScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(btnScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start(() => {
      navigation.navigate('RoleSelection');
    });
  };

  return (
    <ThemedScreen style={styles.outer}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={toggleTheme}
        style={[styles.themeToggle, { backgroundColor: theme.surface, borderColor: theme.border }]}
      >
        <Text style={{ fontSize: 18 }}>{isDark ? '☀️' : '🌙'}</Text>
      </TouchableOpacity>

      <View style={styles.container}>
        <Animated.View style={[styles.logoContainer, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View style={[styles.titleContainer, { opacity: textFade, transform: [{ translateY: textSlide }] }]}>
          <Text style={[styles.brand, { color: theme.text }]}>
            Style<Text style={{ color: theme.accent }}>Book</Text>
          </Text>
          <Text style={[styles.tagline, { color: theme.textSecondary }]}>
            Book your next look in seconds
          </Text>
        </Animated.View>

        <View style={styles.carouselContainer}>
          <Animated.View
            style={[
              styles.slide,
              { opacity: slideFade, transform: [{ translateX: slideTranslate }] },
            ]}
          >
            <View style={[styles.emojiContainer, { backgroundColor: theme.accentLight }]}>
              <Text style={styles.emoji}>{slides[slideIndex].emoji}</Text>
            </View>
            <Text style={[styles.slideTitle, { color: theme.text }]}>
              {slides[slideIndex].title}
            </Text>
            <Text style={[styles.slideDesc, { color: theme.textSecondary }]}>
              {slides[slideIndex].description}
            </Text>
          </Animated.View>

          <View style={styles.indicators}>
            {slides.map((_, idx) => (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.8}
                onPress={() => changeSlide(idx)}
                style={[
                  styles.dot,
                  {
                    backgroundColor: idx === slideIndex ? theme.accent : theme.textTertiary,
                    width: idx === slideIndex ? 20 : 8,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        <Animated.View style={[styles.footer, { opacity: btnFade }]}>
          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleGetStarted}
              style={[styles.button, { backgroundColor: theme.accent }]}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
          </Animated.View>

          <Text style={[styles.footerText, { color: theme.textTertiary }]}>
            By continuing, you agree to our Terms and Conditions
          </Text>
        </Animated.View>
      </View>
    </ThemedScreen>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1 },
  themeToggle: {
    position: 'absolute', top: 16, right: 20, width: 44, height: 44, borderRadius: 22,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center', zIndex: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  container: { flex: 1, paddingHorizontal: 30, justifyContent: 'space-between', paddingTop: 60, paddingBottom: 30 },
  logoContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  logoImage: { width: 140, height: 140, borderRadius: 70 },
  titleContainer: { alignItems: 'center', marginTop: 15 },
  brand: { fontSize: 40, fontWeight: '900', letterSpacing: 1 },
  tagline: { fontSize: 14, fontWeight: '500', marginTop: 4, letterSpacing: 0.5 },
  carouselContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginVertical: 20 },
  slide: { alignItems: 'center', paddingHorizontal: 15, width: width - 90 },
  emojiContainer: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emoji: { fontSize: 28 },
  slideTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  slideDesc: { fontSize: 13, textAlign: 'center', lineHeight: 20, paddingHorizontal: 5 },
  indicators: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24, gap: 6 },
  dot: { height: 8, borderRadius: 4 },
  footer: { width: '100%', alignItems: 'center', marginTop: 10 },
  button: {
    width: width - 60, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  footerText: { fontSize: 11, marginTop: 16, textAlign: 'center' },
});
