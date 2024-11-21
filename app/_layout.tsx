// _layout.tsx
// Reyna Aguirre, Mariann Grace Dizon, Maxwell Guillermo, Jesus Donate

import React, { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import InAppNotification from '../components/InAppNotification';
import { onSnapshot, collection, query, where } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

interface Notification {
  id: string;
  message: string;
  type: string;
  data: any;
}

// Define the types for your route parameters
export type RootStackParamList = {
  index: undefined;
  profile: undefined;
  profilesettings: undefined;
  editprofile: undefined;
  DirectMessage: { recipientId: string; recipientName: string };
  GroupMessage: { groupId: string; groupName: string };
};

// Define the RootLayout component
export default function RootLayout() {
  const [notification, setNotification] = useState<Notification | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const notificationsRef = collection(db, 'users', auth.currentUser.uid, 'notifications');
    const q = query(notificationsRef, where('read', '==', false));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(data);
        console.log(doc.id);
        setNotification({
          id: doc.id,
          message: doc.data().message,
          type: doc.data().type,
          data: doc.data().data,
        });
      });
    });

    return () => unsubscribe();
  }, []);

  const handleCloseNotification = () => {
    setNotification(null);
  };

  // Return the Stack navigation layout
  return (
    <>
      <Stack>
        {/* Define the index screen with no header */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        {/* Define the profile screen with no header */}
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        {/* Define the edit profile screen with no header */}
        <Stack.Screen name="editprofile" options={{ headerShown: false }} />
        {/* Define the settings screen with no header */}
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        {/* Define the discography screen with no header */}
        <Stack.Screen name="discography" options={{ headerShown: false }} />
        {/* Define the messages screen with no header */}
        <Stack.Screen name="messages" options={{ headerShown: false }} />
        {/* Define the email notifications screen with no header */}
        <Stack.Screen name="settings/email-notifications" options={{ headerShown: false }} />
        {/* Define the push notifications screen with no header */}
        <Stack.Screen name="settings/push-notifications" options={{ headerShown: false }} />
        {/* Define the change password screen with no header */}
        <Stack.Screen name="settings/change-password" options={{ headerShown: false }} />
        {/* Define the block list screen with no header */}
        <Stack.Screen name="settings/block-list" options={{ headerShown: false }} />
        {/* Define the hidden words screen with no header */}
        <Stack.Screen name="settings/hidden-words" options={{ headerShown: false }} />
        {/* Define the delete survey screen with no header */}
        <Stack.Screen name="post-delete-survey" options={{ headerShown: false }} />
        {/* Define the events search screen with no header */}
        <Stack.Screen name="events/search" options={{ headerShown: false }} />
        {/* Define the events event-details screen with no header */}
        <Stack.Screen name="events/event-details" options={{ headerShown: false }} />
        {/* Define the events myevents screen with no header */}
        <Stack.Screen name="events/myevents" options={{ headerShown: false }} />
        {/* Define the current liked list screen with no header */}
        <Stack.Screen name="settings/current-liked-list" options={{ headerShown: false }} />
        {/* Define the pause new interaction screen with no header */}
        <Stack.Screen name="settings/pause-new-interaction" options={{ headerShown: false }} />
        {/* Define the ai chatbot screen with no header */}
        <Stack.Screen name="ai-chatbot" options={{ headerShown: false }} />
        {/* Define the disposable camera screen with no header */}
        <Stack.Screen name="disposable-camera" options={{ headerShown: false }} />
        {/* Define the event tickets screen with no header */}
        <Stack.Screen name="events/event-tickets" options={{ headerShown: false }} />
        {/* Define the event location screen with no header */}
        <Stack.Screen name="events/event-location" options={{ headerShown: false }} />
         {/* Define the artist details screen with no header */}
        <Stack.Screen name="events/artist-details" options={{ headerShown: false }} />
        {/* Define the disposable gallery screen with no header */}
        <Stack.Screen name="disposable-gallery" options={{ headerShown: false }} />
        {/* Define the event spaces screen with no header */}
        <Stack.Screen name="events/event-spaces" options={{ headerShown: false }} />  
      </Stack>
      {notification && (
        <InAppNotification
          message={notification.message}
          type={notification.type}
          data={notification.data}
          onClose={handleCloseNotification}
        />
      )}
    </>
  );
}
