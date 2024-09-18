// signup.tsx
// Reyna Aguirre, Jesus Donate, Maxwell Guillermo, and Mariann Grace Dizon

import React, { useState, useEffect } from "react";
import { Text, View, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Image, Alert, Dimensions, KeyboardAvoidingView, Platform, Keyboard } from "react-native";
import { getAuth, createUserWithEmailAndPassword, updateProfile, fetchSignInMethodsForEmail } from "firebase/auth";
import { getFirestore, setDoc, doc } from "firebase/firestore";
import { app } from "../firebaseConfig.js";
import { useRouter, Stack } from "expo-router";
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Font from 'expo-font'; // Sora SemiBold Font
import { Checkbox } from 'react-native-paper'; // Import Checkbox for Profile Visibility

// Loading Sora SemiBold Font
async function loadFonts() {
  await Font.loadAsync({
    'Sora-SemiBold': require('../assets/fonts/Sora-SemiBold.ttf'),
  });
}

// START Custom TextInput component
// START of Maxwell Guillermo Contribution
const CustomTextInput = ({ value, onChangeText, placeholder, ...props }: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  [key: string]: any;
}) => {
  return (
    <TextInput
      {...props}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#C0C0C0"
      style={[styles.input, styles.smallerText]}
    />
  );
};
// END Custom TextInput component
// END of Maxwell Guillermo Contribution

