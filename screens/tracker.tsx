// App.js or Dashboard.js

import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, ViewStyle, Dimensions, Modal, TextInput, TouchableOpacity, Platform, Alert, Animated, Easing, Keyboard, TouchableWithoutFeedback, KeyboardTypeOptions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // For bottom nav icons
import LinearGradient from 'react-native-linear-gradient';
import { Svg, Path, Circle, Defs, Stop, LinearGradient as SvgGradient } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface CardProps {
  title: string;
  customStyle?: ViewStyle;
  children?: React.ReactNode;
  editable?: boolean;
  onUpdate?: (value: string) => void;
  placeholder?: string;
  keyboardType?: 'numeric' | 'default';
  value?: string;
  unit?: string;
}

interface ModalInputProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  title: string;
  placeholder: string;
  unit: string;
  keyboardType?: 'numeric' | 'default';
}

interface ModalConfig {
  visible: boolean;
  type: string;
  title: string;
  placeholder: string;
  unit: string;
}

interface WaterLevelVisualizationProps {
  level: number;
  maxLevel: number;
}

interface TrackerProps {
  onBack: () => void;
  exerciseCount: string;
  onExerciseCountUpdate: (count: string) => void;
}

interface TrackerData {
  waterIntake: string;
  steps: string;
  calories: string;
  sleepHours: string;
  exerciseCount: string;
  date: string;
}

const DEFAULT_TRACKER_DATA: TrackerData = {
  waterIntake: '0',
  steps: '0',
  calories: '0',
  sleepHours: '00:00',
  exerciseCount: '0',
  date: new Date().toISOString().split('T')[0]
};

const TRACKER_QUOTES = [
  "Track your progress, celebrate your victories.",
  "Small steps lead to big changes.",
  "What gets measured, gets managed.",
  "Your health is an investment, not an expense.",
  "Progress is progress, no matter how small.",
  "Every step counts on the path to wellness.",
  "Consistency is the key to lasting change.",
  "Your future self will thank you for tracking today.",
  "Measure progress, not perfection.",
  "Data drives progress.",
  "Track, analyze, improve.",
  "Numbers tell stories of progress.",
  "Monitor your journey to better health.",
  "Every tracked day is a step forward.",
  "Knowledge through tracking leads to growth.",
  "Your health journey, measured daily.",
  "Track today for a healthier tomorrow.",
  "Small habits, tracked daily, create big changes.",
  "Your wellness journey, quantified.",
  "Let your progress motivate you.",
  "Track your way to your goals.",
  "Every measurement is a milestone.",
  "Your health metrics matter.",
  "Progress tracked is progress made.",
  "Monitor your movement towards wellness.",
  "Each tracked day builds your health story.",
  "Measure your way to success.",
  "Your dedication, tracked daily.",
  "Numbers guide your wellness journey.",
  "Track, learn, grow."
];

const getDailyQuote = () => {
  const today = new Date();
  const dayOfMonth = today.getDate() - 1; // 0-based index
  return TRACKER_QUOTES[dayOfMonth % TRACKER_QUOTES.length];
};

