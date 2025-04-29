import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Linking, Platform } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import EditProfileScreen from "../screens/EditProfileScreen";
import PrivacyPolicyScreen from "../screens/PrivacyPolicyScreen";

const { width } = Dimensions.get("screen");
const CURVE_HEIGHT = 150;

interface ProfileData {
  fullName: string;
  nickName: string;
  email: string;
  phoneNumber: string;
  country: string;
  genre: string;
  address: string;
}

type RootStackParamList = {
  Main: undefined;
  Workout: undefined;
  Progress: undefined;
  Diet: undefined;
  Tracker: undefined;
  Leaderboard: undefined;
  Profile: { profileData?: ProfileData };
  EditProfile: { profileData: ProfileData };
  PrivacyPolicy: undefined;
  Community: undefined;
};

type ProfileScreenRouteProp = RouteProp<RootStackParamList, 'Profile'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ProfileScreenRouteProp>();
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: "",
    nickName: "",
    email: "",
    phoneNumber: "",
    country: "",
    genre: "",
    address: "",
  });

  const [selectedEmoji, setSelectedEmoji] = useState<string>("👤");

  // Load profile data from AsyncStorage
  const loadProfileData = async () => {
    try {
      const savedProfileData = await AsyncStorage.getItem('profileData');
      if (savedProfileData) {
        const parsedData = JSON.parse(savedProfileData);
        setProfileData(parsedData);
      }
    } catch (error) {
      console.log('Error loading profile data:', error);
    }
  };

  // Load profile data on component mount
  useEffect(() => {
    loadProfileData();
  }, []);

  // Update profile data when returning from edit screen
  useEffect(() => {
    if (route.params?.profileData) {
      setProfileData(route.params.profileData);
    }
  }, [route.params]);

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', { profileData });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Curved Top Bar */}
        <View style={styles.curvedTopBar}>
          <View style={styles.headerIcons}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.navigate('Main')}
            >
              <Text style={styles.headerEmoji}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Text style={styles.headerEmoji}>⋮</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileBackground}>
            <Text style={styles.emojiAvatar}>{selectedEmoji}</Text>
          </View>
          <Text style={styles.profileName}>{profileData.fullName}</Text>
          <Text style={styles.profileInfo}>{profileData.email} | {profileData.phoneNumber}</Text>
        </View>

        {/* Settings Sections */}
        <View style={styles.settingsContainer}>
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleEditProfile}
          >
            <Text style={styles.settingEmoji}>👤</Text>
            <Text style={styles.settingText}>Edit profile information</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingEmoji}>🌐</Text>
            <Text style={styles.settingText}>Language</Text>
            <Text style={styles.settingValue}>English</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingsContainer}>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingEmoji}>🔒</Text>
            <Text style={styles.settingText}>Security</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingEmoji}>💡</Text>
            <Text style={styles.settingText}>Theme</Text>
            <Text style={styles.settingValue}>Light mode</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingsContainer}>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingEmoji}>❓</Text>
            <Text style={styles.settingText}>Help & Support</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingEmoji}>✉️</Text>
            <Text style={styles.settingText}>Contact us</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          >
            <Text style={styles.settingEmoji}>🔐</Text>
            <Text style={styles.settingText}>Privacy policy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#1A1A1A" 
  },
  scrollView: { 
    paddingBottom: 20 
  },
  curvedTopBar: {
    width: width,
    height: CURVE_HEIGHT,
    backgroundColor: "#FFA500",
    borderBottomLeftRadius: CURVE_HEIGHT / 2,
    borderBottomRightRadius: CURVE_HEIGHT / 2,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 20,
  },
  headerIcons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: Platform.OS === 'ios' ? 40 : 25,
    paddingHorizontal: 20,
  },
  headerEmoji: {
    fontSize: Platform.OS === 'android' ? 28 : 24,
    color: '#FFF',
  },
  headerButton: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    padding: 12,
  },
  profileSection: { 
    alignItems: "center", 
    marginTop: -50,
    marginBottom: 15
  },
  profileBackground: { 
    width: 130, 
    height: 130, 
    borderRadius: 65, 
    backgroundColor: "#2A2A2A", 
    alignItems: "center", 
    justifyContent: "center", 
    position: "relative",
    borderWidth: 3,
    borderColor: "#FFA500"
  },
  emojiAvatar: {
    fontSize: 70,
  },
  profileName: { 
    fontSize: 22,
    fontFamily: 'MinecraftTen',
    marginTop: 10,
    color: "#FFFFFF"
  },
  profileInfo: { 
    color: "#999999", 
    marginTop: 3 
  },
  settingsContainer: { 
    backgroundColor: "#2A2A2A", 
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#333333"
  },
  settingItem: { 
    flexDirection: "row", 
    alignItems: "center", 
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  settingText: { 
    flex: 1, 
    fontSize: 16, 
    marginLeft: 10,
    color: "#FFFFFF"
  },
  settingValue: { 
    fontSize: 16, 
    color: "#FFA500" 
  },
  settingEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
});

export default ProfileScreen;