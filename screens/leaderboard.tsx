import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Enhanced color palette for dark theme
const colors = {
  primary: "#F47551",
  background: "#000",
  text: "#FFFFFF",
  textLight: "#9E9E93",
};

interface LeaderboardProps {
  credits: number;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ credits }) => {
  const [activeTab, setActiveTab] = useState('WEEKLY'); // State to track active tab

  const weeklyPlayers = [
    { name: 'ME', points: credits },
    { name: 'Player 2', points: 2000 },
    { name: 'Player 3', points: 1963 }
  ];

  const allTimePlayers = [
    { name: 'ME', points: credits },
    { name: 'Player 2', points: 2000 },
    { name: 'Player 3', points: 1963 }
  ];

  const players = activeTab === 'WEEKLY' ? weeklyPlayers : allTimePlayers;
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points); // Sort players by points in descending order

  // Function to get rank image based on points
  const getRankImage = (points) => {
    if (points >= 1 && points <= 99) {
      return require('../assets/ranks/Ignite_Bronze.png');
    } else if (points >= 100 && points <= 199) {
      return require('../assets/ranks/Ignite_Silver.png');
    } else if (points >= 200 && points <= 299) {
      return require('../assets/ranks/Ignite_Gold.png');
    } else if (points >= 300 && points <= 399) {
      return require('../assets/ranks/Stride_Bronze.png');
    } else if (points >= 400 && points <= 499) {
      return require('../assets/ranks/Stride_Silver.png');
    } else if (points >= 500 && points <= 599) {
      return require('../assets/ranks/Stride_Gold.png');
    } else if (points >= 600 && points <= 699) {
      return require('../assets/ranks/Surge_Bronze.png');
    } else if (points >= 700 && points <= 799) {
      return require('../assets/ranks/Surge_Silver.png');
    } else if (points >= 800 && points <= 899) {
      return require('../assets/ranks/Surge_Gold.png');
    } else if (points >= 900 && points <= 999) {
      return require('../assets/ranks/Core_Bronze.png');
    } else if (points >= 1000 && points <= 1099) {
      return require('../assets/ranks/Core_Silver.png');
    } else if (points >= 1100 && points <= 1199) {
      return require('../assets/ranks/Core_Gold.png');
    } else if (points >= 1200 && points <= 1299) {
      return require('../assets/ranks/Pulse_Bronze.png');
    } else if (points >= 1300 && points <= 1399) {
      return require('../assets/ranks/Pulse_Silver.png');
    } else if (points >= 1400 && points <= 1499) {
      return require('../assets/ranks/Pulse_Gold.png');
    } else if (points >= 1500 && points <= 1599) {
      return require('../assets/ranks/Edge_Bronze.png');
    } else if (points >= 1600 && points <= 1699) {
      return require('../assets/ranks/Edge_Silver.png');
    } else if (points >= 1700 && points <= 1799) {
      return require('../assets/ranks/Edge_Gold.png');
    } else if (points >= 1800 && points <= 1899) {
      return require('../assets/ranks/Titan_Bronze.png');
    } else if (points >= 1900 && points <= 1999) {
      return require('../assets/ranks/Titan_Silver.png');
    } else if (points >= 2000 && points <= 2099) {
      return require('../assets/ranks/Titan_Gold.png');
    } else if (points >= 2100 && points <= Infinity) {
      return require('../assets/ranks/Arthlete_Ace.png');
    } else {
      return require('../assets/ranks/default.png');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />
      <View style={styles.mainContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>LEADERBOARD</Text>
        </View>

        {/* Tab Section */}
        <View style={styles.tabContainer}>
          <TouchableOpacity onPress={() => setActiveTab('WEEKLY')}>
            <Text style={[styles.tab, activeTab === 'WEEKLY' && styles.activeTab]}>
              WEEKLY
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('ALL TIME')}>
            <Text style={[styles.tab, activeTab === 'ALL TIME' && styles.activeTab]}>
              ALL TIME
            </Text>
          </TouchableOpacity>
        </View>

        {/* Podium Section */}
        <View style={styles.podium}>
          <View style={styles.podiumContainer}>
            {/* Second Place */}
            {sortedPlayers[1] && (
              <View style={styles.podiumItem}>
                <Image
                  source={getRankImage(sortedPlayers[1].points)}
                  style={styles.podiumAvatar}
                />
                <Text style={styles.podiumPlayerName}>{sortedPlayers[1].name}</Text>
                <View style={styles.pointsBox}>
                  <Text style={styles.podiumPoints}>{sortedPlayers[1].points} pts</Text>
                </View>
                <View style={[styles.podiumPillar, styles.secondPlace]}>
                  <Text style={styles.podiumNumber}>2</Text>
                </View>
              </View>
            )}

            {/* First Place */}
            {sortedPlayers[0] && (
              <View style={styles.podiumItem}>
                <Image
                  source={getRankImage(sortedPlayers[0].points)}
                  style={[styles.podiumAvatar, { width: 60, height: 60 }]}
                  resizeMode="contain"
                />
                <Text style={styles.podiumPlayerName}>{sortedPlayers[0].name}</Text>
                <View style={styles.pointsBox}>
                  <Text style={styles.podiumPoints}>{sortedPlayers[0].points} pts</Text>
                </View>
                <View style={[styles.podiumPillar, styles.firstPlace]}>
                  <Text style={styles.podiumNumber}>1</Text>
                </View>
              </View>
            )}

            {/* Third Place */}
            {sortedPlayers[2] && (
              <View style={styles.podiumItem}>
                <Image
                  source={getRankImage(sortedPlayers[2].points)}
                  style={styles.podiumAvatar}
                />
                <Text style={styles.podiumPlayerName}>{sortedPlayers[2].name}</Text>
                <View style={styles.pointsBox}>
                  <Text style={styles.podiumPoints}>{sortedPlayers[2].points} pts</Text>
                </View>
                <View style={[styles.podiumPillar, styles.thirdPlace]}>
                  <Text style={styles.podiumNumber}>3</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Leaderboard Container */}
        <View style={styles.leaderboardContainer}>
          <FlatList
            data={sortedPlayers} // Use sortedPlayers for descending order
            keyExtractor={(item) => item.name}
            renderItem={({ item, index }) => (
              <View style={styles.listItem}>
                <View style={styles.listLeft}>
                  <Text style={styles.listRank}>{index + 1}</Text>
                  {/* Display rank image based on points */}
                  <Image source={getRankImage(item.points)} style={styles.listAvatar} />
                  <Text style={styles.listName}>{item.name}</Text>
                </View>
                <Text style={styles.listPoints}>{item.points} pts</Text>
              </View>
            )}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  mainContent: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#1A1A1A',
  },
  headerTitle: {
    fontSize: 25,
    color: '#F47551',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  tab: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginHorizontal: 10,
    paddingVertical: 5,
  },
  activeTab: {
    color: '#FF4500',
    borderBottomWidth: 2,
    borderBottomColor: '#FF4500',
  },
  podium: {
    marginBottom: 20,
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  podiumItem: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  podiumPillar: {
    width: 80,
    alignItems: 'center',
    borderRadius: 10,
    padding: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  firstPlace: {
    backgroundColor: '#FF4500',
    height: 160,
  },
  secondPlace: {
    backgroundColor: '#C0C0C0',
    height: 140,
  },
  thirdPlace: {
    backgroundColor: '#CD7F32',
    height: 120,
  },
  podiumAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#fff',
  },
  podiumPlayerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5,
  },
  pointsBox: {
    backgroundColor: '#1E1E1E',
    padding: 8,
    borderRadius: 15,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#fff',
  },
  podiumPoints: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF4500',
  },
  podiumNumber: {
    fontFamily: 'Bungee',
    fontSize: 86,
    fontWeight: 'bold',
    color: '#fff',
  },
  leaderboardContainer: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#333',
    padding: 10,
    marginVertical: 5,
    borderRadius: 56,
    borderWidth: 2,
    borderColor: '#fff',
  },
  listLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listRank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 10,
  },
  listAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  listName: {
    fontSize: 14,
    color: '#fff',
  },
  listPoints: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF4500',
  },
});

export default Leaderboard;