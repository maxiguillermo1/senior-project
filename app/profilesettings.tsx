// Import necessary dependencies
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, Switch, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

// Define the ProfileSettings component
export default function ProfileSettings() {
  // Initialize router for navigation
  const router = useRouter();
  // Get initial image values from route params
  const { initialProfileImage, initialFavoritePerformanceImage } = useLocalSearchParams();
  // State variables for various settings
  const [showLastName, setShowLastName] = useState(true);
  const [showLocation, setShowLocation] = useState(true);
  const [showMyEvents, setShowMyEvents] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [profileImage, setProfileImage] = useState<string>(initialProfileImage as string);
  const [favoritePerformanceImage, setFavoritePerformanceImage] = useState(initialFavoritePerformanceImage as string | null);
  const [hasChanges, setHasChanges] = useState(false);

  // Function to handle back button press
  const handleBackPress = () => {
    router.back();
  };

  // Function to handle image picking
  const handleImagePicker = async (setImageFunction: React.Dispatch<React.SetStateAction<string>>) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImageFunction(result.assets[0].uri);
      setHasChanges(true);
    }
  };

  // Function to handle profile picture edit
  const handleEditProfilePicture = () => handleImagePicker(setProfileImage);

  // Function to handle saving changes
  const handleSave = () => {
    console.log('Saving changes...');
    router.replace({
      pathname: '/profile',
      params: { 
        updatedProfileImage: profileImage,
        updatedFavoritePerformanceImage: favoritePerformanceImage
      }
    });
  };

  // Function to handle logout
  const handleLogout = () => {
    // Add any logout logic here (e.g., clearing user session)
    router.replace('/login-signup');
  };

  // Render the component
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        {/* Back button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>back</Text>
        </TouchableOpacity>
        
        {/* Profile section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: profileImage }}
              style={styles.profilePicture}
            />
            <TouchableOpacity style={styles.editButton} onPress={handleEditProfilePicture}>
              <Ionicons name="pencil" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>Miles Morales</Text>
          <Text style={styles.location}>Brooklyn, New York</Text>
        </View>

        {/* Settings section */}
        <View style={styles.settingsSection}>
          {/* Notifications setting */}
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: "#767577", true: "#e66cab" }}
              thumbColor={notifications ? "#f4f3f4" : "#f4f3f4"}
            />
          </View>
          {/* Show Last Name setting */}
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Show Last Name</Text>
            <Switch
              value={showLastName}
              onValueChange={setShowLastName}
              trackColor={{ false: "#767577", true: "#e66cab" }}
              thumbColor={showLastName ? "#f4f3f4" : "#f4f3f4"}
            />
          </View>
          {/* Show Location setting */}
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Show Location</Text>
            <Switch
              value={showLocation}
              onValueChange={setShowLocation}
              trackColor={{ false: "#767577", true: "#e66cab" }}
              thumbColor={showLocation ? "#f4f3f4" : "#f4f3f4"}
            />
          </View>
          {/* Show My Events setting */}
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Show My Events</Text>
            <Switch
              value={showMyEvents}
              onValueChange={setShowMyEvents}
              trackColor={{ false: "#767577", true: "#e66cab" }}
              thumbColor={showMyEvents ? "#f4f3f4" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Save button (only shown when changes are made) */}
        {hasChanges && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        )}

        {/* Logout button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>logout</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </>
  );
}

// Define styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  backButton: {
    position: 'absolute',
    top: 80,
    left: 30,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 14,
    color: '#f4a261',
    fontWeight: 'bold',
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 120,
    marginBottom: 30,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#e66cab',
  },
  editButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#e66cab',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
    marginBottom: 20,
  },
  settingsSection: {
    paddingHorizontal: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  settingLabel: {
    fontSize: 16,
  },
  saveButton: {
    position: 'absolute',
    bottom: 100,  // Adjusted to accommodate logout button
    left: 20,
    right: 20,
    backgroundColor: '#e66cab',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#e07ab1',
    padding: 10,
    borderRadius: 25,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'lowercase',
  },
});
