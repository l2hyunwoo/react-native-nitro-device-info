/**
 * PlatformBadge Component
 * Displays platform availability badge (iOS, Android, All)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PlatformAvailability } from '../types';

interface Props {
  platform: PlatformAvailability;
}

export const PlatformBadge: React.FC<Props> = ({ platform }) => {
  // Don't show badge if property is available on all platforms
  if (platform === PlatformAvailability.ALL) {
    return null;
  }

  // Determine badge label and color
  const getBadgeInfo = () => {
    switch (platform) {
      case PlatformAvailability.IOS_ONLY:
        return { label: 'iOS', color: '#007AFF' };
      case PlatformAvailability.ANDROID_ONLY:
        return { label: 'Android', color: '#3DDC84' };
      case PlatformAvailability.UNKNOWN:
        return { label: '?', color: '#999999' };
      default:
        return null;
    }
  };

  const badgeInfo = getBadgeInfo();
  if (!badgeInfo) {
    return null;
  }

  return (
    <View style={[styles.badge, { backgroundColor: badgeInfo.color }]}>
      <Text style={styles.badgeText}>{badgeInfo.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
