import Geolocation from '@react-native-community/geolocation';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

// Get current device location
export const getCurrentLocation = (): Promise<LocationCoordinates> => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  });
};

// Watch location changes
export const watchLocation = (
  onLocationChange: (location: LocationCoordinates) => void,
  onError?: (error: any) => void
): number => {
  return Geolocation.watchPosition(
    (position) => {
      onLocationChange({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    },
    (error) => {
      console.error('Error watching location:', error);
      if (onError) {
        onError(error);
      }
    },
    {
      enableHighAccuracy: true,
      distanceFilter: 100, // Update when moved 100 meters
    }
  );
};

// Stop watching location
export const clearLocationWatch = (watchId: number): void => {
  Geolocation.clearWatch(watchId);
};

// Geocoding - convert address to coordinates (requires external service)
export const geocodeAddress = async (address: string): Promise<LocationCoordinates | null> => {
  try {
    // This would typically use Google Maps Geocoding API or similar
    // For now, return null - can be implemented when API keys are available
    console.log('Geocoding address:', address);
    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};

// Reverse geocoding - convert coordinates to address
export const reverseGeocode = async (latitude: number, longitude: number): Promise<string | null> => {
  try {
    // This would typically use Google Maps Reverse Geocoding API or similar
    console.log('Reverse geocoding:', latitude, longitude);
    return null;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
};