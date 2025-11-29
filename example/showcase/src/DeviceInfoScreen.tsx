/**
 * Enhanced DeviceInfoScreen
 * Displays all 80+ device properties organized by category with collapsible sections
 */

import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { createDeviceInfo } from 'react-native-nitro-device-info';
import { PropertyCategory } from './types';
import type { DeviceProperty } from './types';
import { PROPERTY_CONFIGS, isPlatformSupported } from './config/propertyCategories';
import { CategorySection } from './components/CategorySection';

export default function DeviceInfoScreen() {
  const [properties, setProperties] = useState<DeviceProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAllProperties();
  }, []);

  /**
   * Load all device properties (sync and async)
   * Fetches values for all 80+ properties from DeviceInfo interface
   */
  const loadAllProperties = async () => {
    try {
      setLoading(true);
      const deviceInfo = createDeviceInfo();
      const loadedProperties: DeviceProperty[] = [];

      // Filter properties for current platform
      const platformProperties = PROPERTY_CONFIGS.filter(isPlatformSupported);

      // Load all properties
      for (const config of platformProperties) {
        try {
          let value: any;

          // Access property based on whether it's sync or async
          // Note: Some sync methods start with 'get' prefix (e.g., getBatteryLevel)
          if (config.isSync && !config.key.startsWith('get')) {
            // Synchronous property - direct access
            value = (deviceInfo as any)[config.key];
          } else if (config.isSync && config.key.startsWith('get')) {
            // Synchronous method - call as function without await
            value = (deviceInfo as any)[config.key]();
          } else {
            // Asynchronous method - call as function with await
            value = await (deviceInfo as any)[config.key]();
          }

          loadedProperties.push({
            ...config,
            value,
            errorState: undefined,
          });
        } catch (error) {
          // Handle individual property errors gracefully
          loadedProperties.push({
            ...config,
            value: null,
            errorState: error instanceof Error ? error.message : 'Failed to fetch',
          });
        }
      }

      setProperties(loadedProperties);
    } catch (error) {
      console.error('Error loading device properties:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = () => {
    setRefreshing(true);
    loadAllProperties();
  };

  /**
   * Group properties by category for display
   */
  const getPropertiesByCategory = (): Record<PropertyCategory, DeviceProperty[]> => {
    const grouped: Record<string, DeviceProperty[]> = {};

    properties.forEach((property) => {
      const category = property.category;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(property);
    });

    return grouped as Record<PropertyCategory, DeviceProperty[]>;
  };

  // Show loading indicator on initial load
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading device information...</Text>
          <Text style={styles.loadingSubtext}>Fetching {PROPERTY_CONFIGS.length}+ properties</Text>
        </View>
      </SafeAreaView>
    );
  }

  const categorizedProperties = getPropertiesByCategory();
  const categoryKeys = Object.keys(categorizedProperties) as PropertyCategory[];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#007AFF" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Device Information</Text>
          <Text style={styles.subtitle}>react-native-nitro-device-info</Text>
          <Text style={styles.propertyCount}>
            {properties.length} properties • {categoryKeys.length} categories
          </Text>
        </View>

        {/* Info Message */}
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            ℹ️ Tap any category to expand and view properties
          </Text>
          <Text style={styles.infoSubtext}>
            All sections start collapsed by default
          </Text>
        </View>

        {/* Category Sections - All collapsed by default per clarification */}
        {categoryKeys.map((category) => (
          <CategorySection
            key={category}
            category={category}
            properties={categorizedProperties[category]}
            defaultExpanded={false}
          />
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Powered by Nitro Modules</Text>
          <Text style={styles.footerSubtext}>Zero-overhead JSI bindings</Text>
          <Text style={styles.footerNote}>Pull down to refresh</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  loadingSubtext: {
    marginTop: 4,
    fontSize: 14,
    color: '#666666',
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
    marginBottom: 8,
  },
  propertyCount: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '400',
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  infoText: {
    fontSize: 14,
    color: '#1565C0',
    fontWeight: '500',
    marginBottom: 4,
  },
  infoSubtext: {
    fontSize: 12,
    color: '#1976D2',
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
    paddingBottom: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
  footerNote: {
    fontSize: 11,
    color: '#BBBBBB',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
