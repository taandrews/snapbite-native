import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform, Alert, Linking } from 'react-native';
import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';

interface PermissionsContextType {
  cameraPermission: string;
  locationPermission: string;
  requestCameraPermission: () => Promise<boolean>;
  requestLocationPermission: () => Promise<boolean>;
  checkPermissions: () => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cameraPermission, setCameraPermission] = useState<string>(RESULTS.UNAVAILABLE);
  const [locationPermission, setLocationPermission] = useState<string>(RESULTS.UNAVAILABLE);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const cameraResult = await check(
        Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA
      );
      setCameraPermission(cameraResult);

      const locationResult = await check(
        Platform.OS === 'ios' 
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE 
          : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
      );
      setLocationPermission(locationResult);
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      const result = await request(
        Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA
      );
      
      setCameraPermission(result);

      if (result === RESULTS.GRANTED) {
        return true;
      } else if (result === RESULTS.BLOCKED || result === RESULTS.DENIED) {
        Alert.alert(
          'Camera Permission Required',
          'SnapBite needs camera access to analyze restaurant photos. Please enable camera permission in Settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: openSettings },
          ]
        );
      }
      return false;
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return false;
    }
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const result = await request(
        Platform.OS === 'ios' 
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE 
          : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
      );
      
      setLocationPermission(result);

      if (result === RESULTS.GRANTED) {
        return true;
      } else if (result === RESULTS.BLOCKED || result === RESULTS.DENIED) {
        Alert.alert(
          'Location Permission Required',
          'SnapBite needs location access to provide proximity notifications and sort restaurants by distance.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: openSettings },
          ]
        );
      }
      return false;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  const value: PermissionsContextType = {
    cameraPermission,
    locationPermission,
    requestCameraPermission,
    requestLocationPermission,
    checkPermissions,
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = (): PermissionsContextType => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};