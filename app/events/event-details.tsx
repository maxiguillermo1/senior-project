// event-details.tsx
// Created by Maxwell Guillermo 
// START of Maxwell's contribution

// This file creates a detailed view page for individual events
// It shows event info, generates AI descriptions, and handles user interactions

// Import necessary tools and components we need
import React, { useState, useEffect, useRef } from 'react'; // Core React features for building the component
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native'; // Basic UI components from React Native
import { useLocalSearchParams, useRouter } from 'expo-router'; // Tools for navigation and getting URL parameters
import axios from 'axios'; // Tool for making API requests
import { Ionicons } from '@expo/vector-icons'; // Package for nice-looking icons

// API key for Google's Gemini AI service that generates event descriptions
const GEMINI_API_KEY = 'AIzaSyD6l21NbFiYT1QtW6H6iaIQMvKxwMAQ604';

// Main component that displays all event details
const EventDetailsPage = () => {
  // Get event data passed through URL parameters and parse it from JSON string
  const params = useLocalSearchParams();
  const eventData = params.eventData ? JSON.parse(params.eventData as string) : null;
  const router = useRouter(); // Tool to help with navigation

  // Variables to store and update different states of the page
  const [aiDescription, setAiDescription] = useState(''); // Stores AI-generated event description
  const descriptionGeneratedRef = useRef(false); // Keeps track if we already generated a description
  const [isLoading, setIsLoading] = useState(true); // Shows loading spinner while getting description
  const [isAttending, setIsAttending] = useState(false); // Tracks if user marked as attending
  const [isFavorite, setIsFavorite] = useState(false); // Tracks if user favorited the event

  // Helper function to make dates look nice (e.g., "January 1, 2024")
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  // This runs when the component loads to generate an AI description of the event
  useEffect(() => {
    const generateAIDescription = async () => {
      // Don't do anything if we don't have event data or already generated description
      if (!eventData || descriptionGeneratedRef.current) return;

      setIsLoading(true); // Show loading spinner
      try {
        // Make API request to Gemini AI to generate event description
        const response = await axios.post(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
          {
            contents: [
              {
                parts: [
                  { text: `Create a concise 5-sentence description for ${eventData.name}'s upcoming performance:

                    1. Introduce the artist and their significance in the music industry.
                    2. Describe the location and details of the upcoming event.
                    3. Briefly mention the artist's backstory or journey in music.
                    4. Highlight the artist's primary genre or style of music.
                    5. Explain why this artist is worth seeing live.

                    Use the following information:
                    Artist: ${eventData.name}
                    Genre: ${eventData.genre || 'Not specified'}
                    Event Date: ${eventData.date}
                    Venue: ${eventData.venue}
                    Location: ${eventData.location}` }
                ]
              }
            ]
          },
          {
            params: { key: GEMINI_API_KEY },
            headers: { 'Content-Type': 'application/json' }
          }
        );
        
        // Save the generated description
        const generatedDescription = response.data.candidates[0].content.parts[0].text;
        setAiDescription(generatedDescription);
        descriptionGeneratedRef.current = true;
      } catch (error) {
        // If something goes wrong, log error and clear description
        console.error('Error generating AI description:', error);
        setAiDescription('');
        descriptionGeneratedRef.current = true;
      } finally {
        setIsLoading(false); // Hide loading spinner
      }
    };

    generateAIDescription();
  }, [eventData]);

  // Functions to handle user interactions
  const handleBackPress = () => {
    router.back(); // Go back to previous screen
  };

  const handleArtistDetails = () => {
    // Future feature: Show artist details page
    console.log('Navigate to artist details');
  };

  const handleTickets = () => {
    // Future feature: Link to ticket purchasing
    console.log('Navigate to tickets');
  };

  const handleAttending = () => {
    setIsAttending(!isAttending); // Toggle attending status
    // Future feature: Save this status to a database
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite); // Toggle favorite status
    // Future feature: Save this status to a database
  };

  // The actual layout/display of the page
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        <View style={styles.container}>
          {/* Back button at top of screen */}
          <View style={styles.customHeader}>
            <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
              <Ionicons name="chevron-back" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
          
          {/* Event title and date */}
          {eventData?.name && <Text style={styles.title}>{eventData.name}</Text>}
          {eventData?.date && <Text style={styles.date}>{formatDate(eventData.date)}</Text>}
          
          {/* Event image */}
          {eventData?.imageUrl && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: eventData.imageUrl }} style={styles.image} />
            </View>
          )}
          
          {/* Event details section */}
          <View style={styles.detailsContainer}>
            {/* Venue and location info */}
            {(eventData?.venue || eventData?.location) && (
              <Text style={styles.detailText}>
                {`${eventData.venue || ''} ${eventData.venue && eventData.location ? '-' : ''} ${eventData.location || ''}`}
              </Text>
            )}
            <Text style={styles.detailText}>Artist Details</Text>
            <Text style={styles.detailText}>Tickets</Text>
            <Text style={styles.descriptionTitle}>Event Description</Text>
            
            {/* Show loading spinner or AI description */}
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="rgba(121, 206, 84, 0.7)" />
              </View>
            ) : (
              <Text style={[styles.descriptionText, styles.centeredText]}>{aiDescription}</Text>
            )}
          </View>

          {/* Buttons for user interactions */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, isAttending && styles.activeButton]}
              onPress={handleAttending}
            >
              <Text style={styles.buttonText}>
                {isAttending ? "I'm Attending!" : "I'm Attending"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, isFavorite && styles.activeButton]}
              onPress={handleFavorite}
            >
              <Text style={styles.buttonText}>
                {isFavorite ? "Favorited" : "Favorite"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles that control how everything looks
const styles = StyleSheet.create({
  safeArea: {
    flex: 1, // Take up all available space
    backgroundColor: '#fff8f0', // Light cream background
  },
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff8f0',
    borderRadius: 10, // Rounded corners
    margin: 30,
    // Shadow settings (currently disabled)
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  customHeader: {
    flexDirection: 'row', // Arrange items horizontally
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 21.5,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  date: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
    color: '#fba904', // Orange color
    fontWeight: 'bold',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  image: {
    width: 180,
    height: 180,
    resizeMode: 'cover',
  },
  detailsContainer: {
    marginBottom: 15,
  },
  detailText: {
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
    color: '#fc6c85', // Pink color
    fontWeight: 'bold',
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  centeredText: {
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#37bdd5', // Blue color
    padding: 8,
    borderRadius: 3,
    width: '45%',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: 'rgba(76, 217, 100, 0.7)', // Semi-transparent green
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
});

// Make this component available to other parts of the app
export default EventDetailsPage;

// End of file
// Created by Maxwell Guillermo 

// This completes the event details page with both frontend display and backend logic
// End of Maxwell's contribution
