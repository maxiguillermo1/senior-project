// profile.tsx
// Mariann Grace Dizon

// Import necessary modules and define types
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, ScrollView, Keyboard, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth, db } from '../firebaseConfig';
import { doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import BottomNavBar from '../components/BottomNavBar';
import { registerForPushNotificationsAsync, hasUnreadNotifications, addNotification } from '../scripts/notificationHandler';

// Define interfaces for data structures
interface Song {
  id: string;
  name: string;
  artist: string;
  albumArt: string;
}

interface Album {
  id: string;
  name: string;
  artist: string;
  albumArt: string;
}

interface Artist {
  id: string;
  name: string;
  picture: string;
}

interface Prompt {
  question: string;
  answer: string;
}

interface DisposablePhoto {
  url: string;
  timestamp: number;
}
// End of imports and type definitions

// Define Profile component and initialize state
const gifImages: Record<string, any> = {
  'pfpoverlay1.gif': require('../assets/animated-avatar/pfpoverlay1.gif'),
  'pfpoverlay2.gif': require('../assets/animated-avatar/pfpoverlay2.gif'),
  'pfpoverlay3.gif': require('../assets/animated-avatar/pfpoverlay3.gif'),
  'pfpoverlay4.gif': require('../assets/animated-avatar/pfpoverlay4.gif'),
  'pfpoverlay5.gif': require('../assets/animated-avatar/pfpoverlay5.gif'),
  'pfpoverlay6.gif': require('../assets/animated-avatar/pfpoverlay6.gif'),
};

export default function Profile() {
  // State for animated border image
  const [animatedBorder, setAnimatedBorder] = useState<ImageSourcePropType | null>(null);

  const router = useRouter();
  // State for user profile data
  const [user, setUser] = useState({
    name: 'Name not set',
    location: 'Location not set',
    profileImageUrl: '',
    gender: '',
    myDisposables: '',
  });

  // State for various user preferences and data
  const [tuneOfMonth, setTuneOfMonth] = useState<Song | null>(null);
  const [favoritePerformance, setFavoritePerformance] = useState('');
  const [favoriteAlbumData, setFavoriteAlbumData] = useState<Album | null>(null);
  const [favoriteArtists, setFavoriteArtists] = useState<Artist[]>([]);
  const [tuneOfMonthLoaded, setTuneOfMonthLoaded] = useState(false);
  const [musicPreference, setMusicPreference] = useState<string[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [selectedDisposable, setSelectedDisposable] = useState<DisposablePhoto | null>(null);

  // Fetch animated border image based on user data
  const fetchAnimatedBorder = async () => {
    if (auth.currentUser) {
      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.AnimatedBorder && gifImages[userData.AnimatedBorder]) {
            setAnimatedBorder(gifImages[userData.AnimatedBorder] as ImageSourcePropType);
          }
        }
      } catch (error) {
        console.error('Error fetching animated border:', error);
      }
    }
  };

  // Fetch user data and register push notifications
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error('User not authenticated');
        const userDocRef = doc(db, 'users', currentUser.uid);
        
        // Listen for real-time updates to user data
        const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data();
            setUser({
              name: userData.displayName || `${userData.firstName} ${userData.lastName}`,
              location: userData.displayLocation || 'Location not set',
              profileImageUrl: userData.profileImageUrl || '',
              gender: userData.gender || '',
              myDisposables: userData.myDisposables || '',
            });

            // Fetch animated border image
            fetchAnimatedBorder();

            // Parse and set tune of the month
            if (userData.tuneOfMonth) {
              try {
                const parsedTuneOfMonth = JSON.parse(userData.tuneOfMonth);
                setTuneOfMonth(parsedTuneOfMonth);
                setTuneOfMonthLoaded(true);
              } catch (error) {
                console.error('Error parsing tuneOfMonth:', error);
                setTuneOfMonth(null);
              }
            } else {
              setTuneOfMonth(null);
            }

            // Parse and set favorite album data
            if (userData.favoriteAlbum) {
              try {
                const parsedFavoriteAlbum = JSON.parse(userData.favoriteAlbum);
                setFavoriteAlbumData(parsedFavoriteAlbum);
              } catch (error) {
                console.error('Error parsing favoriteAlbum:', error);
                setFavoriteAlbumData(null);
              }
            } else {
              setFavoriteAlbumData(null);
            }

            // Parse and set favorite artists
            if (userData.favoriteArtists) {
              try {
                const parsedFavoriteArtists = JSON.parse(userData.favoriteArtists);
                setFavoriteArtists(parsedFavoriteArtists);
              } catch (error) {
                console.error('Error parsing favoriteArtists:', error);
                setFavoriteArtists([]);
              }
            } else {
              setFavoriteArtists([]);
            }

            // Set other user preferences
            setFavoritePerformance(userData.favoritePerformance || '');
            setMusicPreference(userData.musicPreference || []);

            // Fetch and set prompts
            const fetchedPrompts = userData.prompts || {};
            const promptsArray = Object.entries(fetchedPrompts).map(([question, answer]) => ({
              question,
              answer: answer as string
            }));
            setPrompts(promptsArray);

            if (userData.myDisposables) {
              setSelectedDisposable({ url: userData.myDisposables, timestamp: Date.now() });
            } else {
              setSelectedDisposable(null);
            }
          }
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  // Register for push notifications and update user document with token
  useEffect(() => {
    console.log("Registering for push notifications");
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        console.log("Push token:", token);
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userDocRef = doc(db, 'users', currentUser.uid);
          updateDoc(userDocRef, { pushToken: token });
        }
      }
    });
  }, []);
