import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  RefreshControl,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useRestaurants } from '../context/RestaurantContext';
import { Restaurant } from '../types/Restaurant';
import { getCurrentLocation } from '../utils/locationUtils';

const RestaurantsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { restaurants, deleteRestaurant, searchRestaurants, getNearbyRestaurants } = useRestaurants();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(restaurants);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'distance'>('date');

  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredRestaurants(searchRestaurants(searchQuery));
    } else {
      setFilteredRestaurants(restaurants);
    }
  }, [searchQuery, restaurants, searchRestaurants]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // In a real app, this might sync with a backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const sortRestaurants = async (sortType: 'date' | 'name' | 'distance') => {
    setSortBy(sortType);
    let sorted = [...filteredRestaurants];

    switch (sortType) {
      case 'date':
        sorted.sort((a, b) => b.dateAdded.getTime() - a.dateAdded.getTime());
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'distance':
        try {
          const location = await getCurrentLocation();
          sorted.sort((a, b) => {
            const distanceA = Math.sqrt(
              Math.pow(a.latitude - location.latitude, 2) + 
              Math.pow(a.longitude - location.longitude, 2)
            );
            const distanceB = Math.sqrt(
              Math.pow(b.latitude - location.latitude, 2) + 
              Math.pow(b.longitude - location.longitude, 2)
            );
            return distanceA - distanceB;
          });
        } catch (error) {
          Alert.alert('Error', 'Could not get your location for sorting');
          return;
        }
        break;
    }
    setFilteredRestaurants(sorted);
  };

  const showSortOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Sort by Date Added', 'Sort by Name', 'Sort by Distance'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          switch (buttonIndex) {
            case 1:
              sortRestaurants('date');
              break;
            case 2:
              sortRestaurants('name');
              break;
            case 3:
              sortRestaurants('distance');
              break;
          }
        }
      );
    }
  };

  const handleDeleteRestaurant = (restaurant: Restaurant) => {
    Alert.alert(
      'Delete Restaurant',
      `Are you sure you want to delete "${restaurant.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteRestaurant(restaurant.id),
        },
      ]
    );
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: diffDays > 365 ? 'numeric' : undefined 
      });
    }
  };

  const renderRestaurant = ({ item }: { item: Restaurant }) => (
    <TouchableOpacity
      style={styles.restaurantCard}
      onPress={() => navigation.navigate('RestaurantDetail' as never, { restaurant: item } as never)}
    >
      <View style={styles.cardContent}>
        {item.imageUri && (
          <Image source={{ uri: item.imageUri }} style={styles.restaurantImage} />
        )}
        
        <View style={styles.restaurantInfo}>
          <View style={styles.restaurantHeader}>
            <Text style={styles.restaurantName} numberOfLines={1}>
              {item.name}
            </Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteRestaurant(item)}
            >
              <Icon name="trash-outline" size={18} color="#FF3B30" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.restaurantCuisine} numberOfLines={1}>
            {item.cuisine} • {item.priceRange}
          </Text>
          
          <Text style={styles.restaurantAddress} numberOfLines={2}>
            {item.address}
          </Text>
          
          <View style={styles.restaurantMeta}>
            <View style={styles.metaItem}>
              <Icon name="calendar-outline" size={12} color="#666666" />
              <Text style={styles.metaText}>Added {formatDate(item.dateAdded)}</Text>
            </View>
            
            <View style={styles.metaItem}>
              <Icon 
                name={item.source === 'camera' ? 'camera-outline' : 'create-outline'} 
                size={12} 
                color="#666666" 
              />
              <Text style={styles.metaText}>
                {item.source === 'camera' ? 'AI Detected' : 'Manual Entry'}
              </Text>
            </View>
          </View>
          
          {item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 3).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
              {item.tags.length > 3 && (
                <Text style={styles.moreTagsText}>+{item.tags.length - 3} more</Text>
              )}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="restaurant-outline" size={64} color="#CCCCCC" />
      <Text style={styles.emptyStateTitle}>No Restaurants Yet</Text>
      <Text style={styles.emptyStateText}>
        Start discovering restaurants by using the camera to scan menus, signs, or add them manually.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Restaurants</Text>
        <Text style={styles.subtitle}>{restaurants.length} saved</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Icon name="search-outline" size={20} color="#666666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search restaurants..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={20} color="#666666" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity style={styles.sortButton} onPress={showSortOptions}>
          <Icon name="options-outline" size={20} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredRestaurants}
        renderItem={renderRestaurant}
        keyExtractor={(item) => item.id}
        contentContainerStyle={filteredRestaurants.length === 0 ? styles.emptyContainer : styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    marginLeft: 8,
  },
  sortButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 10,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  restaurantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    padding: 16,
  },
  restaurantImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 12,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    padding: 4,
  },
  restaurantCuisine: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '500',
    marginBottom: 4,
  },
  restaurantAddress: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
    lineHeight: 20,
  },
  restaurantMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  tag: {
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#666666',
  },
  moreTagsText: {
    fontSize: 12,
    color: '#999999',
    fontStyle: 'italic',
  },
});

export default RestaurantsScreen;