// START of Sign Up Process
// START of Reyna Aguirre Contribution 
export default function SignUp() {
  
  // START of Sora SemiBold Font Loading
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
  loadFonts().then(() => setFontsLoaded(true));
  }, []);
  // END of Sora SemiBold Font Loading

  // State variables to store user input
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [dateOfBirth, setDateOfBirth] = useState<Date>(new Date());
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [step, setStep] = useState<number>(0);
  const [lastNameVisible, setLastNameVisible] = useState<boolean>(true); // Last Name Visibility Variable
  const router = useRouter();

  // END of Sign Up Process
  // END of Reyna Aguirre Contribution 

  // START of Firebase Storing of User Data
  // START of Jesus Donate Contribution 
  const handleSignUp = async () => {
    try {
      const auth = getAuth(app);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const displayName = lastNameVisible ? `${firstName} ${lastName}` : firstName; // Checks for Last Name Visibility Boolean
      await updateProfile(user, {
        displayName: displayName
      });

      const db = getFirestore(app);
      
      await setDoc(doc(db, "users", user.uid), {
        firstName: firstName,
        lastName: lastName,
        email: email,
        dateOfBirth: dateOfBirth.toISOString().split('T')[0], // Store as YYYY-MM-DD
        displayName: displayName,
        lastNameVisible: lastNameVisible,
        uid: user.uid
      });
      // Firebase Error Handling
      // FIXME: Email Already in Use Error in Enter Email Step
      setSuccessMessage("Sign up successful!");
      
      router.push("/login-signup"); 
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage("This email is already registered. Please use a different email or try logging in.");
      } else {
        setErrorMessage("An error occurred during sign up. Please try again.");
      }
      console.error("Sign up error:", error);
    }
  };
  // END of Firebase Storing of User Data
  // END of Jesus Donate Contribution 

  // START Function to clear error message when user re-enters form
  // START of Mariann Grace Dizon Contribution
  const clearErrorMessage = () => {
    setErrorMessage("");
  };

  // Function to handle next step
  const handleNextStep = () => {
    if (step === 0) {
      setStep(1);
    } else if (step === 1) {
      if (firstName && lastName) {
        setStep(2);
      } else {
        setErrorMessage("Please enter both first and last name.");
      }
    } else if (step === 2) {
      if (email) {
        setStep(3);
      } else {
        setErrorMessage("Please enter your email.");
      }
    } else if (step === 3) {
      if (dateOfBirth) {
        setStep(4);
      } else {
        setErrorMessage("Please enter your date of birth.");
      }
    } else if (step === 4) {
      if (password && confirmPassword) {
        if (password === confirmPassword) {
          Keyboard.dismiss();
          handleSignUp();
        } else {
          setErrorMessage("Passwords do not match.");
        }
      } else {
        setErrorMessage("Please enter and confirm your password.");
      }
    }
  };
  // END Function to clear error message when user re-enters form
  // END of Mariann Grace Dizon Contribution

  // START of UI Render
  // Reyna Aguirre and Maxwell Guillermo
  if (!fontsLoaded) {
    return null; // or a loading indicator
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <SafeAreaView style={styles.container}>
          {/* START Back Button: Reyna Aguirre 09/18/2024 */}
          <TouchableOpacity style={styles.backButton} onPress={() => {
            Alert.alert(
              "Exit Profile Setup",
              "\nAre you sure you want to exit the profile setup process?\n\nChanges will be unsaved.",
              [
                {
                  text: "Yes", 
                  onPress: () => router.push("/login-signup")
                },
                { 
                  text: "Cancel", 
                  style: "cancel"
                }
              ]
            );
          }}>
            <Text style={styles.backButtonText}>back</Text>
          </TouchableOpacity>
          {/* END Back Button: Reyna Aguirre 09/18/2024 */}

          <View style={styles.content}>
            {/* START of Profile Landing Page */}
            {step === 0 && (
              <>
                <Text style={styles.landingsubtitle}>Let's get started with creating your unique music profile.</Text>
                <Image 
                  source={require('../assets/images/Profile_Landing_Graphic.png')}
                  style={styles.landingImage}
                  resizeMode="contain"
                />
                <View style={styles.formContainer}>
                  <TouchableOpacity 
                    style={styles.landingbutton}
                    onPress={handleNextStep}
                  >
                    <Text style={styles.buttonText}>
                      enter info
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
            {/* END of Profile Landing Page */}
            {step === 1 && (
              <>
                <Text style={styles.subtitle}>What's your name ?</Text>
                <View style={styles.formContainer}>
                  {/* First Name input */}
                  <View style={styles.inputContainer}>
                    <CustomTextInput 
                      value={firstName} 
                      onChangeText={(text) => { setFirstName(text); clearErrorMessage(); }} 
                      placeholder="first name"
                    />
                  </View>
                  {/* Last Name input */}
                  <View style={styles.inputContainer}>
                    <CustomTextInput 
                      value={lastName} 
                      onChangeText={(text) => { setLastName(text); clearErrorMessage(); }} 
                      placeholder="last name"
                    />
                  </View>
                  {/* Error message */}
                  {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
                  {/* Next button */}
                  <TouchableOpacity 
                    style={styles.button}
                    onPress={handleNextStep}
                  >
                    <Text style={styles.buttonText}>
                      continue
                    </Text>
                  </TouchableOpacity>
                </View>
                {/* Checkbox for last name visibility */}
                <View style={styles.checkboxContainer}>
                  <TouchableOpacity 
                    style={styles.checkbox}
                    onPress={() => setLastNameVisible(!lastNameVisible)}
                  >
                    <Checkbox
                      status={lastNameVisible ? 'checked' : 'unchecked'}
                      onPress={() => setLastNameVisible(!lastNameVisible)}
                      color="#fba904"
                    />
                    {lastNameVisible && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                  <Text style={styles.checkboxLabel}>last name visible</Text>
                </View>
              </>
            )}
            {step === 2 && (
              <>
                <Text style={styles.subtitle}>what's your email ?</Text>
                <View style={styles.formContainer}>
                  {/* Email input */}
                  <View style={styles.inputContainer}>
                    <CustomTextInput 
                      value={email} 
                      onChangeText={(text) => { setEmail(text); clearErrorMessage(); }} 
                      placeholder="email"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  {/* Error message */}
                  {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
                  {/* Next button */}
                  <View>
                    <TouchableOpacity 
                      style={styles.button}
                      onPress={handleNextStep}
                    >
                      <Text style={styles.buttonText}>
                        continue
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
            {step === 3 && (
              <>
                <Text style={styles.subtitle}>what's your date of birth ?</Text>
                <View style={styles.formContainer}>
                  {/* Date of Birth input */}
                  <View style={styles.inputContainer}>
                    <DateTimePicker
                      value={dateOfBirth}
                      mode="date"
                      display="spinner"
                      onChange={(event, selectedDate) => {
                        const currentDate = selectedDate || dateOfBirth;
                        setDateOfBirth(currentDate);
                        clearErrorMessage();
                      }}
                    />
                  </View>
                  {/* Error message */}
                  {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
                  {/* Next button */}
                  <View>
                    <TouchableOpacity 
                      style={styles.button}
                      onPress={handleNextStep}
                    >
                      <Text style={styles.buttonText}>
                        continue
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
            {step === 4 && (
              <>
                <Text style={styles.subtitle}>Password Setup</Text>
                <View style={styles.formContainer}>
                  {/* Password input */}
                  <View style={styles.inputContainer}>
                    <CustomTextInput 
                      value={password} 
                      onChangeText={(text) => { setPassword(text); clearErrorMessage(); }} 
                      placeholder="new password"
                      secureTextEntry={true}
                    />
                  </View>
                  {/* Confirm Password input */}
                  <View style={styles.inputContainer}>
                    <CustomTextInput 
                      value={confirmPassword} 
                      onChangeText={(text) => { setConfirmPassword(text); clearErrorMessage(); }} 
                      placeholder="re-enter new password"
                      secureTextEntry={true}
                    />
                  </View>
                  {/* Error message */}
                  {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
                  {/* Next button */}
                  <View>
                    <TouchableOpacity 
                      style={styles.button}
                      onPress={handleNextStep}
                    >
                      <Text style={styles.buttonText}>
                        continue
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </>
  );
}
// END of UI Render


// START of Style Code
// Reyna Aguirre and Maxwell Guillermo
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8f0',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 30,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 14,
    color: '#fba904',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 100, 
    justifyContent: 'flex-start', 
    alignItems: 'center',
  },
  landingsubtitle: {
    fontSize: 25,
    color: '#0e1514',
    textAlign: 'left',
    marginBottom: 40, 
    paddingTop: 80,
    fontFamily: 'Sora-SemiBold', // New Sora Font
    lineHeight: 35, // Line Spacing
  },
  subtitle: {
    fontSize: 25,
    color: '#0e1514',
    textAlign: 'left',
    marginBottom: 20, // Reduced margin to move content up
    paddingTop: 20,
    fontFamily: 'Sora-SemiBold', // New Sora Font
    lineHeight: 30, // Line Spacing
  },
  formContainer: {
    width: '100%',
    marginTop: 20, 
  },
  inputContainer: {
    marginBottom: 15, 
    marginLeft: 20,
    marginRight: 20,
  },
  input: {
    width: "100%",
    height: 50, 
    borderWidth: 0,
    paddingHorizontal: 15, 
    paddingVertical: 10, 
    color: '#808080',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
  },
  smallerText: {
    fontSize: 12,
  },
  landingbutton: {
    backgroundColor: '#fba904',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 15,
    marginBottom: 30,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#fba904',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 15,
    marginTop: 5,
    marginBottom: 30,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: -5,
    marginBottom: 5,
    textAlign: 'left',
    paddingHorizontal: 30,
    paddingVertical:5,
    borderRadius: 5,
  },
  workInProgress: {
    color: 'red',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  landingImage: {
    alignItems: 'center',
    width: 215,
    height: 215,
    marginTop: 70, // Added margin to bring image closer to button
    marginBottom:-75, // image right on top of button
  },
  checkboxContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 13,
    color: '#fba904',
    fontWeight: "700",
    paddingLeft: 5,
  },
  checkbox: {
    width: 25,
    height: 25,
    borderWidth: 3,
    borderRadius: 5,
    borderColor: '#fba904',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  checkmark: {
    color: '#fba904',
    fontSize: 18,
    fontWeight: 'bold',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -9 }, { translateY: -12 }],
  },
});
// END of Style Code