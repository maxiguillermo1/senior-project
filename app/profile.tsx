// Import necessary components and hooks from React and React Native
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BottomNavBar from '../components/BottomNavBar';
import { auth, db } from '../firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState({
    name: 'Name not set',
    location: 'Location not set',
    profileImageUrl: '',
  });

  // State hooks for managing the editable fields
  const [tuneOfMonth, setTuneOfMonth] = useState('');
  const [favoritePerformance, setFavoritePerformance] = useState('');
  const [listenTo, setListenTo] = useState('');

  useEffect(() => {
    const currentUser = auth.currentUser;

    if (currentUser) {
      const userDocRef = doc(db, 'users', currentUser.uid);
      

      // listens for changes to the user document and updates the states
      const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          setUser({
            name: `${userData.firstName} ${userData.lastName}`,
            location: userData.location || 'Location not set',
            profileImageUrl: userData.profileImageUrl || '',
          });
          setTuneOfMonth(userData.tuneOfMonth || '');
          setFavoritePerformance(userData.favoritePerformance || '');
          setListenTo(userData.listenTo || '');
        }
      }, (error) => {
        console.error('Error fetching user data:', error);
      });

      // Cleanup function to unsubscribe when component unmounts
      return () => unsubscribe();
    }
  }, []);

  const handleSettingsPress = () => {
    router.push('/profilesettings');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header section with profile picture, user info, and settings button */}
        <View style={styles.header}>
          <Image
            source={{ uri: user.profileImageUrl }}
            style={styles.profilePicture}
          />
          <View style={styles.userInfo}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.location}>{user.location}</Text>
          </View>
          <TouchableOpacity style={styles.settingsButton} onPress={handleSettingsPress}>
            <Ionicons name="settings-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        
        {/* Content section with editable fields */}
        <View style={styles.content}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Tune of the month</Text>
            <TextInput
              style={styles.input}
              value={tuneOfMonth}
              onChangeText={setTuneOfMonth}
              multiline
              placeholder="Enter tune of the month"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>My favorite performance (so far)</Text>
            <View style={styles.imageInputPlaceholder}>
              {/* Placeholder for image upload functionality */}
              <Text style={styles.imageInputText}>+</Text>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>I listen to music to</Text>
            <TextInput
              style={styles.input}
              value={listenTo}
              onChangeText={setListenTo}
              multiline
              placeholder="Enter your music listening reasons"
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <BottomNavBar />
    </SafeAreaView>
  );
}

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8f0',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 60, // Add padding to account for the BottomNavBar
  },
  header: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profilePicture: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#e66cab',
  },
  userInfo: {
    flex: 1,
    marginLeft: 15,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  location: {
    fontSize: 14,
    color: '#666',
  },
  settingsButton: {
    padding: 10,
  },
  content: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    minHeight: 45,
  },
  imageInputPlaceholder: {
    width: '100%',
    height: 160,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageInputText: {
    fontSize: 40,
    color: '#999',
  },
});