import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import Svg, { Circle } from 'react-native-svg';

const Index = () => {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  // Animation values
  const logoScale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);
  
  // Ring animations
  const ring1Scale = useSharedValue(0.8);
  const ring1Opacity = useSharedValue(0);
  const ring2Scale = useSharedValue(0.8);
  const ring2Opacity = useSharedValue(0);
  const ring3Scale = useSharedValue(0.8);
  const ring3Opacity = useSharedValue(0);

  useEffect(() => {
    // Start animations immediately
    logoScale.value = withTiming(1, { duration: 1200, easing: Easing.out(Easing.back(1.5)) });
    logoOpacity.value = withTiming(1, { duration: 1000 });

    textOpacity.value = withDelay(400, withTiming(1, { duration: 800 }));
    taglineOpacity.value = withDelay(800, withTiming(1, { duration: 800 }));

    // Animated concentric circles pulse sequence
    ring1Scale.value = withDelay(200, withRepeat(withTiming(1.6, { duration: 1500, easing: Easing.out(Easing.ease) }), -1, false));
    ring1Opacity.value = withDelay(200, withRepeat(
      withSequence(
        withTiming(0.4, { duration: 300 }),
        withTiming(0, { duration: 1200 })
      ),
      -1,
      false
    ));

    ring2Scale.value = withDelay(500, withRepeat(withTiming(1.6, { duration: 1500, easing: Easing.out(Easing.ease) }), -1, false));
    ring2Opacity.value = withDelay(500, withRepeat(
      withSequence(
        withTiming(0.3, { duration: 300 }),
        withTiming(0, { duration: 1200 })
      ),
      -1,
      false
    ));

    ring3Scale.value = withDelay(800, withRepeat(withTiming(1.6, { duration: 1500, easing: Easing.out(Easing.ease) }), -1, false));
    ring3Opacity.value = withDelay(800, withRepeat(
      withSequence(
        withTiming(0.2, { duration: 300 }),
        withTiming(0, { duration: 1200 })
      ),
      -1,
      false
    ));
  }, []);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        if (!user) {
          router.replace('/(auth)/welcome');
        } else if (!profile || !profile.isSetupComplete) {
          router.replace('/(auth)/setup-profile');
        } else {
          router.replace('/(main)');
        }
      }, 2500); // 2.5 seconds splash time
      return () => clearTimeout(timer);
    }
  }, [loading, user, profile]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const taglineAnimatedStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  // Ring styles
  const r1Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring1Scale.value }],
    opacity: ring1Opacity.value,
  }));

  const r2Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring2Scale.value }],
    opacity: ring2Opacity.value,
  }));

  const r3Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring3Scale.value }],
    opacity: ring3Opacity.value,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.illustrationContainer}>
        {/* Animated concentric pulse rings */}
        <Animated.View style={[styles.pulseRing, r1Style]} />
        <Animated.View style={[styles.pulseRing, r2Style]} />
        <Animated.View style={[styles.pulseRing, r3Style]} />

        {/* Logo Icon */}
        <Animated.View style={[styles.logoCircle, logoAnimatedStyle]}>
          <Svg width="60" height="60" viewBox="0 0 100 100">
            {/* Elegant geometrical icon showing 3 intersecting circles */}
            <Circle cx="50" cy="40" r="25" stroke={colors.primary} strokeWidth="6" fill="transparent" />
            <Circle cx="38" cy="62" r="25" stroke="#ffffff" strokeWidth="6" fill="transparent" />
            <Circle cx="62" cy="62" r="25" stroke="#0ea5e9" strokeWidth="6" fill="transparent" />
          </Svg>
        </Animated.View>
      </View>

      <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
        <Text style={styles.title}>Pursio</Text>
      </Animated.View>

      <Animated.View style={[styles.taglineContainer, taglineAnimatedStyle]}>
        <Text style={styles.tagline}>Maîtrisez vos 3 cercles</Text>
      </Animated.View>
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral900,
  },
  illustrationContainer: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 5,
  },
  textContainer: {
    marginTop: 20,
  },
  title: {
    color: colors.white,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1.5,
    fontFamily: 'Outfit-Bold',
  },
  taglineContainer: {
    position: 'absolute',
    bottom: 50,
  },
  tagline: {
    color: colors.textLighter,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
