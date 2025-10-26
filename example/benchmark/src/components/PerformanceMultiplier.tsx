/**
 * PerformanceMultiplier Component
 * Displays speedup multiplier with visual indication of significance
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface Props {
  speedupMultiplier: number;
  isSignificant: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const PerformanceMultiplier: React.FC<Props> = ({
  speedupMultiplier,
  isSignificant,
  size = 'medium',
}) => {
  const getMultiplierColor = () => {
    if (isSignificant) {
      return '#34C759'; // Green for significant improvements (≥2x)
    } else if (speedupMultiplier >= 1.5) {
      return '#007AFF'; // Blue for moderate improvements
    } else if (speedupMultiplier >= 1.0) {
      return '#FF9500'; // Orange for slight improvements
    } else {
      return '#FF3B30'; // Red for slower performance
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          multiplierSize: 14,
          labelSize: 8,
          containerPadding: 6,
        };
      case 'large':
        return {
          multiplierSize: 24,
          labelSize: 10,
          containerPadding: 12,
        };
      case 'medium':
      default:
        return {
          multiplierSize: 18,
          labelSize: 9,
          containerPadding: 8,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const multiplierColor = getMultiplierColor();

  return (
    <View style={[styles.container, { padding: sizeStyles.containerPadding }]}>
      <Text
        style={[
          styles.multiplier,
          { fontSize: sizeStyles.multiplierSize, color: multiplierColor },
        ]}
      >
        {speedupMultiplier.toFixed(1)}x
      </Text>
      {isSignificant && (
        <Text
          style={[
            styles.significantBadge,
            { fontSize: sizeStyles.labelSize, color: multiplierColor },
          ]}
        >
          SIGNIFICANT
        </Text>
      )}
      {speedupMultiplier < 1.0 && (
        <Text style={[styles.slowerBadge, { fontSize: sizeStyles.labelSize }]}>
          SLOWER
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  multiplier: {
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  significantBadge: {
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  slowerBadge: {
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#FF3B30',
  },
});