// End of fetching user data and registering push notifications

  // Checks if there are any unread notifications
  const checkUnreadNotifications = useCallback(async () => {
    if (auth.currentUser) {
      const unread = await hasUnreadNotifications(auth.currentUser.uid);
      setHasUnread(unread);
    }
  }, []);

  useEffect(() => { 
    // Add sample notifications
    // addNotification(auth.currentUser!.uid, 'You have a new match!')
    // addNotification(auth.currentUser!.uid, 'Someone liked your profile!')
    // addNotification(auth.currentUser!.uid, 'New message from John!')

    // Initial check for unread notifications
    checkUnreadNotifications();

    // Checks for unread notifications every 3 seconds
    const intervalId = setInterval(() => {
      checkUnreadNotifications();
    }, 3000);

    // Clean up function
    return () => {
      clearInterval(intervalId);
    };
  }, [checkUnreadNotifications]);

// Define helper functions for navigation and styling
  const handleSettingsPress = () => {
    router.push('/settings');
  };

  const handleEditPress = () => {
    router.push('/editprofile');
  };

  const getBorderColor = (gender: string) => {
    switch (gender.toLowerCase()) {
      case 'male':
        return '#37bdd5';
      case 'female':
        return '#fc6c85';
      default:
        return '#333';
    }
  };

  const getTextColor = (gender: string) => {
    switch (gender.toLowerCase()) {
      case 'male':
        return '#37bdd5';
      case 'female':
        return '#fc6c85';
      default:
        return '#333';
    }
  };
// End of helper functions for navigation and styling

