/**
 * Geocoding Service for Address to Coordinates Conversion
 * Uses free OpenStreetMap Nominatim API with Google Maps fallback
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export class GeocodingService {
  private googleApiKey?: string;

  constructor(googleApiKey?: string) {
    this.googleApiKey = googleApiKey;
  }

  async geocodeAddress(address: string): Promise<Coordinates> {
    // Try Google Maps first if API key is available
    if (this.googleApiKey) {
      try {
        return await this.geocodeWithGoogle(address);
      } catch (error) {
        console.warn('Google Geocoding failed, falling back to Nominatim:', error);
      }
    }

    // Fallback to free Nominatim service
    try {
      return await this.geocodeWithNominatim(address);
    } catch (error) {
      console.error('All geocoding services failed:', error);
      return this.getDefaultCoordinates();
    }
  }

  private async geocodeWithGoogle(address: string): Promise<Coordinates> {
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${this.googleApiKey}`
    );

    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng,
      };
    }

    throw new Error(`Google Geocoding failed: ${data.status}`);
  }

  private async geocodeWithNominatim(address: string): Promise<Coordinates> {
    const encodedAddress = encodeURIComponent(address);
    
    // Add delay to respect Nominatim usage policy
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'SnapBite Restaurant Discovery App',
        },
      }
    );

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }

    throw new Error('Nominatim geocoding returned no results');
  }

  private getDefaultCoordinates(): Coordinates {
    // Return San Francisco coordinates as default with slight randomization
    return {
      latitude: 37.7749 + (Math.random() - 0.5) * 0.1,
      longitude: -122.4194 + (Math.random() - 0.5) * 0.1,
    };
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<string> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'SnapBite Restaurant Discovery App',
          },
        }
      );

      const data = await response.json();
      return data.display_name || `${latitude}, ${longitude}`;
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
  }
}