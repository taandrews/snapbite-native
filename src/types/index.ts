/**
 * TypeScript type definitions for SnapBite
 */

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  rating: number;
  cuisine: string;
  priceRange: string;
  latitude: number;
  longitude: number;
  imageUri?: string;
  extractedText?: string;
  dateAdded: string;
  reviewCount?: number;
  phoneNumber?: string;
  website?: string;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface PremiumFeatures {
  unlimitedSaves: boolean;
  advancedAnalytics: boolean;
  prioritySupport: boolean;
  noAds: boolean;
}

export interface AppState {
  restaurants: Restaurant[];
  userLocation: UserLocation | null;
  isPremium: boolean;
  premiumFeatures: PremiumFeatures;
  isLocationEnabled: boolean;
  analysisHistory: string[];
}

export interface ImagePickerResponse {
  didCancel?: boolean;
  errorMessage?: string;
  assets?: Array<{
    uri?: string;
    width?: number;
    height?: number;
    fileSize?: number;
    type?: string;
    fileName?: string;
  }>;
}