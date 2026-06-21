import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { colors } from '@/constants/theme';
import Typo from './Typo';
import * as Icons from 'phosphor-react-native';

interface GaugeCirclesProps {
  vitalProgress: number; // 0 to 1+
  croissanceProgress: number; // 0 to 1+
  plaisirProgress: number; // 0 to 1+
  animateCroissance: boolean; // triggers pulse
}

const GaugeCircles = ({
  vitalProgress = 0,
  croissanceProgress = 0,
  plaisirProgress = 0,
  animateCroissance = false,
}: GaugeCirclesProps) => {
  // Shared values for scale animations
  const vitalAnim = useSharedValue(0);
  const croissanceAnim = useSharedValue(0);
  const plaisirAnim = useSharedValue(0);

  // Pulse animation for Croissance (middle circle)
  const pulseScale = useSharedValue(1);
  const pulseGlow = useSharedValue(0.2);

  useEffect(() => {
    vitalAnim.value = withTiming(Math.min(1, Math.max(0, vitalProgress)), { duration: 1000 });
    croissanceAnim.value = withTiming(Math.min(1, Math.max(0, croissanceProgress)), { duration: 1000 });
    plaisirAnim.value = withTiming(Math.min(1, Math.max(0, plaisirProgress)), { duration: 1000 });
  }, [vitalProgress, croissanceProgress, plaisirProgress]);

  useEffect(() => {
    if (animateCroissance) {
      pulseScale.value = withSequence(
        withTiming(1.15, { duration: 150, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 300, easing: Easing.inOut(Easing.ease) })
      );
      pulseGlow.value = withSequence(
        withTiming(0.8, { duration: 150 }),
        withTiming(0.2, { duration: 300 })
      );
    }
  }, [animateCroissance]);

  // Handle color override for Vital if exceeded by 5%
  const isVitalExceeded = vitalProgress > 1.05;
  const vitalColor = isVitalExceeded ? colors.rose : colors.white;

  // Animated styles
  const vitalStyle = useAnimatedStyle(() => ({
    opacity: vitalAnim.value,
    transform: [{ scale: vitalAnim.value }],
  }));

  const croissanceStyle = useAnimatedStyle(() => ({
    opacity: croissanceAnim.value,
    transform: [{ scale: croissanceAnim.value * pulseScale.value }],
    shadowOpacity: pulseGlow.value,
  }));

  const plaisirStyle = useAnimatedStyle(() => ({
    opacity: plaisirAnim.value,
    transform: [{ scale: plaisirAnim.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Outer Circle - VITAL */}
      <Animated.View style={[styles.circle, styles.outerCircle, { borderColor: '#1A1A1A' }, vitalStyle]}>
        <View style={[styles.indicatorArc, {
          borderColor: vitalColor,
          borderTopColor: 'transparent',
          borderRightColor: vitalProgress > 0.25 ? vitalColor : 'transparent',
          borderBottomColor: vitalProgress > 0.5 ? vitalColor : 'transparent',
          borderLeftColor: vitalProgress > 0.75 ? vitalColor : 'transparent',
        }]} />
        
        {/* Middle Circle - CROISSANCE */}
        <Animated.View style={[styles.circle, styles.middleCircle, { borderColor: '#1E1E1E' }, croissanceStyle]}>
          <View style={[styles.indicatorArc, {
            borderColor: colors.primary,
            borderTopColor: 'transparent',
            borderRightColor: croissanceProgress > 0.25 ? colors.primary : 'transparent',
            borderBottomColor: croissanceProgress > 0.5 ? colors.primary : 'transparent',
            borderLeftColor: croissanceProgress > 0.75 ? colors.primary : 'transparent',
          }]} />

          {/* Inner Circle - PLAISIR */}
          <Animated.View style={[styles.circle, styles.innerCircle, { borderColor: '#2A2A2A' }, plaisirStyle]}>
            <View style={[styles.indicatorArc, {
              borderColor: '#0ea5e9',
              borderTopColor: 'transparent',
              borderRightColor: plaisirProgress > 0.25 ? '#0ea5e9' : 'transparent',
              borderBottomColor: plaisirProgress > 0.5 ? '#0ea5e9' : 'transparent',
              borderLeftColor: plaisirProgress > 0.75 ? '#0ea5e9' : 'transparent',
            }]} />
            
            {/* Center Icon */}
            <Icons.Compass size={24} color={colors.primary} weight="duotone" />
          </Animated.View>
        </Animated.View>
      </Animated.View>

      {/* Side Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: vitalColor }]} />
          <Typo size={12} color={colors.textLight} fontWeight="500">
            Vital : {Math.round(vitalProgress * 100)}%
          </Typo>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Typo size={12} color={colors.textLight} fontWeight="500">
            Croissance : {Math.round(croissanceProgress * 100)}%
          </Typo>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#0ea5e9' }]} />
          <Typo size={12} color={colors.textLight} fontWeight="500">
            Plaisir : {Math.round(plaisirProgress * 100)}%
          </Typo>
        </View>
      </View>
    </View>
  );
};

export default GaugeCircles;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 30,
    marginVertical: 20,
    backgroundColor: colors.neutral800,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  circle: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 6,
    position: 'relative',
  },
  outerCircle: {
    width: 160,
    height: 160,
  },
  middleCircle: {
    width: 116,
    height: 116,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 8,
  },
  innerCircle: {
    width: 72,
    height: 72,
  },
  indicatorArc: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 999,
    borderWidth: 6,
    transform: [{ rotate: '-45deg' }],
  },
  legendContainer: {
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