// Render Profile component
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.cameraButton} onPress={() => router.push('/disposable-camera')}>
          <Ionicons name="camera-outline" size={24} color="black" />
        </TouchableOpacity>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
            <Ionicons name="create-outline" size={25} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsButton} onPress={handleSettingsPress}>
            <Ionicons name="settings-outline" size={25} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.notificationButton} onPress={() => router.push('/notification-page')}>
            <Ionicons name="notifications-outline" size={25} color="#333" />
            {hasUnread && <View style={styles.notificationDot} />}
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.profileContent}>
        {user.profileImageUrl ? (
          <View style={[
            styles.profileImageContainer,
            { borderColor: getBorderColor(user.gender) }
          ]}>
            {animatedBorder && (
              <Image
                source={animatedBorder}
                style={styles.animatedBorder}
              />
            )}
            <Image
              source={{ uri: user.profileImageUrl }}
              style={styles.profilePicture}
            />
          </View>
        ) : (
          <View style={[
            styles.profileImageContainer,
            styles.placeholderImage,
            { borderColor: getBorderColor(user.gender) }
          ]} />
        )}
        <View style={styles.userInfo}>
          <Text style={styles.name}>{user.name}</Text>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={12} color={getTextColor(user.gender)} />
            <Text style={[styles.location, { color: getTextColor(user.gender) }]}>{user.location}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.inputContainer}>
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>Music Preference</Text>
              {musicPreference.length > 0 ? (
                <Text style={styles.inputText}>{musicPreference.join(', ')}</Text>
              ) : (
                <Text style={styles.inputText}>No music preferences set</Text>
              )}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>Tune of the Month</Text>
              {tuneOfMonthLoaded && tuneOfMonth && tuneOfMonth.albumArt ? (
                <View style={styles.songContainer}>
                  <Image source={{ uri: tuneOfMonth.albumArt }} style={styles.albumArt} />
                  <View style={styles.songInfo}>
                    <Text style={styles.songTitle}>{tuneOfMonth.name}</Text>
                    <Text style={styles.songArtist}>{tuneOfMonth.artist}</Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.inputText}>No tune of the month set</Text>
              )}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>Favorite Artists</Text>
              {favoriteArtists.length > 0 ? (
                favoriteArtists.map((artist) => (
                  <View key={artist.id} style={styles.artistContainer}>
                    <Image source={{ uri: artist.picture }} style={styles.artistImage} />
                    <Text style={styles.artistName}>{artist.name}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.inputText}>No favorite artists set</Text>
              )}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>Favorite Album</Text>
              {favoriteAlbumData ? (
                <View style={styles.albumContainer}>
                  <Image source={{ uri: favoriteAlbumData.albumArt }} style={styles.albumArt} />
                  <View style={styles.albumInfo}>
                    <Text style={styles.albumName}>{favoriteAlbumData.name}</Text>
                    <Text style={styles.albumArtist}>{favoriteAlbumData.artist}</Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.inputText}>No favorite album set</Text>
              )}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>My Favorite Performance</Text>
              {favoritePerformance ? (
                <Image source={{ uri: favoritePerformance }} style={styles.imageInput} />
              ) : (
                <Text style={styles.inputText}>No favorite performance set</Text>
              )}
            </View>
          </View>

          {prompts.map((prompt, index) => (
            <View key={index} style={styles.inputContainer}>
              <View style={styles.inputContent}>
                <Text style={styles.inputLabel}>{prompt.question}</Text>
                <Text style={styles.inputText}>{prompt.answer}</Text>
              </View>
            </View>
          ))}

          <View style={styles.inputContainer}>
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>My Disposables</Text>
              {user.myDisposables ? (
                <Image source={{ uri: user.myDisposables }} style={styles.imageInput} />
              ) : (
                <Text style={styles.inputText}>No disposable photo selected</Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomNavBarContainer}>
        <BottomNavBar />
      </View>
    </SafeAreaView>
  );
}
// End of Profile component render

// Define StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8f0',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 20,
    paddingTop: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 120,
  },
  editButton: {
    padding: 5,
  },
  settingsButton: {
    padding: 5,
  },
  notificationButton: {
    padding: 5,
    position: 'relative',
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 40,
    paddingRight: 30,
    paddingTop: 5,
    paddingBottom: 13,
  },
  profileImageContainer: {
    borderWidth: 3,
    borderRadius: 50,
    overflow: 'hidden',
    width: 85,
    height: 85,
  },
  profilePicture: {
    width: '100%',
    height: '100%',
    zIndex: 0,
    position: 'relative',
  },
  userInfo: {
    flex: 1,
    marginLeft: 15,
  },
  name: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 15,
    marginLeft: 4,
  },
  placeholderImage: {
    backgroundColor: '#f7e9da',
  },
  content: {
    paddingTop: 10,
    paddingLeft: 30,
    paddingRight: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  inputContent: {
    borderWidth: 15,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
  },
  inputText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  imageInput: {
    width: '100%',
    height: 250,
  },
  bottomNavBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 80,
  },
  songContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  songTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  songArtist: {
    marginTop: 1,
    fontSize: 11,
    color: '#333',
  },
  songInfo: {
    flex: 1,
  },
  artistContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  artistImage: {
    width: 65,
    height: 65,
    borderRadius: 50,
    marginRight: 15,
    marginLeft: 15,
    marginTop: 4,
    marginBottom: 4,
  },
  artistName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  albumContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  albumArt: {
    width: 80,
    height: 80,
    borderRadius: 5,
    marginRight: 15,
    marginLeft: 15,
  },
  albumInfo: {
    flex: 1,
  },
  albumName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  albumArtist: {
    marginTop: 1,
    fontSize: 11,
    color: '#666',
  },
  promptContainer: {
    marginBottom: 1,
  },
  promptQuestion: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  promptAnswer: {
    fontSize: 20,
    color: '#666',
  },
  notificationDot: {
    position: 'absolute',
    right: 3,
    top: 3,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red',
  },
  animatedBorder: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 50,
    zIndex: 1, // Ensure animated border is on top
  },
  cameraButton: {
    padding: 5,
    position: 'absolute',
    left: 20,
    top: 10,
  },
});
