import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Linking, Platform, SafeAreaView } from "react-native";
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
  Profile: {
    profileData?: ProfileData;
  };
  EditProfile: {
    profileData?: ProfileData;
  };
  PrivacyPolicy: undefined;
  Main: undefined;
  Diet: undefined;
  Workout: undefined;
};

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ProfileScreenRouteProp = RouteProp<RootStackParamList, 'Profile'>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
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

  const [notificationEnabled, setNotificationEnabled] = useState<boolean>(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string>("👤");
  const [selectedTab, setSelectedTab] = useState('profile');

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

  // Handle notification settings
  const handleNotificationSettings = async () => {
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL('app-settings:');
      } else {
        await Linking.openSettings();
      }
      setNotificationEnabled(!notificationEnabled);
    } catch (error) {
      console.log('Error opening settings:', error);
    }
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', { profileData });
  };

  const handleNavigation = (screen: keyof RootStackParamList) => {
    switch (screen) {
      case 'Profile':
        navigation.navigate('Profile', {});
        break;
      case 'EditProfile':
        navigation.navigate('EditProfile', { profileData });
        break;
      default:
        navigation.navigate(screen);
    }
  };

  const renderNavItem = (name: string, screen: keyof RootStackParamList) => {
    const isActive = selectedTab === name.toLowerCase();
    return (
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => handleNavigation(screen)}
      >
        {isActive && <View style={styles.activeIndicator} />}
        <Text style={[styles.navText, isActive && styles.activeNavText]}>{name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Curved Top Bar */}
        <View style={styles.curvedTopBar}>
          <View style={styles.headerIcons}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleNotificationSettings}
            >
              <Text style={styles.headerEmoji}>
                {notificationEnabled ? '🔔' : '🔕'}
              </Text>
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

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleNotificationSettings}
          >
            <Text style={styles.settingEmoji}>{notificationEnabled ? '🔔' : '🔕'}</Text>
            <Text style={styles.settingText}>Notifications</Text>
            <Text style={styles.settingValue}>{notificationEnabled ? 'On' : 'Off'}</Text>
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

      <View style={styles.bottomNav}>
        {renderNavItem('HOME', 'Main')}
        {renderNavItem('DIET', 'Diet')}
        {renderNavItem('WORKOUT', 'Workout')}
        {renderNavItem('PROFILE', 'Profile')}
      </View>
    </SafeAreaView>
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
    backgroundColor: "#F47551",
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
    width: "90%",
    marginTop: Platform.OS === 'ios' ? 40 : 10,
    paddingHorizontal: 15,
  },
  headerEmoji: {
    fontSize: 28,
    color: '#FFF',
    padding: 10,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
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
    borderColor: "#F47551"
  },
  emojiAvatar: {
    fontSize: 70,
  },
  profileName: { 
    fontSize: 22, 
    fontWeight: "bold", 
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
    color: "#F47551" 
  },
  settingEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2C',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    position: 'relative',
    minWidth: 80,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -16,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#F47551',
    borderRadius: 1,
  },
  navText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'NationalPark',
    fontWeight: '500',
  },
  activeNavText: {
    color: '#F47551',
    fontWeight: '600',
  },
});

export default ProfileScreen;