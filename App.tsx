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

const App = () => {
  const [didConfig, setDidConfig] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showWFPUI, setWPFUI] = useState(false);
  const [week, setWeek] = useState('1');
  const [bodyZone, setBodyZone] = useState(SMWorkoutLibrary.BodyZone.FullBody);
  const [difficulty, setDifficulty] = useState(SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty);
  const [duration, setDuration] = useState(SMWorkoutLibrary.WorkoutDuration.Long);
  const [language, setLanguage] = useState(SMWorkoutLibrary.Language.English);
  const [name, setName] = useState('YOUR_PROGRAM_ID');
  const [modalVisible, setModalVisible] = useState(false);
  const [summaryMessage, setSummaryMessage] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);

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
    setSummaryMessage(summary);
    setModalVisible(true);
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
                20,                      // targetTime
                null,                    // targetReps
                null,                    // targetDistance
                null                     // targetCalories
              ),
              '',                     // failedSound
              'OH Squat',             // exerciseTitle
              'Hold the position',    // subtitle
              'Time',                 // scoreTitle
              'seconds'               // scoreSubtitle
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
              exerciseName,              // exerciseTitle
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

      const result = await startCustomAssessment(workout, null, true, false);
      console.log('Assessment result:', result.summary);
      console.log('Did finish:', result.didFinish);
    } catch (e) {
      showAlert('Workout Error', e.message);
    }
  };

  return (
    <View style={styles.mainContainer}>
      {isLoading && <ActivityIndicator size="large" color="#C4A484" />}
      
      <View style={styles.headerContainer}>
      <Image 
          source={require('./assets/logo1.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.welcomeText}>Welcome to </Text>
        <View style={{ flexDirection: 'row' }}>
          <Text style={[styles.titleText, { color: 'white' }]}>Ar</Text>
          <Text style={[styles.titleText, { color: '#E08714' }]}>thlete</Text>
          <Text style={[styles.titleText, { color: 'white' }]}> AI Experience</Text>
        </View>
      </View>

      <ScrollView style={styles.categoryScrollContainer}>
        <View style={styles.categoryContainer}>
          {['Fitness', 'Movement', 'Cardio', 'Strength', 'Custom Fitness'].map((category) => (
            <Pressable
              key={category}
              style={styles.categoryButton}
              onPress={() => handleCategorySelect(category)}
              disabled={!didConfig}>
              <Text style={styles.categoryText}>{category}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Text style={styles.instructionText}>
        Or scroll down and choose up to 3 exercises from the list.
      </Text>

      <ScrollView style={styles.exerciseScrollContainer}>
        <View style={styles.exerciseContainer}>
          {['High Plank', 'Air Squat', 'Push-ups', 'OH Squat', 'Knee Raise Left', 'Knee Raise Right', 'Side Bend Left', 'Side Bend Right', 'Standing Alternate Toe Touch', 'Jefferson Curl', 'Alternate Windmill Toe Touch', 'Burpees', 'Crunches', 'Froggers', 'Glute Bridge', 'High Knees', 'Jumping Jacks', 'Jumps', 'Lateral Raises', 'Lunge', 'Lunge Jump', 'Side Lunge', 'Mountain Climber Plank', 'Shoulder Taps Plank', 'Reverse Sit to Table Top', 'Skater Hops', 'Ski Jumps', 'Rotation Jab Squat', 'Bicycle Crunches', 'Oblique Crunches', 'Shoulder Press', 'Side Plank', 'Tuck Hold'].map((exercise) => (
              <Pressable
              key={exercise}
              style={[
                styles.exerciseButton,
                selectedExercises.includes(exercise) && styles.selectedExercise
              ]}
              onPress={() => handleExerciseSelect(exercise)}
              disabled={!didConfig}>
              <Text style={styles.exerciseText}>{exercise}</Text>
              </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <Pressable
          style={[styles.startButton, !didConfig && styles.disabledButton]}
          onPress={handleStartWorkout}
          disabled={!didConfig}>
          <Text style={styles.startButtonText}>Start AI Workout</Text>
        </Pressable>

        <Text style={styles.learnMoreText}>
          Learn More About Arthlete's AI Technology
        </Text>
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
    </View>
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
        difficulty,
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
  mainContainer: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    padding: 20,
  },
  headerContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 0,
    
    borderRadius: 20,
  },
  welcomeText: {
    marginRight: 10,
    fontSize: 24,
    color: 'white',
    opacity: 0.8,
  },
  titleText: {
    
    fontSize:27,
    color: 'white',
    fontWeight: 'bold',
  },
  categoryScrollContainer: {
    flex: 1,
    marginBottom: 10,
  },
  categoryContainer: {
    width: '100%',
  },
  categoryButton: {
    width: '100%',
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgb(255, 255, 255)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  categoryText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  instructionText: {
    color: '#F4D7CF',
    fontSize: 16,
    marginVertical: 10,
    textAlign: 'center',
  },
  exerciseScrollContainer: {
    flex: 1,
    marginBottom: 10,
  },
  exerciseContainer: {
    width: '100%',
  },
  exerciseButton: {
    width: '100%',
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgb(255, 255, 255)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  exerciseText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  bottomContainer: {
    marginTop: 10,
    paddingBottom: 10,
  },
  startButton: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E06714',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  learnMoreText: {
    color: '#F4D7CF',
    fontSize: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
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
});

export default App;