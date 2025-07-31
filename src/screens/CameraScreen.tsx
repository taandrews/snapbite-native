import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { RNCamera } from 'react-native-camera';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRestaurants } from '../context/RestaurantContext';
import { openaiService } from '../services/openaiService';
import { getCurrentLocation } from '../utils/locationUtils';
import { Restaurant } from '../types/Restaurant';

const CameraScreen: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [manualEntry, setManualEntry] = useState({
    name: '',
    address: '',
    cuisine: '',
    priceRange: '$$',
  });
  
  const cameraRef = useRef<RNCamera>(null);
  const { addRestaurant } = useRestaurants();

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const options = {
          quality: 0.8,
          base64: true,
          skipProcessing: true,
        };
        const data = await cameraRef.current.takePictureAsync(options);
        setCapturedImage(data.uri);
        
        if (data.base64) {
          await analyzeImage(data.base64);
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const analyzeImage = async (base64Image: string) => {
    setIsAnalyzing(true);
    try {
      const result = await openaiService.analyzeRestaurantImage(base64Image);
      
      if (result.confidence > 0.3) {
        setAnalysisResult(result);
        setManualEntry({
          name: result.restaurantName,
          address: result.address,
          cuisine: result.cuisine,
          priceRange: result.priceRange,
        });
        setShowModal(true);
      } else {
        Alert.alert(
          'Restaurant Not Detected',
          'Could not identify a restaurant in this image. Would you like to add one manually?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Add Manually', onPress: () => setShowModal(true) },
          ]
        );
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      Alert.alert(
        'Analysis Failed',
        'Could not analyze the image. Would you like to add a restaurant manually?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Manually', onPress: () => setShowModal(true) },
        ]
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveRestaurant = async () => {
    if (!manualEntry.name.trim()) {
      Alert.alert('Error', 'Restaurant name is required');
      return;
    }

    try {
      const location = await getCurrentLocation();
      
      const newRestaurant: Omit<Restaurant, 'id' | 'dateAdded'> = {
        name: manualEntry.name.trim(),
        address: manualEntry.address.trim() || 'Address not provided',
        latitude: location.latitude,
        longitude: location.longitude,
        cuisine: manualEntry.cuisine.trim() || 'Unknown',
        priceRange: manualEntry.priceRange,
        description: analysisResult?.description || '',
        imageUri: capturedImage || undefined,
        source: capturedImage ? 'camera' : 'manual',
        tags: analysisResult?.tags || [],
        isVisited: false,
      };

      addRestaurant(newRestaurant);
      
      Alert.alert('Success', 'Restaurant added to your collection!');
      resetForm();
    } catch (error) {
      console.error('Error saving restaurant:', error);
      Alert.alert('Error', 'Failed to save restaurant');
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setCapturedImage(null);
    setAnalysisResult(null);
    setManualEntry({
      name: '',
      address: '',
      cuisine: '',
      priceRange: '$$',
    });
  };

  return (
    <View style={styles.container}>
      <RNCamera
        ref={cameraRef}
        style={styles.camera}
        type={RNCamera.Constants.Type.back}
        flashMode={RNCamera.Constants.FlashMode.auto}
        captureAudio={false}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.title}>SnapBite</Text>
            <Text style={styles.subtitle}>Discover restaurants with AI</Text>
          </View>

          <View style={styles.scanArea}>
            <View style={styles.scanFrame} />
            <Text style={styles.scanText}>
              Point camera at restaurant sign or menu
            </Text>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.manualButton}
              onPress={() => setShowModal(true)}
            >
              <Icon name="add-outline" size={24} color="#FFFFFF" />
              <Text style={styles.manualButtonText}>Manual</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.captureButton, isAnalyzing && styles.captureButtonDisabled]}
              onPress={takePicture}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <ActivityIndicator size="large" color="#FFFFFF" />
              ) : (
                <Icon name="camera" size={32} color="#FFFFFF" />
              )}
            </TouchableOpacity>

            <View style={styles.placeholder} />
          </View>
        </View>
      </RNCamera>

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={resetForm}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Restaurant</Text>
            <TouchableOpacity onPress={saveRestaurant}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {capturedImage && (
              <Image source={{ uri: capturedImage }} style={styles.previewImage} />
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Restaurant Name *</Text>
              <TextInput
                style={styles.textInput}
                value={manualEntry.name}
                onChangeText={(text) => setManualEntry({ ...manualEntry, name: text })}
                placeholder="Enter restaurant name"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address</Text>
              <TextInput
                style={styles.textInput}
                value={manualEntry.address}
                onChangeText={(text) => setManualEntry({ ...manualEntry, address: text })}
                placeholder="Enter address"
                multiline
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Cuisine Type</Text>
              <TextInput
                style={styles.textInput}
                value={manualEntry.cuisine}
                onChangeText={(text) => setManualEntry({ ...manualEntry, cuisine: text })}
                placeholder="e.g., Italian, Mexican, Asian"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Price Range</Text>
              <View style={styles.priceButtons}>
                {['$', '$$', '$$$', '$$$$'].map((price) => (
                  <TouchableOpacity
                    key={price}
                    style={[
                      styles.priceButton,
                      manualEntry.priceRange === price && styles.priceButtonSelected,
                    ]}
                    onPress={() => setManualEntry({ ...manualEntry, priceRange: price })}
                  >
                    <Text
                      style={[
                        styles.priceButtonText,
                        manualEntry.priceRange === price && styles.priceButtonTextSelected,
                      ]}
                    >
                      {price}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {analysisResult && (
              <View style={styles.aiAnalysis}>
                <Text style={styles.aiAnalysisTitle}>AI Analysis</Text>
                <Text style={styles.aiAnalysisText}>
                  Confidence: {Math.round(analysisResult.confidence * 100)}%
                </Text>
                {analysisResult.description && (
                  <Text style={styles.aiAnalysisText}>
                    {analysisResult.description}
                  </Text>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 200,
    borderWidth: 2,
    borderColor: '#FF6B35',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  scanText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  manualButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    minWidth: 80,
  },
  manualButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 4,
  },
  captureButton: {
    backgroundColor: '#FF6B35',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonDisabled: {
    backgroundColor: 'rgba(255, 107, 53, 0.5)',
  },
  placeholder: {
    width: 80,
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
  saveButton: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginVertical: 16,
  },
  inputGroup: {
    marginBottom: 20,
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
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  priceButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    alignItems: 'center',
  },
  priceButtonSelected: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  priceButtonText: {
    fontSize: 16,
    color: '#333333',
  },
  priceButtonTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  aiAnalysis: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  aiAnalysisTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  aiAnalysisText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
});

export default CameraScreen;