const InputModal: React.FC<ModalInputProps> = ({
  visible,
  onClose,
  onSubmit,
  title,
  placeholder,
  unit,
  keyboardType = 'numeric'
}) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const validateAndSubmit = () => {
    if (!value) {
      setError('Please enter a value');
      return;
    }

    if (keyboardType === 'numeric' && isNaN(Number(value))) {
      setError('Please enter a valid number');
      return;
    }

    if (title.includes('Sleep') && !value.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      setError('Please enter time in HH:MM format');
      return;
    }

    setError('');
    onSubmit(value);
    setValue('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              placeholder={placeholder}
              keyboardType={keyboardType}
              value={value}
              onChangeText={(text) => {
                setValue(text);
                setError('');
              }}
            />
            <Text style={styles.inputUnit}>{unit}</Text>
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <View style={styles.modalButtons}>
            <TouchableOpacity onPress={onClose} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={validateAndSubmit}
              style={[styles.modalButton, styles.submitButton]}
            >
              <Text style={[styles.modalButtonText, styles.submitButtonText]}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const WaterAnimation = ({ progress }: { progress: number }) => {
  const height = Math.min(85, Math.max(15, progress * 100));
  
  return (
    <View style={styles.waterContainer}>
      <LinearGradient
        colors={['#F47551', '#F47551']}
        style={[StyleSheet.absoluteFill, { height: `${height}%` }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
    </View>
  );
};

const WaterLevelVisualization: React.FC<WaterLevelVisualizationProps> = ({ level, maxLevel }: WaterLevelVisualizationProps) => (
  <View style={styles.waterVisual}>
    <View style={styles.waterBarsContainer}>
      {Array.from({ length: 8 }).map((_, index) => (
        <View key={index} style={{ width: '10%', marginHorizontal: '1%' }}>
          <View style={styles.waterBarBackground}>
            <View
              style={[
                styles.waterBar,
                {
                  height: `${Math.min(100, (level / maxLevel) * 100)}%`,
                },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
    <View style={styles.waterInfoContainer}>
      <Text style={styles.waterValue}>{level}</Text>
      <Text style={styles.waterUnit}>ml</Text>
    </View>
  </View>
);

const SleepVisual = ({ hours }: { hours: string }) => {
  const [hoursNum, minutesNum] = hours.split(':').map(num => parseInt(num));
  const totalMinutes = (hoursNum * 60) + minutesNum;
  const progress = Math.min(1, totalMinutes / (8 * 60)); // 8 hours as target

  return (
    <View style={styles.sleepVisualContainer}>
      <View style={styles.sleepCircleContainer}>
        <Svg height="110" width="110" viewBox="0 0 100 100">
          <Defs>
            <SvgGradient id="sleepGradient" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#F47551" stopOpacity="0.2" />
              <Stop offset="1" stopColor="#F47551" />
            </SvgGradient>
          </Defs>
          <Circle
            cx="50"
            cy="50"
            r="45"
            stroke="#333"
            strokeWidth="10"
            fill="none"
          />
          <Circle
            cx="50"
            cy="50"
            r="45"
            stroke="url(#sleepGradient)"
            strokeWidth="10"
            fill="none"
            strokeDasharray={`${progress * 283} 283`}
            transform="rotate(-90 50 50)"
          />
        </Svg>
        <View style={styles.sleepTextContainer}>
          <Text style={styles.sleepValue}>{hours}</Text>
          <Text style={styles.sleepUnit}>hours</Text>
        </View>
      </View>
    </View>
  );
};

const ProgressRing = ({ progress }: { progress: number }) => {
  const size = 110;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress * circumference);

  return (
    <View style={styles.progressContainer}>
      <Svg width={size} height={size} style={styles.progressRing}>
        <Circle
          cx={size/2}
          cy={size/2}
          r={radius}
          stroke="#333"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size/2}
          cy={size/2}
          r={radius}
          stroke="#F47551"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size/2} ${size/2})`}
        />
      </Svg>
    </View>
  );
};

const Card: React.FC<CardProps> = ({ 
  title, 
  customStyle, 
  children, 
  editable, 
  onUpdate,
  placeholder,
  keyboardType = 'numeric',
  value,
  unit
}: CardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');

  const handleSubmit = () => {
    if (onUpdate) {
      onUpdate(inputValue);
    }
    setIsEditing(false);
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={() => editable && setIsEditing(true)}>
      <View style={[styles.card, customStyle]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{title}</Text>
          {editable && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.cardContent}>
          {editable && isEditing ? (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.editInput}
                value={inputValue}
                onChangeText={setInputValue}
                placeholder={placeholder}
                keyboardType={keyboardType}
                autoFocus
                onBlur={handleSubmit}
                onSubmitEditing={handleSubmit}
              />
              {unit && <Text style={styles.editUnit}>{unit}</Text>}
            </View>
          ) : (
            children
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const getCurrentWeekDates = () => {
  const today = new Date();
  const currentDate = today.getDate();
  
  // Calculate dates to show 3 days before and 3 days after current date
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(today);
    day.setDate(currentDate - 3 + index);
    return day.getDate();
  });
};

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const CURRENT_WEEK = getCurrentWeekDates();

const getDateKey = (dateString: string) => dateString;

const Tracker = ({ 
  onBack, 
  exerciseCount, 
  onExerciseCountUpdate,
}: TrackerProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const today = new Date();
  const [dailyQuote, setDailyQuote] = useState("");
  const [waterIntake, setWaterIntake] = useState('0');
  const [steps, setSteps] = useState('0');
  const [calories, setCalories] = useState('0');
  const [sleepHours, setSleepHours] = useState('00:00');
  const [lastSavedDate, setLastSavedDate] = useState('');
  const [debugCaloriesKey, setDebugCaloriesKey] = useState('');
  const [debugCaloriesValue, setDebugCaloriesValue] = useState('');
  
  const [modalConfig, setModalConfig] = useState<ModalConfig>({
    visible: false,
    type: '',
    title: '',
    placeholder: '',
    unit: ''
  });

  useEffect(() => {
    setDailyQuote(getDailyQuote());
    checkAndResetDaily();
    loadTrackerData();
  }, []);

  useEffect(() => {
    loadTrackerData();
  }, [selectedDate]);

  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const data = await AsyncStorage.getItem(`tracker_${selectedDate}`);
        if (data) {
          const parsedData: TrackerData = JSON.parse(data);
          if (parsedData.exerciseCount) {
            onExerciseCountUpdate(parsedData.exerciseCount);
          }
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    };
    
    loadSavedData();
  }, [selectedDate]);

  useEffect(() => {
    // Set up a timer to reset calories at midnight
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    const msUntilMidnight = midnight.getTime() - now.getTime();
    const timer = setTimeout(() => {
      setCalories('0');
      AsyncStorage.setItem(`diet_calories_${getDateKey(selectedDate)}`, '0');
    }, msUntilMidnight);
    return () => clearTimeout(timer);
  }, [selectedDate]);

  const checkAndResetDaily = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const lastSaved = await AsyncStorage.getItem('lastSavedDate');
      
      if (lastSaved !== today) {
        // It's a new day, reset today's values
        await saveTrackerData({
          ...DEFAULT_TRACKER_DATA,
          date: today
        });
        await AsyncStorage.setItem('lastSavedDate', today);
        setLastSavedDate(today);
        
        // Only reset current view if we're looking at today
        if (selectedDate === today) {
          setWaterIntake('0');
          setSteps('0');
          setCalories('0');
          setSleepHours('00:00');
          onExerciseCountUpdate('0');
        }
      }
    } catch (error) {
      console.error('Error checking daily reset:', error);
    }
  };

  const loadTrackerData = async () => {
    try {
      setWaterIntake('0');
      setSteps('0');
      setCalories('0');
      setSleepHours('00:00');
      onExerciseCountUpdate('0');

      console.log('Tracker: selectedDate', selectedDate);
      const data = await AsyncStorage.getItem(`tracker_${getDateKey(selectedDate)}`);
      if (data) {
        const parsedData: TrackerData = JSON.parse(data);
        if (parsedData.waterIntake && parsedData.waterIntake !== '') setWaterIntake(parsedData.waterIntake);
        if (parsedData.steps && parsedData.steps !== '') setSteps(parsedData.steps);
        if (parsedData.sleepHours && parsedData.sleepHours !== '') setSleepHours(parsedData.sleepHours);
        if (parsedData.exerciseCount && parsedData.exerciseCount !== '') onExerciseCountUpdate(parsedData.exerciseCount);
      }
      // Read calories from diet using selected date key
      const dietCaloriesKey = `diet_calories_${getDateKey(selectedDate)}`;
      const dietCalories = await AsyncStorage.getItem(dietCaloriesKey);
      setDebugCaloriesKey(dietCaloriesKey);
      setDebugCaloriesValue(dietCalories || 'null');
      console.log('Tracker: reading', dietCaloriesKey, 'value:', dietCalories);
      if (dietCalories) {
        setCalories(dietCalories);
      } else {
        setCalories('0');
      }
    } catch (error) {
      console.error('Error loading tracker data:', error);
      setWaterIntake('0');
      setSteps('0');
      setCalories('0');
      setSleepHours('00:00');
      onExerciseCountUpdate('0');
    }
  };

  const saveTrackerData = async (data: TrackerData) => {
    try {
      await AsyncStorage.setItem(`tracker_${data.date}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving tracker data:', error);
    }
  };

  const handleModalSubmit = (value: string) => {
    switch (modalConfig.type) {
      case 'water':
        const waterValue = parseFloat(value);
        if (isNaN(waterValue) || waterValue < 0) {
          Alert.alert('Invalid Input', 'Please enter a valid number');
          return;
        }
        setWaterIntake(waterValue.toFixed(1));
        break;
      case 'steps':
        const stepsValue = parseInt(value);
        if (isNaN(stepsValue) || stepsValue < 0) {
          Alert.alert('Invalid Input', 'Please enter a valid number');
          return;
        }
        if (stepsValue > 100000) {
          Alert.alert('Invalid Input', 'Please enter a reasonable number of steps (0-100,000)');
          return;
        }
        setSteps(stepsValue.toString());
        break;
      case 'calories':
        const calorieValue = parseInt(value);
        if (calorieValue > 5000) {
          Alert.alert('Warning', 'That seems like a lot of calories! Please verify the amount.');
          return;
        }
        setCalories(calorieValue.toString());
        break;
      case 'sleep':
        setSleepHours(value);
        break;
    }
    Alert.alert('Success', 'Your data has been updated!');
  };

  const openModal = (type: string) => {
    const configs: Record<string, Omit<ModalConfig, 'visible' | 'type'>> = {
      water: {
        title: 'Add Water Intake',
        placeholder: 'Enter water intake (e.g., 0.5)',
        unit: 'litres'
      },
      steps: {
        title: 'Add Steps',
        placeholder: 'Enter number of steps',
        unit: 'steps'
      },
      calories: {
        title: 'Add Calories',
        placeholder: 'Enter calories (e.g., 500)',
        unit: 'Kcal'
      },
      sleep: {
        title: 'Add Sleep Hours',
        placeholder: 'Enter sleep time (HH:MM)',
        unit: 'hours'
      }
    };

    setModalConfig({
      visible: true,
      type,
      ...configs[type]
    });
  };

  const handleWaterUpdate = async (value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) {
      Alert.alert('Invalid Input', 'Please enter a valid number');
      return;
    }
    setWaterIntake(numValue.toFixed(1));
    await saveTrackerData({
      waterIntake: numValue.toFixed(1),
      steps,
      calories,
      sleepHours,
      exerciseCount,
      date: selectedDate
    });
  };

  const handleStepsUpdate = async (value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 0) {
      Alert.alert('Invalid Input', 'Please enter a valid number');
      return;
    }
    if (numValue > 100000) {
      Alert.alert('Invalid Input', 'Please enter a reasonable number of steps (0-100,000)');
      return;
    }
    setSteps(numValue.toString());
    await saveTrackerData({
      waterIntake,
      steps: numValue.toString(),
      calories,
      sleepHours,
      exerciseCount,
      date: selectedDate
    });
  };

  const handleCaloriesUpdate = async (value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 0) {
      Alert.alert('Invalid Input', 'Please enter a valid number');
      return;
    }
    if (numValue > 5000) {
      Alert.alert('Warning', 'That seems like a lot of calories! Please verify the amount.');
      return;
    }
    setCalories(numValue.toString());
    await saveTrackerData({
      waterIntake,
      steps,
      calories: numValue.toString(),
      sleepHours,
      exerciseCount,
      date: selectedDate
    });
  };

  const handleSleepUpdate = async (value: string) => {
    if (!value.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      Alert.alert('Invalid Input', 'Please enter time in HH:MM format');
      return;
    }
    setSleepHours(value);
    await saveTrackerData({
      waterIntake,
      steps,
      calories,
      sleepHours: value,
      exerciseCount,
      date: selectedDate
    });
  };

  const handleExercisesUpdate = async (value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 0) {
      Alert.alert('Invalid Input', 'Please enter a valid number');
      return;
    }
    onExerciseCountUpdate(value);
    await saveTrackerData({
      waterIntake,
      steps,
      calories,
      sleepHours,
      exerciseCount: value,
      date: selectedDate
    });
  };

  const handleDateSelect = (date: string) => {
    const selectedDateObj = new Date();
    selectedDateObj.setDate(parseInt(date));
    const formattedDate = selectedDateObj.toISOString().split('T')[0];
    setSelectedDate(formattedDate);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tracker</Text>
      </View>
      <View style={styles.quoteContainer}>
        <Text style={styles.quoteText}>{dailyQuote}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionHeader}>For Today</Text>

        <View style={styles.weekViewContainer}>
          <View style={styles.daysContainer}>
            {DAYS.map((day, index) => {
              const date = CURRENT_WEEK[index];
              const isSelected = date.toString() === selectedDate;
              const isToday = date === today.getDate();
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayButton,
                    isSelected && !isToday && styles.selectedDay,
                    isSelected && isToday && styles.todaySelectedDay
                  ]}
                  onPress={() => handleDateSelect(date.toString())}
                >
                  <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center', minHeight: 48 }}>
                    {isToday && (
                      <View style={styles.currentDateCircle} />
                    )}
                    <Text style={[
                      styles.dayText,
                      isSelected && !isToday && styles.selectedDayText,
                      isSelected && isToday && styles.todaySelectedDayText,
                      !isSelected && isToday && styles.todayText
                    ]}>{day}</Text>
                    <Text style={[
                      styles.dateText,
                      isSelected && !isToday && styles.selectedDayText,
                      isSelected && isToday && styles.todaySelectedDayText,
                      !isSelected && isToday && styles.todayText
                    ]}>{date}</Text>
                    {isToday && <View style={[
                      styles.dateDot,
                      isSelected && styles.selectedDayDot
                    ]} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.cardGrid}>
          <Card 
            title="Water" 
            customStyle={styles.waterCard}
            editable
            onUpdate={handleWaterUpdate}
            placeholder="Enter litres"
            value={waterIntake}
            unit="litres"
          >
            <WaterLevelVisualization level={parseFloat(waterIntake) * 1000} maxLevel={3000} />
          </Card>

          <Card 
            title="Walk" 
            customStyle={styles.walkCard}
            editable
            onUpdate={handleStepsUpdate}
            placeholder="Enter steps"
            value={steps}
            unit="steps"
          >
            <View style={styles.walkContent}>
              <ProgressRing progress={parseInt(steps) / 10000} />
              <Text style={styles.valueText}>{steps}</Text>
              <Text style={styles.unitText}>steps</Text>
            </View>
          </Card>

          <Card 
            title="Sleep" 
            customStyle={styles.sleepCard}
            editable
            onUpdate={handleSleepUpdate}
            placeholder="HH:MM"
            value={sleepHours}
            unit="hours"
            keyboardType="default"
          >
            <SleepVisual hours={sleepHours} />
          </Card>

          <Card 
            title="Exercises" 
            customStyle={styles.exerciseCard}
            editable
            onUpdate={handleExercisesUpdate}
            placeholder="Enter count"
            value={exerciseCount}
            unit="completed"
          >
            <View style={styles.exerciseContent}>
              <View style={styles.exerciseCircle}>
                <Text style={styles.exerciseCount}>{exerciseCount}</Text>
                <Text style={styles.exerciseUnit}>exercises</Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>

      <InputModal
        visible={modalConfig.visible}
        onClose={() => setModalConfig(prev => ({ ...prev, visible: false }))}
        onSubmit={handleModalSubmit}
        title={modalConfig.title}
        placeholder={modalConfig.placeholder}
        unit={modalConfig.unit}
        keyboardType={modalConfig.type === 'sleep' ? 'default' : 'numeric'}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#1A1A1A',
    width: '100%',
  },
  headerTitle: {
    fontSize: 25,
    color: '#F47551',
    textAlign: 'center',
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  quoteContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(247, 219, 167, 0.1)',
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 12,
    borderRadius: 12,
  },
  quoteText: {
    fontSize: 14,
    color: '#F7DBA7',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  content: {
    flexGrow: 1,
    paddingBottom: 16,
    backgroundColor: '#121212',
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    gap: 8,
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    minHeight: 150,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    color: '#222222',
    marginBottom: 8,
    opacity: 0.7,
  },
  cardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  cardUnit: {
    fontSize: 14,
    color: '#718096',
    marginTop: 4,
  },
  editButton: {
    padding: 4,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editInput: {
    flex: 1,
    fontSize: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    color: '#fff',
    backgroundColor: '#2A2A2A',
  },
  editUnit: {
    marginLeft: 8,
    color: '#718096',
  },
  valueText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#222222',
    marginTop: 4,
  },
  unitText: {
    fontSize: 14,
    color: '#222222',
    marginTop: 2,
    opacity: 0.6,
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  progressRing: {
    transform: [{ rotate: '0deg' }],
  },
  progressBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 60,
    borderWidth: 12,
    borderColor: '#EDF2F7',
  },
  progressFill: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 60,
    borderWidth: 12,
    borderColor: '#4AA9FF',
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#2A2A2A',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    color: '#fff',
    backgroundColor: '#1A1A1A',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#E2E8F0',
  },
  saveButton: {
    backgroundColor: '#4299E1',
  },
  buttonText: {
    textAlign: 'center',
    color: 'white',
  },
  waterValue: {
    fontSize: 32,
    fontWeight: '600',
    color: '#222222',
    marginTop: 4,
  },
  waterUnit: {
    fontSize: 14,
    color: '#222222',
    opacity: 0.6,
    marginTop: 2,
  },
  waterBarsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 60,
    width: '100%',
    paddingHorizontal: 8,
  },
  waterBarBackground: {
    height: '100%',
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  waterBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#F47551',
    borderRadius: 4,
  },
  waterInfoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 10,
  },
  waterVisual: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walkContent: {
    alignItems: 'center',
  },
  sleepVisualContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  sleepCircleContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    width: 100,
  },
  sleepTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sleepValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222222',
    textAlign: 'center',
  },
  sleepUnit: {
    fontSize: 12,
    color: '#222222',
    textAlign: 'center',
    marginTop: 2,
    opacity: 0.6,
  },
  waterCard: {
    backgroundColor: '#FFFFFF',
  },
  walkCard: {
    backgroundColor: '#FFFFFF',
  },
  sleepCard: {
    backgroundColor: '#FFFFFF',
    height: 200,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  caloriesCard: {
    backgroundColor: '#FFFFFF',
    height: 200,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginBottom: 12,
  },
  inputUnit: {
    fontSize: 16,
    color: '#999',
    width: 60,
    marginLeft: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  modalButtonText: {
    fontSize: 16,
    color: '#999',
  },
  submitButton: {
    backgroundColor: '#4AA9FF',
  },
  submitButtonText: {
    color: '#fff',
  },
  waterContainer: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
  },
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    height: 200,
  },
  exerciseContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1A1A1A',
    borderWidth: 3,
    borderColor: '#F47551',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  exerciseCount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  exerciseUnit: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
    marginTop: 2,
    opacity: 0.6,
  },
  caloriesTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  caloriesText: {
    textAlign: 'center',
    fontSize: 35,
    fontWeight: 'bold',
    color: '#222222',
  },
  weekViewContainer: {
    paddingTop: 0,
    paddingBottom: 12,
    backgroundColor: '#121212',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  dayButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 24,
    minWidth: 40,
  },
  selectedDay: {
    backgroundColor: 'rgba(244, 117, 81, 0.15)',
    borderWidth: 1,
    borderColor: '#F47551',
    borderRadius: 24,
  },
  dayText: {
    fontSize: 13,
    color: '#9E9E93',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  selectedDayText: {
    color: '#F47551',
    fontWeight: '600',
  },
  dateDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F47551',
    marginTop: 4,
  },
  selectedDayDot: {
    backgroundColor: '#F47551',
  },
  todayText: {
    color: '#F47551',
    fontWeight: '500',
  },
  todaySelectedDay: {
    backgroundColor: 'rgba(244, 117, 81, 0.15)',
  },
  todaySelectedDayText: {
    color: '#F47551',
    fontWeight: '600',
  },
  currentDateCircle: {
    position: 'absolute',
    top: -12,
    left: -14,
    width: 48,
    height: 72,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#F47551',
    backgroundColor: 'rgba(244, 117, 81, 0.15)',
    zIndex: -1,
  },
});

export default Tracker;
