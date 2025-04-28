import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
  DeviceEventEmitter,
  Alert,
  ScrollView,
  Image,
  SafeAreaView,
} from 'react-native';
import {
  configure,
  startAssessment,
  startCustomAssessment,
  setSessionLanguage,
  startCustomWorkout,
  startWorkoutProgram,
  setEndExercisePreferences,
  setCounterPreferences,
} from '@sency/react-native-smkit-ui';
import * as SMWorkoutLibrary from '@sency/react-native-smkit-ui/src/SMWorkout';
import EditText from './components/EditText';
import ThreeCheckboxes from './components/ThreeCheckboxes';
import React from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import WorkoutScreen from './screens/workout';
import Diet from './screens/diet';
import Tracker from './screens/tracker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Leaderboard from './screens/leaderboard';
import Profile from './screens/profile';
import ProgressScreen from './screens/progress';
import EditProfileScreen from './screens/EditProfileScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';

// Add this array at the top of the file, after imports
const MOTIVATION_QUOTES = [
  "The pain you feel today will be the\nstrength you feel tomorrow.",
  "Your body deserves the best nutrition possible.",
  "Success starts with self-discipline.",
  "Your only limit is your mind.",
  "Make yourself stronger than your excuses.",
  "The only bad workout is the one that didn't happen.",
  "Fitness is not about being better than\nsomeone else. It's about being better than you used to be.",
  "Take care of your body.\nIt's the only place you have to live.",
  "The harder you work,\nthe better you get.",
  "Your health is an investment,\nnot an expense.",
  "Small progress is still progress.",
  "Don't wish for it, work for it.",
  "Strive for progress,\nnot perfection.",
  "Your future self will thank you.",
  "Push yourself because no one else\nis going to do it for you.",
  "The only way to do great work\nis to love what you do.",
  "Dream big, work hard,\nstay focused.",
  "Believe in yourself and\nall that you are.",
  "Every day is a new opportunity\nto become better.",
  "The body achieves what\nthe mind believes.",
  "Make your workouts count.",
  "Strong mind, strong body.",
  "Dedication and commitment\nlead to success.",
  "Challenge yourself every day.",
  "Your potential is limitless.",
  "Focus on your goals,\nnot obstacles.",
  "Transform your body by\ntransforming your mindset.",
  "Sweat, smile, and repeat.",
  "Be stronger than your\nstrongest excuse.",
  "Your only competition is yourself."
];

// Enhanced color palette for dark theme
const colors = {
  navigationBg: '#000000',
};

