// FavoriteEvents.tsx
// Maxwell Guillermo & Mariann Grace Dizon

// START of FavoriteEvents UI/UX
// START of Maxwell Guillermo Contribution

import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { formatDate } from '../utils/dateUtils';
import { ThemeContext } from '../context/ThemeContext';
import { getAuth } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

interface Event {
  title: string;
  date: string;
  venue: string;
  imageUrl: string; // Change type to string for URL
}

const FavoriteEvents = () => {
  const router = useRouter();
  const [favoriteEvents, setFavoriteEvents] = useState([]);

    // START of Mariann Grace Dizon Contribution
    // Initialize Firebase Auth
    const auth = getAuth();

    // Initialize Firestore
    const db = getFirestore();

    // Use theme context
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [isDarkMode, setIsDarkMode] = useState(theme === 'dark');

    // Update dark mode state when theme changes
    useEffect(() => {
        setIsDarkMode(theme === 'dark');
    }, [theme]);

    // Fetch user's theme preference from Firebase
    useEffect(() => {
        if (!auth.currentUser) return;
        const userDoc = doc(db, 'users', auth.currentUser.uid);
        const unsubscribe = onSnapshot(userDoc, (docSnapshot) => {
            const userData = docSnapshot.data();
            
            // Ensure userData is defined before accessing themePreference
            const userTheme = userData?.themePreference || 'light';
            setIsDarkMode(userTheme === 'dark'); // Set isDarkMode based on themePreference
        });

        return () => unsubscribe(); // Ensure unsubscribe is returned to clean up the listener
    }, [auth.currentUser]);
    // END of Mariann Grace Dizon Contribution

  useEffect(() => {
    const loadFavoriteEvents = async () => {
      try {
        const savedEvents = await AsyncStorage.getItem('favoriteEvents');
        if (savedEvents) {
          setFavoriteEvents(JSON.parse(savedEvents));
        }
      } catch (error) {
        console.error('Error loading favorite events:', error);
      }
    };

    loadFavoriteEvents();
  }, []);

  const handleEventPress = (event: Event) => {
    const eventData = {
      name: event.title,
      date: event.date,
      venue: event.venue,
      imageUrl: event.imageUrl,
      // Add any other fields needed for event-details
    };
    
    router.push({
      pathname: '/events/event-details',
      params: { eventData: JSON.stringify(eventData) }
    });
  };

  const renderEvent = (event: Event, index: number) => (
    <TouchableOpacity 
      key={index} 
      style={[styles.eventCard, { backgroundColor: isDarkMode ? 'transparent' : 'transparent' }]}
      onPress={() => handleEventPress(event)}
    >
      <Image 
        source={{ uri: event.imageUrl }}
        style={styles.eventImage}
      />
      <View style={styles.eventInfo}>
        <Text style={[styles.eventName, { color: isDarkMode ? '#fff' : '#000' }]} numberOfLines={3} ellipsizeMode="tail">{event.title}</Text>
        <Text style={styles.eventDate}>{formatDate(event.date)}</Text>
        <View style={styles.eventLocation}>
          <Ionicons name="location-outline" size={10} color={isDarkMode ? '#aaa' : '#888'} />
          <Text style={[styles.eventLocationText, { color: isDarkMode ? '#aaa' : '#888' }]} numberOfLines={1} ellipsizeMode="tail">{event.venue}</Text>
        </View>
      </View>
      <Ionicons name="star" size={14} color="#FFD700" style={styles.starIcon} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? 'transparent' : 'transparent' }]}>
      <View style={styles.header}>
        <Ionicons name="star" size={12} color="#FFD700" />
        <Text style={[styles.headerText, { color: isDarkMode ? '#fff' : '#000' }]}>Favorites</Text>
      </View>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {favoriteEvents.map(renderEvent)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    paddingHorizontal: 25,
    width: '80%',
    alignSelf: 'center',
    height: 320,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff8f0',
    borderRadius: 8,
    height: 90,
  },
  eventImage: {
    width: 70,
    height: 70,
    
  },
  eventInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
    height: '100%',
  },
  eventName: {
    fontSize: 11,
    fontWeight: 'bold',
    lineHeight: 15,
    marginBottom: 2,
  },
  eventDate: {
    fontSize: 10,
    color: '#FF69B4',
    marginTop: 2,
  },
  eventLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  eventLocationText: {
    fontSize: 10,
    color: '#888',
    marginLeft: 4,
  },
  starIcon: {
    marginLeft: 8,
  },
});

export default FavoriteEvents;

// END of FavoriteEvents UI/UX
// END of Maxwell Guillermo Contribution