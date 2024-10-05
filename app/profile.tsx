// profile.tsx
// Mariann Grace Dizon

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, ScrollView, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth, db } from '../firebaseConfig';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import BottomNavBar from '../components/BottomNavBar';
import { registerForPushNotificationsAsync } from '../scripts/notificationHandler';

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

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState({
    name: 'Name not set',
    location: 'Location not set',
    profileImageUrl: '',
    gender: '',
  });

  const [tuneOfMonth, setTuneOfMonth] = useState<Song | null>(null);
  const [favoritePerformance, setFavoritePerformance] = useState('');
  const [listenTo, setListenTo] = useState('');
  const [favoriteMusicArtists, setFavoriteMusicArtists] = useState('');
  const [favoriteAlbumData, setFavoriteAlbumData] = useState<Album | null>(null);
  const [favoriteArtist, setFavoriteArtist] = useState<Artist | null>(null);
  const [artistToSee, setArtistToSee] = useState('');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [tuneOfMonthLoaded, setTuneOfMonthLoaded] = useState(false);
  const [favoriteGenre, setFavoriteGenre] = useState('');
  const [nextConcert, setNextConcert] = useState('');
  const [unforgettableExperience, setUnforgettableExperience] = useState('');
  const [favoriteAfterPartySpot, setFavoriteAfterPartySpot] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const userDocRef = doc(db, 'users', currentUser.uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          setUser({
            name: `${userData.firstName} ${userData.lastName}`,
            location: userData.location || 'Location not set',
            profileImageUrl: userData.profileImageUrl || '',
            gender: userData.gender || '',
          });

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

          if (userData.favoriteArtist) {
            try {
              const parsedFavoriteArtist = JSON.parse(userData.favoriteArtist);
              setFavoriteArtist(parsedFavoriteArtist);
            } catch (error) {
              console.error('Error parsing favoriteArtist:', error);
              setFavoriteArtist(null);
            }
          } else {
            setFavoriteArtist(null);
          }

          setFavoritePerformance(userData.favoritePerformance || '');
          setListenTo(userData.listenTo || '');
          setFavoriteMusicArtists(userData.favoriteMusicArtists || '');
          setArtistToSee(userData.artistToSee || '');
          setFavoriteGenre(userData.favoriteGenre || '');
          setNextConcert(userData.nextConcert || '');
          setUnforgettableExperience(userData.unforgettableExperience || '');
          setFavoriteAfterPartySpot(userData.favoriteAfterPartySpot || '');
        }
      });

      return () => unsubscribe();
    };

    fetchUserData();

    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

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
        return '#fba904';
    }
  };

  const getTextColor = (gender: string) => {
    switch (gender.toLowerCase()) {
      case 'male':
        return '#37bdd5';
      case 'female':
        return '#fc6c85';
      default:
        return '#fba904';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {user.profileImageUrl ? (
          <View style={[
            styles.profileImageContainer,
            { borderColor: getBorderColor(user.gender) }
          ]}>
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
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
            <Ionicons name="create-outline" size={25} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsButton} onPress={handleSettingsPress}>
            <Ionicons name="settings-outline" size={25} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Tune of the Month</Text>
            <View style={styles.inputContent}>
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
            <Text style={styles.inputLabel}>My Favorite Performance</Text>
            <View style={styles.inputContent}>
              {favoritePerformance ? (
                <Image source={{ uri: favoritePerformance }} style={styles.imageInput} />
              ) : (
                <Text style={styles.inputText}>No favorite performance set</Text>
              )}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Favorite Music Artist/s</Text>
            <View style={styles.inputContent}>
              <Text style={styles.inputText}>{favoriteMusicArtists || 'Not set'}</Text>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Favorite Artist</Text>
            <View style={styles.inputContent}>
              {favoriteArtist ? (
                <View style={styles.artistContainer}>
                  <Image source={{ uri: favoriteArtist.picture }} style={styles.artistImage} />
                  <Text style={styles.artistName}>{favoriteArtist.name}</Text>
                </View>
              ) : (
                <Text style={styles.inputText}>No favorite artist set</Text>
              )}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Favorite Album</Text>
            <View style={styles.inputContent}>
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
            <Text style={styles.inputLabel}>I Listen to Music to</Text>
            <View style={styles.inputContent}>
              <Text style={styles.inputText}>{listenTo || 'Not set'}</Text>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>If I Could See Any Artist, Dead or Alive, It Would Be</Text>
            <View style={styles.inputContent}>
              <Text style={styles.inputText}>{artistToSee || 'Not set'}</Text>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Favorite Music Genre</Text>
            <View style={styles.inputContent}>
              <Text style={styles.inputText}>{favoriteGenre || 'Not set'}</Text>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Next Concert or Event</Text>
            <View style={styles.inputContent}>
              <Text style={styles.inputText}>{nextConcert || 'No upcoming concert set'}</Text>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Unforgettable Concert Experience</Text>
            <View style={styles.inputContent}>
              <Text style={styles.inputText}>{unforgettableExperience || 'No experience shared'}</Text>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Favorite Post-Event Hangout Spot</Text>
            <View style={styles.inputContent}>
              <Text style={styles.inputText}>{favoriteAfterPartySpot || 'No spot shared'}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomNavBarContainer, isKeyboardVisible && { paddingBottom: 0 }]}>
        <BottomNavBar />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  artistContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  artistImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  artistName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fba904',
  },
  albumContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  albumArt: {
    width: 60,
    height: 60,
    borderRadius: 5,
    marginRight: 10,
  },
  albumInfo: {
    flex: 1,
  },
  albumName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fba904',
  },
  albumArtist: {
    fontSize: 14,
    color: '#666',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff8f0',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 500,
  },
  header: {
    flexDirection: 'row',
    paddingLeft: 40,
    paddingRight: 30,
    paddingTop: 20,
    paddingBottom: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileImageContainer: {
    borderWidth: 3,
    borderRadius: 50, // Half of the width and height
    overflow: 'hidden',
    width: 85,
    height: 85,
  },
  profilePicture: {
    width: '100%',
    height: '100%',
  },
  userInfo: {
    flex: 1,
    marginLeft: 15,
  },
  name: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  location: {
    fontSize: 13,
    marginLeft: 4,
  },
  settingsButton: {
    paddingTop: 15,
    paddingBottom: 25,
    paddingRight: 7,
  },
  content: {
    paddingTop: 20,
    paddingLeft: 50,
    paddingRight: 50,
  },
  inputContainer: {
    marginBottom: 35,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  inputContent: {
    borderWidth: 3,
    borderColor: '#f7e9da',
    borderRadius: 10,
    padding: 15,
  },
  inputText: {
    fontSize: 14,
    color: '#fba904',
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
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editButton: {
    paddingTop: 15,
    paddingBottom: 25,
    paddingRight: 10,
  },
  songContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 90,
  },
  songInfo: {
    marginLeft: 10,
  },
  songTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fba904',
  },
  songArtist: {
    fontSize: 10,
    color: '#333',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeholderImage: {
    backgroundColor: '#f7e9da',
  },
});