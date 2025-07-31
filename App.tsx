import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';

// Screens
import CameraScreen from './src/screens/CameraScreen';
import RestaurantsScreen from './src/screens/RestaurantsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import RestaurantDetailScreen from './src/screens/RestaurantDetailScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

// Context
import { RestaurantProvider } from './src/context/RestaurantContext';
import { PermissionsProvider } from './src/context/PermissionsContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'Camera') {
            iconName = focused ? 'camera' : 'camera-outline';
          } else if (route.name === 'Restaurants') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Camera" 
        component={CameraScreen}
        options={{ title: 'Discover' }}
      />
      <Tab.Screen 
        name="Restaurants" 
        component={RestaurantsScreen}
        options={{ title: 'My Restaurants' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

const App = (): React.JSX.Element => {
  return (
    <PermissionsProvider>
      <RestaurantProvider>
        <NavigationContainer>
          <StatusBar
            barStyle="dark-content"
            backgroundColor="#FFFFFF"
          />
          <SafeAreaView style={styles.container}>
            <Stack.Navigator
              initialRouteName="Onboarding"
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen name="Main" component={MainTabs} />
              <Stack.Screen 
                name="RestaurantDetail" 
                component={RestaurantDetailScreen}
                options={{
                  headerShown: true,
                  title: 'Restaurant Details',
                  headerStyle: {
                    backgroundColor: '#FF6B35',
                  },
                  headerTintColor: '#FFFFFF',
                }}
              />
            </Stack.Navigator>
          </SafeAreaView>
        </NavigationContainer>
      </RestaurantProvider>
    </PermissionsProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default App;