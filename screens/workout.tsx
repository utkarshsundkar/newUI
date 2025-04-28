import { useState, useEffect, useCallback, memo } from 'react';
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
import EditText from '../components/EditText';
import ThreeCheckboxes from '../components/ThreeCheckboxes';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Add these interfaces at the top of the file, after imports
interface ExerciseStatus {
  completed: boolean;
  skipped: boolean;
}

interface ExerciseWithStatus {
  name: string;
  completed: boolean;
  skipped: boolean;
}

interface WorkoutExercise {
  name: string;
  [key: string]: any; // Allow other properties from SMAssessmentExercise
}

interface WorkoutWithEvents extends SMWorkoutLibrary.SMWorkout {
  onExerciseCompleted?: (exercise: WorkoutExercise) => void;
  onExerciseSkipped?: (exercise: WorkoutExercise) => void;
}

interface WorkoutScreenProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
  credits: number;
  setCredits: (credits: number) => void;
}

const WorkoutScreen: React.FC<WorkoutScreenProps> = ({ onBack, onNavigate, credits, setCredits }) => {
  const [didConfig, setDidConfig] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showWFPUI, setWPFUI] = useState(false);
  const [week, setWeek] = useState('1');
  const [bodyZone, setBodyZone] = useState(SMWorkoutLibrary.BodyZone.FullBody);
  const [difficultyLevel, setDifficultyLevel] = useState(SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty);
  const [duration, setDuration] = useState(SMWorkoutLibrary.WorkoutDuration.Long);
  const [language, setLanguage] = useState(SMWorkoutLibrary.Language.English);
  const [name, setName] = useState('YOUR_PROGRAM_ID');
  const [modalVisible, setModalVisible] = useState(false);
  const [summaryMessage, setSummaryMessage] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  
  const availableExercises = [
    'Jumping Jacks',
    'High Knees',
    'Glute Bridge',
    'Lunge',
    'Shoulder Taps Plank',
    'Push-up',
    'Air Squat',
    'Oblique Crunches',
    'Shoulder Press',
    'Side Plank',
    'High Plank',
    'Overhead Squat',
    'Tuck Hold',
    'Jefferson Curl',
    'Standing Knee Raise (Left)',
    'Standing Knee Raise (Right)',
    'Side Bend (Left)',
    'Side Bend (Right)',
    'Hamstring Mobility',
    'Standing Hamstring Mobility'
  ];

  const exerciseConfigs = {
    'Jumping Jacks': {
      detector: 'JumpingJacks',
      isTimeBased: false,
      reps: 60  // Changed from time-based to 60 reps
    },
    'High Knees': {
      detector: 'HighKnees',
      isTimeBased: false,
      reps: 60  // Changed from time-based to 60 reps
    },
    'Glute Bridge': {
      detector: 'GlutesBridge',
      isTimeBased: false,
      reps: 15
    },
    'Lunge': {
      detector: 'Lunge',
      isTimeBased: false,
      reps: 15
    },
    'Shoulder Taps Plank': {
      detector: 'PlankHighShoulderTaps',
      isTimeBased: false,
      reps: 20
    },
    'Push-up': {
      detector: 'PushupRegular',
      isTimeBased: false,
      reps: 15
    },
    'Air Squat': {
      detector: 'SquatRegular',
      isTimeBased: false,
      reps: 15
    },
    'Oblique Crunches': {
      detector: 'StandingObliqueCrunches',
      isTimeBased: false,
      reps: 15
    },
    'Shoulder Press': {
      detector: 'ShouldersPress',
      isTimeBased: false,
      reps: 15
    },
    'Side Plank': {
      detector: 'PlankSideLowStatic',
      isTimeBased: true,
      duration: 45
    },
    'High Plank': {
      detector: 'PlankHighStatic',
      isTimeBased: true,
      duration: 45
    },
    'Overhead Squat': {
      detector: 'SquatRegularOverheadStatic',
      isTimeBased: true,
      duration: 45
    },
    'Tuck Hold': {
      detector: 'TuckHold',
      isTimeBased: true,
      duration: 45
    },
    'Jefferson Curl': {
      detector: 'JeffersonCurlRight',
      isTimeBased: true,
      duration: 45
    },
    'Standing Knee Raise (Left)': {
      detector: 'StandingKneeRaiseLeft',
      isTimeBased: true,
      duration: 45
    },
    'Standing Knee Raise (Right)': {
      detector: 'StandingKneeRaiseRight',
      isTimeBased: true,
      duration: 45
    },
    'Side Bend (Left)': {
      detector: 'StandingSideBendLeft',
      isTimeBased: true,
      duration: 45,
    },
    'Side Bend (Right)': {
      detector: 'StandingSideBendRight',
      isTimeBased: true,
      duration: 45,
    },
    'Hamstring Mobility': {
      detector: 'HamstringMobility',
      isTimeBased: true,
      duration: 45
    },
    'Standing Hamstring Mobility': {
      detector: 'StandingHamstringMobility',
      isTimeBased: true,
      duration: 45
    }
  };

  const toggleExerciseSelection = (exercise: string) => {
    setSelectedExercises(prevSelected => {
      if (prevSelected.includes(exercise)) {
        return prevSelected.filter(e => e !== exercise);
      }
      if (prevSelected.length >= 4) {
        Alert.alert('Maximum Exercises', 'You can only select up to 4 exercises');
        return prevSelected;
      }
      return [...prevSelected, exercise];
    });
  };

  const handleStartWorkout = async () => {
    try {
      // Initialize exercise status
      const initialStatus = selectedExercises.reduce((acc, exercise) => {
        acc[exercise] = { completed: false, skipped: false };
        return acc;
      }, {});
      setExerciseStatus(initialStatus);

      const workoutExercises = selectedExercises.map(exerciseName => {
        const config = exerciseConfigs[exerciseName];
        return new SMWorkoutLibrary.SMAssessmentExercise(
          exerciseName,
          35,
          config.detector,
            null,
          config.isTimeBased 
            ? [SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion]
            : [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
          config.detector,
            '',
            new SMWorkoutLibrary.SMScoringParams(
            config.isTimeBased ? SMWorkoutLibrary.ScoringType.Time : SMWorkoutLibrary.ScoringType.Reps,
              0.3,
            config.isTimeBased ? config.duration : null,
            !config.isTimeBased ? config.reps : null,
              null,
              null
            ),
            '',
            exerciseName,
          config.isTimeBased ? `Hold for ${config.duration} seconds` : `Complete ${config.reps} reps`,
          config.isTimeBased ? 'Time' : 'Reps',
          'clean reps'
        );
      });

      const workout = new SMWorkoutLibrary.SMWorkout(
        'custom_workout',
        'Custom Workout',
        null,
        null,
        workoutExercises,
        null,
        null,
        null
      ) as any; // Use any type for workout to allow event handlers

      // Add exercise completion handlers
      workout.onExerciseCompleted = (exercise: any) => {
        setExerciseStatus(prev => ({
          ...prev,
          [exercise.name]: { ...prev[exercise.name], completed: true }
        }));
        onExerciseCompleted(exercise);
      };

      workout.onExerciseSkipped = (exercise: any) => {
        setExerciseStatus(prev => ({
          ...prev,
          [exercise.name]: { ...prev[exercise.name], skipped: true }
        }));
        onExerciseSkipped(exercise);
      };

      const result = await startCustomAssessment(workout, null, false, false);
      console.log('Assessment result:', result.summary);
      if (result.didFinish) {
        // Count completed exercises
        const completedCount = Object.values(exerciseStatus).filter(status => status.completed).length;
        handleEvent({ 
          type: 'workout_completed',
          completedExercises: completedCount,
          exercises: selectedExercises.map(name => ({
            name,
            ...exerciseStatus[name]
          }))
        });
      }
    } catch (e) {
      showAlert('Workout Error', e.message);
    }
  };

  const handleCustomButtonPress = useCallback(() => {
    setSelectedExercises([]);
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setSelectedExercises([]);
  }, []);

  const ExerciseSelectionModal = memo(() => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={closeModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Select Exercises (Max 4)</Text>
          <Text style={styles.modalSubtitle}>{selectedExercises.length}/4 selected</Text>
          <ScrollView style={styles.exerciseList}>
            {availableExercises.map((exercise) => (
              <TouchableOpacity
                key={exercise}
                style={[
                  styles.exerciseItem,
                  selectedExercises.includes(exercise) && styles.exerciseItemSelected
                ]}
                onPress={() => toggleExerciseSelection(exercise)}
              >
                <Text style={[
                  styles.exerciseText,
                  selectedExercises.includes(exercise) && styles.exerciseTextSelected
                ]}>
                  {exercise}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={closeModal}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalStartButton,
                selectedExercises.length === 0 && styles.modalStartButtonDisabled
              ]}
              onPress={handleStartWorkout}
              disabled={selectedExercises.length === 0}
            >
              <Text style={styles.modalButtonText}>Start Workout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  ));

  useEffect(() => {
    configureSMKitUI();
  }, []);

  useEffect(() => {
    const didExitWorkoutSubscription = DeviceEventEmitter.addListener('didExitWorkout', params => {
      handleEvent(params.summary);
      console.log('Received didExitWorkout event with message:', params.summary);
    });

    const workoutDidFinishSubscription = DeviceEventEmitter.addListener('workoutDidFinish', params => {
      handleEvent(params.summary);
      console.log('Received workoutDidFinish event with message:', params.summary);
    });

    return () => {
      didExitWorkoutSubscription.remove();
      workoutDidFinishSubscription.remove();
    };
  }, []);

  const handleEvent = (summary) => {
    console.log('Workout event:', summary);
    
    // Handle exercise completion
    if (summary.type === 'exercise_completed' || summary.event === 'exercise_completed') {
      console.log('Exercise completed, awarding credits');
      const newCredits = credits + 5;
      setCredits(newCredits);
      
      // Emit event for tracker
      DeviceEventEmitter.emit('didExitWorkout', {
        type: 'workout_completed',
        completedExercises: 1,
        source: 'workout'
      });
    } 
    // Handle workout completion
    else if (summary.type === 'workout_completed') {
      // Calculate completed exercises
      let completedCount = 0;
      
      if (summary.exercises) {
        if (Array.isArray(summary.exercises)) {
          // If exercises array is provided, count completed ones
          completedCount = summary.exercises.filter((ex: any) => 
            ex.completed || (!ex.skipped && !ex.failed)
          ).length;
        } else {
          // If just a number is provided
          completedCount = 1;
        }
      } else if (summary.completedExercises) {
        completedCount = summary.completedExercises;
      }

      console.log('Workout completed, counted exercises:', completedCount);
      
      // Emit event for tracker with completed exercise count
      DeviceEventEmitter.emit('didExitWorkout', {
        type: 'workout_completed',
        completedExercises: completedCount,
        source: 'workout'
      });
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
    setDifficultyLevel(
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
    try {
      switch (category) {
        case 'Fitness':
          await startAssessmentSession(SMWorkoutLibrary.AssessmentTypes.Fitness, true, '');
          break;
        case 'Movement':
          await startAssessmentSession(SMWorkoutLibrary.AssessmentTypes.Body360, true, '');
          break;
        case 'Cardio':
          await startAssessmentSession(SMWorkoutLibrary.AssessmentTypes.Fitness, true, '');
          break;
        case 'Strength':
          const strengthExercises = [
            new SMWorkoutLibrary.SMExercise(
              "Burpees",               // name
              35,                      // totalSeconds
              "BurpeesRegular",        // videoInstruction
              null,                    // exerciseIntro
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer],
              "BurpeesRegular",        // detector
              "",                      // repBased
              null                     // exerciseClosure
            ),
            new SMWorkoutLibrary.SMExercise(
              "Froggers",             // name
              35,                     // totalSeconds
              "FroggersRegular",      // videoInstruction
              null,                   // exerciseIntro
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer],
              "FroggersRegular",      // detector
              "",                     // repBased
              null                    // exerciseClosure
            )
          ];
          break;
        case 'Custom Fitness':
          const customExercises = [
            new SMWorkoutLibrary.SMAssessmentExercise(
              'High Plank',          // name
              35,                     // totalSeconds
              'PlankHighStatic',     // videoInstruction
              null,                   // exerciseIntro
              [SMWorkoutLibrary.UIElement.Timer], // UI elements
              'PlankHighStatic',     // detector
              '',                     // successSound
              new SMWorkoutLibrary.SMScoringParams(
                SMWorkoutLibrary.ScoringType.Time,  // scoring type
                0.3,                     // threshold
                30,                      // targetTime
                null,                    // targetReps
                null,                    // targetDistance
                null                     // targetCalories
              ),
              '',                     // failedSound
              'High Plank',           // exerciseTitle
              'Hold the position',    // subtitle
              'Time',                 // scoreTitle
              'seconds'               // scoreSubtitle
            ),
            new SMWorkoutLibrary.SMAssessmentExercise(
              'Air Squat',           // name
              35,                     // totalSeconds
              'SquatRegular',        // videoInstruction
              null,                   // exerciseIntro
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion], // UI elements
              'SquatRegular',        // detector
              '',                     // successSound
              new SMWorkoutLibrary.SMScoringParams(
                SMWorkoutLibrary.ScoringType.Reps,  // scoring type
                0.3,                     // threshold
                null,                    // targetTime
                12,                      // targetReps
                null,                    // targetDistance
                null                     // targetCalories
              ),
              '',                     // failedSound
              'Air Squat',            // exerciseTitle
              'Complete the exercise', // subtitle
              'Reps',                 // scoreTitle
              'clean reps'            // scoreSubtitle
            ),
            new SMWorkoutLibrary.SMAssessmentExercise(
              'Push-ups',            // name
              35,                     // totalSeconds
              'PushupRegular',       // videoInstruction
              null,                   // exerciseIntro
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], // UI elements
              'PushupRegular',       // detector
              '',                     // successSound
              new SMWorkoutLibrary.SMScoringParams(
                SMWorkoutLibrary.ScoringType.Reps,  // scoring type
                0.3,                     // threshold
                null,                    // targetTime
                10,                      // targetReps
                null,                    // targetDistance
                null                     // targetCalories
              ),
              '',                     // failedSound
              'Push-ups',             // exerciseTitle
              'Complete the exercise', // subtitle
              'Reps',                 // scoreTitle
              'clean reps'            // scoreSubtitle
            ),
            new SMWorkoutLibrary.SMAssessmentExercise(
              'OH Squat',            // name
              35,                     // totalSeconds
              'SquatRegularOverheadStatic', // videoInstruction
              null,                   // exerciseIntro
              [SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion], // UI elements
              'SquatRegularOverheadStatic', // detector
              '',                     // successSound
              new SMWorkoutLibrary.SMScoringParams(
                SMWorkoutLibrary.ScoringType.Time,  // scoring type
                0.3,                     // threshold
                30,                      // targetTime
                null,                    // targetReps
                null,                    // targetDistance
                null                     // targetCalories
              ),
              '',                     // failedSound
              'Overhead Squat',       // exerciseTitle
              'Hold for 30 seconds',  // subtitle
              'Time',                 // scoreTitle
              'seconds held'          // scoreSubtitle
            )
          ];

          const customAssessment = new SMWorkoutLibrary.SMWorkout(
            'custom_fitness',         // id
            'Custom Fitness Assessment', // name
            null,                     // workoutIntro
            null,                     // soundtrack
            customExercises,          // exercises
            null,                     // getInFrame
            null,                     // bodycalFinished
            null                      // workoutClosure
          );

          await startCustomAssessment(
            customAssessment,
            null,  // userData
            true,  // forceShowUserDataScreen
            true   // showSummary
          );
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error starting assessment:', error);
      Alert.alert('Error', 'Failed to start assessment');
    }
  };

  const DifficultyButton = ({ title, isSelected, onPress }) => (
    <TouchableOpacity
      style={[
        styles.difficultyButton,
        isSelected && styles.selectedDifficultyButton,
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.difficultyButtonText,
        isSelected && styles.selectedDifficultyButtonText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const WorkoutButton = ({ title, onPress }) => (
    <TouchableOpacity style={styles.workoutButton} onPress={onPress}>
      <Text style={styles.workoutButtonText}>{title}</Text>
    </TouchableOpacity>
  );

  const onExerciseCompleted = (exercise: WorkoutExercise) => {
    console.log('Exercise completed:', exercise.name);
    // Emit event for single exercise completion
    DeviceEventEmitter.emit('didExitWorkout', {
      type: 'workout_completed',
      completedExercises: 1,
      source: 'workout',
      exerciseName: exercise.name
    });
  };

  const onExerciseSkipped = (exercise: WorkoutExercise) => {
    console.log('Exercise skipped:', exercise.name);
    // Emit event for skipped exercise (still counts as attempted)
    DeviceEventEmitter.emit('didExitWorkout', {
      type: 'workout_completed',
      completedExercises: 1,
      source: 'workout',
      exerciseName: exercise.name,
      skipped: true
    });
  };

  // Add exercise status tracking
  const [exerciseStatus, setExerciseStatus] = useState<{[key: string]: ExerciseStatus}>({});

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        {/* Header moved inside ScrollView */}
        <View style={styles.header}> 
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Workout</Text>
        </View>
        <View style={styles.difficultyContainer}>
          <DifficultyButton 
            title="BEGINNER" 
            isSelected={difficultyLevel === SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty}
            onPress={() => onDifficulty(0)} 
          />
          <DifficultyButton 
            title="INTERMEDIATE" 
            isSelected={difficultyLevel === SMWorkoutLibrary.WorkoutDifficulty.MidDifficulty}
            onPress={() => onDifficulty(1)} 
          />
          <DifficultyButton 
            title="ADVANCED" 
            isSelected={difficultyLevel === SMWorkoutLibrary.WorkoutDifficulty.HighDifficulty}
            onPress={() => onDifficulty(2)} 
          />
        </View>

        <View style={styles.focusCard}>
          <Text style={styles.focusTitle}>CUSTOM WORKOUT 🛠️</Text>
          <Text style={styles.workoutTitle}>Tailored to your needs</Text>
          <Text style={styles.workoutDescription}>
           One session. Five exercises. Fully tailored to yourself
          </Text>
          <TouchableOpacity 
            style={styles.customButton}
            onPress={() => {
              setSelectedExercises([]);
              setModalVisible(true);
            }}
          >
            <Text style={styles.customButtonText}>Custom</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Let's go Beginner</Text>
        <Text style={styles.sectionSubtitle}>EXPLORE DIFFERENT WORKOUT STYLES</Text>

        <View style={styles.workoutOptionsContainer}>
          {difficultyLevel === SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty && (
            <>
              <WorkoutButton 
                title="CORE ACTIVATION" 
                onPress={async () => {
                  const beginnerExercises = [
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Oblique Crunches',
                      35,
                      'StandingObliqueCrunches',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'StandingObliqueCrunches',
                      '',
              new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        10,
                        null,
                        null
                      ),
                      '',
                      'Oblique Crunches',
                      'Complete 10 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Side Plank Left',
                      35,
                      'PlankSideLowStatic',
                      null,
                      [SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'PlankSideLowStatic',
                      '',
              new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Time,
                        0.3,
                        30,
                        null,
                        null,
                        null
                      ),
                      '',
                      'Side Plank Left',
                      'Hold for 30 seconds',
                      'Time',
                      'seconds held'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Side Plank Right',
                      35,
                      'PlankSideLowStatic',
                      null,
                      [SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'PlankSideLowStatic',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Time,
                        0.3,
                        30,
                        null,
                        null,
                        null
                      ),
                      '',
                      'Side Plank Right',
                      'Hold for 30 seconds',
                      'Time',
                      'seconds held'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Tuck Hold',
                      35,
                      'TuckHold',
                      null,
                      [SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'TuckHold',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Time,
                        0.3,
                        30,
                        null,
                        null,
                        null
                      ),
                      '',
                      'Tuck Hold',
                      'Hold for 30 seconds',
                      'Time',
                      'seconds held'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'High Plank',
                      35,
                      'PlankHighStatic',
                      null,
                      [SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'PlankHighStatic',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Time,
                        0.3,
                        30,
                        null,
                        null,
                        null
                      ),
                      '',
                      'High Plank',
                      'Hold for 30 seconds',
                      'Time',
                      'seconds held'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'SHOULDER & ARM FOCUS',
                      35,
                      'ShouldersPress',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'ShouldersPress',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        10,
                        null,
                        null
                      ),
                      '',
                      'Shoulder Press',
                      'Complete 10 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Glute & Hamstring Strength',
                      35,
                      'GlutesBridge',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'GlutesBridge',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        10,
                        null,
                        null
                      ),
                      '',
                      'Glutes Bridge',
                      'Complete 10 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'HIGH INTENSITY (HIIT STYLE)',
                      35,
                      'JumpingJacks',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'JumpingJacks',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        30,
                        null,
                        null
                      ),
                      '',
                      'Jumping Jacks',
                      'Complete 30 reps',
                      'Reps',
                      'clean reps'
                    )
                  ];

                  const workout = new SMWorkoutLibrary.SMWorkout(
                    'beginner_core_activation',
                    'Core Activation',
                    null,
                    null,
                    beginnerExercises,
                    null,
                    null,
                    null
                  );

                  try {
                    await setEndExercisePreferences(SMWorkoutLibrary.EndExercisePreferences.TargetBased);
                    await setCounterPreferences(SMWorkoutLibrary.CounterPreferences.PerfectOnly);
                    await startCustomAssessment(workout, null, true, true);
                  } catch (error) {
                    console.error('Error starting workout:', error);
                    Alert.alert('Error', 'Failed to start workout. Please try again.');
                  }
                }}
              />
              <WorkoutButton 
                title="FAT BURNER" 
                onPress={async () => {
                  const beginnerExercises = [
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Jumping Jacks',
                      35,
                      'JumpingJacks',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'JumpingJacks',
                      '',
              new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        30,
                        null,
                        null
                      ),
                      '',
                      'Jumping Jacks',
                      'Complete 30 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'High Knees',
                      35,
                      'HighKnees',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'HighKnees',
                      '',
              new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        30,
                        null,
                        null
                      ),
                      '',
                      'High Knees',
                      'Complete 30 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Push-up',
                      35,
                      'PushupRegular',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'PushupRegular',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        10,
                        null,
                        null
                      ),
                      '',
                      'Push-up',
                      'Complete 10 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Lunge',
                      35,
                      'LungeFront',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'LungeFront',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        10,
                        null,
                        null
                      ),
                      '',
                      'Lunge',
                      'Complete 10 reps',
                      'Reps',
                      'clean reps'
                    )
                  ];

                  const workout = new SMWorkoutLibrary.SMWorkout(
                    'beginner_fat_burner',
                    'Fat Burner',
                    null,
                    null,
                    beginnerExercises,
                    null,
                    null,
                    null
                  );

                  try {
                    await setEndExercisePreferences(SMWorkoutLibrary.EndExercisePreferences.TargetBased);
                    await setCounterPreferences(SMWorkoutLibrary.CounterPreferences.PerfectOnly);
                    await startCustomAssessment(workout, null, true, true);
                  } catch (error) {
                    console.error('Error starting workout:', error);
                    Alert.alert('Error', 'Failed to start workout. Please try again.');
                  }
                }}
              />
              <WorkoutButton 
                title="PLANK & CORE STABILITY" 
                onPress={async () => {
                  const beginnerExercises = [
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Side Plank Left',
                      35,
                      'PlankSideLowStatic',
                      null,
                      [SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'PlankSideLowStatic',
                      '',
              new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Time,
                        0.3,
                        30,
                        null,
                        null,
                        null
                      ),
                      '',
                      'Side Plank Left',
                      'Hold for 30 seconds',
                      'Time',
                      'seconds held'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Side Plank Right',
                      35,
                      'PlankSideLowStatic',
                      null,
                      [SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'PlankSideLowStatic',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Time,
                        0.3,
                        30,
                        null,
                        null,
                        null
                      ),
                      '',
                      'Side Plank Right',
                      'Hold for 30 seconds',
                      'Time',
                      'seconds held'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'High Plank',
                      35,
                      'PlankHighStatic',
                      null,
                      [SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'PlankHighStatic',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Time,
                        0.3,
                        30,
                        null,
                        null,
                        null
                      ),
                      '',
                      'High Plank',
                      'Hold for 30 seconds',
                      'Time',
                      'seconds held'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Tuck Hold',
                      35,
                      'TuckHold',
                      null,
                      [SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'TuckHold',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Time,
                        0.3,
                        30,
                        null,
                        null,
                        null
                      ),
                      '',
                      'Tuck Hold',
                      'Hold for 30 seconds',
                      'Time',
                      'seconds held'
                    )
                  ];

                  const workout = new SMWorkoutLibrary.SMWorkout(
                    'beginner_plank_core_stability',
                    'Plank & Core Stability',
                    null,
                    null,
                    beginnerExercises,
                    null,
                    null,
                    null
                  );

                  try {
                    await setEndExercisePreferences(SMWorkoutLibrary.EndExercisePreferences.TargetBased);
                    await setCounterPreferences(SMWorkoutLibrary.CounterPreferences.PerfectOnly);
                    await startCustomAssessment(workout, null, true, true);
                  } catch (error) {
                    console.error('Error starting workout:', error);
                    Alert.alert('Error', 'Failed to start workout. Please try again.');
                  }
                }}
              />
              <WorkoutButton 
                title="CORE & ABS" 
                onPress={() => {
                  const coreExercises = [
                    // ... existing core exercises ...
                  ];
                  const workout = new SMWorkoutLibrary.SMWorkout(
                    'core_abs_workout',
                    'Core & Abs Workout',
                    null,
                    null,
                    coreExercises,
                    null,
                    null,
                    null,
                  );
                  startCustomAssessment(workout, null, true, true);
                }}
              />
              <WorkoutButton 
                title="PUSH-UPS CHALLENGE" 
                onPress={async () => {
                  setSelectedExercises(['Push-ups']);
                  const pushupExercise = new SMWorkoutLibrary.SMAssessmentExercise(
                    'Push-ups',
                    35,
                    'PushupRegular',
                    null,
                    [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer],
                    'PushupRegular',
                    '',
                    new SMWorkoutLibrary.SMScoringParams(
                      SMWorkoutLibrary.ScoringType.Reps,
                      0.3,
                      null,
                      15,
                      null,
                      null
                    ),
                    '',
                    'Push-ups Challenge',
                    'Complete maximum reps with perfect form',
                    'Reps',
                    'clean reps'
                  );
                  const workout = new SMWorkoutLibrary.SMWorkout(
                    'pushups_challenge',
                    'Push-ups Challenge',
                    null,
                    null,
                    [pushupExercise],
                    null,
                    null,
                    null,
                  );
                  const result = await startCustomAssessment(workout, null, true, true);
                  if (result.didFinish) {
                    DeviceEventEmitter.emit('didExitWorkout', { 
        type: 'workout_completed',
                      exercises: [pushupExercise]
                    });
                  }
                }}
              />
              <WorkoutButton 
                title="UPPER BODY" 
                onPress={async () => {
                  const upperBodyExercises = [
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'ShoulderPress',
                      35,
                      'ShouldersPress',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'ShouldersPress',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        20,
                        null,
                        null
                      ),
                      '',
                      'Shoulder Press',
                      'Complete 20 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'PushupRegular',
                      35,
                      'PushupRegular',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'PushupRegular',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        20,
                        null,
                        null
                      ),
                      '',
                      'Push-up',
                      'Complete 20 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'ObliqueCrunches',
                      35,
                      'StandingObliqueCrunches',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'StandingObliqueCrunches',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        20,
                        null,
                        null
                      ),
                      '',
                      'Oblique Crunches',
                      'Complete 20 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'PlankHighStatic',
                      60,
                      'PlankHighStatic',
                      null,
                      [SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'PlankHighStatic',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Time,
                        0.3,
                        60,
                        null,
                        null,
                        null
                      ),
                      '',
                      'High Plank',
                      'Hold for 60 seconds',
                      'Time',
                      'seconds held'
                    )
                  ];

                  const workout = new SMWorkoutLibrary.SMWorkout(
                    'upper_body',
                    'Upper Body',
                    null,
                    null,
                    upperBodyExercises,
                    null,
                    null,
                    null,
                  );
                  const result = await startCustomAssessment(workout, null, true, true);
                  if (result.didFinish) {
                    DeviceEventEmitter.emit('didExitWorkout', { 
                      type: 'workout_completed',
                      exercises: upperBodyExercises
                    });
                  }
                }}
              />
              <WorkoutButton 
                title="FULL BODY BURN" 
                onPress={async () => {
                  const fullBodyExercises = [
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'JumpingJacks',
                      35,
                      'JumpingJacks',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer],
                      'JumpingJacks',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        60,
                        null,
                        null
                      ),
                      '',
                      'Jumping Jacks',
                      'Complete exercise for 60s',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'PushupRegular',
                      35,
                      'PushupRegular',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer],
                      'PushupRegular',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        20,
                        null,
                        null
                      ),
                      '',
                      'Push-up',
                      'Complete 20 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'SquatRegular',
                      35,
                      'SquatRegular',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer],
                      'SquatRegular',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        20,
                        null,
                        null
                      ),
                      '',
                      'Air Squat',
                      'Complete 20 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'HighKnees',
                      35,
                      'HighKnees',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer],
                      'HighKnees',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        60,
                        null,
                        null
                      ),
                      '',
                      'High Knees',
                      'Complete exercise for 60s',
                      'Reps',
                      'clean reps'
                    )
                  ];

                  const workout = new SMWorkoutLibrary.SMWorkout(
                    'full_body_burn',
                    'Full Body Burn',
                    null,
                    null,
                    fullBodyExercises,
                    null,
                    null,
                    null,
                  );
                  const result = await startCustomAssessment(workout, null, true, true);
                  if (result.didFinish) {
                    DeviceEventEmitter.emit('didExitWorkout', { 
                      type: 'workout_completed',
                      exercises: fullBodyExercises
                    });
                  }
                }}
              />
              <WorkoutButton 
                title="MOBILITY & STRETCH" 
                onPress={() => {
                  const mobilityExercises = [
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'SideBendLeft',
                      35,
                      'StandingSideBendLeft',
                      null,
                      [SMWorkoutLibrary.UIElement.Timer],
                      'StandingSideBendLeft',
                      '',
              new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Time,
                        0.3,
                        60,
                        null,
                        null,
                        null
                      ),
                      '',
                      'Side Bend (Left)',
                      'Hold for 60 seconds',
                      'Time',
                      'seconds'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'SideBendRight',
                      35,
                      'StandingSideBendRight',
                      null,
                      [SMWorkoutLibrary.UIElement.Timer],
                      'StandingSideBendRight',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Time,
                        0.3,
                        60,
                        null,
                        null,
                        null
                      ),
                      '',
                      'Side Bend (Right)',
                      'Hold for 60 seconds',
                      'Time',
                      'seconds'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'StandingHamstringMobility',
                      35,
                      'StandingHamstringMobility',
                      null,
                      [SMWorkoutLibrary.UIElement.Timer],
                      'StandingHamstringMobility',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Time,
                        0.3,
                        60,
                        null,
                        null,
                        null
                      ),
                      '',
                      'Standing Hamstring Mobility',
                      'Hold for 60 seconds',
                      'Time',
                      'seconds'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'HamstringMobility',
                      35,
                      'HamstringMobility',
                      null,
                      [SMWorkoutLibrary.UIElement.Timer],
                      'HamstringMobility',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Time,
                        0.3,
                        60,
                        null,
                        null,
                        null
                      ),
                      '',
                      'Hamstring Mobility',
                      'Hold for 60 seconds',
                      'Time',
                      'seconds'
                    )
                  ];

                  const workout = new SMWorkoutLibrary.SMWorkout(
                    'advanced_mobility_stretch',
                    'Advanced Mobility & Stretch',
                    null,
                    null,
                    mobilityExercises,
                    null,
                    null,
                    null
                  );
                  startCustomAssessment(workout, null, true, true);
                }}
              />
              <WorkoutButton 
                title="SHOULDER & ARM FOCUS" 
                onPress={async () => {
                  const beginnerExercises = [
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Shoulder Press',
                      35,
                      'ShouldersPress',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'ShouldersPress',
                      '',
              new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        10,
                        null,
                        null
                      ),
                      '',
                      'Shoulder Press',
                      'Complete 10 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Shoulder Taps Plank',
                      35,
                      'PlankHighShoulderTaps',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'PlankHighShoulderTaps',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        10,
                        null,
                        null
                      ),
                      '',
                      'Shoulder Taps Plank',
                      'Complete 10 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Push-up',
                      35,
                      'PushupRegular',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'PushupRegular',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        10,
                        null,
                        null
                      ),
                      '',
                      'Push-up',
                      'Complete 10 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Side Plank',
                      35,
                      'PlankSideLowStatic',
                      null,
                      [SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'PlankSideLowStatic',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Time,
                        0.3,
                        30,
                        null,
                        null,
                        null
                      ),
                      '',
                      'Side Plank',
                      'Hold for 30 seconds',
                      'Time',
                      'seconds held'
                    )
                  ];

                  const workout = new SMWorkoutLibrary.SMWorkout(
                    'beginner_shoulder_arm_focus',
                    'Shoulder & Arm Focus',
                    null,
                    null,
                    beginnerExercises,
                    null,
                    null,
                    null
                  );

                  try {
                    await setEndExercisePreferences(SMWorkoutLibrary.EndExercisePreferences.TargetBased);
                    await setCounterPreferences(SMWorkoutLibrary.CounterPreferences.PerfectOnly);
                    await startCustomAssessment(workout, null, true, true);
                  } catch (error) {
                    console.error('Error starting workout:', error);
                    Alert.alert('Error', 'Failed to start workout. Please try again.');
                  }
                }}
              />
              <WorkoutButton 
                title="HIGH INTENSITY (HIIT STYLE)" 
                onPress={async () => {
                  const intermediateExercises = [
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Jumping Jacks',
                      35,
                      'JumpingJacks',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'JumpingJacks',
                      '',
              new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        45,
                        null,
                        null
                      ),
                      '',
                      'Jumping Jacks',
                      'Complete 45 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'High Knees',
                      35,
                      'HighKnees',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'HighKnees',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        45,
                        null,
                        null
                      ),
                      '',
                      'High Knees',
                      'Complete 45 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Push-up',
                      35,
                      'PushupRegular',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'PushupRegular',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        15,
                        null,
                        null
                      ),
                      '',
                      'Push-up',
                      'Complete 15 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Air Squat',
                      35,
                      'SquatRegular',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'SquatRegular',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        15,
                        null,
                        null
                      ),
                      '',
                      'Air Squat',
                      'Complete 15 reps',
                      'Reps',
                      'clean reps'
                    )
                  ];

                  const workout = new SMWorkoutLibrary.SMWorkout(
                    'intermediate_hiit_style',
                    'High Intensity (HIIT Style)',
                    null,
                    null,
                    intermediateExercises,
                    null,
                    null,
                    null
                  );

                  try {
                    await setEndExercisePreferences(SMWorkoutLibrary.EndExercisePreferences.TargetBased);
                    await setCounterPreferences(SMWorkoutLibrary.CounterPreferences.PerfectOnly);
                    await startCustomAssessment(workout, null, true, true);
                  } catch (error) {
                    console.error('Error starting workout:', error);
                    Alert.alert('Error', 'Failed to start workout. Please try again.');
                  }
                }}
              />
            </>
          )}
          {difficultyLevel === SMWorkoutLibrary.WorkoutDifficulty.MidDifficulty && (
            <>
              <WorkoutButton 
                title="CORE ACTIVATION" 
                onPress={async () => {
                  const intermediateExercises = [
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Oblique Crunches',
                      35,
                      'StandingObliqueCrunches',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'StandingObliqueCrunches',
                      '',
              new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        15,
                        null,
                        null
                      ),
                      '',
                      'Oblique Crunches',
                      'Complete 15 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Side Plank Left',
                      35,
                      'PlankSideLowStatic',
                      null,
                      [SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'PlankSideLowStatic',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Time,
                        0.3,
                        45,
                        null,
                        null,
                        null
                      ),
                      '',
                      'Side Plank Left',
                      'Hold for 45 seconds',
                      'Time',
                      'seconds held'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Side Plank Right',
                      35,
                      'PlankSideLowStatic',
                      null,
                      [SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'PlankSideLowStatic',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Time,
                        0.3,
                        45,
                        null,
                        null,
                        null
                      ),
                      '',
                      'Side Plank Right',
                      'Hold for 45 seconds',
                      'Time',
                      'seconds held'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Tuck Hold',
                      35,
                      'TuckHold',
                      null,
                      [SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'TuckHold',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Time,
                        0.3,
                        45,
                        null,
                        null,
                        null
                      ),
                      '',
                      'Tuck Hold',
                      'Hold for 45 seconds',
                      'Time',
                      'seconds held'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'High Plank',
                      35,
                      'PlankHighStatic',
                      null,
                      [SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'PlankHighStatic',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Time,
                        0.3,
                        45,
                        null,
                        null,
                        null
                      ),
                      '',
                      'High Plank',
                      'Hold for 45 seconds',
                      'Time',
                      'seconds held'
                    )
                  ];

                  const workout = new SMWorkoutLibrary.SMWorkout(
                    'intermediate_core_activation',
                    'Core Activation',
                    null,
                    null,
                    intermediateExercises,
                    null,
                    null,
                    null
                  );

                  try {
                    await setEndExercisePreferences(SMWorkoutLibrary.EndExercisePreferences.TargetBased);
                    await setCounterPreferences(SMWorkoutLibrary.CounterPreferences.PerfectOnly);
                    await startCustomAssessment(workout, null, true, true);
                  } catch (error) {
                    console.error('Error starting workout:', error);
                    Alert.alert('Error', 'Failed to start workout. Please try again.');
                  }
                }}
              />
              <WorkoutButton 
                title="FAT BURNER" 
                onPress={async () => {
                  const intermediateExercises = [
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Jumping Jacks',
                      35,
                      'JumpingJacks',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'JumpingJacks',
                      '',
              new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        30,
                        null,
                        null
                      ),
                      '',
                      'Jumping Jacks',
                      'Complete 30 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'High Knees',
                      35,
                      'HighKnees',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'HighKnees',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        30,
                        null,
                        null
                      ),
                      '',
                      'High Knees',
                      'Complete 30 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Push-up',
                      35,
                      'PushupRegular',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'PushupRegular',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        10,
                        null,
                        null
                      ),
                      '',
                      'Push-up',
                      'Complete 10 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Lunge',
                      35,
                      'LungeFront',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'LungeFront',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        10,
                        null,
                        null
                      ),
                      '',
                      'Lunge',
                      'Complete 10 reps',
                      'Reps',
                      'clean reps'
                    )
                  ];

                  const workout = new SMWorkoutLibrary.SMWorkout(
                    'intermediate_fat_burner',
                    'Fat Burner',
                    null,
                    null,
                    intermediateExercises,
                    null,
                    null,
                    null
                  );

                  try {
                    await setEndExercisePreferences(SMWorkoutLibrary.EndExercisePreferences.TargetBased);
                    await setCounterPreferences(SMWorkoutLibrary.CounterPreferences.PerfectOnly);
                    await startCustomAssessment(workout, null, true, true);
                  } catch (error) {
                    console.error('Error starting workout:', error);
                    Alert.alert('Error', 'Failed to start workout. Please try again.');
                  }
                }}
              />
              <WorkoutButton 
                title="PLANK & CORE STABILITY" 
                onPress={async () => {
                  const intermediateExercises = [
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Side Plank Left',
                      35,
                      'PlankSideLowStatic',
                      null,
                      [SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'PlankSideLowStatic',
                      '',
              new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Time,
                        0.3,
                        30,
                        null,
                        null,
                        null
                      ),
                      '',
                      'Side Plank Left',
                      'Hold for 30 seconds',
                      'Time',
                      'seconds held'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Side Plank Right',
                      35,
                      'PlankSideLowStatic',
                      null,
                      [SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'PlankSideLowStatic',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Time,
                        0.3,
                        30,
                        null,
                        null,
                        null
                      ),
                      '',
                      'Side Plank Right',
                      'Hold for 30 seconds',
                      'Time',
                      'seconds held'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'High Plank',
                      35,
                      'PlankHighStatic',
                      null,
                      [SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'PlankHighStatic',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Time,
                        0.3,
                        30,
                        null,
                        null,
                        null
                      ),
                      '',
                      'High Plank',
                      'Hold for 30 seconds',
                      'Time',
                      'seconds held'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Tuck Hold',
                      35,
                      'TuckHold',
                      null,
                      [SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'TuckHold',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Time,
                        0.3,
                        30,
                        null,
                        null,
                        null
                      ),
                      '',
                      'Tuck Hold',
                      'Hold for 30 seconds',
                      'Time',
                      'seconds held'
                    )
                  ];

                  const workout = new SMWorkoutLibrary.SMWorkout(
                    'intermediate_plank_core_stability',
                    'Plank & Core Stability',
                    null,
                    null,
                    intermediateExercises,
                    null,
                    null,
                    null
                  );

                  try {
                    await setEndExercisePreferences(SMWorkoutLibrary.EndExercisePreferences.TargetBased);
                    await setCounterPreferences(SMWorkoutLibrary.CounterPreferences.PerfectOnly);
                    await startCustomAssessment(workout, null, true, true);
                  } catch (error) {
                    console.error('Error starting workout:', error);
                    Alert.alert('Error', 'Failed to start workout. Please try again.');
                  }
                }}
              />
              <WorkoutButton 
                title="CORE & ABS" 
                onPress={() => {
                  const coreExercises = [
                    // ... existing core exercises ...
                  ];
                  const workout = new SMWorkoutLibrary.SMWorkout(
                    'core_abs_workout',
                    'Core & Abs Workout',
                    null,
                    null,
                    coreExercises,
                    null,
                    null,
                    null,
                  );
                  startCustomAssessment(workout, null, true, true);
                }}
              />
              <WorkoutButton 
                title="PUSH-UPS CHALLENGE" 
                onPress={() => {
                  // Push-ups workout code remains the same
                  setSelectedExercises(['Push-ups']);
                  const pushupExercise = new SMWorkoutLibrary.SMAssessmentExercise(
                    'Push-ups',
                    35,
                    'PushupRegular',
                    null,
                    [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer],
                    'PushupRegular',
                    '',
              new SMWorkoutLibrary.SMScoringParams(
                      SMWorkoutLibrary.ScoringType.Reps,
                      0.3,
                      null,
                      15,
                      null,
                      null
                    ),
                    '',
                    'Push-ups Challenge',
                    'Complete maximum reps with perfect form',
                    'Reps',
                    'clean reps'
                  );
                  const workout = new SMWorkoutLibrary.SMWorkout(
                    'pushups_challenge',
                    'Push-ups Challenge',
                    null,
                    null,
                    [pushupExercise],
                    null,
                    null,
                    null,
                  );
                  startCustomAssessment(workout, null, true, true);
                }}
              />
              <WorkoutButton 
                title="UPPER BODY" 
                onPress={async () => {
                  const upperBodyExercises = [
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'ShoulderPress',
                      35,
                      'ShouldersPress',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'ShouldersPress',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        20,
                        null,
                        null
                      ),
                      '',
                      'Shoulder Press',
                      'Complete 20 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'PushupRegular',
                      35,
                      'PushupRegular',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'PushupRegular',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        20,
                        null,
                        null
                      ),
                      '',
                      'Push-up',
                      'Complete 20 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'ObliqueCrunches',
                      35,
                      'StandingObliqueCrunches',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'StandingObliqueCrunches',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        20,
                        null,
                        null
                      ),
                      '',
                      'Oblique Crunches',
                      'Complete 20 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'PlankHighStatic',
                      60,
                      'PlankHighStatic',
                      null,
                      [SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'PlankHighStatic',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Time,
                        0.3,
                        60,
                        null,
                        null,
                        null
                      ),
                      '',
                      'High Plank',
                      'Hold for 60 seconds',
                      'Time',
                      'seconds held'
                    )
                  ];

                  const workout = new SMWorkoutLibrary.SMWorkout(
                    'upper_body',
                    'Upper Body',
                    null,
                    null,
                    upperBodyExercises,
                    null,
                    null,
                    null,
                  );
                  const result = await startCustomAssessment(workout, null, true, true);
                  if (result.didFinish) {
                    DeviceEventEmitter.emit('didExitWorkout', { 
                      type: 'workout_completed',
                      exercises: upperBodyExercises
                    });
                  }
                }}
              />
              <WorkoutButton 
                title="FULL BODY BURN" 
                onPress={async () => {
                  const fullBodyExercises = [
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'JumpingJacks',
                      35,
                      'JumpingJacks',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer],
                      'JumpingJacks',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        60,
                        null,
                        null
                      ),
                      '',
                      'Jumping Jacks',
                      'Complete exercise for 60s',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'PushupRegular',
                      35,
                      'PushupRegular',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer],
                      'PushupRegular',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        20,
                        null,
                        null
                      ),
                      '',
                      'Push-up',
                      'Complete 20 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'SquatRegular',
                      35,
                      'SquatRegular',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer],
                      'SquatRegular',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        20,
                        null,
                        null
                      ),
                      '',
                      'Air Squat',
                      'Complete 20 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'HighKnees',
                      35,
                      'HighKnees',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer],
                      'HighKnees',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        60,
                        null,
                        null
                      ),
                      '',
                      'High Knees',
                      'Complete exercise for 60s',
                      'Reps',
                      'clean reps'
                    )
                  ];

                  const workout = new SMWorkoutLibrary.SMWorkout(
                    'full_body_burn',
                    'Full Body Burn',
                    null,
                    null,
                    fullBodyExercises,
                    null,
                    null,
                    null,
                  );
                  const result = await startCustomAssessment(workout, null, true, true);
                  if (result.didFinish) {
                    DeviceEventEmitter.emit('didExitWorkout', { 
                      type: 'workout_completed',
                      exercises: fullBodyExercises
                    });
                  }
                }}
              />
              <WorkoutButton 
                title="MOBILITY & STRETCH" 
                onPress={() => {
                  const mobilityExercises = [
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'SideBendLeft',
                      35,
                      'StandingSideBendLeft',
                      null,
                      [SMWorkoutLibrary.UIElement.Timer],
                      'StandingSideBendLeft',
                      '',
              new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Time,
                        0.3,
                        60,
                        null,
                        null,
                        null
                      ),
                      '',
                      'Side Bend (Left)',
                      'Hold for 60 seconds',
                      'Time',
                      'seconds'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'SideBendRight',
                      35,
                      'StandingSideBendRight',
                      null,
                      [SMWorkoutLibrary.UIElement.Timer],
                      'StandingSideBendRight',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Time,
                        0.3,
                        60,
                        null,
                        null,
                        null
                      ),
                      '',
                      'Side Bend (Right)',
                      'Hold for 60 seconds',
                      'Time',
                      'seconds'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'StandingHamstringMobility',
                      35,
                      'StandingHamstringMobility',
                      null,
                      [SMWorkoutLibrary.UIElement.Timer],
                      'StandingHamstringMobility',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Time,
                        0.3,
                        60,
                        null,
                        null,
                        null
                      ),
                      '',
                      'Standing Hamstring Mobility',
                      'Hold for 60 seconds',
                      'Time',
                      'seconds'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'HamstringMobility',
                      35,
                      'HamstringMobility',
                      null,
                      [SMWorkoutLibrary.UIElement.Timer],
                      'HamstringMobility',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Time,
                        0.3,
                        60,
                        null,
                        null,
                        null
                      ),
                      '',
                      'Hamstring Mobility',
                      'Hold for 60 seconds',
                      'Time',
                      'seconds'
                    )
                  ];

                  const workout = new SMWorkoutLibrary.SMWorkout(
                    'advanced_mobility_stretch',
                    'Advanced Mobility & Stretch',
                    null,
                    null,
                    mobilityExercises,
                    null,
                    null,
                    null
                  );
                  startCustomAssessment(workout, null, true, true);
                }}
              />
              <WorkoutButton 
                title="SHOULDER & ARM FOCUS" 
                onPress={async () => {
                  const intermediateExercises = [
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Shoulder Press',
                      35,
                      'ShouldersPress',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'ShouldersPress',
                      '',
              new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        15,
                        null,
                        null
                      ),
                      '',
                      'Shoulder Press',
                      'Complete 15 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Push-up',
                      35,
                      'PushupRegular',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'PushupRegular',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        15,
                        null,
                        null
                      ),
                      '',
                      'Push-up',
                      'Complete 15 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Side Plank',
                      35,
                      'PlankSideLowStatic',
                      null,
                      [SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'PlankSideLowStatic',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Time,
                        0.3,
                        45,
                        null,
                        null,
                        null
                      ),
                      '',
                      'Side Plank',
                      'Hold for 45 seconds',
                      'Time',
                      'seconds held'
                    )
                  ];

                  const workout = new SMWorkoutLibrary.SMWorkout(
                    'intermediate_shoulder_arm_focus',
                    'Shoulder & Arm Focus',
                    null,
                    null,
                    intermediateExercises,
                    null,
                    null,
                    null
                  );

                  try {
                    await setEndExercisePreferences(SMWorkoutLibrary.EndExercisePreferences.TargetBased);
                    await setCounterPreferences(SMWorkoutLibrary.CounterPreferences.PerfectOnly);
                    await startCustomAssessment(workout, null, true, true);
                  } catch (error) {
                    console.error('Error starting workout:', error);
                    Alert.alert('Error', 'Failed to start workout. Please try again.');
                  }
                }}
              />
              <WorkoutButton 
                title="HIGH INTENSITY (HIIT STYLE)" 
                onPress={async () => {
                  const intermediateExercises = [
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Jumping Jacks',
                      35,
                      'JumpingJacks',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'JumpingJacks',
                      '',
              new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        45,
                        null,
                        null
                      ),
                      '',
                      'Jumping Jacks',
                      'Complete 45 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'High Knees',
                      35,
                      'HighKnees',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'HighKnees',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        45,
                        null,
                        null
                      ),
                      '',
                      'High Knees',
                      'Complete 45 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Push-up',
                      35,
                      'PushupRegular',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'PushupRegular',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        15,
                        null,
                        null
                      ),
                      '',
                      'Push-up',
                      'Complete 15 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Air Squat',
                      35,
                      'SquatRegular',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'SquatRegular',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        15,
                        null,
                        null
                      ),
                      '',
                      'Air Squat',
                      'Complete 15 reps',
                      'Reps',
                      'clean reps'
                    )
                  ];

                  const workout = new SMWorkoutLibrary.SMWorkout(
                    'intermediate_hiit_style',
                    'High Intensity (HIIT Style)',
                    null,
                    null,
                    intermediateExercises,
                    null,
                    null,
                    null
                  );

                  try {
                    await setEndExercisePreferences(SMWorkoutLibrary.EndExercisePreferences.TargetBased);
                    await setCounterPreferences(SMWorkoutLibrary.CounterPreferences.PerfectOnly);
                    await startCustomAssessment(workout, null, true, true);
                  } catch (error) {
                    console.error('Error starting workout:', error);
                    Alert.alert('Error', 'Failed to start workout. Please try again.');
                  }
                }}
              />
            </>
          )}
          {difficultyLevel === SMWorkoutLibrary.WorkoutDifficulty.HighDifficulty && (
            <>
              <WorkoutButton 
                title="CORE ACTIVATION" 
                onPress={async () => {
                  const advancedExercises = [
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Oblique Crunches',
                      35,
                      'StandingObliqueCrunches',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'StandingObliqueCrunches',
                      '',
              new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        20,
                        null,
                        null
                      ),
                      '',
                      'Oblique Crunches',
                      'Complete 20 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Side Plank Left',
                      35,
                      'PlankSideLowStatic',
                      null,
                      [SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'PlankSideLowStatic',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Time,
                        0.3,
                        60,
                        null,
                        null,
                        null
                      ),
                      '',
                      'Side Plank Left',
                      'Hold for 60 seconds',
                      'Time',
                      'seconds held'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Side Plank Right',
                      35,
                      'PlankSideLowStatic',
                      null,
                      [SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'PlankSideLowStatic',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Time,
                        0.3,
                        60,
                        null,
                        null,
                        null
                      ),
                      '',
                      'Side Plank Right',
                      'Hold for 60 seconds',
                      'Time',
                      'seconds held'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Tuck Hold',
                      35,
                      'TuckHold',
                      null,
                      [SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'TuckHold',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Time,
                        0.3,
                        60,
                        null,
                        null,
                        null
                      ),
                      '',
                      'Tuck Hold',
                      'Hold for 60 seconds',
                      'Time',
                      'seconds held'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'High Plank',
                      35,
                      'PlankHighStatic',
                      null,
                      [SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'PlankHighStatic',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Time,
                        0.3,
                        60,
                        null,
                        null,
                        null
                      ),
                      '',
                      'High Plank',
                      'Hold for 60 seconds',
                      'Time',
                      'seconds held'
                    )
                  ];

                  const workout = new SMWorkoutLibrary.SMWorkout(
                    'advanced_core_activation',
                    'Core Activation',
                    null,
                    null,
                    advancedExercises,
                    null,
                    null,
                    null
                  );

                  try {
                    await setEndExercisePreferences(SMWorkoutLibrary.EndExercisePreferences.TargetBased);
                    await setCounterPreferences(SMWorkoutLibrary.CounterPreferences.PerfectOnly);
                    await startCustomAssessment(workout, null, true, true);
                  } catch (error) {
                    console.error('Error starting workout:', error);
                    Alert.alert('Error', 'Failed to start workout. Please try again.');
                  }
                }}
              />
              <WorkoutButton 
                title="FAT BURNER" 
                onPress={async () => {
                  const advancedExercises = [
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Jumping Jacks',
                      35,
                      'JumpingJacks',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'JumpingJacks',
                      '',
              new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        60,
                        null,
                        null
                      ),
                      '',
                      'Jumping Jacks',
                      'Complete 60 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'High Knees',
                      35,
                      'HighKnees',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'HighKnees',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        60,
                        null,
                        null
                      ),
                      '',
                      'High Knees',
                      'Complete 60 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Push-up',
                      35,
                      'PushupRegular',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'PushupRegular',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        20,
                        null,
                        null
                      ),
                      '',
                      'Push-up',
                      'Complete 20 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Lunge',
                      35,
                      'LungeStatic',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'LungeStatic',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        20,
                        null,
                        null
                      ),
                      '',
                      'Lunge',
                      'Complete 20 reps',
                      'Reps',
                      'clean reps'
                    )
                  ];

                  const workout = new SMWorkoutLibrary.SMWorkout(
                    'advanced_fat_burner',
                    'Fat Burner',
                    null,
                    null,
                    advancedExercises,
                    null,
                    null,
                    null
                  );

                  try {
                    await setEndExercisePreferences(SMWorkoutLibrary.EndExercisePreferences.TargetBased);
                    await setCounterPreferences(SMWorkoutLibrary.CounterPreferences.PerfectOnly);
                    await startCustomAssessment(workout, null, true, true);
                  } catch (error) {
                    console.error('Error starting workout:', error);
                    Alert.alert('Error', 'Failed to start workout. Please try again.');
                  }
                }}
              />
              <WorkoutButton 
                title="PLANK & CORE STABILITY" 
                onPress={async () => {
                  const advancedExercises = [
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Side Plank Left',
                      35,
                      'PlankSideLowStatic',
                      null,
                      [SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'PlankSideLowStatic',
                      '',
              new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Time,
                        0.3,
                        60,
                        null,
                        null,
                        null
                      ),
                      '',
                      'Side Plank Left',
                      'Hold for 60 seconds',
                      'Time',
                      'seconds held'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Side Plank Right',
                      35,
                      'PlankSideLowStatic',
                      null,
                      [SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'PlankSideLowStatic',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Time,
                        0.3,
                        60,
                        null,
                        null,
                        null
                      ),
                      '',
                      'Side Plank Right',
                      'Hold for 60 seconds',
                      'Time',
                      'seconds held'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'High Plank',
                      35,
                      'PlankHighStatic',
                      null,
                      [SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'PlankHighStatic',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Time,
                        0.3,
                        60,
                        null,
                        null,
                        null
                      ),
                      '',
                      'High Plank',
                      'Hold for 60 seconds',
                      'Time',
                      'seconds held'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Tuck Hold',
                      35,
                      'TuckHold',
                      null,
                      [SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'TuckHold',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Time,
                        0.3,
                        60,
                        null,
                        null,
                        null
                      ),
                      '',
                      'Tuck Hold',
                      'Hold for 60 seconds',
                      'Time',
                      'seconds held'
                    )
                  ];

                  const workout = new SMWorkoutLibrary.SMWorkout(
                    'advanced_plank_core_stability',
                    'Plank & Core Stability',
                    null,
                    null,
                    advancedExercises,
                    null,
                    null,
                    null
                  );

                  try {
                    await setEndExercisePreferences(SMWorkoutLibrary.EndExercisePreferences.TargetBased);
                    await setCounterPreferences(SMWorkoutLibrary.CounterPreferences.PerfectOnly);
                    await startCustomAssessment(workout, null, true, true);
                  } catch (error) {
                    console.error('Error starting workout:', error);
                    Alert.alert('Error', 'Failed to start workout. Please try again.');
                  }
                }}
              />
              <WorkoutButton 
                title="CORE & ABS" 
                onPress={() => {
                  const coreExercises = [
                    // ... existing core exercises ...
                  ];
                  const workout = new SMWorkoutLibrary.SMWorkout(
                    'core_abs_workout',
                    'Core & Abs Workout',
                    null,
                    null,
                    coreExercises,
                    null,
                    null,
                    null,
                  );
                  startCustomAssessment(workout, null, true, true);
                }}
              />
              <WorkoutButton 
                title="PUSH-UPS CHALLENGE" 
                onPress={() => {
                  // Push-ups workout code remains the same
                  setSelectedExercises(['Push-ups']);
                  const pushupExercise = new SMWorkoutLibrary.SMAssessmentExercise(
                    'Push-ups',
                    35,
                    'PushupRegular',
                    null,
                    [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer],
                    'PushupRegular',
                    '',
          new SMWorkoutLibrary.SMScoringParams(
                      SMWorkoutLibrary.ScoringType.Reps,
                      0.3,
                      null,
                      15,
                      null,
                      null
                    ),
                    '',
                    'Push-ups Challenge',
                    'Complete maximum reps with perfect form',
                    'Reps',
                    'clean reps'
                  );
                  const workout = new SMWorkoutLibrary.SMWorkout(
                    'pushups_challenge',
                    'Push-ups Challenge',
                    null,
                    null,
                    [pushupExercise],
                    null,
                    null,
                    null,
                  );
                  startCustomAssessment(workout, null, true, true);
                }}
              />
              <WorkoutButton 
                title="UPPER BODY" 
                onPress={async () => {
                  const upperBodyExercises = [
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'ShoulderPress',
                      35,
                      'ShouldersPress',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'ShouldersPress',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        20,
                        null,
                        null
                      ),
                      '',
                      'Shoulder Press',
                      'Complete 20 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'PushupRegular',
                      35,
                      'PushupRegular',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'PushupRegular',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        20,
                        null,
                        null
                      ),
                      '',
                      'Push-up',
                      'Complete 20 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'ObliqueCrunches',
                      35,
                      'StandingObliqueCrunches',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'StandingObliqueCrunches',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        20,
                        null,
                        null
                      ),
                      '',
                      'Oblique Crunches',
                      'Complete 20 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'PlankHighStatic',
                      60,
                      'PlankHighStatic',
                      null,
                      [SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'PlankHighStatic',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Time,
                        0.3,
                        60,
                        null,
                        null,
                        null
                      ),
                      '',
                      'High Plank',
                      'Hold for 60 seconds',
                      'Time',
                      'seconds held'
                    )
                  ];

                  const workout = new SMWorkoutLibrary.SMWorkout(
                    'upper_body',
                    'Upper Body',
                    null,
                    null,
                    upperBodyExercises,
                    null,
                    null,
                    null,
                  );
                  const result = await startCustomAssessment(workout, null, true, true);
                  if (result.didFinish) {
                    DeviceEventEmitter.emit('didExitWorkout', { 
                      type: 'workout_completed',
                      exercises: upperBodyExercises
                    });
                  }
                }}
              />
              <WorkoutButton 
                title="FULL BODY BURN" 
                onPress={async () => {
                  const fullBodyExercises = [
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'JumpingJacks',
                      35,
                      'JumpingJacks',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer],
                      'JumpingJacks',
                      '',
          new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        60,
                        null,
                        null
                      ),
                      '',
                      'Jumping Jacks',
                      'Complete exercise for 60s',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'PushupRegular',
                      35,
                      'PushupRegular',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer],
                      'PushupRegular',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        20,
                        null,
                        null
                      ),
                      '',
                      'Push-up',
                      'Complete 20 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'SquatRegular',
                      35,
                      'SquatRegular',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer],
                      'SquatRegular',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        20,
                        null,
                        null
                      ),
                      '',
                      'Air Squat',
                      'Complete 20 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'HighKnees',
                      35,
                      'HighKnees',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer],
                      'HighKnees',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        60,
                        null,
                        null
                      ),
                      '',
                      'High Knees',
                      'Complete exercise for 60s',
                      'Reps',
                      'clean reps'
                    )
                  ];

                  const workout = new SMWorkoutLibrary.SMWorkout(
                    'advanced_full_body_burn',
                    'Advanced Full Body Burn',
                    null,
                    null,
                    fullBodyExercises,
                    null,
                    null,
                    null
                  );
                  const result = await startCustomAssessment(workout, null, true, true);
                  if (result.didFinish) {
                    DeviceEventEmitter.emit('didExitWorkout', { 
                      type: 'workout_completed',
                      exercises: fullBodyExercises
                    });
                  }
                }}
              />
              <WorkoutButton 
                title="MOBILITY & STRETCH" 
                onPress={() => {
                  const mobilityExercises = [
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'SideBendLeft',
                      35,
                      'StandingSideBendLeft',
                      null,
                      [SMWorkoutLibrary.UIElement.Timer],
                      'StandingSideBendLeft',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Time,
                        0.3,
                        60,
                        null,
                        null,
                        null
                      ),
                      '',
                      'Side Bend (Left)',
                      'Hold for 60 seconds',
                      'Time',
                      'seconds'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'SideBendRight',
                      35,
                      'StandingSideBendRight',
                      null,
                      [SMWorkoutLibrary.UIElement.Timer],
                      'StandingSideBendRight',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Time,
                        0.3,
                        60,
                        null,
                        null,
                        null
                      ),
                      '',
                      'Side Bend (Right)',
                      'Hold for 60 seconds',
                      'Time',
                      'seconds'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'StandingHamstringMobility',
                      35,
                      'StandingHamstringMobility',
                      null,
                      [SMWorkoutLibrary.UIElement.Timer],
                      'StandingHamstringMobility',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Time,
                        0.3,
                        60,
                        null,
                        null,
                        null
                      ),
                      '',
                      'Standing Hamstring Mobility',
                      'Hold for 60 seconds',
                      'Time',
                      'seconds'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'HamstringMobility',
                      35,
                      'HamstringMobility',
                      null,
                      [SMWorkoutLibrary.UIElement.Timer],
                      'HamstringMobility',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Time,
                        0.3,
                        60,
                        null,
                        null,
                        null
                      ),
                      '',
                      'Hamstring Mobility',
                      'Hold for 60 seconds',
                      'Time',
                      'seconds'
                    )
                  ];

                  const workout = new SMWorkoutLibrary.SMWorkout(
                    'advanced_mobility_stretch',
                    'Advanced Mobility & Stretch',
                    null,
                    null,
                    mobilityExercises,
                    null,
                    null,
                    null
                  );
                  startCustomAssessment(workout, null, true, true);
                }}
              />
              <WorkoutButton 
                title="SHOULDER & ARM FOCUS" 
                onPress={async () => {
                  const advancedExercises = [
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Shoulder Press',
                      35,
                      'ShoulderPress',
        null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'ShoulderPress',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        20,
                        null,
                        null
                      ),
                      '',
                      'Shoulder Press',
                      'Complete 20 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Push-up',
                      35,
                      'PushupRegular',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'PushupRegular',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        20,
                        null,
                        null
                      ),
                      '',
                      'Push-up',
                      'Complete 20 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Side Plank',
                      35,
                      'SidePlank',
                      null,
                      [SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'SidePlank',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Time,
                        0.3,
                        null,
                        null,
                        '60',
                        null
                      ),
                      '',
                      'Side Plank',
                      'Hold for 60 seconds',
                      'Time',
                      'clean reps'
                    )
                  ];

                  const workout = new SMWorkoutLibrary.SMWorkout(
                    'advanced_shoulder_arm_focus',
                    'Shoulder & Arm Focus',
                    null,
                    null,
                    advancedExercises,
                    null,
                    null,
                    null
                  );

                  try {
                    await setEndExercisePreferences(SMWorkoutLibrary.EndExercisePreferences.TargetBased);
                    await setCounterPreferences(SMWorkoutLibrary.CounterPreferences.PerfectOnly);
                    await startCustomAssessment(workout, null, true, true);
                  } catch (error) {
                    console.error('Error starting workout:', error);
                    Alert.alert('Error', 'Failed to start workout. Please try again.');
                  }
                }}
              />
              <WorkoutButton 
                title="HIGH INTENSITY (HIIT STYLE)" 
                onPress={async () => {
                  const advancedExercises = [
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Jumping Jacks',
                      35,
                      'JumpingJacks',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'JumpingJacks',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        60,
                        null,
                        null
                      ),
                      '',
                      'Jumping Jacks',
                      'Complete 60 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'High Knees',
                      35,
                      'HighKnees',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'HighKnees',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        60,
                        null,
                        null
                      ),
                      '',
                      'High Knees',
                      'Complete 60 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Push-up',
                      35,
                      'PushupRegular',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'PushupRegular',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        20,
                        null,
                        null
                      ),
                      '',
                      'Push-up',
                      'Complete 20 reps',
                      'Reps',
                      'clean reps'
                    ),
                    new SMWorkoutLibrary.SMAssessmentExercise(
                      'Air Squat',
                      35,
                      'SquatRegular',
                      null,
                      [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion],
                      'SquatRegular',
                      '',
                      new SMWorkoutLibrary.SMScoringParams(
                        SMWorkoutLibrary.ScoringType.Reps,
                        0.3,
                        null,
                        20,
                        null,
                        null
                      ),
                      '',
                      'Air Squat',
                      'Complete 20 reps',
                      'Reps',
                      'clean reps'
                    )
                  ];

                  const workout = new SMWorkoutLibrary.SMWorkout(
                    'advanced_hiit_style',
                    'High Intensity (HIIT Style)',
                    null,
                    null,
                    advancedExercises,
                    null,
                    null,
                    null
                  );

                  try {
                    await setEndExercisePreferences(SMWorkoutLibrary.EndExercisePreferences.TargetBased);
                    await setCounterPreferences(SMWorkoutLibrary.CounterPreferences.PerfectOnly);
                    await startCustomAssessment(workout, null, true, true);
                  } catch (error) {
                    console.error('Error starting workout:', error);
                    Alert.alert('Error', 'Failed to start workout. Please try again.');
                  }
                }}
              />
            </>
          )}
      </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setSelectedExercises([]);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Select Exercises (Max 4)</Text>
            <Text style={styles.modalSubtitle}>{selectedExercises.length}/4 selected</Text>
            
            <ScrollView style={styles.exerciseList}>
              {availableExercises.map((exercise) => (
                <TouchableOpacity
                  key={exercise}
                  style={[
                    styles.exerciseItem,
                    selectedExercises.includes(exercise) && styles.exerciseItemSelected
                  ]}
                  onPress={() => toggleExerciseSelection(exercise)}
                >
                  <Text style={[
                    styles.exerciseText,
                    selectedExercises.includes(exercise) && styles.exerciseTextSelected
                  ]}>
                    {exercise}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setModalVisible(false);
                  setSelectedExercises([]);
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalStartButton,
                  selectedExercises.length === 0 && styles.modalStartButtonDisabled
                ]}
                onPress={handleStartWorkout}
                disabled={selectedExercises.length === 0}
              >
                <Text style={styles.modalButtonText}>Start Workout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF8C00" />
    </View>
      )}
    </SafeAreaView>
  );

  async function configureSMKitUI() {
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
  }

  async function startWorkoutProgramSession() {
    try {
      const parsedWeek = parseInt(week, 10);
      if (isNaN(parsedWeek)) {
        throw new Error('Invalid week number');
      }
      var config = new SMWorkoutLibrary.WorkoutConfig(
        parsedWeek,
        bodyZone,
        difficultyLevel,
        duration,
        language,
        name,
      );
      var result = await startWorkoutProgram(config);
      console.log(result.summary);
      console.log(result.didFinish);
    } catch (e) {
      Alert.alert('Unable to start workout program', e.message, [{ text: 'OK', onPress: () => console.log('OK Pressed') }]);
    }
  }

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

      var result = await startCustomAssessment(assessment, null, true, false);
      console.log('Assessment result:', result.summary);
      console.log('Did finish:', result.didFinish);

      // Track all exercises and their status
      const exerciseStatus = (exercises as any[]).map((e: any) => ({
        name: e.exercise.name,
        completed: e.completed,
        skipped: e.skipped,
        total: exercises.length
      }));
      
      // Emit workout completion event with all exercise statuses
      DeviceEventEmitter.emit('workout_completed', {
        exercises: exerciseStatus,
        totalExercises: exercises.length,
        completedExercises: (exercises as any[]).filter((e: any) => e.completed).length,
        skippedExercises: (exercises as any[]).filter((e: any) => e.skipped).length
      });
    } catch (e) {
      console.error('Custom assessment error:', e);
      showAlert('Custom assessment error', e.message);
    }
  }
};

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
  scrollViewContent: {
    paddingBottom: '10%', // Changed from 80px to 10%
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: '5%', // Changed from 20px to 5%
    paddingTop: '4%', // Changed from 16px to 4%
    paddingBottom: '3%', // Changed from 12px to 3%
    backgroundColor: 'transparent',
    position: 'relative',
  },
  headerTitle: {
    fontSize: 25,
    color: '#F47551',
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding: '2%', // Changed from 8px to 2%
    zIndex: 1,
  },
  backIcon: {
    fontSize: 28,
    color: '#F47551',
    fontWeight: '600',
  },
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3, // Changed from 12px to 3%
    paddingVertical: '3%', // Changed from 12px to 3%
    paddingHorizontal: '5%', // Changed from 20px to 5%
  },
  difficultyButton: {
    paddingVertical: '2.5%', // Changed from 10px to 2.5%
    paddingHorizontal: '5%', // Changed from 20px to 5%
    borderRadius: 25,
    backgroundColor: '#333333',
  },
  selectedDifficultyButton: {
    backgroundColor: '#FFE4C4',
  },
  difficultyButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  selectedDifficultyButtonText: {
    color: '#000000',
  },
  focusCard: {
    margin: '5%', // Changed from 20px to 5%
    padding: '5%', // Changed from 20px to 5%
    backgroundColor: '#FFE4C4',
    borderRadius: 15,
  },
  focusTitle: {
    fontSize: 16,
    color: '#000000',
  },
  workoutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginVertical: '2.5%', // Changed from 10px to 2.5%
  },
  workoutDescription: {
    fontSize: 14,
    color: '#000000',
    marginBottom: '5%', // Changed from 20px to 5%
  },
  startButton: {
    backgroundColor: '#1A1A1A',
    padding: '3.75%', // Changed from 15px to 3.75%
    borderRadius: 25,
    alignItems: 'center',
    width: '100%',
    marginTop: '2%', // Changed from 8px to 2%
  },
  startButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF8C00',
    marginLeft: '5%', // Changed from 20px to 5%
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: '5%', // Changed from 20px to 5%
    marginTop: '1.25%', // Changed from 5px to 1.25%
    marginBottom: '5%', // Changed from 20px to 5%
  },
  workoutOptionsContainer: {
    padding: '5%', // Changed from 20px to 5%
    marginBottom: '5%', // Changed from 20px to 5%
  },
  workoutButton: {
    backgroundColor: '#333333',
    padding: '5%', // Changed from 20px to 5%
    borderRadius: 15,
    marginBottom: '2.5%', // Changed from 10px to 2.5%
  },
  workoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bottomSpacer: {
    height: '15%', // Changed from 60px to 15%
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#000000',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '15%', // Changed from 60px to 15%
    borderTopWidth: 0.5,
    borderTopColor: '#333333',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '2.5%', // Changed from 10px to 2.5%
  },
  navText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: '5%', // Changed from 20px to 5%
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: '3.75%', // Changed from 15px to 3.75%
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '5%', // Changed from 20px to 5%
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: '5%', // Changed from 20px to 5%
    width: '100%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: '2.5%', // Changed from 10px to 2.5%
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: '5%', // Changed from 20px to 5%
  },
  exerciseList: {
    maxHeight: '70%',
  },
  exerciseItem: {
    backgroundColor: '#333333',
    padding: '3.75%', // Changed from 15px to 3.75%
    borderRadius: 10,
    marginBottom: '2.5%', // Changed from 10px to 2.5%
  },
  exerciseItemSelected: {
    backgroundColor: '#4A90E2',
  },
  exerciseText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  exerciseTextSelected: {
    fontWeight: 'bold',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: '5%', // Changed from 20px to 5%
  },
  modalCancelButton: {
    backgroundColor: '#666666',
    padding: '3.75%', // Changed from 15px to 3.75%
    borderRadius: 10,
    flex: 1,
    marginRight: '2.5%', // Changed from 10px to 2.5%
  },
  modalStartButton: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
  },
  modalStartButtonDisabled: {
    backgroundColor: '#333333',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  customButton: {
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  customButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  noWorkoutsContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noWorkoutsText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default WorkoutScreen;