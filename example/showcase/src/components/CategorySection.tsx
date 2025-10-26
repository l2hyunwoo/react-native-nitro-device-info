/**
 * CategorySection Component
 * Collapsible section for a category of device properties
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { PropertyCategory } from '../types';
import type { DeviceProperty } from '../types';
import { PropertyRow } from './PropertyRow';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props {
  category: PropertyCategory;
  properties: DeviceProperty[];
  defaultExpanded?: boolean;
}

export const CategorySection: React.FC<Props> = ({ category, properties, defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.section}>
      {/* Category Header - Tappable */}
      <TouchableOpacity style={styles.header} onPress={toggleExpanded} activeOpacity={0.7}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{category}</Text>
          <Text style={styles.propertyCount}>{properties.length} properties</Text>
        </View>
        <Text style={styles.chevron}>{isExpanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>

      {/* Collapsible Content */}
      {isExpanded && (
        <View style={styles.content}>
          {properties.map((property, index) => (
            <PropertyRow key={`${property.key}-${index}`} property={property} />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  propertyCount: {
    fontSize: 12,
    color: '#666666',
  },
  chevron: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 12,
  },
  content: {
    backgroundColor: '#FFFFFF',
  },
});