type RootStackParamList = {
  Main: undefined;
  Workout: undefined;
  Progress: undefined;
  Diet: undefined;
  Tracker: undefined;
  Leaderboard: undefined;
  Profile: undefined;
  EditProfile: undefined;
  PrivacyPolicy: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MainContent = () => {
  const [credits, setCredits] = useState(0);
  const [isConfigured, setIsConfigured] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const [exerciseCount, setExerciseCount] = useState(0);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [workoutModalVisible, setWorkoutModalVisible] = useState(false);
  const [mobilityModalVisible, setMobilityModalVisible] = useState(false);
  const [coreModalVisible, setCoreModalVisible] = useState(false);
  const [dailyWorkouts, setDailyWorkouts] = useState<{
    title: string;
    exercises: {
      name: string;
      reps: number;
      duration: number;
    }[];
  }[]>([]);
  const [lastUpdatedDate, setLastUpdatedDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [didConfig, setDidConfig] = useState(false);
  const [showWorkoutScreen, setShowWorkoutScreen] = useState(false);
  const [showDietScreen, setShowDietScreen] = useState(false);
  const [showTrackerScreen, setShowTrackerScreen] = useState(false);
  const [week, setWeek] = useState<string>('current');
  const [bodyZone, setBodyZone] = useState<SMWorkoutLibrary.BodyZone>(SMWorkoutLibrary.BodyZone.FullBody);
  const [difficulty, setDifficulty] = useState<SMWorkoutLibrary.WorkoutDifficulty>(SMWorkoutLibrary.WorkoutDifficulty.MidDifficulty);
  const [duration, setDuration] = useState<SMWorkoutLibrary.WorkoutDuration>(SMWorkoutLibrary.WorkoutDuration.Long);
  const [language, setLanguage] = useState<SMWorkoutLibrary.Language>(SMWorkoutLibrary.Language.English);
  const [name, setName] = useState('YOUR_PROGRAM_ID');
  const [modalVisible, setModalVisible] = useState(false);
  const [summaryMessage, setSummaryMessage] = useState('');
  const [exerciseDurations, setExerciseDurations] = useState({
    'Jumping Jacks': 30,
    'High Plank': 30,
    'Air Squat': 10,
    'Burpees': 5,
    'Hamstring Mobility': 45,
    'Push-up': 30,
    'High Knees': 30,
    'Side Bend (Left)': 45,
    'Side Bend (Right)': 45,
    'Standing Hamstring Mobility': 45
  });
  const [coreExerciseDurations, setCoreExerciseDurations] = useState({
    'Side Plank': 30,
    'High Plank': 30,
    'Tuck Hold': 30,
    'Oblique Crunches': 30
  });
  const [exerciseReps, setExerciseReps] = useState({
    'Jumping Jacks': 30,
    'Push-up': 10,
    'Air Squat': 10,
    'High Knees': 30,
    'Side Bend (Left)': 10,
    'Side Bend (Right)': 10,
    'Standing Hamstring Mobility': 0,
    'Hamstring Mobility': 0
  });
  const [coreExerciseReps, setCoreExerciseReps] = useState({
    'Side Plank': 0,
    'High Plank': 0,
    'Tuck Hold': 0,
    'Oblique Crunches': 10
  });
  const [dailyQuote, setDailyQuote] = useState(MOTIVATION_QUOTES[0]);
  const [pendingSwitchToTracker, setPendingSwitchToTracker] = useState(false);
  const [selectedTab, setSelectedTab] = useState('home');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Load credits from AsyncStorage on component mount
  useEffect(() => {
    const loadCredits = async () => {
      try {
        const savedCredits = await AsyncStorage.getItem('credits');
        if (savedCredits) {
          setCredits(parseInt(savedCredits));
        }
      } catch (error) {
        console.error('Error loading credits:', error);
      }
    };
    loadCredits();
  }, []);

  // Function to update credits
  const updateCredits = async (amount: number) => {
    try {
      const newCredits = credits + amount;
      setCredits(newCredits);
      await AsyncStorage.setItem('credits', newCredits.toString());
      // Optional: Add a visual feedback when credits are updated
      console.log(`Credits updated: +${amount}. New total: ${newCredits}`);
    } catch (error) {
      console.error('Error updating credits:', error);
    }
  };

  const updateDuration = (exerciseName, increment) => {
    setExerciseDurations(prev => ({
      ...prev,
      [exerciseName]: Math.max(5, (prev[exerciseName] || 30) + increment)
    }));
  };

  const updateReps = (exerciseName, increment) => {
    setExerciseReps(prev => ({
      ...prev,
      [exerciseName]: Math.max(1, prev[exerciseName] + increment)
    }));
  };

  const updateCoreDuration = (exerciseName, increment) => {
    setCoreExerciseDurations(prev => ({
      ...prev,
      [exerciseName]: Math.max(5, (prev[exerciseName] || 30) + increment)
    }));
  };

  const updateCoreReps = (exerciseName, increment) => {
    setCoreExerciseReps(prev => ({
      ...prev,
      [exerciseName]: Math.max(1, prev[exerciseName] + increment)
    }));
  };

  const fullBodyExercises = [
    { name: 'Jumping Jacks', reps: exerciseReps['Jumping Jacks'], duration: exerciseDurations['Jumping Jacks'], type: 'both' },
    { name: 'Push-up', reps: exerciseReps['Push-up'], duration: exerciseDurations['Push-up'], type: 'both' },
    { name: 'Air Squat', reps: exerciseReps['Air Squat'], duration: exerciseDurations['Air Squat'], type: 'both' },
    { name: 'High Knees', reps: exerciseReps['High Knees'], duration: exerciseDurations['High Knees'], type: 'both' }
  ];

  const mobilityExercises = [
    { name: 'Side Bend (Left)', reps: exerciseReps['Side Bend (Left)'], duration: exerciseDurations['Side Bend (Left)'], type: 'reps' },
    { name: 'Side Bend (Right)', reps: exerciseReps['Side Bend (Right)'], duration: exerciseDurations['Side Bend (Right)'], type: 'reps' },
    { name: 'Standing Hamstring Mobility', duration: exerciseDurations['Standing Hamstring Mobility'], type: 'duration' },
    { name: 'Hamstring Mobility', duration: exerciseDurations['Hamstring Mobility'], type: 'duration' }
  ];

  const coreExercises = [
    { name: 'Side Plank', reps: coreExerciseReps['Side Plank'], duration: coreExerciseDurations['Side Plank'], type: 'duration' },
    { name: 'High Plank', reps: coreExerciseReps['High Plank'], duration: coreExerciseDurations['High Plank'], type: 'duration' },
    { name: 'Tuck Hold', reps: coreExerciseReps['Tuck Hold'], duration: coreExerciseDurations['Tuck Hold'], type: 'duration' },
    { name: 'Oblique Crunches', reps: coreExerciseReps['Oblique Crunches'], duration: coreExerciseDurations['Oblique Crunches'], type: 'reps' }
  ];

  const startMobilityWorkout = async () => {
    try {
      // Award 4 credits for starting mobility workout
      await updateCredits(4);
      const exercises = [
        new SMWorkoutLibrary.SMAssessmentExercise(
          'StandingSideBendLeft',
          exerciseDurations['Side Bend (Left)'],
          'StandingSideBendLeft',
          null,
          [SMWorkoutLibrary.UIElement.Timer],
          'StandingSideBendLeft',
          '',
          new SMWorkoutLibrary.SMScoringParams(
            SMWorkoutLibrary.ScoringType.Time,
            0.3,
            exerciseDurations['Side Bend (Left)'],
            null,
            null,
            null
          ),
          '',
          'Side Bend (Left)',
          'Hold the position',
          'Time',
          'seconds'
        ),
        new SMWorkoutLibrary.SMAssessmentExercise(
          'StandingSideBendRight',
          exerciseDurations['Side Bend (Right)'],
          'StandingSideBendRight',
          null,
          [SMWorkoutLibrary.UIElement.Timer],
          'StandingSideBendRight',
          '',
          new SMWorkoutLibrary.SMScoringParams(
            SMWorkoutLibrary.ScoringType.Time,
            0.3,
            exerciseDurations['Side Bend (Right)'],
            null,
            null,
            null
          ),
          '',
          'Side Bend (Right)',
          'Hold the position',
          'Time',
          'seconds'
        ),
        new SMWorkoutLibrary.SMAssessmentExercise(
          'StandingHamstringMobility',
          exerciseDurations['Standing Hamstring Mobility'],
          'StandingHamstringMobility',
          null,
          [SMWorkoutLibrary.UIElement.Timer],
          'StandingHamstringMobility',
          '',
          new SMWorkoutLibrary.SMScoringParams(
            SMWorkoutLibrary.ScoringType.Time,
            0.3,
            exerciseDurations['Standing Hamstring Mobility'],
            null,
            null,
            null
          ),
          '',
          'Standing Hamstring Mobility',
          'Hold the position',
          'Time',
          'seconds'
        ),
        new SMWorkoutLibrary.SMAssessmentExercise(
          'HamstringMobility',
          exerciseDurations['Hamstring Mobility'],
          'HamstringMobility',
          null,
          [SMWorkoutLibrary.UIElement.Timer],
          'HamstringMobility',
          '',
          new SMWorkoutLibrary.SMScoringParams(
            SMWorkoutLibrary.ScoringType.Time,
            0.3,
            exerciseDurations['Hamstring Mobility'],
            null,
            null,
            null
          ),
          '',
          'Hamstring Mobility',
          'Hold the position',
          'Time',
          'seconds'
        ),
      ];

      const workout = new SMWorkoutLibrary.SMWorkout(
        'mobility_stretch',
        'Mobility & Stretch',
        null,
        null,
        exercises,
        null,
        null,
        null,
      );

      setMobilityModalVisible(false);
      const result = await startCustomAssessment(workout, null, false, false);
      console.log('Workout result:', result.summary);
      if (result.didFinish) {
        handleEvent({ 
          type: 'workout_completed',
          exercises: exercises 
        });
      }
    } catch (error) {
      console.error('Workout error:', error);
      Alert.alert('Error', 'Failed to start workout');
    }
  };

  useEffect(() => {
    configureSDK();
  }, []);

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
      let skippedExercises = 0;

      // Handle different event types from workout.tsx
      if (event.type === 'workout_completed') {
        completedExercises = event.completedExercises || 0;
      } else if (Array.isArray(event.exercises)) {
        // Handle direct exercise array format
        completedExercises = event.exercises.filter((ex: any) => ex.completed).length;
        skippedExercises = event.exercises.filter((ex: any) => ex.skipped).length;
      }

      // Calculate total credits to award
      const totalCredits = (completedExercises + skippedExercises) * 5;
      await updateCredits(totalCredits);

      // Update exercise count
      const newExerciseCount = parseInt(currentData.exerciseCount || '0') + completedExercises;
      currentData.exerciseCount = newExerciseCount.toString();
      await AsyncStorage.setItem(`tracker_${today}`, JSON.stringify(currentData));
    });

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
      
      const skippedExercises = Array.isArray(event.exercises) ? 
        event.exercises.filter((ex: any) => ex.skipped).length : 0;

      // Calculate total credits to award
      const totalCredits = (completedExercises + skippedExercises) * 5;
      await updateCredits(totalCredits);

      // Update exercise count
      const newExerciseCount = parseInt(currentData.exerciseCount || '0') + completedExercises;
      currentData.exerciseCount = newExerciseCount.toString();
      await AsyncStorage.setItem(`tracker_${today}`, JSON.stringify(currentData));
    });

    return () => {
      workoutSubscription.remove();
      workoutCompletedSubscription.remove();
    };
  }, [credits]); // Add credits to dependency array

  useEffect(() => {
    selectDailyWorkouts();
  }, []);

  useEffect(() => {
    const today = new Date();
    const dayOfMonth = today.getDate();
    const quoteIndex = (dayOfMonth - 1) % MOTIVATION_QUOTES.length;
    setDailyQuote(MOTIVATION_QUOTES[quoteIndex]);
  }, []); // Empty dependency array means this runs once when component mounts

  useEffect(() => {
    const loadInitialExerciseCount = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const data = await AsyncStorage.getItem(`tracker_${today}`);
        if (data) {
          const parsedData = JSON.parse(data);
          if (parsedData.exerciseCount) {
            setExerciseCount(parseInt(parsedData.exerciseCount));
          }
        }
      } catch (error) {
        console.error('Error loading initial exercise count:', error);
      }
    };

    loadInitialExerciseCount();
  }, []);

  const handleEvent = (summary) => {
    console.log('Workout event:', summary);
    
    // Calculate completed exercises
    let completedExercises = 0;
    if (summary.type === 'workout_completed') {
      completedExercises = summary.exercises?.length || 0;
    } else if (Array.isArray(summary.exercises)) {
      completedExercises = summary.exercises.filter(ex => ex.completed || ex.skipped).length;
    } else if (summary.event === 'exercise_completed' || summary.event === 'exercise_skipped') {
      completedExercises = 1;
    }

    // Award 4 credits per exercise
    if (completedExercises > 0) {
      updateCredits(4 * completedExercises);
      incrementExerciseCount(completedExercises);
    }

    if (summary.type === 'workout_completed') {
      setModalVisible(true);
      setSummaryMessage('Great job! You have completed the workout.');
    }
  };

  const onDuration = (index) => {
    setDuration(index === 0 ? SMWorkoutLibrary.WorkoutDuration.Long : SMWorkoutLibrary.WorkoutDuration.Short);
  };

  const onLanguage = (index) => {
    setLanguage(index === 0 ? SMWorkoutLibrary.Language.Hebrew : SMWorkoutLibrary.Language.English);
  };

  const onBodyZone = (index) => {
    setBodyZone(
      index === 0 ? SMWorkoutLibrary.BodyZone.UpperBody :
      index === 1 ? SMWorkoutLibrary.BodyZone.LowerBody :
      SMWorkoutLibrary.BodyZone.FullBody
    );
  };

  const onDifficulty = (index) => {
    setDifficulty(
      index === 0 ? SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty :
      index === 1 ? SMWorkoutLibrary.WorkoutDifficulty.MidDifficulty :
      SMWorkoutLibrary.WorkoutDifficulty.HighDifficulty
    );
  };

  const handleExerciseSelect = (exercise: string) => {
    setSelectedExercises(prev => {
      if (prev.includes(exercise)) {
        return prev.filter(e => e !== exercise);
      }
      if (prev.length >= 3) {
        showAlert('Maximum Exercises', 'You can only select up to 3 exercises');
        return prev;
      }
      return [...prev, exercise];
    });
  };

  const handleCategorySelect = async (category: string) => {
    // Award 4 credits when starting any recommended workout
    await updateCredits(4);
    
    switch (category.toLowerCase()) {
      case 'core & abs':
        setShowWorkoutScreen(true);
        startCoreWorkout();
        break;
      case 'full body burn':
        setShowWorkoutScreen(true);
        startFullBodyWorkout();
        break;
      case 'mobility & stretch':
        setShowWorkoutScreen(true);
        startMobilityWorkout();
        break;
      case 'upper body':
        setShowWorkoutScreen(true);
        startWorkoutProgramSession();
        break;
      default:
        console.log('Unknown category:', category);
    }
  };

  const handleStartWorkout = async () => {
    if (selectedExercises.length === 0) {
      showAlert('No Exercises', 'Please select at least one exercise');
      return;
    }

    try {
      const exercises = selectedExercises.map(exerciseName => {
        let detectorId;
        let scoringType;
        let targetReps: number | null = null;
        let targetTime: number | null = null;
        let uiElements = [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer];

        switch(exerciseName) {
          case 'High Plank':
            detectorId = 'PlankHighStatic';
            scoringType = SMWorkoutLibrary.ScoringType.Time;
            targetTime = 30;
            uiElements = [SMWorkoutLibrary.UIElement.Timer];
            break;
          case 'Air Squat':
            detectorId = 'SquatRegular';
            scoringType = SMWorkoutLibrary.ScoringType.Reps;
            targetReps = 10;
            break;
          case 'Push-ups':
            detectorId = 'PushupRegular';
            scoringType = SMWorkoutLibrary.ScoringType.Reps;
            targetReps = 10;
            break;
          case 'OH Squat':
            detectorId = 'SquatRegularOverheadStatic';
            scoringType = SMWorkoutLibrary.ScoringType.Time;
            targetTime = 20;
            uiElements = [SMWorkoutLibrary.UIElement.Timer];
            break;
          case 'Knee Raise Left':
            detectorId = 'StandingKneeRaiseLeft';
            scoringType = SMWorkoutLibrary.ScoringType.Time;
            targetTime = 15;
            uiElements = [SMWorkoutLibrary.UIElement.GaugeOfMotion, SMWorkoutLibrary.UIElement.Timer];
            break;
          case 'Knee Raise Right':
            detectorId = 'StandingKneeRaiseRight';
            scoringType = SMWorkoutLibrary.ScoringType.Time;
            targetTime = 15;
            uiElements = [SMWorkoutLibrary.UIElement.GaugeOfMotion, SMWorkoutLibrary.UIElement.Timer];
            break;
          case 'Side Bend Left':
            detectorId = 'StandingSideBendLeft';
            scoringType = SMWorkoutLibrary.ScoringType.Time;
            targetTime = 30;
            uiElements = [SMWorkoutLibrary.UIElement.Timer];
            break;
          case 'Side Bend Right':
            detectorId = 'StandingSideBendRight';
            scoringType = SMWorkoutLibrary.ScoringType.Time;
            targetTime = 30;
            uiElements = [SMWorkoutLibrary.UIElement.Timer];
            break;
          case 'Standing Alternate Toe Touch':
            detectorId = 'StandingAlternateToeTouch';
            scoringType = SMWorkoutLibrary.ScoringType.Reps;
            targetReps = 10;
            uiElements = [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer];
            break;
          case 'Jefferson Curl':
            detectorId = 'JeffersonCurlRight';
            scoringType = SMWorkoutLibrary.ScoringType.Time;
            targetTime = 20;
            uiElements = [SMWorkoutLibrary.UIElement.GaugeOfMotion, SMWorkoutLibrary.UIElement.Timer];
            break;
          case 'Alternate Windmill Toe Touch':
            detectorId = 'AlternateWindmillToeTouch';
            scoringType = SMWorkoutLibrary.ScoringType.Reps;
            targetReps = 10;
            uiElements = [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer];
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'AlternateWindmillToeTouch',           // name
              35,                                     // totalSeconds
              'AlternateWindmillToeTouch',            // videoInstruction
              null,                                   // exerciseIntro
              uiElements,                             // UI elements
              'AlternateWindmillToeTouch',            // detector
              '',                                     // successSound
              new SMWorkoutLibrary.SMScoringParams(
                scoringType,                          // scoring type based on exercise
                0.3,                                  // threshold
                targetTime,                           // targetTime (for plank and static holds)
                targetReps,                           // targetReps (for dynamic exercises)
                null,                                 // targetDistance
                null                                  // targetCalories
              ),
              '',                                     // failedSound
              exerciseName,                           // exerciseTitle (display name)
              'Complete the exercise',                 // subtitle
              'Reps',                                 // scoreTitle
              'clean reps'                            // scoreSubtitle
            );
          case 'Burpees':
            detectorId = 'Burpees';
            scoringType = SMWorkoutLibrary.ScoringType.Reps;
            targetReps = 10;
            uiElements = [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer];
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'Burpees',           // name
              35,                     // totalSeconds
              'Burpees',            // videoInstruction
              null,                  // exerciseIntro
              uiElements,            // UI elements
              'Burpees',            // detector
              '',                    // successSound
              new SMWorkoutLibrary.SMScoringParams(
                scoringType,         // scoring type based on exercise
                0.3,                 // threshold
                targetTime,          // targetTime (for plank and static holds)
                targetReps,          // targetReps (for dynamic exercises)
                null,                // targetDistance
                null                 // targetCalories
              ),
              '',                    // failedSound
              exerciseName,          // exerciseTitle (display name)
              'Complete the exercise',   // subtitle
              'Reps',  // scoreTitle
              'clean reps'  // scoreSubtitle
            );
          case 'Crunches':
            detectorId = 'Crunches';
            scoringType = SMWorkoutLibrary.ScoringType.Reps;
            targetReps = 15;
            uiElements = [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer];
            break;
          case 'Froggers':
            detectorId = 'Froggers';
            scoringType = SMWorkoutLibrary.ScoringType.Reps;
            targetReps = 10;
            uiElements = [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer];
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'Froggers',           // name
              35,                     // totalSeconds
              'Froggers',            // videoInstruction
              null,                  // exerciseIntro
              uiElements,            // UI elements
              'Froggers',            // detector
              '',                    // successSound
              new SMWorkoutLibrary.SMScoringParams(
                scoringType,         // scoring type based on exercise
                0.3,                 // threshold
                targetTime,          // targetTime (for plank and static holds)
                targetReps,          // targetReps (for dynamic exercises)
                null,                // targetDistance
                null                 // targetCalories
              ),
              '',                    // failedSound
              exerciseName,          // exerciseTitle (display name)
              'Complete the exercise',   // subtitle
              'Reps',  // scoreTitle
              'clean reps'  // scoreSubtitle
            );
          case 'Glute Bridge':
            detectorId = 'GlutesBridge';
            scoringType = SMWorkoutLibrary.ScoringType.Reps;
            targetReps = 12;
            uiElements = [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer];
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'GlutesBridge',           // name
              35,                         // totalSeconds
              'GlutesBridge',            // videoInstruction
              null,                      // exerciseIntro
              uiElements,                // UI elements
              'GlutesBridge',            // detector
              '',                        // successSound
              new SMWorkoutLibrary.SMScoringParams(
                scoringType,             // scoring type based on exercise
                0.3,                     // threshold
                targetTime,              // targetTime (for plank and static holds)
                targetReps,              // targetReps (for dynamic exercises)
                null,                    // targetDistance
                null                     // targetCalories
              ),
              '',                        // failedSound
              exerciseName,              // exerciseTitle (display name)
              'Complete the exercise',   // subtitle
              'Reps',                    // scoreTitle
              'clean reps'               // scoreSubtitle
            );
          case 'High Knees':
            detectorId = 'HighKnees';
            scoringType = SMWorkoutLibrary.ScoringType.Reps;
            targetReps = 20;
            uiElements = [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer];
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'HighKnees',           // name
              35,                     // totalSeconds
              'HighKnees',            // videoInstruction
              null,                  // exerciseIntro
              uiElements,            // UI elements
              'HighKnees',            // detector
              '',                    // successSound
              new SMWorkoutLibrary.SMScoringParams(
                scoringType,         // scoring type based on exercise
                0.3,                 // threshold
                targetTime,          // targetTime (for plank and static holds)
                targetReps,          // targetReps (for dynamic exercises)
                null,                // targetDistance
                null                 // targetCalories
              ),
              '',                    // failedSound
              exerciseName,          // exerciseTitle (display name)
              'Complete the exercise',   // subtitle
              'Reps',  // scoreTitle
              'clean reps'  // scoreSubtitle
            );
          case 'Jumping Jacks':
            detectorId = 'JumpingJacks';
            scoringType = SMWorkoutLibrary.ScoringType.Reps;
            targetReps = 20;
            uiElements = [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer];
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'JumpingJacks',           // name
              35,                         // totalSeconds
              'JumpingJacks',            // videoInstruction
              null,                      // exerciseIntro
              uiElements,                // UI elements
              'JumpingJacks',            // detector
              '',                        // successSound
              new SMWorkoutLibrary.SMScoringParams(
                scoringType,             // scoring type based on exercise
                0.3,                     // threshold
                targetTime,              // targetTime (for plank and static holds)
                targetReps,              // targetReps (for dynamic exercises)
                null,                    // targetDistance
                null                     // targetCalories
              ),
              '',                        // failedSound
              exerciseName,              // exerciseTitle (display name)
              'Complete the exercise',   // subtitle
              'Reps',                    // scoreTitle
              'clean reps'               // scoreSubtitle
            );
          case 'Jumps':
            detectorId = 'JumpRegular';
            scoringType = SMWorkoutLibrary.ScoringType.Reps;
            targetReps = 15;
            uiElements = [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer];
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'JumpRegular',           // name
              35,                         // totalSeconds
              'JumpRegular',            // videoInstruction
              null,                      // exerciseIntro
              uiElements,                // UI elements
              'JumpRegular',            // detector
              '',                        // successSound
              new SMWorkoutLibrary.SMScoringParams(
                scoringType,             // scoring type based on exercise
                0.3,                     // threshold
                targetTime,              // targetTime (for plank and static holds)
                targetReps,              // targetReps (for dynamic exercises)
                null,                    // targetDistance
                null                     // targetCalories
              ),
              '',                        // failedSound
              exerciseName,              // exerciseTitle (display name)
              'Complete the exercise',   // subtitle
              'Reps',                    // scoreTitle
              'clean reps'               // scoreSubtitle
            );
          case 'Lateral Raises':
            detectorId = 'LateralRaise';
            scoringType = SMWorkoutLibrary.ScoringType.Reps;
            targetReps = 12;
            uiElements = [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer];
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'LateralRaise',           // name
              35,                         // totalSeconds
              'LateralRaise',            // videoInstruction
              null,                      // exerciseIntro
              uiElements,                // UI elements
              'LateralRaise',            // detector
              '',                        // successSound
              new SMWorkoutLibrary.SMScoringParams(
                scoringType,             // scoring type based on exercise
                0.3,                     // threshold
                targetTime,              // targetTime (for plank and static holds)
                targetReps,              // targetReps (for dynamic exercises)
                null,                    // targetDistance
                null                     // targetCalories
              ),
              '',                        // failedSound
              exerciseName,              // exerciseTitle (display name)
              'Complete the exercise',   // subtitle
              'Reps',                    // scoreTitle
              'clean reps'               // scoreSubtitle
            );
          case 'Lunge':
            detectorId = 'LungeFront';
            scoringType = SMWorkoutLibrary.ScoringType.Reps;
            targetReps = 12;
            uiElements = [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer];
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'LungeFront',           // name
              35,                         // totalSeconds
              'LungeFront',            // videoInstruction
              null,                      // exerciseIntro
              uiElements,                // UI elements
              'LungeFront',            // detector
              '',                        // successSound
              new SMWorkoutLibrary.SMScoringParams(
                scoringType,             // scoring type based on exercise
                0.3,                     // threshold
                targetTime,              // targetTime (for plank and static holds)
                targetReps,              // targetReps (for dynamic exercises)
                null,                    // targetDistance
                null                     // targetCalories
              ),
              '',                        // failedSound
              exerciseName,              // exerciseTitle (display name)
              'Complete the exercise',   // subtitle
              'Reps',                    // scoreTitle
              'clean reps'               // scoreSubtitle
            );
          case 'Lunge Jump':
            detectorId = 'LungeJump';
            scoringType = SMWorkoutLibrary.ScoringType.Reps;
            targetReps = 12;
            uiElements = [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer];
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'LungeJump',           // name
              35,                         // totalSeconds
              'LungeJump',            // videoInstruction
              null,                      // exerciseIntro
              uiElements,                // UI elements
              'LungeJump',            // detector
              '',                        // successSound
              new SMWorkoutLibrary.SMScoringParams(
                scoringType,             // scoring type based on exercise
                0.3,                     // threshold
                targetTime,              // targetTime (for plank and static holds)
                targetReps,              // targetReps (for dynamic exercises)
                null,                    // targetDistance
                null                     // targetCalories
              ),
              '',                        // failedSound
              exerciseName,              // exerciseTitle (display name)
              'Complete the exercise',   // subtitle
              'Reps',                    // scoreTitle
              'clean reps'               // scoreSubtitle
            );
          case 'Side Lunge':
            detectorId = 'SideLunge';
            scoringType = SMWorkoutLibrary.ScoringType.Reps;
            targetReps = 12;
            uiElements = [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer];
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'SideLunge',           // name
              35,                         // totalSeconds
              'SideLunge',            // videoInstruction
              null,                      // exerciseIntro
              uiElements,                // UI elements
              'SideLunge',            // detector
              '',                        // successSound
              new SMWorkoutLibrary.SMScoringParams(
                scoringType,             // scoring type based on exercise
                0.3,                     // threshold
                targetTime,              // targetTime (for plank and static holds)
                targetReps,              // targetReps (for dynamic exercises)
                null,                    // targetDistance
                null                     // targetCalories
              ),
              '',                        // failedSound
              exerciseName,              // exerciseTitle (display name)
              'Complete the exercise',   // subtitle
              'Reps',                    // scoreTitle
              'clean reps'               // scoreSubtitle
            );
          case 'Mountain Climber Plank':
            detectorId = 'MountainClimberPlank';
            scoringType = SMWorkoutLibrary.ScoringType.Reps;
            targetReps = 20;
            uiElements = [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer];
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'MountainClimberPlank',           // name
              35,                         // totalSeconds
              'MountainClimberPlank',            // videoInstruction
              null,                      // exerciseIntro
              uiElements,                // UI elements
              'MountainClimberPlank',            // detector
              '',                        // successSound
              new SMWorkoutLibrary.SMScoringParams(
                scoringType,             // scoring type based on exercise
                0.3,                     // threshold
                targetTime,              // targetTime (for plank and static holds)
                targetReps,              // targetReps (for dynamic exercises)
                null,                    // targetDistance
                null                     // targetCalories
              ),
              '',                        // failedSound
              exerciseName,              // exerciseTitle (display name)
              'Complete the exercise',   // subtitle
              'Reps',                    // scoreTitle
              'clean reps'               // scoreSubtitle
            );
          case 'Shoulder Taps Plank':
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'PlankHighShoulderTaps',           // name
              35,                         // totalSeconds
              'PlankHighShoulderTaps',            // videoInstruction
              null,                      // exerciseIntro
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], // UI elements
              'PlankHighShoulderTaps',            // detector
              '',                        // successSound
              new SMWorkoutLibrary.SMScoringParams(
                SMWorkoutLibrary.ScoringType.Reps,  // scoring type
                0.3,                     // threshold
                null,                    // targetTime
                20,                      // targetReps
                null,                    // targetDistance
                null                     // targetCalories
              ),
              '',                        // failedSound
              exerciseName,              // exerciseTitle
              'Complete the exercise',   // subtitle
              'Reps',                    // scoreTitle
              'clean reps'               // scoreSubtitle
            );
          case 'Reverse Sit to Table Top':
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'ReverseSitToTableTop',           // name
              35,                         // totalSeconds
              'ReverseSitToTableTop',            // videoInstruction
              null,                      // exerciseIntro
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], // UI elements
              'ReverseSitToTableTop',            // detector
              '',                        // successSound
              new SMWorkoutLibrary.SMScoringParams(
                SMWorkoutLibrary.ScoringType.Reps,  // scoring type
                0.3,                     // threshold
                null,                    // targetTime
                12,                      // targetReps
                null,                    // targetDistance
                null                     // targetCalories
              ),
              '',                        // failedSound
              exerciseName,              // exerciseTitle
              'Complete the exercise',   // subtitle
              'Reps',                    // scoreTitle
              'clean reps'               // scoreSubtitle
            );
          case 'Skater Hops':
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'SkaterHops',           // name
              35,                         // totalSeconds
              'SkaterHops',            // videoInstruction
              null,                      // exerciseIntro
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], // UI elements
              'SkaterHops',            // detector
              '',                        // successSound
              new SMWorkoutLibrary.SMScoringParams(
                SMWorkoutLibrary.ScoringType.Reps,  // scoring type
                0.3,                     // threshold
                null,                    // targetTime
                20,                      // targetReps
                null,                    // targetDistance
                null                     // targetCalories
              ),
              '',                        // failedSound
              exerciseName,              // exerciseTitle
              'Complete the exercise',   // subtitle
              'Reps',                    // scoreTitle
              'clean reps'               // scoreSubtitle
            );
          case 'Ski Jumps':
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'SkiJumps',           // name
              35,                         // totalSeconds
              'SkiJumps',            // videoInstruction
              null,                      // exerciseIntro
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], // UI elements
              'SkiJumps',            // detector
              '',                        // successSound
              new SMWorkoutLibrary.SMScoringParams(
                SMWorkoutLibrary.ScoringType.Reps,  // scoring type
                0.3,                     // threshold
                null,                    // targetTime
                20,                      // targetReps
                null,                    // targetDistance
                null                     // targetCalories
              ),
              '',                        // failedSound
              exerciseName,              // exerciseTitle (display name)
              'Complete the exercise',   // subtitle
              'Reps',                    // scoreTitle
              'clean reps'               // scoreSubtitle
            );
          case 'Rotation Jab Squat':
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'SquatAndRotationJab',           // name
              35,                         // totalSeconds
              'SquatAndRotationJab',            // videoInstruction
              null,                      // exerciseIntro
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], // UI elements
              'SquatAndRotationJab',            // detector
              '',                        // successSound
              new SMWorkoutLibrary.SMScoringParams(
                SMWorkoutLibrary.ScoringType.Reps,  // scoring type
                0.3,                     // threshold
                null,                    // targetTime
                12,                      // targetReps
                null,                    // targetDistance
                null                     // targetCalories
              ),
              '',                        // failedSound
              exerciseName,              // exerciseTitle
              'Complete the exercise',   // subtitle
              'Reps',                    // scoreTitle
              'clean reps'               // scoreSubtitle
            );
          case 'Bicycle Crunches':
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'StandingBicycleCrunches',           // name
              35,                         // totalSeconds
              'StandingBicycleCrunches',            // videoInstruction
              null,                      // exerciseIntro
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], // UI elements
              'StandingBicycleCrunches',            // detector
              '',                        // successSound
              new SMWorkoutLibrary.SMScoringParams(
                SMWorkoutLibrary.ScoringType.Reps,  // scoring type
                0.3,                     // threshold
                null,                    // targetTime
                20,                      // targetReps
                null,                    // targetDistance
                null                     // targetCalories
              ),
              '',                        // failedSound
              exerciseName,              // exerciseTitle
              'Complete the exercise',   // subtitle
              'Reps',                    // scoreTitle
              'clean reps'               // scoreSubtitle
            );
          case 'Oblique Crunches':
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'StandingObliqueCrunches',           // name
              35,                         // totalSeconds
              'StandingObliqueCrunches',            // videoInstruction
              null,                      // exerciseIntro
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], // UI elements
              'StandingObliqueCrunches',            // detector
              '',                        // successSound
              new SMWorkoutLibrary.SMScoringParams(
                SMWorkoutLibrary.ScoringType.Reps,  // scoring type
                0.3,                     // threshold
                null,                    // targetTime
                20,                      // targetReps
                null,                    // targetDistance
                null                     // targetCalories
              ),
              '',                        // failedSound
              exerciseName,              // exerciseTitle
              'Complete the exercise',   // subtitle
              'Reps',                    // scoreTitle
              'clean reps'               // scoreSubtitle
            );
          case 'Shoulder Press':
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'ShouldersPress',           // name
              35,                         // totalSeconds
              'ShouldersPress',            // videoInstruction
              null,                      // exerciseIntro
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], // UI elements
              'ShouldersPress',            // detector
              '',                        // successSound
              new SMWorkoutLibrary.SMScoringParams(
                SMWorkoutLibrary.ScoringType.Reps,  // scoring type
                0.3,                     // threshold
                null,                    // targetTime
                12,                      // targetReps
                null,                    // targetDistance
                null                     // targetCalories
              ),
              '',                        // failedSound
              exerciseName,              // exerciseTitle
              'Complete the exercise',   // subtitle
              'Reps',                    // scoreTitle
              'clean reps'               // scoreSubtitle
            );
          case 'Side Plank':
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'PlankSideLowStatic',           // name
              35,                         // totalSeconds
              'PlankSideLowStatic',            // videoInstruction
              null,                      // exerciseIntro
              [SMWorkoutLibrary.UIElement.Timer], // UI elements
              'PlankSideLowStatic',            // detector
              '',                        // successSound
              new SMWorkoutLibrary.SMScoringParams(
                SMWorkoutLibrary.ScoringType.Time,  // scoring type
                0.3,                     // threshold
                30,                      // targetTime
                null,                    // targetReps
                null,                    // targetDistance
                null                     // targetCalories
              ),
              '',                        // failedSound
              exerciseName,              // exerciseTitle
              'Hold the position',   // subtitle
              'Time',                    // scoreTitle
              'seconds'               // scoreSubtitle
            );
          case 'Tuck Hold':
            return new SMWorkoutLibrary.SMAssessmentExercise(
              'TuckHold',           // name
              35,                         // totalSeconds
              'TuckHold',            // videoInstruction
              null,                      // exerciseIntro
              [SMWorkoutLibrary.UIElement.Timer], // UI elements
              'TuckHold',            // detector
              '',                        // successSound
              new SMWorkoutLibrary.SMScoringParams(
                SMWorkoutLibrary.ScoringType.Time,  // scoring type
                0.3,                     // threshold
                30,                      // targetTime
                null,                    // targetReps
                null,                    // targetDistance
                null                     // targetCalories
              ),
              '',                        // failedSound
              exerciseName,              // exerciseTitle
              'Hold the position',   // subtitle
              'Time',                    // scoreTitle
              'seconds'               // scoreSubtitle
            );
          default:
            if (exerciseName === 'Lunge Jump') {
              detectorId = 'LungeJump';
              scoringType = SMWorkoutLibrary.ScoringType.Reps;
              targetReps = 12;
              uiElements = [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer];
            } else if (exerciseName === 'Lateral Raises') {
              detectorId = 'LateralRaise';
              scoringType = SMWorkoutLibrary.ScoringType.Reps;
              targetReps = 12;
              uiElements = [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer];
            } else if (exerciseName === 'Shoulder Taps Plank') {
              detectorId = 'PlankHighShoulderTaps';
              scoringType = SMWorkoutLibrary.ScoringType.Reps;
              targetReps = 20;
              uiElements = [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer];
            } else if (exerciseName === 'Rotation Jab Squat') {
              detectorId = 'SquatAndRotationJab';
              scoringType = SMWorkoutLibrary.ScoringType.Reps;
              targetReps = 12;
              uiElements = [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer];
            } else {
              detectorId = exerciseName;
              scoringType = SMWorkoutLibrary.ScoringType.Reps;
              targetReps = 10;
            }
            break;
        }

        return new SMWorkoutLibrary.SMAssessmentExercise(
          detectorId,           // name (using detector ID as name for consistency)
          35,                     // totalSeconds
          exerciseName === 'Alternate Windmill Toe Touch' ? 'AlternateWindmillToeTouch' : detectorId,            // videoInstruction
          null,                  // exerciseIntro
          uiElements,            // UI elements
          detectorId,            // detector
          '',                    // successSound
          new SMWorkoutLibrary.SMScoringParams(
            scoringType,         // scoring type based on exercise
            0.3,                 // threshold
            targetTime,          // targetTime (for plank and static holds)
            targetReps,          // targetReps (for dynamic exercises)
            null,                // targetDistance
            null                 // targetCalories
          ),
          '',                    // failedSound
          exerciseName,          // exerciseTitle (display name)
          scoringType === SMWorkoutLibrary.ScoringType.Time ? 'Hold the position' : 'Complete the exercise',   // subtitle
          scoringType === SMWorkoutLibrary.ScoringType.Time ? 'Time' : 'Reps',  // scoreTitle
          scoringType === SMWorkoutLibrary.ScoringType.Time ? 'seconds held' : 'clean reps'  // scoreSubtitle
        );
      });

      const workout = new SMWorkoutLibrary.SMWorkout(
        '50',
        'Custom Workout',
        null,
        null,
        exercises,
        null,
        null,
        null,
      );

      const result = await startCustomAssessment(workout, null, false, false);
      console.log('Assessment result:', result.summary);
      console.log('Did finish:', result.didFinish);
      if (result.didFinish) {
        handleEvent({ 
          type: 'workout_completed',
          exercises: exercises 
        });
      }
    } catch (e) {
      showAlert('Workout Error', e.message);
    }
  };

  const renderNavItem = (name: string, icon: any, onPress?: () => void) => {
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

  const configureSDK = async () => {
    try {
      await configure("public_live_a5jSYbzaDk7sgalguc");
      setIsConfigured(true);
    } catch (error) {
      Alert.alert('Configuration Error', 'Failed to configure SDK');
    }
  };

  const handleAssessment = async (type: string) => {
    try {
      let exerciseCount = 0;
      
      switch (type) {
        case 'FITNESS':
          exerciseCount = 5; // Fitness assessment has 5 exercises
          await updateCredits(exerciseCount); // Award 1 credit per exercise
          incrementExerciseCount(exerciseCount);
          await startAssessmentSession(SMWorkoutLibrary.AssessmentTypes.Fitness, false, '');
          break;
          
        case 'MOVEMENT':
          exerciseCount = 3; // Movement assessment has 3 exercises
          await updateCredits(exerciseCount); // Award 1 credit per exercise
          incrementExerciseCount(exerciseCount);
          await startAssessmentSession(SMWorkoutLibrary.AssessmentTypes.Body360, false, '');
          break;
          
        case 'STRENGTH':
          exerciseCount = 4; // Strength assessment has 4 exercises
          await updateCredits(exerciseCount); // Award 1 credit per exercise
          incrementExerciseCount(exerciseCount);
          await startAssessmentSession(SMWorkoutLibrary.AssessmentTypes.Fitness, false, '');
          break;
          
        case 'CARDIO':
          exerciseCount = 3; // Cardio assessment has 3 exercises
          await updateCredits(exerciseCount); // Award 1 credit per exercise
          incrementExerciseCount(exerciseCount);
          await startAssessmentSession(SMWorkoutLibrary.AssessmentTypes.Fitness, false, '');
          break;
          
        case 'CUSTOM':
          exerciseCount = 6; // Custom assessment has 6 exercises (based on startSMKitUICustomAssessment)
          await updateCredits(exerciseCount); // Award 1 credit per exercise
          incrementExerciseCount(exerciseCount);
          await startSMKitUICustomAssessment();
          break;
      }
    } catch (error) {
      console.error('Error in handleAssessment:', error);
      Alert.alert('Error', 'Failed to start assessment');
    }
  };

  const handleWorkoutCompletion = (summary) => {
    // Award 4 credits for completing exercises
    if (summary && summary.exercises) {
      const completedCount = summary.exercises.filter(
        ex => ex.status === 'completed' || ex.status === 'skipped'
      ).length;
      updateCredits(4 * completedCount); // 4 credits per exercise
    }
    
    setModalVisible(true);
    setSummaryMessage('Workout completed! Great job!');
  };

  const startCoreWorkout = async () => {
    try {
      setShowWorkoutScreen(true);
      // Award 4 credits for starting core workout
      await updateCredits(4);
      const exercises = [
        new SMWorkoutLibrary.SMExercise(
          "Side Plank",
          coreExerciseDurations['Side Plank'],
          "PlankSideLowStatic",
          null,
          [SMWorkoutLibrary.UIElement.Timer],
          "PlankSideLowStatic",
          "",
          null  // Remove scoring params
        ),
        new SMWorkoutLibrary.SMExercise(
          "High Plank",
          coreExerciseDurations['High Plank'],
          "PlankHighStatic",
          null,
          [SMWorkoutLibrary.UIElement.Timer],
          "PlankHighStatic",
          "",
          null  // Remove scoring params
        ),
        new SMWorkoutLibrary.SMExercise(
          "Tuck Hold",
          coreExerciseDurations['Tuck Hold'],
          "TuckHold",
          null,
          [SMWorkoutLibrary.UIElement.Timer],
          "TuckHold",
          "",
          null  // Remove scoring params
        ),
        new SMWorkoutLibrary.SMExercise(
          "Oblique Crunches",
          coreExerciseDurations['Oblique Crunches'],
          "StandingObliqueCrunches",
          null,
          [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer],
          "StandingObliqueCrunches",
          "",
          null  // Remove scoring params
        )
      ];

      const workout = new SMWorkoutLibrary.SMWorkout(
        'core_workout',
        'Core Workout',
        null,
        null,
        exercises,
        null,
        null,
        null
      );

      const result = await startCustomWorkout(workout);
      handleEvent(result.summary);
    } catch (error) {
      console.error('Error starting core workout:', error);
    }
  };

  const startFullBodyWorkout = async () => {
    try {
      setShowWorkoutScreen(true);
      // Award 4 credits for starting full body workout
      await updateCredits(4);
      const exercises = [
        new SMWorkoutLibrary.SMExercise(
          "Jumping Jacks",
          exerciseDurations['Jumping Jacks'],
          "JumpingJacks",
          null,
          [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer],
          "JumpingJacks",
          "",
          null  // Remove scoring params
        ),
        new SMWorkoutLibrary.SMExercise(
          "Push-up",
          exerciseDurations['Push-up'],
          "PushupRegular",
          null,
          [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer],
          "PushupRegular",
          "",
          null  // Remove scoring params
        ),
        new SMWorkoutLibrary.SMExercise(
          "Air Squat",
          exerciseDurations['Air Squat'],
          "SquatRegular",
          null,
          [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer],
          "SquatRegular",
          "",
          null  // Remove scoring params
        ),
        new SMWorkoutLibrary.SMExercise(
          "High Knees",
          exerciseDurations['High Knees'],
          "HighKnees",
          null,
          [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer],
          "HighKnees",
          "",
          null  // Remove scoring params
        )
      ];

      const workout = new SMWorkoutLibrary.SMWorkout(
        'full_body_workout',
        'Full Body Workout',
        null,
        null,
        exercises,
        null,
        null,
        null
      );

      const result = await startCustomWorkout(workout);
      handleEvent(result.summary);
    } catch (error) {
      console.error('Error starting full body workout:', error);
    }
  };

  const startWorkoutProgramSession = async () => {
    try {
      setShowWorkoutScreen(true);
      const parsedWeek = parseInt(week, 10);
      if (isNaN(parsedWeek)) {
        throw new Error('Invalid week number');
      }
      const config = new SMWorkoutLibrary.WorkoutConfig(
        parsedWeek,
        bodyZone,
        difficulty,
        duration,
        language,
        name
      );
      const result = await startWorkoutProgram(config);
      if (result && result.summary) {
        handleEvent(result.summary);
      }
    } catch (error) {
      console.error('Error starting workout program:', error);
    }
  };

  const handleHomeClick = () => {
    setShowWorkoutScreen(false);
    setShowDietScreen(false);
    setActiveTab('Home');
  };

  const getCurrentDate = () => {
    const date = new Date();
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    return `${month} ${day}`;
  };

  const incrementExerciseCount = async (count: number = 1) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const data = await AsyncStorage.getItem(`tracker_${today}`);
      const currentData = data ? JSON.parse(data) : {
        waterIntake: '0',
        steps: '0',
        calories: '0',
        sleepHours: '00:00',
        exerciseCount: '0',
        date: today
      };

      const newCount = parseInt(currentData.exerciseCount || '0') + count;
      currentData.exerciseCount = newCount.toString();
      
      await AsyncStorage.setItem(`tracker_${today}`, JSON.stringify(currentData));
      setExerciseCount(newCount);

      // Emit an event to update other components
      DeviceEventEmitter.emit('exerciseCountUpdated', { count: newCount });
    } catch (error) {
      console.error('Error incrementing exercise count:', error);
    }
  };

  // Function to check if it's a new day
  const isNewDay = (lastUpdate: string | null): boolean => {
    if (!lastUpdate) return true;
    
    const now = new Date();
    const last = new Date(lastUpdate);
    
    return now.getDate() !== last.getDate() ||
           now.getMonth() !== last.getMonth() ||
           now.getFullYear() !== last.getFullYear();
  };

  // Function to select random workouts
  const selectDailyWorkouts = async () => {
    try {
      const lastUpdateStr = await AsyncStorage.getItem('lastWorkoutUpdate');
      
      // Only update if it's a new day
      if (isNewDay(lastUpdateStr)) {
        const allWorkouts = [
          {
            title: 'FULL BODY BURN',
            exercises: [
              { name: 'Jumping Jacks', reps: 60, duration: 0 },
              { name: 'High Knees', reps: 60, duration: 0 },
              { name: 'Push-up', reps: 15, duration: 0 },
              { name: 'Air Squat', reps: 15, duration: 0 }
            ]
          },
          {
            title: 'CORE & ABS',
            exercises: [
              { name: 'Side Plank', reps: 0, duration: 45 },
              { name: 'High Plank', reps: 0, duration: 45 },
              { name: 'Tuck Hold', reps: 0, duration: 45 },
              { name: 'Oblique Crunches', reps: 15, duration: 0 }
            ]
          },
          {
            title: 'MOBILITY & STRETCH',
            exercises: [
              { name: 'Side Bend (Left)', reps: 0, duration: 45 },
              { name: 'Side Bend (Right)', reps: 0, duration: 45 },
              { name: 'Standing Hamstring Mobility', reps: 0, duration: 45 },
              { name: 'Hamstring Mobility', reps: 0, duration: 45 }
            ]
          },
          {
            title: 'UPPER BODY',
            exercises: [
              { name: 'Push-up', reps: 15, duration: 0 },
              { name: 'Shoulder Press', reps: 15, duration: 0 },
              { name: 'Shoulder Taps Plank', reps: 20, duration: 0 },
              { name: 'High Plank', reps: 0, duration: 45 }
            ]
          },
          {
            title: 'LOWER BODY',
            exercises: [
              { name: 'Air Squat', reps: 15, duration: 0 },
              { name: 'Lunge', reps: 15, duration: 0 },
              { name: 'Glute Bridge', reps: 15, duration: 0 },
              { name: 'Overhead Squat', reps: 0, duration: 45 }
            ]
          }
        ];

        // Shuffle array and pick first 3
        const shuffled = [...allWorkouts].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);
        
        // Save selected workouts and update time
        await AsyncStorage.setItem('dailyWorkouts', JSON.stringify(selected));
        await AsyncStorage.setItem('lastWorkoutUpdate', new Date().toISOString());
        
        setDailyWorkouts(selected);
      } else {
        // Load existing workouts if same day
        const savedWorkouts = await AsyncStorage.getItem('dailyWorkouts');
        if (savedWorkouts) {
          setDailyWorkouts(JSON.parse(savedWorkouts));
        }
      }
    } catch (error) {
      console.error('Error updating daily workouts:', error);
    }
  };

  // Load initial workouts and set up midnight refresh
  useEffect(() => {
    selectDailyWorkouts();

    // Set up interval to check for midnight
    const interval = setInterval(async () => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        await selectDailyWorkouts();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const configureSMKitUI = async () => {
    setIsLoading(true);
    try {
      var res = await configure("public_live_a5jSYbzaDk7sgalguc");
      console.log("Configuration successful:", res);
      setIsLoading(false);
      setDidConfig(true);
    } catch (e) {
      setIsLoading(false);
      Alert.alert('Configure Failed', e.message, [{ text: 'OK', onPress: () => console.log('OK Pressed') }]);
    }
  };

  const loadTrackerData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const data = await AsyncStorage.getItem(`tracker_${today}`);
      if (data) {
        const parsedData = JSON.parse(data);
        if (parsedData.waterIntake && parsedData.steps && parsedData.calories && parsedData.sleepHours) {
          // Just trigger a refresh without returning data
          return;
        }
      }
    } catch (error) {
      console.error('Error loading tracker data:', error);
    }
  };

  const renderHomeContent = () => {
    return (
      <ScrollView style={styles.scrollView}>
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <View style={styles.headerTopRow}>
              <Text style={styles.greeting}>Hi, Utkarsh</Text>
              <View style={styles.creditsContainer}>
                <Text style={styles.creditsText}>{credits}</Text>
                <Text style={styles.creditsLabel}>Credits</Text>
              </View>
            </View>
            <Text style={styles.motivationalText}>
              {dailyQuote}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => {
              setSelectedTab('leaderboard');
            }}
          >
            <Text style={styles.actionEmoji}>🏆</Text>
            <Text style={styles.actionText}>Leaderboard</Text>
          </TouchableOpacity>
          
          <View style={styles.verticalLine} />
          
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => {
              setSelectedTab('progress');
            }}
          >
            <Text style={styles.actionEmoji}>📊</Text>
            <Text style={styles.actionText}>Progress{'\n'}Tracking</Text>
          </TouchableOpacity>
          
          <View style={styles.verticalLine} />
          
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => {
              setSelectedTab('tracker');
            }}
          >
            <Text style={styles.actionEmoji}>📈</Text>
            <Text style={styles.actionText}>Tracker</Text>
          </TouchableOpacity>
          
          <View style={styles.verticalLine} />
          
          <View style={styles.actionItem}>
            <Text style={styles.actionEmoji}>👥</Text>
            <Text style={styles.actionText}>Community</Text>
          </View>
        </View>

        {/* Avatar Section */}
        <View style={styles.avatarContainer}>
          <Image 
            source={require('./assets/Figure.png')} 
            style={styles.avatar}
          />
        </View>

        {/* Assessments Section */}
        <View style={styles.assessmentsSection}>
          <View style={styles.assessmentHeader}>
            <Text style={styles.assessmentTitle}>Assessments</Text>
            <Text style={styles.letsGoText}>See all</Text>
          </View>
          
          <View style={styles.assessmentGrid}>
            <View style={styles.assessmentRow}>
              <TouchableOpacity 
                style={styles.assessmentButton}
                onPress={() => handleAssessment('FITNESS')}
              >
                <Text style={styles.assessmentButtonText}>FITNESS</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.assessmentButton}
                onPress={() => handleAssessment('MOVEMENT')}
              >
                <Text style={styles.assessmentButtonText}>MOVEMENT</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.assessmentRow}>
              <TouchableOpacity 
                style={styles.assessmentButton}
                onPress={() => handleAssessment('STRENGTH')}
              >
                <Text style={styles.assessmentButtonText}>STRENGTH</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.assessmentButton}
                onPress={() => handleAssessment('CARDIO')}
              >
                <Text style={styles.assessmentButtonText}>CARDIO</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={styles.customFitnessButton}
              onPress={() => handleAssessment('CUSTOM')}
            >
              <Text style={styles.assessmentButtonText}>CUSTOM FITNESS</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recommendations Section */}
        <View style={styles.recommendationsSection}>
          <Text style={styles.recommendationsTitle}>Recommendations : {getCurrentDate()}</Text>
          <Text style={styles.recommendationsSubtitle}>Exercise for today</Text>
          
          {dailyWorkouts.map((workout, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.workoutCard}
              onPress={() => {
                incrementExerciseCount(workout.exercises.length);
                switch(workout.title) {
                  case 'FULL BODY BURN':
                    setWorkoutModalVisible(true);
                    break;
                  case 'MOBILITY & STRETCH':
                    setMobilityModalVisible(true);
                    break;
                  case 'CORE & ABS':
                    setCoreModalVisible(true);
                    break;
                  default:
                    setWorkoutModalVisible(true);
                }
              }}
            >
              <View style={styles.workoutInfo}>
                <Text style={styles.workoutTitle}>{workout.title}</Text>
                <View style={styles.workoutMeta}>
                  <Text style={styles.workoutDuration}>{workout.exercises.length} exercises</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Weekly Challenge Section */}
        <View style={styles.weeklyChallenge}>
          <Text style={styles.weeklyTitleText}>WEEKLY CHALLENGE</Text>
          <View style={styles.challengeContainer}>
            <View style={styles.challengeContent}>
              <Text style={styles.challengeText}>Complete 30 exercises this week</Text>
              <TouchableOpacity style={styles.startButton}>
                <Text style={styles.startButtonText}>START</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {selectedTab === 'home' && renderHomeContent()}
      {selectedTab === 'tracker' && (
        <Tracker 
          onBack={handleHomeClick}
          exerciseCount={exerciseCount.toString()}
          onExerciseCountUpdate={async (count) => {
            const numCount = parseInt(count);
            if (!isNaN(numCount)) {
              setExerciseCount(numCount);
              const today = new Date().toISOString().split('T')[0];
              const existingData = await AsyncStorage.getItem(`tracker_${today}`);
              const trackerData = existingData ? JSON.parse(existingData) : {
                waterIntake: '0',
                steps: '0',
                calories: '0',
                sleepHours: '00:00',
                exerciseCount: '0',
                date: today
              };
              trackerData.exerciseCount = numCount.toString();
              await AsyncStorage.setItem(`tracker_${today}`, JSON.stringify(trackerData));
            }
          }}
        />
      )}
      {selectedTab === 'diet' && <Diet onBack={handleHomeClick} onSaveCalories={loadTrackerData} />}
      {selectedTab === 'leaderboard' && <Leaderboard credits={credits} />}
      {selectedTab === 'profile' && <Profile />}
      {selectedTab === 'progress' && <ProgressScreen onBack={() => setSelectedTab('home')} />}
      {selectedTab === 'workout' && (
        <WorkoutScreen 
          onBack={() => setSelectedTab('home')}
          onNavigate={(screen) => setSelectedTab(screen)}
          credits={credits}
          setCredits={setCredits}
        />
      )}

      <View style={styles.bottomNav}>
        {renderNavItem('HOME', null, () => setSelectedTab('home'))}
        {renderNavItem('DIET', null, () => setSelectedTab('diet'))}
        {renderNavItem('WORKOUT', null, () => setSelectedTab('workout'))}
        {renderNavItem('PROFILE', null, () => setSelectedTab('profile'))}
      </View>

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>{summaryMessage}</Text>
            <TouchableOpacity
              style={[styles.button, styles.closeButton]}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={workoutModalVisible}
        animationType="slide"
        onRequestClose={() => setWorkoutModalVisible(false)}
      >
        <View style={styles.workoutModalBackground}>
          <View style={styles.workoutModalContainer}>
            <Text style={[styles.workoutModalTitle, { fontFamily: 'MinecraftTen' }]}>FULL BODY BURN</Text>
            <ScrollView style={styles.exerciseList}>
              {fullBodyExercises.map((exercise, index) => (
                <View key={index} style={styles.exerciseItem}>
                  <View style={styles.exerciseMainInfo}>
                    <Text style={[styles.exerciseName, { fontFamily: 'MinecraftTen' }]}>{exercise.name}</Text>
                  </View>
                  <View style={styles.controlsContainer}>
                    <View style={styles.controlGroup}>
                      <Text style={[styles.controlLabel, { fontFamily: 'MinecraftTen' }]}>REPS</Text>
                      <View style={styles.controls}>
                        <TouchableOpacity 
                          style={styles.controlButton}
                          onPress={() => updateReps(exercise.name, -1)}
                        >
                          <Text style={[styles.controlButtonText, { fontFamily: 'MinecraftTen' }]}>-</Text>
                        </TouchableOpacity>
                        <Text style={[styles.controlText, { fontFamily: 'MinecraftTen' }]}>{exercise.reps}</Text>
                        <TouchableOpacity 
                          style={styles.controlButton}
                          onPress={() => updateReps(exercise.name, 1)}
                        >
                          <Text style={[styles.controlButtonText, { fontFamily: 'MinecraftTen' }]}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.controlGroup}>
                      <Text style={[styles.controlLabel, { fontFamily: 'MinecraftTen' }]}>TIME</Text>
                      <View style={styles.controls}>
                        <TouchableOpacity 
                          style={styles.controlButton}
                          onPress={() => updateDuration(exercise.name, -5)}
                        >
                          <Text style={[styles.controlButtonText, { fontFamily: 'MinecraftTen' }]}>-</Text>
                        </TouchableOpacity>
                        <Text style={[styles.controlText, { fontFamily: 'MinecraftTen' }]}>{exercise.duration}s</Text>
                        <TouchableOpacity 
                          style={styles.controlButton}
                          onPress={() => updateDuration(exercise.name, 5)}
                        >
                          <Text style={[styles.controlButtonText, { fontFamily: 'MinecraftTen' }]}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setWorkoutModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText, { fontFamily: 'MinecraftTen' }]}>CLOSE</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.startWorkoutButton]}
                onPress={startFullBodyWorkout}
              >
                <Text style={[styles.modalButtonText, styles.startButtonText, { fontFamily: 'MinecraftTen' }]}>START WORKOUT</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={mobilityModalVisible}
        animationType="slide"
        onRequestClose={() => setMobilityModalVisible(false)}
      >
        <View style={styles.workoutModalBackground}>
          <View style={styles.workoutModalContainer}>
            <Text style={[styles.workoutModalTitle, { fontFamily: 'MinecraftTen' }]}>MOBILITY & STRETCH</Text>
            <ScrollView style={styles.exerciseList}>
              {mobilityExercises.map((exercise, index) => (
                <View key={index} style={styles.exerciseItem}>
                  <View style={styles.exerciseMainInfo}>
                    <Text style={[styles.exerciseName, { fontFamily: 'MinecraftTen' }]}>{exercise.name}</Text>
                  </View>
                  <View style={styles.controlsContainer}>
                    {exercise.type === 'reps' || exercise.type === 'both' ? (
                      <View style={styles.controlGroup}>
                        <Text style={[styles.controlLabel, { fontFamily: 'MinecraftTen' }]}>REPS</Text>
                        <View style={styles.controls}>
                          <TouchableOpacity 
                            style={styles.controlButton}
                            onPress={() => updateReps(exercise.name, -1)}
                          >
                            <Text style={[styles.controlButtonText, { fontFamily: 'MinecraftTen' }]}>-</Text>
                          </TouchableOpacity>
                          <Text style={[styles.controlText, { fontFamily: 'MinecraftTen' }]}>{exercise.reps}</Text>
                          <TouchableOpacity 
                            style={styles.controlButton}
                            onPress={() => updateReps(exercise.name, 1)}
                          >
                            <Text style={[styles.controlButtonText, { fontFamily: 'MinecraftTen' }]}>+</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : null}
                    {exercise.type === 'duration' || exercise.type === 'both' ? (
                      <View style={styles.controlGroup}>
                        <Text style={[styles.controlLabel, { fontFamily: 'MinecraftTen' }]}>TIME</Text>
                        <View style={styles.controls}>
                          <TouchableOpacity 
                            style={styles.controlButton}
                            onPress={() => updateDuration(exercise.name, -5)}
                          >
                            <Text style={[styles.controlButtonText, { fontFamily: 'MinecraftTen' }]}>-</Text>
                          </TouchableOpacity>
                          <Text style={[styles.controlText, { fontFamily: 'MinecraftTen' }]}>{exercise.duration}s</Text>
                          <TouchableOpacity 
                            style={styles.controlButton}
                            onPress={() => updateDuration(exercise.name, 5)}
                          >
                            <Text style={[styles.controlButtonText, { fontFamily: 'MinecraftTen' }]}>+</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : null}
                  </View>
                </View>
              ))}
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setMobilityModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText, { fontFamily: 'MinecraftTen' }]}>CLOSE</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.startWorkoutButton]}
                onPress={startMobilityWorkout}
              >
                <Text style={[styles.modalButtonText, styles.startButtonText, { fontFamily: 'MinecraftTen' }]}>START WORKOUT</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={coreModalVisible}
        animationType="slide"
        onRequestClose={() => setCoreModalVisible(false)}
      >
        <View style={styles.workoutModalBackground}>
          <View style={styles.workoutModalContainer}>
            <Text style={[styles.workoutModalTitle, { fontFamily: 'MinecraftTen' }]}>CORE & ABS</Text>
            <ScrollView style={styles.exerciseList}>
              {coreExercises.map((exercise, index) => (
                <View key={index} style={styles.exerciseItem}>
                  <View style={styles.exerciseMainInfo}>
                    <Text style={[styles.exerciseName, { fontFamily: 'MinecraftTen' }]}>{exercise.name}</Text>
                  </View>
                  <View style={styles.controlsContainer}>
                    {exercise.type === 'reps' || exercise.type === 'both' ? (
                      <View style={styles.controlGroup}>
                        <Text style={[styles.controlLabel, { fontFamily: 'MinecraftTen' }]}>REPS</Text>
                        <View style={styles.controls}>
                          <TouchableOpacity 
                            style={styles.controlButton}
                            onPress={() => updateCoreReps(exercise.name, -1)}
                          >
                            <Text style={[styles.controlButtonText, { fontFamily: 'MinecraftTen' }]}>-</Text>
                          </TouchableOpacity>
                          <Text style={[styles.controlText, { fontFamily: 'MinecraftTen' }]}>{exercise.reps}</Text>
                          <TouchableOpacity 
                            style={styles.controlButton}
                            onPress={() => updateCoreReps(exercise.name, 1)}
                          >
                            <Text style={[styles.controlButtonText, { fontFamily: 'MinecraftTen' }]}>+</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : null}
                    {exercise.type === 'duration' || exercise.type === 'both' ? (
                      <View style={styles.controlGroup}>
                        <Text style={[styles.controlLabel, { fontFamily: 'MinecraftTen' }]}>TIME</Text>
                        <View style={styles.controls}>
                          <TouchableOpacity 
                            style={styles.controlButton}
                            onPress={() => updateCoreDuration(exercise.name, -5)}
                          >
                            <Text style={[styles.controlButtonText, { fontFamily: 'MinecraftTen' }]}>-</Text>
                          </TouchableOpacity>
                          <Text style={[styles.controlText, { fontFamily: 'MinecraftTen' }]}>{exercise.duration}s</Text>
                          <TouchableOpacity 
                            style={styles.controlButton}
                            onPress={() => updateCoreDuration(exercise.name, 5)}
                          >
                            <Text style={[styles.controlButtonText, { fontFamily: 'MinecraftTen' }]}>+</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : null}
                  </View>
                </View>
              ))}
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setCoreModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText, { fontFamily: 'MinecraftTen' }]}>CLOSE</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.startWorkoutButton]}
                onPress={startCoreWorkout}
              >
                <Text style={[styles.modalButtonText, styles.startButtonText, { fontFamily: 'MinecraftTen' }]}>START WORKOUT</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

