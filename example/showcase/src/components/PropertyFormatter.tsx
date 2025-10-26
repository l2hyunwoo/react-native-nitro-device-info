/**
 * PropertyFormatter Component
 * Formats and displays property values based on their type
 */

import React from 'react';
import { Text, StyleSheet, Platform } from 'react-native';
import { PropertyType } from '../types';
import { formatPropertyValue } from '../utils/formatters';

interface Props {
  value: any;
  type: PropertyType;
  error?: string;
}

export const PropertyFormatter: React.FC<Props> = ({ value, type, error }) => {
  // Display error state if present
  if (error) {
    return <Text style={styles.error}>Error: {error}</Text>;
  }

  // Format value based on type
  const formattedValue = formatPropertyValue(value, type);

  // Apply different styles based on type
  const getValueStyle = () => {
    switch (type) {
      case PropertyType.BOOLEAN:
        return [styles.value, styles.booleanValue];
      case PropertyType.NUMBER:
        return [styles.value, styles.numberValue];
      case PropertyType.BYTES:
      case PropertyType.TIMESTAMP:
        return [styles.value, styles.specialValue];
      case PropertyType.OBJECT:
      case PropertyType.ARRAY:
        return [styles.value, styles.complexValue];
      default:
        return styles.value;
    }
  };

  return (
    <Text
      style={getValueStyle()}
      numberOfLines={type === PropertyType.OBJECT || type === PropertyType.ARRAY ? undefined : 3}
      ellipsizeMode="tail"
    >
      {formattedValue}
    </Text>
  );
};

const styles = StyleSheet.create({
  value: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
    textAlign: 'right',
  },
  error: {
    fontSize: 14,
    color: '#FF3B30',
    flex: 1,
    textAlign: 'right',
    fontStyle: 'italic',
  },
  booleanValue: {
    fontWeight: '600',
  },
  numberValue: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  specialValue: {
    fontSize: 13,
    color: '#555555',
  },
  complexValue: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textAlign: 'left',
  },
});
