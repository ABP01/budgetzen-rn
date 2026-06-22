import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

let NativeLiquidGlassView: any = null;
let isSupported = false;

try {
  const LG = require('@callstack/liquid-glass');
  NativeLiquidGlassView = LG.LiquidGlassView;
  isSupported = LG.isLiquidGlassSupported;
} catch (e) {
  isSupported = false;
}

export interface LiquidGlassProps extends ViewProps {
  intensity?: number;
  interactive?: boolean;
  effect?: 'clear' | 'regular' | 'none';
  tintColor?: string;
  borderRadius?: number;
  children?: React.ReactNode;
}

export const LiquidGlass = ({
  intensity = 15,
  interactive = false,
  effect = 'regular',
  tintColor = 'rgba(25, 25, 25, 0.55)',
  borderRadius = 16,
  children,
  style,
  ...props
}: LiquidGlassProps) => {
  if (isSupported && NativeLiquidGlassView) {
    return (
      <NativeLiquidGlassView
        interactive={interactive}
        effect={effect}
        style={[
          styles.nativeGlass,
          { borderRadius },
          style
        ]}
        {...props}
      >
        {children}
      </NativeLiquidGlassView>
    );
  }

  // Fallback to high-quality glassmorphic BlurView + border for Expo Go and Android/web
  return (
    <View 
      style={[
        styles.fallbackContainer, 
        { backgroundColor: tintColor, borderRadius }, 
        style
      ]} 
      {...props}
    >
      <BlurView 
        intensity={intensity} 
        tint="dark" 
        style={[StyleSheet.absoluteFillObject, { borderRadius }]} 
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  nativeGlass: {
    overflow: 'hidden',
  },
  fallbackContainer: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
});
