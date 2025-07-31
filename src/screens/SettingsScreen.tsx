import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { openaiService } from '../services/openaiService';

const SettingsScreen: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [tempApiKey, setTempApiKey] = useState('');
  const [isTestingApi, setIsTestingApi] = useState(false);

  const loadApiKey = async () => {
    try {
      const storedKey = await AsyncStorage.getItem('openai_api_key');
      if (storedKey) {
        setApiKey(storedKey);
        openaiService.setApiKey(storedKey);
      }
    } catch (error) {
      console.error('Error loading API key:', error);
    }
  };

  const saveApiKey = async (key: string) => {
    try {
      await AsyncStorage.setItem('openai_api_key', key);
      setApiKey(key);
      openaiService.setApiKey(key);
    } catch (error) {
      console.error('Error saving API key:', error);
      Alert.alert('Error', 'Failed to save API key');
    }
  };

  const testApiKey = async () => {
    if (!tempApiKey.trim()) {
      Alert.alert('Error', 'Please enter an API key');
      return;
    }

    setIsTestingApi(true);
    try {
      // Create a temporary service instance to test the key
      const testService = new (require('../services/openaiService').OpenAIService)(tempApiKey);
      
      // Test with a simple request
      await testService.enhanceRestaurantData('Test Restaurant', 'Test Address');
      
      Alert.alert(
        'Success',
        'API key is valid and working!',
        [
          {
            text: 'Save',
            onPress: () => {
              saveApiKey(tempApiKey);
              setShowApiKeyModal(false);
              setTempApiKey('');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'API key appears to be invalid or there was a connection error. Please check your key and try again.'
      );
    } finally {
      setIsTestingApi(false);
    }
  };

  const clearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your saved restaurants and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['snapbite_restaurants', 'openai_api_key']);
              Alert.alert('Success', 'All data has been cleared');
              setApiKey('');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const exportData = async () => {
    try {
      const restaurants = await AsyncStorage.getItem('snapbite_restaurants');
      if (restaurants) {
        // In a real app, this would implement proper export functionality
        Alert.alert('Export', 'Export functionality would be implemented here');
      } else {
        Alert.alert('No Data', 'No restaurants to export');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  React.useEffect(() => {
    loadApiKey();
  }, []);

  const SettingItem: React.FC<{
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
  }> = ({ icon, title, subtitle, onPress, rightComponent }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} disabled={!onPress}>
      <View style={styles.settingIcon}>
        <Icon name={icon} size={24} color="#FF6B35" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightComponent || (onPress && <Icon name="chevron-forward" size={20} color="#CCCCCC" />)}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI & Features</Text>
        
        <SettingItem
          icon="key-outline"
          title="OpenAI API Key"
          subtitle={apiKey ? 'Configured' : 'Required for AI features'}
          onPress={() => setShowApiKeyModal(true)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Permissions</Text>
        
        <SettingItem
          icon="notifications-outline"
          title="Notifications"
          subtitle="Get notified when near saved restaurants"
          rightComponent={
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#E0E0E0', true: '#FF6B35' }}
              thumbColor="#FFFFFF"
            />
          }
        />
        
        <SettingItem
          icon="location-outline"
          title="Location Services"
          subtitle="Required for proximity notifications"
          rightComponent={
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              trackColor={{ false: '#E0E0E0', true: '#FF6B35' }}
              thumbColor="#FFFFFF"
            />
          }
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        
        <SettingItem
          icon="download-outline"
          title="Export Data"
          subtitle="Export your restaurants as JSON"
          onPress={exportData}
        />
        
        <SettingItem
          icon="trash-outline"
          title="Clear All Data"
          subtitle="Delete all restaurants and settings"
          onPress={clearData}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <SettingItem
          icon="information-circle-outline"
          title="Version"
          subtitle="1.0.0"
        />
        
        <SettingItem
          icon="help-circle-outline"
          title="Help & Support"
          onPress={() => Alert.alert('Help', 'Help documentation would be available here')}
        />
        
        <SettingItem
          icon="document-text-outline"
          title="Privacy Policy"
          onPress={() => Alert.alert('Privacy', 'Privacy policy would be displayed here')}
        />
      </View>

      <Modal
        visible={showApiKeyModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowApiKeyModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>OpenAI API Key</Text>
            <TouchableOpacity onPress={testApiKey} disabled={isTestingApi}>
              {isTestingApi ? (
                <ActivityIndicator size="small" color="#FF6B35" />
              ) : (
                <Text style={styles.testButton}>Test</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.modalDescription}>
              Enter your OpenAI API key to enable AI-powered restaurant discovery and analysis.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>API Key</Text>
              <TextInput
                style={styles.textInput}
                value={tempApiKey}
                onChangeText={setTempApiKey}
                placeholder="sk-..."
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.infoBox}>
              <Icon name="information-circle-outline" size={20} color="#FF6B35" />
              <Text style={styles.infoText}>
                You can get your API key from platform.openai.com. The key is stored securely on your device.
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
  },
  section: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginTop: 44,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  cancelButton: {
    fontSize: 16,
    color: '#FF6B35',
  },
  testButton: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF5F0',
    borderRadius: 8,
    padding: 16,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666666',
    marginLeft: 12,
    lineHeight: 20,
  },
});

export default SettingsScreen;