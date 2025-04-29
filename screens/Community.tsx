import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, Linking, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Main: undefined;
  Diet: undefined;
  Workout: undefined;
  Profile: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Community = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedTab, setSelectedTab] = useState('home');

  const renderNavItem = (name: string, onPress?: () => void) => {
    const isActive = selectedTab === name.toLowerCase();
    return (
      <TouchableOpacity
        style={styles.navItem}
        onPress={onPress}
      >
        {isActive && <View style={styles.activeIndicator} />}
        <Text style={[styles.navText, isActive && styles.activeNavText]}>{name}</Text>
      </TouchableOpacity>
    );
  };

  const handleNavigation = (screen: keyof RootStackParamList) => {
    setSelectedTab(screen.toLowerCase());
    navigation.navigate(screen);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>WELCOME TO THE{"\n"}ARTHLETE ARENA!</Text>
        <Text style={styles.subtitle}>Unite. Train. Rise Together.</Text>
        <Text style={styles.description}>
          Each platform is your portal to level up, connect, and grow with the Arthlete community!
        </Text>
       
        {/* Instagram Section with Character */}
        <View style={styles.instagramSection}>
          <Image 
            source={require('../assets/man.png')} 
            style={styles.characterImage}
          />
          <View style={styles.speechBubble}>
            <Text style={styles.platformTitle}>INSTAGRAM – THE COMMUNITY BASE</Text>
            <Text style={styles.mission}>Swap tips, find motivation, join groups, and engage with fellow Arthletes.</Text>
            <TouchableOpacity
              style={[styles.button, styles.instagramButton]}
              onPress={() => Linking.openURL('https://www.instagram.com/arthlete.fit?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==')}
            >
              <Text style={styles.buttonText}>JOIN GROUPS</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Facebook Section */}
        <View style={styles.card}>
          <Text style={styles.platformTitle}>FACEBOOK – THE COMMUNITY BASE</Text>
          <Text style={styles.mission}>Mission: Swap tips, find motivation, join groups, and engage with fellow Arthletes.</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => Linking.openURL('https://www.facebook.com/arthlete')}
          >
            <Text style={styles.buttonText}>JOIN THE CONVO</Text>
          </TouchableOpacity>
        </View>

        {/* LinkedIn Section */}
        <View style={styles.card}>
          <Text style={styles.platformTitle}>LINKEDIN – THE HALL OF GROWTH</Text>
          <Text style={styles.mission}>Mission: Build professional fitness-tech networks, share insights, and discover career opportunities.</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => Linking.openURL('https://www.linkedin.com/company/arthlete/posts/?feedView=all')}
          >
            <Text style={styles.buttonText}>CONNECT NOW</Text>
          </TouchableOpacity>
        </View>

        {/* Discord Section */}
        <View style={styles.card}>
          <Text style={styles.platformTitle}>DISCORD – THE BATTLE ZONE</Text>
          <Text style={styles.mission}>Mission: Chat live, join workout challenges, share tips, and celebrate wins with fellow Arthletes!</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => Linking.openURL('https://discord.gg/m8C85KpS')}
          >
            <Text style={styles.buttonText}>ENTER ARENA</Text>
          </TouchableOpacity>
        </View>

        {/* YouTube Section */}
        <View style={styles.card}>
          <Text style={styles.platformTitle}>YOUTUBE – THE TRAINING VAULT</Text>
          <Text style={styles.mission}>Mission: Learn techniques, watch full workouts, explore Arthlete tutorials, and level up your fitness.</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => Linking.openURL('https://youtube.com/@arthlete.fitness?feature=shared')}
          >
            <Text style={styles.buttonText}>WATCH NOW</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footerTitle}>READY TO POWER UP?</Text>
        <Text style={styles.footerText}>
          Shape the future of Arthlete! Share feedback, suggest new features, and be a part of building the ultimate fitness movement.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backButton: {
    padding: 8,
    position: 'relative',
    zIndex: 1,
    marginTop: 8,
    marginLeft: 8,
  },
  backArrow: {
    color: '#FFA500',
    fontSize: 24,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
  },
  title: {
    marginTop:20,
    color: '#FFA500',
    fontSize: 28,
    textAlign: 'center',
    fontFamily: 'MinecraftTen',
    marginBottom: 10,
  },
  subtitle: {
    color: '#FFA500',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'MinecraftTen',
    marginBottom: 10,
  },
  description: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'MinecraftTen',
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderColor: '#FFA500',
    borderWidth: 1,
  },
  platformTitle: {
    color: '#FFA500',
    fontSize: 13,
    marginBottom: 6,
    fontFamily: 'MinecraftTen',
  },
  mission: {
    color: '#fff',
    fontSize: 11,
    marginBottom: 10,
    lineHeight: 14,
    fontFamily: 'MinecraftTen',
  },
  button: {
    backgroundColor: '#FFA500',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 18,
    alignSelf: 'flex-end',
  },
  buttonText: {
    color: '#1A1A1A',
    fontSize: 11,
    fontFamily: 'MinecraftTen',
  },
  footerTitle: {
    color: '#FFA500',
    fontSize: 20,
    textAlign: 'center',
    fontFamily: 'MinecraftTen',
    marginTop: 10,
  },
  footerText: {
    color: '#fff',
    fontSize: 13,
    textAlign: 'center',
    marginVertical: 10,
    fontFamily: 'MinecraftTen',
    marginBottom:50,
  },
  instagramSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 0,
    marginHorizontal: -10,
    paddingLeft: 0,
    position: 'relative',
    marginTop: 30,
  },
  characterImage: {
    width: 150,
    height: 150,
    marginRight: -30,
    marginTop: 0,
    marginLeft: 15,
    zIndex: 2,
  },
  speechBubble: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: '#FFA500',
    marginLeft: 15,
    zIndex: 1,
    minHeight: 110,
    justifyContent: 'center',
  },
  instagramButton: {
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
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
    backgroundColor: '#FFA500',
    borderRadius: 1,
  },
  navText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'NationalPark',
    fontWeight: '500',
  },
  activeNavText: {
    color: '#FFA500',
    fontWeight: '600',
  },
});

export default Community;