async function startAssessmentSession(
  type,
  showSummary,
  customAssessmentID,
) {
  try {
    console.log('starting assessment');
    var result = await startAssessment(
      type,
      showSummary,
      null,
      false,
      customAssessmentID,
    );
    console.log(result.summary);
    console.log(result.didFinish);
  } catch (e) {
    Alert.alert('Unable to start assessment', e.message, [{ text: 'OK', onPress: () => console.log('OK Pressed') }]);
  }
}

async function startSMKitUICustomWorkout() {
  try {
    var exercises = [
      new SMWorkoutLibrary.SMAssessmentExercise(
        'SquatRegularOverheadStatic',
        30,
        'SquatRegularOverheadStatic',
        null,
        [
          SMWorkoutLibrary.UIElement.GaugeOfMotion,
          SMWorkoutLibrary.UIElement.Timer,
        ],
        'SquatRegularOverheadStatic',
        'stam',
        new SMWorkoutLibrary.SMScoringParams(
          SMWorkoutLibrary.ScoringType.Time,
          0.5,
          20,
          null,
          null,
          null,
        ),
        '',
        'SquatRegularOverheadStatic',
        'Subtitle',
        'timeInPosition',
        'clean reps'
      ),
      new SMWorkoutLibrary.SMAssessmentExercise(
        'Jefferson Curl',
        30,
        'JeffersonCurlRight',
        null,
        [
          SMWorkoutLibrary.UIElement.GaugeOfMotion,
          SMWorkoutLibrary.UIElement.Timer,
        ],
        'JeffersonCurlRight',
        'stam',
        new SMWorkoutLibrary.SMScoringParams(
          SMWorkoutLibrary.ScoringType.Time,
          0.5,
          20,
          null,
          null,
          null,
        ),
        '',
        'JeffersonCurlRight',
        'Subtitle',
        'timeInPosition',
        'clean reps'
      ),
      new SMWorkoutLibrary.SMAssessmentExercise(
        'Push-Up',
        30,
        'PushupRegular',
        null,
        [
          SMWorkoutLibrary.UIElement.RepsCounter,
          SMWorkoutLibrary.UIElement.Timer,
        ],
        'PushupRegular',
        'stam',
        new SMWorkoutLibrary.SMScoringParams(
          SMWorkoutLibrary.ScoringType.Reps,
          0.5,
          null,
          6,
          null,
          null,
        ),
        '',
        'PushupRegular',
        'Subtitle',
        'Reps',
        'clean reps'
      ),
      new SMWorkoutLibrary.SMAssessmentExercise(
        'LungeFrontRight',
        30,
        'LungeFrontRight',
        null,
        [
          SMWorkoutLibrary.UIElement.GaugeOfMotion,
          SMWorkoutLibrary.UIElement.Timer,
        ],
        'LungeFront',
        'stam',
        new SMWorkoutLibrary.SMScoringParams(
          SMWorkoutLibrary.ScoringType.Reps,
          0.5,
          null,
          20,
          null,
          null,
        ),
        '',
        'LungeFrontRight',
        'Subtitle',
        'timeInPosition',
        'clean reps'
      ),
      new SMWorkoutLibrary.SMAssessmentExercise(
        'LungeFrontLeft',
        30,
        'LungeFrontLeft',
        null,
        [
          SMWorkoutLibrary.UIElement.GaugeOfMotion,
          SMWorkoutLibrary.UIElement.Timer,
        ],
        'LungeFront',
        'stam',
        new SMWorkoutLibrary.SMScoringParams(
          SMWorkoutLibrary.ScoringType.Reps,
          0.5,
          null,
          20,
          null,
          null,
        ),
        '',
        'LungeFrontLeft',
        'Subtitle',
        'timeInPosition',
        'clean reps'
      ),
    ];

    var assessment = new SMWorkoutLibrary.SMWorkout(
      '50',
      'demo workout',
      null,
      null,
      exercises,
      null,
      null,
      null,
    );

    var result = await startCustomWorkout(assessment);
    console.log(result.summary);
    console.log(result.didFinish);
  } catch (e) {
    console.error(e);
    showAlert('Custom workout error', e.message);
  }
}

