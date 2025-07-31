import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Restaurant, RestaurantContextType } from '../types/Restaurant';
import { calculateDistance } from '../utils/locationUtils';

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

const STORAGE_KEY = 'snapbite_restaurants';

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  // Load restaurants from storage on app start
  useEffect(() => {
    loadRestaurants();
  }, []);

  // Save restaurants to storage whenever the list changes
  useEffect(() => {
    saveRestaurants();
  }, [restaurants]);

  const loadRestaurants = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const restaurantsWithDates = parsed.map((restaurant: any) => ({
          ...restaurant,
          dateAdded: new Date(restaurant.dateAdded),
          visitedDate: restaurant.visitedDate ? new Date(restaurant.visitedDate) : undefined,
        }));
        setRestaurants(restaurantsWithDates);
      }
    } catch (error) {
      console.error('Error loading restaurants:', error);
    }
  };

  const saveRestaurants = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(restaurants));
    } catch (error) {
      console.error('Error saving restaurants:', error);
    }
  };

  const addRestaurant = (restaurantData: Omit<Restaurant, 'id' | 'dateAdded'>) => {
    const newRestaurant: Restaurant = {
      ...restaurantData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      dateAdded: new Date(),
    };

    setRestaurants(prev => [newRestaurant, ...prev]);
  };

  const deleteRestaurant = (id: string) => {
    setRestaurants(prev => prev.filter(restaurant => restaurant.id !== id));
  };

  const updateRestaurant = (id: string, updates: Partial<Restaurant>) => {
    setRestaurants(prev =>
      prev.map(restaurant =>
        restaurant.id === id ? { ...restaurant, ...updates } : restaurant
      )
    );
  };

  const getNearbyRestaurants = (latitude: number, longitude: number, radiusKm: number): Restaurant[] => {
    return restaurants.filter(restaurant => {
      const distance = calculateDistance(
        latitude,
        longitude,
        restaurant.latitude,
        restaurant.longitude
      );
      return distance <= radiusKm;
    });
  };

  const searchRestaurants = (query: string): Restaurant[] => {
    const lowercaseQuery = query.toLowerCase();
    return restaurants.filter(restaurant =>
      restaurant.name.toLowerCase().includes(lowercaseQuery) ||
      restaurant.cuisine.toLowerCase().includes(lowercaseQuery) ||
      restaurant.address.toLowerCase().includes(lowercaseQuery) ||
      restaurant.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  };

  const value: RestaurantContextType = {
    restaurants,
    addRestaurant,
    deleteRestaurant,
    updateRestaurant,
    getNearbyRestaurants,
    searchRestaurants,
  };

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurants = (): RestaurantContextType => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurants must be used within a RestaurantProvider');
  }
  return context;
};