import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, G } from 'react-native-svg';
import { colors } from '@/constants/theme';
import Typo from './Typo';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

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
  // Shared values for animated progress (0 to 1)
  const vitalAnim = useSharedValue(0);
  const croissanceAnim = useSharedValue(0);
  const plaisirAnim = useSharedValue(0);

  // Pulse animation for Croissance (middle circle)
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    vitalAnim.value = withTiming(Math.min(1, Math.max(0, vitalProgress)), { duration: 1000 });
    croissanceAnim.value = withTiming(Math.min(1, Math.max(0, croissanceProgress)), { duration: 1000 });
    plaisirAnim.value = withTiming(Math.min(1, Math.max(0, plaisirProgress)), { duration: 1000 });
  }, [vitalProgress, croissanceProgress, plaisirProgress]);

  useEffect(() => {
    if (animateCroissance) {
      pulseScale.value = withSequence(
        withTiming(1.1, { duration: 150, easing: Easing.out(Easing.ease) }),
        withTiming(1.0, { duration: 300, easing: Easing.inOut(Easing.ease) })
      );
      pulseOpacity.value = withSequence(
        withTiming(0.8, { duration: 150 }),
        withTiming(1.0, { duration: 300 })
      );
    }
  }, [animateCroissance]);

  const isVitalExceeded = vitalProgress > 1.05;
  const vitalColor = isVitalExceeded ? colors.rose : colors.white;

  // Dimensions
  const size = 180;
  const strokeWidth = 10;
  const center = size / 2;

  // Radii
  const rVital = 75;
  const rCroissance = 55;
  const rPlaisir = 35;

  // Circumferences
  const cVital = 2 * Math.PI * rVital;
  const cCroissance = 2 * Math.PI * rCroissance;
  const cPlaisir = 2 * Math.PI * rPlaisir;

  // Animated Props for SVG paths
  const vitalProps = useAnimatedProps(() => ({
    strokeDashoffset: cVital - vitalAnim.value * cVital,
  }));

  const croissanceProps = useAnimatedProps(() => ({
    strokeDashoffset: cCroissance - croissanceAnim.value * cCroissance,
  }));

  const plaisirProps = useAnimatedProps(() => ({
    strokeDashoffset: cPlaisir - plaisirAnim.value * cPlaisir,
  }));

  // Middle group animation style (pulse)
  const middleGroupStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  // Overall Score Calculation
  const avgProgress = Math.round(
    ((Math.min(1, vitalProgress) + Math.min(1, croissanceProgress) + Math.min(1, plaisirProgress)) / 3) * 100
  );

  return (
    <View style={styles.container}>
      <View style={styles.svgWrapper}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* VITAL - Outer Ring */}
          {/* Background Track */}
          <Circle
            cx={center}
            cy={center}
            r={rVital}
            stroke="#121212"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Ring */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={rVital}
            stroke={vitalColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${cVital} ${cVital}`}
            animatedProps={vitalProps}
            strokeLinecap="round"
            fill="transparent"
            transform={`rotate(-90 ${center} ${center})`}
          />

          {/* CROISSANCE - Middle Ring */}
          {/* Background Track */}
          <Circle
            cx={center}
            cy={center}
            r={rCroissance}
            stroke="#1E1E1E"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Ring */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={rCroissance}
            stroke={colors.primary}
            strokeWidth={strokeWidth}
            strokeDasharray={`${cCroissance} ${cCroissance}`}
            animatedProps={croissanceProps}
            strokeLinecap="round"
            fill="transparent"
            transform={`rotate(-90 ${center} ${center})`}
          />

          {/* PLAISIR - Inner Ring */}
          {/* Background Track */}
          <Circle
            cx={center}
            cy={center}
            r={rPlaisir}
            stroke="#2A2A2A"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Ring */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={rPlaisir}
            stroke="#0ea5e9"
            strokeWidth={strokeWidth}
            strokeDasharray={`${cPlaisir} ${cPlaisir}`}
            animatedProps={plaisirProps}
            strokeLinecap="round"
            fill="transparent"
            transform={`rotate(-90 ${center} ${center})`}
          />
        </Svg>

        {/* Center Text */}
        <View style={styles.centerContainer}>
          <Typo size={22} fontWeight="800" color={colors.white}>
            {avgProgress}%
          </Typo>
          <Typo size={9} color={colors.primary} fontWeight="700" style={{ marginTop: -2 }}>
            Optimisé
          </Typo>
        </View>
      </View>

      {/* Side Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: vitalColor }]} />
          <Typo size={12} color={colors.textLight} fontWeight="600">
            Vital : {Math.round(vitalProgress * 100)}%
          </Typo>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Typo size={12} color={colors.textLight} fontWeight="600">
            Croissance : {Math.round(croissanceProgress * 100)}%
          </Typo>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#0ea5e9' }]} />
          <Typo size={12} color={colors.textLight} fontWeight="600">
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
    gap: 25,
    marginVertical: 10,
    backgroundColor: 'rgba(18, 18, 18, 0.4)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  svgWrapper: {
    width: 180,
    height: 180,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
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