async function startSMKitUICustomAssessment() {
  try {
    // Set language and preferences first
    await setSessionLanguage(SMWorkoutLibrary.Language.Hebrew);
    setEndExercisePreferences(SMWorkoutLibrary.EndExercisePreferences.TargetBased);
    setCounterPreferences(SMWorkoutLibrary.CounterPreferences.PerfectOnly);

    // Optional: Use local sound files instead of URLs
    const successSound = '';  // Remove URL and use local file or leave empty
    const failedSound = '';   // Remove URL and use local file or leave empty

    const exercises = [
      new SMWorkoutLibrary.SMAssessmentExercise(
        'SquatRegular',
        35,
        'SquatRegular',
        null,
        [
          SMWorkoutLibrary.UIElement.RepsCounter,
          SMWorkoutLibrary.UIElement.Timer,
        ],
        'SquatRegular',
        successSound,
        new SMWorkoutLibrary.SMScoringParams(
          SMWorkoutLibrary.ScoringType.Reps,
          0.3,
          null,
          5,
          null,
          null,
        ),
        failedSound,
        'SquatRegular',
        'Subtitle',
        'Reps',
        'clean reps'
      ),
      new SMWorkoutLibrary.SMAssessmentExercise(
        'LungeFront',
        35,
        'LungeFront',
        null,
        [
          SMWorkoutLibrary.UIElement.RepsCounter,
          SMWorkoutLibrary.UIElement.Timer,
        ],
        'LungeFront',
        successSound,
        new SMWorkoutLibrary.SMScoringParams(
          SMWorkoutLibrary.ScoringType.Reps,
          0.3,
          null,
          5,
          null,
          null,
        ),
        failedSound,
        'LungeFront',
        'Subtitle',
        'Reps',
        'clean reps'
      ),
      new SMWorkoutLibrary.SMAssessmentExercise(
        'HighKnees',
        35,
        'HighKnees',
        null,
        [
          SMWorkoutLibrary.UIElement.RepsCounter,
          SMWorkoutLibrary.UIElement.Timer,
        ],
        'HighKnees',
        successSound,
        new SMWorkoutLibrary.SMScoringParams(
          SMWorkoutLibrary.ScoringType.Reps,
          0.3,
          null,
          5,
          null,
          null,
        ),
        failedSound,
        'HighKnees',
        'Subtitle',
        'Reps',
        'clean reps'
      ),
      new SMWorkoutLibrary.SMAssessmentExercise(
        'SquatRegularOverheadStatic',
        35,
        'SquatRegularOverheadStatic',
        null,
        [
          SMWorkoutLibrary.UIElement.RepsCounter,
          SMWorkoutLibrary.UIElement.Timer,
        ],
        'SquatRegularOverheadStatic',
        successSound,
        new SMWorkoutLibrary.SMScoringParams(
          SMWorkoutLibrary.ScoringType.Time,
          0.3,
          15,
          null,
          null,
          null,
        ),
        failedSound,
        'SquatRegularOverheadStatic',
        'Subtitle',
        'Time',
        'seconds held'
      ),
      new SMWorkoutLibrary.SMAssessmentExercise(
        'PlankHighStatic',
        35,
        'PlankHighStatic',
        null,
        [
          SMWorkoutLibrary.UIElement.RepsCounter,
          SMWorkoutLibrary.UIElement.Timer,
        ],
        'PlankHighStatic',
        successSound,
        new SMWorkoutLibrary.SMScoringParams(
          SMWorkoutLibrary.ScoringType.Time,
          0.3,
          15,
          null,
          null,
          null,
        ),
        failedSound,
        'PlankHighStatic',
        'Subtitle',
        'Time',
        'seconds held'
      ),
      new SMWorkoutLibrary.SMAssessmentExercise(
        'StandingSideBendRight',
        35,
        'StandingSideBendRight',
        null,
        [
          SMWorkoutLibrary.UIElement.RepsCounter,
          SMWorkoutLibrary.UIElement.Timer,
        ],
        'StandingSideBendRight',
        successSound,
        new SMWorkoutLibrary.SMScoringParams(
          SMWorkoutLibrary.ScoringType.Time,
          0.3,
          15,
          null,
          null,
          null,
        ),
        failedSound,
        'StandingSideBendRight',
        'Subtitle',
        'Time',
        'seconds held'
      ),
    ];

    var assessment = new SMWorkoutLibrary.SMWorkout(
      '50',
      'demo workout',
      null,
      null,
      exercises,
      null,
      null,
      null,
    );

    var result = await startCustomAssessment(assessment, null, false, false);
    console.log('Assessment result:', result.summary);
    console.log('Did finish:', result.didFinish);
  } catch (e) {
    console.error('Custom assessment error:', e);
    showAlert('Custom assessment error', e.message);
  }
}

