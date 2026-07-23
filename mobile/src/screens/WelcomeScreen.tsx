import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import ThemedScreen from '../components/ThemedScreen';

// Retrieve screen dimensions for responsive layout styling
const { width } = Dimensions.get('window');

/**
 * Sparkle Component
 * Helper component that renders a diamond/star sparkle vector shape.
 * Used to accent the branding illustration with shining details.
 */
function Sparkle({ x, y, s, color }: { x: number; y: number; s: number; color: string }) {
  return (
    <Path
      d={`M ${x} ${y - s} L ${x + s * 0.3} ${y - s * 0.3} L ${x + s} ${y} L ${x + s * 0.3} ${y + s * 0.3} L ${x} ${y + s} L ${x - s * 0.3} ${y + s * 0.3} L ${x - s} ${y} L ${x - s * 0.3} ${y - s * 0.3} Z`}
      fill={color}
    />
  );
}

/**
 * WelcomeLogo Component
 * Renders a premium, themed styling illustration containing scissors, a comb, rings,
 * and decorative sparkle details using react-native-svg vectors.
 */
function WelcomeLogo({ accent, text }: { accent: string; text: string }) {
  return (
    <Svg width={140} height={140} viewBox="0 0 100 100">
      {/* Outer elegant dash rings */}
      <Circle cx={50} cy={50} r={46} stroke={accent} strokeWidth={1.5} strokeDasharray="4 4" fill="none" opacity={0.6} />
      <Circle cx={50} cy={50} r={41} stroke={accent} strokeWidth={0.7} fill="none" opacity={0.3} />
      
      {/* Stylist Scissors - finger holes */}
      <Path
        d="M 36 60 C 33 60 30 57 30 54 C 30 51 33 48 36 48 C 39 48 41 50 43 53 L 50 46 L 43 39 M 36 32 C 33 32 30 35 30 38 C 30 41 33 44 36 44 C 39 44 41 42 43 39"
        stroke={text}
        strokeWidth={2.2}
        strokeLinecap="round"
        fill="none"
      />
      {/* Stylist Scissors - blades and pivot point */}
      <Path d="M 50 46 L 68 34 M 50 46 L 68 58" stroke={text} strokeWidth={2.2} strokeLinecap="round" />
      <Circle cx={50} cy={46} r={1.5} fill={accent} />
      
      {/* Styling Comb */}
      <Path d="M 32 23 L 68 23 M 32 23 L 32 29 M 36 23 L 36 28 M 40 23 L 40 28 M 44 23 L 44 28 M 48 23 L 48 28 M 52 23 L 52 28 M 56 23 L 56 28 M 60 23 L 60 28 M 64 23 L 64 28 M 68 23 L 68 29" stroke={accent} strokeWidth={1.2} strokeLinecap="round" />
      
      {/* Decorative Sparkles */}
      <Sparkle x={74} y={32} s={5} color={accent} />
      <Sparkle x={24} y={46} s={3.5} color={accent} />
      <Sparkle x={72} y={62} s={4.5} color={accent} />
      <Sparkle x={50} y={76} s={6} color={accent} />
    </Svg>
  );
}

// Data format representing each onboarding feature slide
interface SlideData {
  title: string;
  description: string;
  emoji: string;
}

// Key onboarding features highlights
const slides: SlideData[] = [
  {
    title: 'Find Expert Stylists',
    description: 'Discover the best barbers, salons, and beauty professionals directly in your neighborhood.',
    emoji: '🔍',
  },
  {
    title: 'Book in Seconds',
    description: 'Select services, pick your preferred professional, and reserve your slot instantly.',
    emoji: '📅',
  },
  {
    title: 'Elevate Your Look',
    description: 'Read verified reviews, view portfolios, and step out feeling confident and styled.',
    emoji: '✨',
  },
];

