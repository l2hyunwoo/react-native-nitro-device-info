/**
 * Example App for react-native-nitro-device-info
 * Displays device information with tabs for static properties and live hooks demo
 */

import { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import DeviceInfoScreen from './DeviceInfoScreen';
import HooksDemo from './screens/HooksDemo';

type TabType = 'properties' | 'hooks';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('properties');

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'properties' && styles.activeTab]}
          onPress={() => setActiveTab('properties')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'properties' && styles.activeTabText,
            ]}
          >
            Properties
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'hooks' && styles.activeTab]}
          onPress={() => setActiveTab('hooks')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'hooks' && styles.activeTabText,
            ]}
          >
            Hooks Demo
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'properties' ? <DeviceInfoScreen /> : <HooksDemo />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
});
