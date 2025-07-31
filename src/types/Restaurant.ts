export interface Restaurant {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  cuisine: string;
  priceRange: string;
  rating?: number;
  description?: string;
  imageUri?: string;
  dateAdded: Date;
  source: 'camera' | 'manual';
  tags: string[];
  website?: string;
  phoneNumber?: string;
  isVisited: boolean;
  visitedDate?: Date;
  notes?: string;
}

export interface RestaurantContextType {
  restaurants: Restaurant[];
  addRestaurant: (restaurant: Omit<Restaurant, 'id' | 'dateAdded'>) => void;
  deleteRestaurant: (id: string) => void;
  updateRestaurant: (id: string, updates: Partial<Restaurant>) => void;
  getNearbyRestaurants: (latitude: number, longitude: number, radiusKm: number) => Restaurant[];
  searchRestaurants: (query: string) => Restaurant[];
}

export interface AIAnalysisResult {
  restaurantName: string;
  cuisine: string;
  address: string;
  priceRange: string;
  description: string;
  tags: string[];
  confidence: number;
}