/**
 * PropertyRow Component
 * Displays a single device property with label, value, and platform badge
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { DeviceProperty } from '../types';
import { PlatformBadge } from './PlatformBadge';
import { PropertyFormatter } from './PropertyFormatter';

interface Props {
  property: DeviceProperty;
}

export const PropertyRow: React.FC<Props> = ({ property }) => {
  return (
    <View style={styles.row}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{property.label}</Text>
        <PlatformBadge platform={property.platform} />
      </View>
      <PropertyFormatter value={property.value} type={property.type} error={property.errorState} />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
});
