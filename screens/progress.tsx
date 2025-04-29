import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  DeviceEventEmitter,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  Workout: undefined;
  Profile: undefined;
  // Add other screen names as needed
};

type ProgressScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface DataPoint {
  value: number;
  label: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color: (opacity?: number) => string;
    strokeWidth: number;
  }[];
}

interface ProgressScreenProps {
  onBack: () => void;
}

const ProgressScreen: React.FC<ProgressScreenProps> = ({ onBack }) => {
  const navigation = useNavigation<ProgressScreenNavigationProp>();
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [workoutData, setWorkoutData] = useState<DataPoint[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    datasets: []
  });

  const [totalExercises, setTotalExercises] = useState(0);
  const [totalWater, setTotalWater] = useState(0);
  const [totalSleepHours, setTotalSleepHours] = useState('0:00');
  const [totalSteps, setTotalSteps] = useState(0);

  // Function to get the date range based on timeframe
  const getDateRange = (timeframe: string): string[] => {
    const today = new Date();
    const dates: string[] = [];
    let days = 7; // default to week

    if (timeframe === 'month') {
      days = 30;
    } else if (timeframe === 'year') {
      days = 365;
    }

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  // Function to format labels based on timeframe
  const formatLabel = (date: string, timeframe: string): string => {
    const d = new Date(date);
    if (timeframe === 'week') {
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
    } else if (timeframe === 'month') {
      return d.getDate().toString();
    } else {
      return (d.getMonth() + 1).toString();
    }
  };

  // Convert HH:MM format to hours
  const convertTimeToHours = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours + (minutes / 60);
  };

  // Load workout data from AsyncStorage
  const loadWorkoutData = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const trackerKeys = keys.filter(key => key.startsWith('tracker_'));
      
      // Initialize arrays for each metric
      const workoutData = new Array(7).fill(0);
      const waterData = new Array(7).fill(0);
      const sleepData = new Array(7).fill(0);
      const stepsData = new Array(7).fill(0);

      // Get Monday of current week
      const today = new Date();
      const currentDay = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - ((currentDay + 6) % 7));

      // Process data for the week
      for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        const dateKey = date.toISOString().split('T')[0];
        const data = await AsyncStorage.getItem(`tracker_${dateKey}`);
        
        if (data) {
          const parsedData = JSON.parse(data);
          
          // Convert exercise count to chart units (1 unit = 20 exercises)
          workoutData[i] = parsedData.exerciseCount ? Math.min(10, parseInt(parsedData.exerciseCount) / 20) : 0;
          
          // Convert water intake to chart units (1 unit = 5L)
          waterData[i] = parsedData.waterIntake ? Math.min(10, parseFloat(parsedData.waterIntake) / 5) : 0;
          
          // Convert sleep hours to chart units (1.5 units = 6h)
          if (parsedData.sleepHours) {
            const [hours, minutes] = parsedData.sleepHours.split(':').map(Number);
            const totalHours = hours + (minutes / 60);
            sleepData[i] = Math.min(10, (totalHours / 6) * 1.5);
          }
          
          // Convert steps to chart units (0.5 units = 1000 steps)
          stepsData[i] = parsedData.steps ? Math.min(10, parseInt(parsedData.steps) / 2000) : 0;
        }
      }

      // Calculate totals for display
      const totalExerciseCount = workoutData.reduce((sum, val) => sum + (val * 20), 0);
      const totalWaterCount = waterData.reduce((sum, val) => sum + (val * 5), 0);
      const totalStepsCount = stepsData.reduce((sum, val) => sum + (val * 2000), 0);
      
      // Calculate total sleep hours
      const totalSleepMinutes = sleepData.reduce((sum, val) => {
        const hours = (val / 1.5) * 6;
        return sum + (hours * 60);
      }, 0);
      const hours = Math.floor(totalSleepMinutes / 60);
      const minutes = Math.round(totalSleepMinutes % 60);
      const formattedSleepHours = `${hours}:${minutes.toString().padStart(2, '0')}`;

      setTotalExercises(Math.round(totalExerciseCount));
      setTotalWater(Math.round(totalWaterCount * 10) / 10);
      setTotalSleepHours(formattedSleepHours);
      setTotalSteps(Math.round(totalStepsCount));

      setChartData({
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            data: workoutData,
            color: (opacity = 1) => `rgba(255, 165, 0, ${opacity})`,
            strokeWidth: 2
          },
          {
            data: waterData,
            color: (opacity = 1) => `rgba(74, 169, 255, ${opacity})`,
            strokeWidth: 2
          },
          {
            data: sleepData,
            color: (opacity = 1) => `rgba(75, 192, 112, ${opacity})`,
            strokeWidth: 2
          },
          {
            data: stepsData,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            strokeWidth: 2
          }
        ]
      });
    } catch (error) {
      console.error('Error loading workout data:', error);
      setTotalExercises(0);
      setTotalWater(0);
      setTotalSleepHours('0:00');
      setTotalSteps(0);
      setChartData({
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            data: [0, 0, 0, 0, 0, 0, 0],
            color: (opacity = 1) => `rgba(244, 117, 81, ${opacity})`,
            strokeWidth: 2
          },
          {
            data: [0, 0, 0, 0, 0, 0, 0],
            color: (opacity = 1) => `rgba(74, 169, 255, ${opacity})`,
            strokeWidth: 2
          },
          {
            data: [0, 0, 0, 0, 0, 0, 0],
            color: (opacity = 1) => `rgba(75, 192, 112, ${opacity})`,
            strokeWidth: 2
          },
          {
            data: [0, 0, 0, 0, 0, 0, 0],
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            strokeWidth: 2
          }
        ]
      });
    }
  };

  // Add new useEffect to listen for workout events
  useEffect(() => {
    const workoutSubscription = DeviceEventEmitter.addListener('didExitWorkout', async (event) => {
      const today = new Date().toISOString().split('T')[0];
      const trackerData = await AsyncStorage.getItem(`tracker_${today}`);
      const currentData = trackerData ? JSON.parse(trackerData) : {
        waterIntake: '0',
        steps: '0',
        calories: '0',
        sleepHours: '00:00',
        exerciseCount: '0',
        date: today
      };

      let completedExercises = 0;

      // Handle different event types from workout.tsx
      if (event.type === 'workout_completed') {
        completedExercises = event.completedExercises || 0;
      } else if (Array.isArray(event.exercises)) {
        // Handle direct exercise array format
        completedExercises = event.exercises.filter((ex: any) => ex.completed).length;
      }
        
      // Add workout exercises to tracker exercises
      const newExerciseCount = parseInt(currentData.exerciseCount || '0') + completedExercises;
      currentData.exerciseCount = newExerciseCount.toString();
      
      // Save updated data
      await AsyncStorage.setItem(`tracker_${today}`, JSON.stringify(currentData));
      
      // Reload data if viewing today's date
      if (selectedDate === today) {
        loadWorkoutData();
      }
    });

    // Also listen for the workout_completed event (used by some workout types)
    const workoutCompletedSubscription = DeviceEventEmitter.addListener('workout_completed', async (event) => {
      const today = new Date().toISOString().split('T')[0];
      const trackerData = await AsyncStorage.getItem(`tracker_${today}`);
      const currentData = trackerData ? JSON.parse(trackerData) : {
        waterIntake: '0',
        steps: '0',
        calories: '0',
        sleepHours: '00:00',
        exerciseCount: '0',
        date: today
      };

      const completedExercises = event.completedExercises || 
        (Array.isArray(event.exercises) ? event.exercises.filter((ex: any) => ex.completed).length : 0);
        
      // Add workout exercises to tracker exercises
      const newExerciseCount = parseInt(currentData.exerciseCount || '0') + completedExercises;
      currentData.exerciseCount = newExerciseCount.toString();
      
      // Save updated data
      await AsyncStorage.setItem(`tracker_${today}`, JSON.stringify(currentData));
      
      // Reload data if viewing today's date
      if (selectedDate === today) {
        loadWorkoutData();
      }
    });

    return () => {
      workoutSubscription.remove();
      workoutCompletedSubscription.remove();
    };
  }, [selectedDate]);

  // Load data when timeframe changes
  useEffect(() => {
    loadWorkoutData();
  }, [selectedTimeframe]);

  const chartConfig = {
    backgroundGradientFrom: '#1A1A1A',
    backgroundGradientTo: '#1A1A1A',
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    style: {
      borderRadius: 16,
    },
    formatYLabel: (value: string) => {
      const num = Math.floor(parseFloat(value));
      return num.toString();
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#FFA500'
    },
    propsForBackgroundLines: {
      strokeDasharray: [], // solid lines
      stroke: '#333333',
      strokeWidth: 1
    },
    propsForLabels: {
      fontSize: 12,
      fill: '#FFFFFF'
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Progress</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.timeframeSelector}>
          <TouchableOpacity
            style={[styles.timeframeButton, selectedTimeframe === 'week' && styles.selectedTimeframe]}
            onPress={() => setSelectedTimeframe('week')}
          >
            <Text style={[styles.timeframeText, selectedTimeframe === 'week' && styles.selectedTimeframeText]}>
              Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.timeframeButton, selectedTimeframe === 'month' && styles.selectedTimeframe]}
            onPress={() => setSelectedTimeframe('month')}
          >
            <Text style={[styles.timeframeText, selectedTimeframe === 'month' && styles.selectedTimeframeText]}>
              Month
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.timeframeButton, selectedTimeframe === 'year' && styles.selectedTimeframe]}
            onPress={() => setSelectedTimeframe('year')}
          >
            <Text style={[styles.timeframeText, selectedTimeframe === 'year' && styles.selectedTimeframeText]}>
              Year
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Exercise Progress</Text>
          <Text style={styles.chartSubtitle}>(1 unit = 20 exercises or 5L water, 1.5 units = 6h sleep, 0.5 units = 1000 steps)</Text>
          <LineChart
            data={chartData.datasets[0]?.data?.map((value, index) => ({
              value,
              label: chartData.labels[index],
              labelTextStyle: { color: '#FFFFFF' }
            })) || []}
            data2={chartData.datasets[1]?.data?.map((value, index) => ({
              value,
              label: chartData.labels[index],
              labelTextStyle: { color: '#FFFFFF' }
            })) || []}
            data3={chartData.datasets[2]?.data?.map((value, index) => ({
              value,
              label: chartData.labels[index],
              labelTextStyle: { color: '#FFFFFF' }
            })) || []}
            data4={chartData.datasets[3]?.data?.map((value, index) => ({
              value,
              label: chartData.labels[index],
              labelTextStyle: { color: '#FFFFFF' }
            })) || []}
            width={Dimensions.get('window').width - 40}
            height={220}
            spacing={40}
            initialSpacing={20}
            color1={chartData.datasets[0]?.color(1)}
            color2={chartData.datasets[1]?.color(1)}
            color3={chartData.datasets[2]?.color(1)}
            color4={chartData.datasets[3]?.color(1)}
            thickness={2}
            hideDataPoints={false}
            dataPointsColor1={chartData.datasets[0]?.color(1)}
            dataPointsColor2={chartData.datasets[1]?.color(1)}
            dataPointsColor3={chartData.datasets[2]?.color(1)}
            dataPointsColor4={chartData.datasets[3]?.color(1)}
            startFillColor1={chartData.datasets[0]?.color(0.2)}
            startFillColor2={chartData.datasets[1]?.color(0.2)}
            startFillColor3={chartData.datasets[2]?.color(0.2)}
            startFillColor4={chartData.datasets[3]?.color(0.2)}
            endFillColor1={chartData.datasets[0]?.color(0)}
            endFillColor2={chartData.datasets[1]?.color(0)}
            endFillColor3={chartData.datasets[2]?.color(0)}
            endFillColor4={chartData.datasets[3]?.color(0)}
            backgroundColor="#1A1A1A"
            showVerticalLines
            verticalLinesColor="#333333"
            xAxisColor="#666666"
            yAxisColor="#666666"
            yAxisLabelWidth={40}
            yAxisTextStyle={{ color: '#FFFFFF' }}
            maxValue={10}
            noOfSections={5}
            xAxisLabelTextStyle={{ color: '#FFFFFF', marginTop: 4 }}
            xAxisLabelsHeight={24}
            rulesType="solid"
            rulesColor="#333333"
            xAxisIndicesHeight={4}
            xAxisIndicesWidth={2}
            xAxisIndicesColor="#FFFFFF"
            showXAxisIndices
            hideRules={false}
            showVerticalLines={true}
            showHorizontalLines={true}
          />
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#FFA500' }]} />
              <Text style={styles.legendText}>Exercises</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#4AA9FF' }]} />
              <Text style={styles.legendText}>Water (L)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#4BC070' }]} />
              <Text style={styles.legendText}>Sleep (hrs)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#FFFFFF' }]} />
              <Text style={styles.legendText}>Steps</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Exercises</Text>
            <Text style={styles.statValue}>{totalExercises}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Water (L)</Text>
            <Text style={styles.statValue}>{totalWater.toFixed(1)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Sleep (hrs)</Text>
            <Text style={styles.statValue}>{totalSleepHours}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Steps</Text>
            <Text style={styles.statValue}>{totalSteps}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    ...Platform.select({
      ios: {
        paddingTop: 0
      }
    })
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: Platform.OS === 'ios' ? 8 : 12,
    backgroundColor: '#000000',
  },
  headerTitle: {
    fontSize: 25,
    color: '#FFA500',
    fontFamily: 'MinecraftTen',
    textAlign: 'center',
  },
  content: {
    flexGrow: 1,
    paddingBottom: 16,
    backgroundColor: '#121212',
    ...Platform.select({
      ios: {
        paddingTop: 0
      }
    })
  },
  timeframeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  timeframeButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
  },
  selectedTimeframe: {
    backgroundColor: '#FFA500',
  },
  timeframeText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  selectedTimeframeText: {
    fontWeight: 'bold',
    color: '#000000',
  },
  chartContainer: {
    marginBottom: 20,
  },
  chartTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    paddingLeft: 4,
  },
  chartSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
    paddingLeft: 4,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  backArrow: {
    fontSize: 28,
    color: '#FFA500',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
    marginTop: 16,
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#FFA500',
    marginBottom: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ProgressScreen; 