// spotify-api.tsx
// Mariann Grace Dizon

// Centralized Spotify API interactions
// This module handles interactions with the Spotify API, including authentication and search functionalities.
import axios, { AxiosError } from 'axios';
import { encode } from 'base-64';

// Spotify API credentials
// These are the client ID and secret used for authenticating with the Spotify API.
const CLIENT_ID = 'f947f2727da74807960190670ee93b6d';
const CLIENT_SECRET = '3eab1b4a8c684c50b6cee76aa226ac5b';

let accessToken = '';
let tokenExpirationTime = 0;

// Function to obtain Spotify access token
// Retrieves and caches the Spotify access token, refreshing it if expired.
const getSpotifyAccessToken = async () => {
  const currentTime = Date.now();
  if (accessToken && tokenExpirationTime > currentTime) {
    return accessToken;
  }

  try {
    const authString = encode(`${CLIENT_ID}:${CLIENT_SECRET}`);
    const response = await axios.post('https://accounts.spotify.com/api/token', 
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    accessToken = response.data.access_token;
    tokenExpirationTime = currentTime + (response.data.expires_in * 1000);
    return accessToken;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Error getting Spotify access token:', error.response?.data || error.message);
    } else {
      console.error('Error getting Spotify access token:', error);
    }
    throw error;
  }
};

// Function to search for artists on Spotify
// Searches for artists on Spotify using the provided query string.
export const searchSpotifyArtists = async (query: string) => {
  try {
    const token = await getSpotifyAccessToken();
    const response = await axios.get(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=10`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    return response.data.artists.items.map((artist: any) => ({
      id: artist.id,
      name: artist.name,
      picture: artist.images[0]?.url || '',
    }));
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Error searching Spotify artists:', error.response?.data || error.message);
    } else {
      console.error('Error searching Spotify artists:', error);
    }
    throw error;
  }
};

// Function to search for albums on Spotify
// Searches for albums on Spotify using the provided query string.
export const searchSpotifyAlbums = async (query: string) => {
  try {
    const token = await getSpotifyAccessToken();
    const response = await axios.get(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=10`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    return response.data.albums.items.map((album: any) => ({
      id: album.id,
      name: album.name,
      artist: album.artists[0].name,
      albumArt: album.images[0]?.url || '',
    }));
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Error searching Spotify albums:', error.response?.data || error.message);
    } else {
      console.error('Error searching Spotify albums:', error);
    }
    throw error;
  }
};

// Function to search for tracks on Spotify
// Searches for tracks on Spotify using the provided query string.
export const searchSpotifyTracks = async (query: string) => {
  try {
    const token = await getSpotifyAccessToken();
    const response = await axios.get(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    return response.data.tracks.items.map((item: any) => ({
      id: item.id,
      name: item.name,
      artists: item.artists.map((artist: any) => ({
        id: artist.id,
        name: artist.name
      })),
      albumArt: item.album.images[0]?.url || '',
    }));
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Error searching Spotify tracks:', error.response?.data || error.message);
    } else {
      console.error('Error searching Spotify tracks:', error);
    }
    throw error;
  }
};
// Function to get Spotify recommendations based on seed artists and tracks
// Takes in arrays of artist IDs and track IDs, and returns a list of recommended tracks
export const getSpotifyRecommendations = async (artistIds: string[], trackIds: string[]) => {
  try {
    // Get the Spotify access token
    const token = await getSpotifyAccessToken();
    
    // Make a GET request to the Spotify recommendations endpoint
    const response = await axios.get(
      'https://api.spotify.com/v1/recommendations',
      {
        headers: {
          'Authorization': `Bearer ${token}`, // Set the authorization header with the access token
        },
        params: {
          seed_artists: artistIds.slice(0, 2).join(','), // Use up to 2 seed artist IDs
          seed_tracks: trackIds.slice(0, 2).join(','), // Use up to 2 seed track IDs
          limit: 10 // Limit the number of recommendations to 10
        }
      }
    );

    // Map the response data to extract relevant track information
    return response.data.tracks.map((track: any) => ({
      id: track.id, // Track ID
      name: track.name, // Track name
      artists: track.artists.map((artist: any) => ({
        id: artist.id, // Artist ID
        name: artist.name // Artist name
      })),
      albumArt: track.album.images[0]?.url || '', // Album art URL (if available)
    }));
  } catch (error) {
    // Handle errors
    if (error instanceof AxiosError) {
      console.error('Error getting Spotify recommendations:', error.response?.data || error.message);
    } else {
      console.error('Error getting Spotify recommendations:', error);
    }
    throw error;
  }
};

// Function to get related artists for a given artist on Spotify
// Takes in an artist ID and returns a list of related artists
export const getSpotifyRelatedArtists = async (artistId: string) => {
  try {
    // Get the Spotify access token
    const token = await getSpotifyAccessToken();
    
    // Make a GET request to the Spotify related artists endpoint
    const response = await axios.get(
      `https://api.spotify.com/v1/artists/${artistId}/related-artists`,
      {
        headers: {
          'Authorization': `Bearer ${token}`, // Set the authorization header with the access token
        }
      }
    );

    // Map the response data to extract relevant artist information
    return response.data.artists.map((artist: any) => ({
      id: artist.id, // Artist ID
      name: artist.name, // Artist name
      popularity: artist.popularity, // Artist popularity
      imageUrl: artist.images[0]?.url || '', // Artist image URL (if available)
    })).slice(0, 10); // Limit the number of related artists to 10
  } catch (error) {
    // Handle errors
    if (error instanceof AxiosError) {
      console.error('Error getting related artists:', error.response?.data || error.message);
    } else {
      console.error('Error getting related artists:', error);
    }
    throw error;
  }
};

// Function to get tracks from a specific album
export const getAlbumTracks = async (albumId: string) => {
  try {
    const token = await getSpotifyAccessToken();
    const response = await axios.get(
      `https://api.spotify.com/v1/albums/${albumId}/tracks?limit=10`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    return response.data.items.map((track: any) => ({
      id: track.id,
      name: track.name,
      artists: track.artists.map((artist: any) => artist.name).join(', ')
    }));
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Error getting album tracks:', error.response?.data || error.message);
    } else {
      console.error('Error getting album tracks:', error);
    }
    throw error;
  }
};