function showAlert(title, message) {
  Alert.alert(title, message, [
    { text: 'OK', onPress: () => console.log('OK Pressed') },
  ]);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 2, // Reduced from 4 to 2
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2, // Reduced from 4 to 2
  },
  creditsContainer: {
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#F47551',
    shadowColor: '#F47551',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  creditsText: {
    color: '#F47551',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'NationalPark',
    alignSelf: 'center'
  },
  creditsLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'NationalPark',
    opacity: 0.8,
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F47551',
    marginBottom: 4, // Reduced from 8 to 4
    fontFamily: 'NationalPark',
  },
  motivationalText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
    fontWeight: 'bold',
    fontFamily: 'NationalPark',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 15,
    marginBottom: 10,
  },
  actionItem: {
    alignItems: 'center',
    flex: 1,
  },
  actionEmoji: {
    fontSize: 24,
    marginBottom: 8,
    color: '#FFFFFF',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    fontFamily: 'NationalPark',
  },
  verticalLine: {
    width: 1,
    height: 40,
    backgroundColor: '#333333',
  },
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  avatar: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  assessmentsSection: {
    padding: 20,
  },
  assessmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  assessmentTitle: {
    color: '#F47551',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'NationalPark',
  },
  letsGoText: {
    color: '#F47551',
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'NationalPark',
  },
  assessmentGrid: {
    gap: 15,
  },
  assessmentRow: {
    flexDirection: 'row',
    gap: 15,
  },
  assessmentButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    fontFamily: 'MinecraftTen',
  },
  customFitnessButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  assessmentButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'MinecraftTen',
  },
  recommendationsSection: {
    padding: 20,
    paddingBottom: 10, // Reduced padding at bottom
  },
  recommendationsTitle: {
    color: '#F47551',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'NationalPark',
    marginBottom: 5,
  },
  recommendationsSubtitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'MinecraftTen',
    marginBottom: 15,
  },
  workoutCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 15,
    marginBottom: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutInfo: {
    width: '100%',
    alignItems: 'center',
  },
  workoutTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1,
    textAlign: 'center',
  },
  workoutMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutDuration: {
    color: '#F47551',
    fontSize: 16,
    fontFamily: 'MinecraftTen',
    marginRight: 15,
    letterSpacing: 0.5,
  },
  workoutLevel: {
    color: '#666666',
    fontSize: 16,
    fontFamily: 'MinecraftTen',
    letterSpacing: 0.5,
  },
  weeklyChallenge: {
    backgroundColor: '#1E1E1E', // Changed to match workoutCard background
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333333',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  weeklyTitleText: {
    color: '#F47551',
    fontSize: 20,
    fontFamily: 'NationalPark',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  challengeContainer: {
    backgroundColor: '#242424',
    borderRadius: 12,
    overflow: 'hidden',
  },
  challengeContent: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'NationalPark',
    fontWeight: '500',
    flex: 1,
    letterSpacing: 0.5,
  },
  startButton: {
    backgroundColor: '#F47551',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'MinecraftTen',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: colors.navigationBg,
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
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 5,
    padding: 10,
    width: '45%',
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  selectedExercise: {
    backgroundColor: 'rgba(196, 164, 132, 0.3)',
    borderColor: '#C4A484',
  },
  disabledButton: {
    opacity: 0.5,
  },
  workoutModalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  workoutModalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  workoutModalTitle: {
    color: '#F47551',
    fontSize: 28,
    marginBottom: 25,
    textAlign: 'center',
    fontFamily: 'MinecraftTen',
    letterSpacing: 1,
  },
  exerciseList: {
    width: '100%',
    marginBottom: 20,
    maxHeight: '60%',
  },
  exerciseItem: {
    backgroundColor: '#F8F8F8',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  exerciseMainInfo: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 10,
  },
  exerciseName: {
    color: '#333333',
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'MinecraftTen',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
  },
  controlGroup: {
    flex: 1,
  },
  controlLabel: {
    color: '#F47551',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'MinecraftTen',
    letterSpacing: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  controlButton: {
    backgroundColor: '#F47551',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F47551',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'MinecraftTen',
  },
  controlText: {
    color: '#333333',
    fontSize: 18,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'center',
    fontFamily: 'MinecraftTen',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
    gap: 15,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  cancelButton: {
    backgroundColor: '#EEEEEE',
  },
  startWorkoutButton: {
    backgroundColor: '#F47551',
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: 'MinecraftTen',
    letterSpacing: 1,
  },
  cancelButtonText: {
    color: '#666666',
    fontFamily: 'MinecraftTen',
  },
});

const WrappedWorkoutScreen = (props: any) => {
  const navigation = useNavigation<NavigationProp>();
  return (
    <WorkoutScreen
      {...props}
      onBack={() => navigation.goBack()}
      onNavigate={(screen) => navigation.navigate(screen as keyof RootStackParamList)}
    />
  );
};

const WrappedProgressScreen = (props: any) => {
  const navigation = useNavigation<NavigationProp>();
  return <ProgressScreen {...props} onBack={() => navigation.goBack()} />;
};

const WrappedDietScreen = (props: any) => {
  const navigation = useNavigation<NavigationProp>();
  return <Diet {...props} onBack={() => navigation.goBack()} />;
};

const WrappedTrackerScreen = (props: any) => {
  const navigation = useNavigation<NavigationProp>();
  return <Tracker {...props} onBack={() => navigation.goBack()} />;
};

const WrappedLeaderboardScreen = (props: any) => {
  return <Leaderboard {...props} credits={0} />;
};

const App = () => {
  const [credits, setCredits] = useState(0);
  const [exerciseCount, setExerciseCount] = useState(0);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainContent} />
        <Stack.Screen name="Workout" component={WrappedWorkoutScreen} />
        <Stack.Screen name="Progress" component={WrappedProgressScreen} />
        <Stack.Screen name="Diet" component={WrappedDietScreen} />
        <Stack.Screen name="Tracker" component={WrappedTrackerScreen} />
        <Stack.Screen name="Leaderboard" component={WrappedLeaderboardScreen} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;