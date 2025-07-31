import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Linking,
  Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useRestaurants } from '../context/RestaurantContext';
import { Restaurant } from '../types/Restaurant';

interface RouteParams {
  restaurant: Restaurant;
}

const RestaurantDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { restaurant } = route.params as RouteParams;
  const { updateRestaurant, deleteRestaurant } = useRestaurants();
  
  const [isVisited, setIsVisited] = useState(restaurant.isVisited);

  const handleMarkVisited = () => {
    const newVisitedState = !isVisited;
    setIsVisited(newVisitedState);
    
    updateRestaurant(restaurant.id, {
      isVisited: newVisitedState,
      visitedDate: newVisitedState ? new Date() : undefined,
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Restaurant',
      `Are you sure you want to delete "${restaurant.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteRestaurant(restaurant.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    try {
      const message = `Check out ${restaurant.name}!\n\n${restaurant.cuisine} • ${restaurant.priceRange}\n${restaurant.address}\n\nShared via SnapBite`;
      
      await Share.share({
        message,
        title: restaurant.name,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDirections = () => {
    const url = `maps://app?daddr=${restaurant.latitude},${restaurant.longitude}`;
    const fallbackUrl = `https://maps.google.com/?q=${restaurant.latitude},${restaurant.longitude}`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Linking.openURL(fallbackUrl);
        }
      })
      .catch(() => {
        Linking.openURL(fallbackUrl);
      });
  };

  const handleCall = () => {
    if (restaurant.phoneNumber) {
      const phoneUrl = `tel:${restaurant.phoneNumber}`;
      Linking.openURL(phoneUrl);
    }
  };

  const handleWebsite = () => {
    if (restaurant.website) {
      let url = restaurant.website;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
      }
      Linking.openURL(url);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {restaurant.imageUri && (
        <Image source={{ uri: restaurant.imageUri }} style={styles.headerImage} />
      )}
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            <View style={styles.cuisineRow}>
              <Text style={styles.cuisine}>{restaurant.cuisine}</Text>
              <View style={styles.priceRange}>
                <Text style={styles.priceRangeText}>{restaurant.priceRange}</Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Icon name="share-outline" size={24} color="#FF6B35" />
          </TouchableOpacity>
        </View>

        <View style={styles.addressSection}>
          <Icon name="location-outline" size={20} color="#666666" />
          <Text style={styles.address}>{restaurant.address}</Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleDirections}>
            <Icon name="navigate-outline" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Directions</Text>
          </TouchableOpacity>
          
          {restaurant.phoneNumber && (
            <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
              <Icon name="call-outline" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Call</Text>
            </TouchableOpacity>
          )}
          
          {restaurant.website && (
            <TouchableOpacity style={styles.actionButton} onPress={handleWebsite}>
              <Icon name="globe-outline" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Website</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.visitedButton, isVisited && styles.visitedButtonActive]}
          onPress={handleMarkVisited}
        >
          <Icon 
            name={isVisited ? "checkmark-circle" : "checkmark-circle-outline"} 
            size={24} 
            color={isVisited ? "#FFFFFF" : "#FF6B35"} 
          />
          <Text style={[styles.visitedButtonText, isVisited && styles.visitedButtonTextActive]}>
            {isVisited ? 'Visited' : 'Mark as Visited'}
          </Text>
        </TouchableOpacity>

        {restaurant.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{restaurant.description}</Text>
          </View>
        )}

        {restaurant.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {restaurant.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          
          <View style={styles.detailRow}>
            <Icon name="calendar-outline" size={16} color="#666666" />
            <Text style={styles.detailLabel}>Added:</Text>
            <Text style={styles.detailValue}>{formatDate(restaurant.dateAdded)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Icon 
              name={restaurant.source === 'camera' ? 'camera-outline' : 'create-outline'} 
              size={16} 
              color="#666666" 
            />
            <Text style={styles.detailLabel}>Source:</Text>
            <Text style={styles.detailValue}>
              {restaurant.source === 'camera' ? 'AI Camera Detection' : 'Manual Entry'}
            </Text>
          </View>
          
          {restaurant.visitedDate && (
            <View style={styles.detailRow}>
              <Icon name="checkmark-circle-outline" size={16} color="#666666" />
              <Text style={styles.detailLabel}>Visited:</Text>
              <Text style={styles.detailValue}>{formatDate(restaurant.visitedDate)}</Text>
            </View>
          )}
          
          {restaurant.rating && (
            <View style={styles.detailRow}>
              <Icon name="star-outline" size={16} color="#666666" />
              <Text style={styles.detailLabel}>Rating:</Text>
              <Text style={styles.detailValue}>{restaurant.rating}/5</Text>
            </View>
          )}
        </View>

        {restaurant.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{restaurant.notes}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Icon name="trash-outline" size={20} color="#FF3B30" />
          <Text style={styles.deleteButtonText}>Delete Restaurant</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleSection: {
    flex: 1,
    marginRight: 16,
  },
  restaurantName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  cuisineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cuisine: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '500',
    marginRight: 12,
  },
  priceRange: {
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  priceRangeText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  shareButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    padding: 8,
  },
  addressSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  address: {
    fontSize: 16,
    color: '#666666',
    marginLeft: 8,
    flex: 1,
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  visitedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FF6B35',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 24,
  },
  visitedButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  visitedButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
    marginLeft: 8,
  },
  visitedButtonTextActive: {
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 14,
    color: '#666666',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
    marginRight: 8,
    minWidth: 60,
  },
  detailValue: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
  notes: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 20,
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#FF3B30',
    marginLeft: 8,
  },
});

export default RestaurantDetailScreen;