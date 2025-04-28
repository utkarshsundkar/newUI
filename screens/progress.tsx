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
      const today = new Date();
      const currentDay = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - ((currentDay + 6) % 7));
      
      const workoutData: number[] = new Array(7).fill(0);
      const waterData: number[] = new Array(7).fill(0);
      const sleepData: number[] = new Array(7).fill(0);
      const stepsData: number[] = new Array(7).fill(0);
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        const dateKey = date.toISOString().split('T')[0];
        
        const data = await AsyncStorage.getItem(`tracker_${dateKey}`);
        if (data) {
          const parsedData = JSON.parse(data);
          // Convert exercise count to units (1 unit = 20 exercises)
          const exerciseCount = parseInt(parsedData.exerciseCount || '0');
          workoutData[i] = Math.floor(exerciseCount / 20);
          
          // Convert water intake to units (1 unit = 5 liters)
          const waterLiters = parseFloat(parsedData.waterIntake || '0');
          waterData[i] = Math.floor(waterLiters / 5);

          // Convert sleep hours to units (1.5 units = 6 hours)
          const sleepHours = convertTimeToHours(parsedData.sleepHours || '00:00');
          sleepData[i] = (sleepHours / 6) * 1.5;

          // Convert steps to units (0.5 units = 1000 steps)
          const steps = parseInt(parsedData.steps || '0');
          stepsData[i] = (steps / 1000) * 0.5;
        }
      }

      setChartData({
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            data: workoutData,
            color: (opacity = 1) => `rgba(244, 117, 81, ${opacity})`,
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
      stroke: '#F47551'
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
        <TouchableOpacity onPress={onBack}>
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Progress</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Workout')}>
          <Icon name="barbell" size={24} color="#FFFFFF" />
        </TouchableOpacity>
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
            data={chartData.datasets[0].data.map((value, index) => ({
              value: Math.min(value, 10),
              label: chartData.labels[index],
              dataPointColor: chartData.datasets[0].color(1),
              labelTextStyle: { color: '#FFFFFF' }
            }))}
            data2={chartData.datasets[1].data.map((value, index) => ({
              value: Math.min(value, 10),
              label: chartData.labels[index],
              dataPointColor: chartData.datasets[1].color(1),
              labelTextStyle: { color: '#FFFFFF' }
            }))}
            data3={chartData.datasets[2].data.map((value, index) => ({
              value: Math.min(value, 10),
              label: chartData.labels[index],
              dataPointColor: chartData.datasets[2].color(1),
              labelTextStyle: { color: '#FFFFFF' }
            }))}
            data4={chartData.datasets[3].data.map((value, index) => ({
              value: Math.min(value, 10),
              label: chartData.labels[index],
              dataPointColor: chartData.datasets[3].color(1),
              labelTextStyle: { color: '#FFFFFF' }
            }))}
            width={Dimensions.get('window').width - 40}
            height={220}
            spacing={40}
            initialSpacing={20}
            color1={chartData.datasets[0].color(1)}
            color2={chartData.datasets[1].color(1)}
            color3={chartData.datasets[2].color(1)}
            color4={chartData.datasets[3].color(1)}
            thickness={2}
            hideDataPoints={false}
            dataPointsColor1={chartData.datasets[0].color(1)}
            dataPointsColor2={chartData.datasets[1].color(1)}
            dataPointsColor3={chartData.datasets[2].color(1)}
            dataPointsColor4={chartData.datasets[3].color(1)}
            startFillColor1={chartData.datasets[0].color(0.2)}
            startFillColor2={chartData.datasets[1].color(0.2)}
            startFillColor3={chartData.datasets[2].color(0.2)}
            startFillColor4={chartData.datasets[3].color(0.2)}
            endFillColor1={chartData.datasets[0].color(0)}
            endFillColor2={chartData.datasets[1].color(0)}
            endFillColor3={chartData.datasets[2].color(0)}
            endFillColor4={chartData.datasets[3].color(0)}
            backgroundColor="#1A1A1A"
            showVerticalLines
            verticalLinesColor="#333333"
            xAxisColor="#333333"
            yAxisColor="#333333"
            yAxisLabelWidth={40}
            yAxisTextStyle={{ color: '#FFFFFF' }}
            maxValue={10}
            noOfSections={5}
          />
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#F47551' }]} />
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
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>8h 30m</Text>
            <Text style={styles.statLabel}>Time</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>3,500</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#2A2A2A',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F47551',
  },
  content: {
    flex: 1,
    padding: 16,
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
    backgroundColor: '#F47551',
  },
  timeframeText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  selectedTimeframeText: {
    fontWeight: 'bold',
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statValue: {
    color: '#F47551',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 4,
  }
});

export default ProgressScreen; 