export default function WelcomeScreen({ navigation }: any) {
  // Pull current active theme and toggle trigger from ThemeContext
  const { theme, isDark, toggleTheme } = useTheme();
  // State variables for tracking currently active feature slide
  const [slideIndex, setSlideIndex] = useState(0);

  // --- Animation References ---
  // Logo entrance
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  // Header text entrance
  const textFade = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(20)).current;
  // Slideshow transition values
  const slideFade = useRef(new Animated.Value(1)).current;
  const slideTranslate = useRef(new Animated.Value(0)).current;
  // Get Started button entrance and press feedback scale
  const btnScale = useRef(new Animated.Value(1)).current;
  const btnFade = useRef(new Animated.Value(0)).current;

  // Run screen entrance stagger animations on mount
  useEffect(() => {
    Animated.sequence([
      // Step 1: Scale and fade in the logo
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 6.5, tension: 40, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      // Step 2: Fade and slide up the branding title and tagline
      Animated.parallel([
        Animated.timing(textFade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(textSlide, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      // Step 3: Reveal the bottom action buttons
      Animated.timing(btnFade, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  /**
   * Transition Slideshow Content
   * Coordinates the outgoing slide fade-out and slide-out,
   * updates index state, and performs incoming slide fade-in and slide-in.
   */
  const changeSlide = (nextIndex: number) => {
    Animated.parallel([
      Animated.timing(slideFade, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideTranslate, { toValue: -15, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setSlideIndex(nextIndex);
      // Pre-position slide layout to animate in from the opposite side
      slideTranslate.setValue(15);
      Animated.parallel([
        Animated.timing(slideFade, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(slideTranslate, { toValue: 0, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    });
  };

  // Set up automated slide-show auto-rotations every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (slideIndex + 1) % slides.length;
      changeSlide(nextIndex);
    }, 4500);
    return () => clearInterval(timer);
  }, [slideIndex]);

  /**
   * Handle Get Started Press
   * Simulates a modern spring scale micro-animation on tap before transitioning
   * to the RoleSelection screen navigation target.
   */
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
      {/* Theme Switcher Button - Floating Top Right */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={toggleTheme}
        style={[styles.themeToggle, { backgroundColor: theme.surface, borderColor: theme.border }]}
      >
        <Text style={{ fontSize: 18 }}>{isDark ? '☀️' : '🌙'}</Text>
      </TouchableOpacity>

      <View style={styles.container}>
        {/* Logo/Branding Graphics Section */}
        <Animated.View style={[styles.logoContainer, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
          <WelcomeLogo accent={theme.accent} text={theme.text} />
        </Animated.View>

        {/* Brand Titles */}
        <Animated.View style={[styles.titleContainer, { opacity: textFade, transform: [{ translateY: textSlide }] }]}>
          <Text style={[styles.brand, { color: theme.text }]}>
            Style<Text style={{ color: theme.accent }}>Book</Text>
          </Text>
          <Text style={[styles.tagline, { color: theme.textSecondary }]}>
            Redefining your style, simplified
          </Text>
        </Animated.View>

        {/* Feature Slideshow Section */}
        <View style={styles.carouselContainer}>
          <Animated.View
            style={[
              styles.slide,
              { opacity: slideFade, transform: [{ translateX: slideTranslate }] },
            ]}
          >
            {/* Feature Emoticon bubble */}
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

          {/* Slideshow Pagination Indicator Dots */}
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
                    // Active indicator stretches into a bar for high visual premium styling
                    width: idx === slideIndex ? 20 : 8,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Bottom Call to Action and Footer */}
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

          {/* Legal / Policy links */}
          <Text style={[styles.footerText, { color: theme.textTertiary }]}>
            By continuing, you agree to our Terms and Conditions
          </Text>
        </Animated.View>
      </View>
    </ThemedScreen>
  );
}

// StyleSheet Styling Definitions
const styles = StyleSheet.create({
  outer: {
    flex: 1,
  },
  themeToggle: {
    position: 'absolute',
    top: 16,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  container: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 30,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 15,
  },
  brand: {
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  slide: {
    alignItems: 'center',
    paddingHorizontal: 15,
    width: width - 90,
  },
  emojiContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 28,
  },
  slideTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  slideDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 5,
  },
  indicators: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  button: {
    width: width - 60,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footerText: {
    fontSize: 11,
    marginTop: 16,
    textAlign: 'center',
  },
});
