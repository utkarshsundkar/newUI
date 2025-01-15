import {useState, useEffect} from 'react';
import Clipboard from '@react-native-clipboard/clipboard';
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
} from 'react-native';
import {
  configure,
  startAssessment,
  startCustomAssessment,
  setSessionLanguge,
  startCustomWorkout,
  startWorkoutProgram,
} from '@sency/react-native-smkit-ui';
import * as SMWorkoutLibrary from '@sency/react-native-smkit-ui/src/SMWorkout';
import EditText from './components/EditText';
import ThreeCheckboxes from './components/ThreeCheckboxes';
import React from 'react';

const App = () => {
  const [didConfig, setDidConfig] = useState(false);
  const [isLoading, setisLoading] = useState(false);

  const [showWFPUI, setWPFUI] = useState(false);
  const [week, setWeek] = useState('1');
  const [bodyZone, setBodyZone] = useState(SMWorkoutLibrary.BodyZone.FullBody);
  const [difficulty, setDifficulty] = useState(
    SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty,
  );
  const [duration, setDuration] = useState(
    SMWorkoutLibrary.WorkoutDuration.Long,
  );
  const [language, setLanguage] = useState(SMWorkoutLibrary.Language.English);
  const [name, setName] = useState('YOUR_PROGRAM_ID');

  const [modalVisible, setModalVisible] = useState(false);
  const [summaryMessage, setSummaryMessage] = useState('');

  useEffect(() => {
    configureSMKitUI();
  }, []);

  // Currently available in Android
  useEffect(() => {
    const didExitWorkoutSubscription = DeviceEventEmitter.addListener(
      'didExitWorkout',
      params => {
        handleEvent(params.summary);
        console.log(
          'Received didExitWorkout event with message:',
          params.summary,
        );
      },
    );

    const workoutDidFinishSubscription = DeviceEventEmitter.addListener(
      'workoutDidFinish',
      params => {
        handleEvent(params.summary);
        console.log(
          'Received workoutDidFinish event with message:',
          params.summary,
        );
      },
    );

    // Clean up subscription
    return () => {
      didExitWorkoutSubscription.remove();
      workoutDidFinishSubscription.remove();
    };
  }, []);

  const handleEvent = (summary: string) => {
    setSummaryMessage(summary);
    setModalVisible(true);
  };

  const copyToClipboard = () => {
    Clipboard.setString(summaryMessage);
    Alert.alert('Copied to Clipboard!');
  };

  const onDuration = (index: number) => {
    if (index == 0) {
      setDuration(SMWorkoutLibrary.WorkoutDuration.Long);
    } else {
      setDuration(SMWorkoutLibrary.WorkoutDuration.Short);
    }
  };

  const onLanguage = (index: number) => {
    if (index == 0) {
      setLanguage(SMWorkoutLibrary.Language.Hebrew);
    } else {
      setLanguage(SMWorkoutLibrary.Language.English);
    }
  };

  const onBodyZone = (index: number) => {
    if (index == 0) {
      setBodyZone(SMWorkoutLibrary.BodyZone.UpperBody);
    } else if (index == 1) {
      setBodyZone(SMWorkoutLibrary.BodyZone.LowerBody);
    } else {
      setBodyZone(SMWorkoutLibrary.BodyZone.FullBody);
    }
  };

  const onDifficulty = (index: number) => {
    if (index == 0) {
      setDifficulty(SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty);
    } else if (index == 1) {
      setDifficulty(SMWorkoutLibrary.WorkoutDifficulty.MidDifficulty);
    } else {
      setDifficulty(SMWorkoutLibrary.WorkoutDifficulty.HighDifficulty);
    }
  };

  return (
    <View style={styles.centeredView}>
      {showWFPUI ? (
        <View style={styles.container}>
          <Text style={styles.textStyleWFP}>Workout ID:</Text>
          <EditText
            placeholder="Enter workout ID"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.textStyleWFP}>Workout Week:</Text>
          <EditText
            placeholder="Enter workout week"
            value={week}
            onChangeText={setWeek}
          />

          <Text style={styles.textStyleWFP}>Duration:</Text>
          <ThreeCheckboxes list={['Long', 'Short']} onPress={onDuration} />

          <Text style={styles.textStyleWFP}>Body Zone:</Text>
          <ThreeCheckboxes
            list={['Upper Body', 'Lower Body', 'Full Body']}
            onPress={onBodyZone}
          />

          <Text style={styles.textStyleWFP}>Language:</Text>
          <ThreeCheckboxes list={['Hebrew', 'English']} onPress={onLanguage} />

          <Text style={styles.textStyleWFP}>Difficulty:</Text>
          <ThreeCheckboxes
            list={['Low', 'Mid', 'High']}
            onPress={onDifficulty}
          />

          <View style={styles.buttonGroup}>
            <Pressable
              style={[styles.button]}
              onPress={() => startWorkoutProgramSession()}>
              <Text style={styles.buttonText}>Start</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.closeButton]}
              onPress={() => setWPFUI(false)}>
              <Text style={styles.buttonText}>Back</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View>
          {isLoading && <ActivityIndicator size="large" color="#0000ff" />}
          <Modal
            transparent={true}
            visible={modalVisible}
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}>
            <View style={styles.modalBackground}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalText}>{summaryMessage}</Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={copyToClipboard}>
                  <Text style={styles.buttonText}>Copy to Clipboard</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.closeButton]}
                  onPress={() => setModalVisible(false)}>
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          <View>
            <Pressable
              disabled={!didConfig}
              style={[styles.button]}
              onPress={() =>
                startAssessmentSession(
                  SMWorkoutLibrary.AssessmentTypes.Fitness,
                  true,
                  '',
                )
              }>
              <Text style={styles.textStyle}>Start Assessment</Text>
            </Pressable>

            <Pressable
              disabled={!didConfig}
              style={[styles.button]}
              onPress={() =>
                startAssessmentSession(
                  SMWorkoutLibrary.AssessmentTypes.Custom,
                  true,
                  'YOUR_CUSTOM_ASSESSMENT',
                )
              }>
              <Text style={styles.textStyle}>Start Custom Assessment</Text>
            </Pressable>

            <Pressable
              disabled={!didConfig}
              style={[styles.button]}
              onPress={() =>
                startAssessmentSession(
                  SMWorkoutLibrary.AssessmentTypes.Body360,
                  true,
                  '',
                )
              }>
              <Text style={styles.textStyle}>Start Body360 Assessment</Text>
            </Pressable>

            <Pressable
              disabled={!didConfig}
              style={[styles.button]}
              onPress={() => startSMKitUICustomWorkout()}>
              <Text style={styles.textStyle}>Start startCustomWorkout</Text>
            </Pressable>

            <Pressable
              disabled={!didConfig}
              style={[styles.button]}
              onPress={() => startSMKitUICustomAssessment()}>
              <Text style={styles.textStyle}>Start customized assessment</Text>
            </Pressable>

            <Pressable
              disabled={!didConfig}
              style={[styles.button]}
              onPress={() => setWPFUI(true)}>
              <Text style={styles.textStyle}>Workout from program</Text>
            </Pressable>
          </View>

          <View></View>
        </View>
      )}
    </View>
  );

  async function configureSMKitUI() {
    setisLoading(true);
    try {
      await configure('');
      setisLoading(false);
      setDidConfig(true);
    } catch (e) {
      setisLoading(false);
      Alert.alert('Configure Failed'),
        '',
        [{text: 'OK', onPress: () => console.log('OK Pressed')}];
    }
  }

  async function startWorkoutProgramSession() {
    try {
      const parsedWeek = parseInt(week, 10); // Use base 10 for decimal numbers

      if (!isNaN(parsedWeek)) {
        console.log('Parsed integer:', parsedWeek);
      } else {
        throw new Error();
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
      Alert.alert('Unable to start assessment'),
        '',
        [{text: 'OK', onPress: () => console.log('OK Pressed')}];
    }
  }

  async function startAssessmentSession(
    type: SMWorkoutLibrary.AssessmentTypes, // => The type of assessment, which can be either AssessmentTypes.Fitness or AssessmentTypes.Custom.
    showSummary: boolean, // => Determines whether the summary screen will be presented at the end of the exercise.
    customAssessmentID: string, // If you have more than one custom assessment, use the customAssessmentID to specify which one to call, if not please use null.
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
      Alert.alert('Unable to start assessment'),
        '',
        [{text: 'OK', onPress: () => console.log('OK Pressed')}];
    }
  }

  async function startSMKitUICustomWorkout() {
    try {
      // list of exercies
      var exercises = [
        new SMWorkoutLibrary.SMAssessmentExercise(
          'SquatRegularOverheadStatic', // Name
          30, // Duration in seconds
          'SquatRegularOverheadStatic', // Video instruction name
          null, // Exercise intro
          [
            SMWorkoutLibrary.UIElement.GaugeOfMotion,
            SMWorkoutLibrary.UIElement.Timer,
          ],
          'SquatRegularOverheadStatic', // Detector
          'stam', // Closure
          new SMWorkoutLibrary.SMScoringParams(
            SMWorkoutLibrary.ScoringType.Time, // Scoring type
            0.5, // Score factor
            20, // Target time
            null, // Target repetitions
            null,
            null,
          ),
          'SquatRegularOverheadStatic', // => summaryTitle: string | null
          'Subtitle', // => summarySubTitle: string | null
          'timeInPosition', // => summaryMainMetricTitle: string | null
          'clean reps', // => summaryMainMetricSubTitle: string | null
        ),
        new SMWorkoutLibrary.SMAssessmentExercise(
          'Jefferson Curl', // Name
          30, // Duration in seconds
          'JeffersonCurlRight', // Video instruction name
          null, // Exercise intro
          [
            SMWorkoutLibrary.UIElement.GaugeOfMotion,
            SMWorkoutLibrary.UIElement.Timer,
          ],
          'JeffersonCurlRight', // Detector
          'stam', // Closure
          new SMWorkoutLibrary.SMScoringParams(
            SMWorkoutLibrary.ScoringType.Time, // Scoring type
            0.5, // Score factor
            20, // Target time
            null, // Target repetitions
            null,
            null,
          ),
          'JeffersonCurlRight', // => summaryTitle: string | null
          'Subtitle', // => summarySubTitle: string | null
          'timeInPosition', // => summaryMainMetricTitle: string | null
          'clean reps', // => summaryMainMetricSubTitle: string | null
        ),
        new SMWorkoutLibrary.SMAssessmentExercise(
          'Push-Up', // Name
          30, // Duration in seconds
          'PushupRegular', // Video instruction name
          null, // Exercise intro
          [
            SMWorkoutLibrary.UIElement.RepsCounter,
            SMWorkoutLibrary.UIElement.Timer,
          ],
          'PushupRegular', // Detector
          'stam', // Closure
          new SMWorkoutLibrary.SMScoringParams(
            SMWorkoutLibrary.ScoringType.Reps, // Scoring type
            0.5, // Score factor
            null, // Target time
            6, // Target repetitions
            null,
            null,
          ),
          'PushupRegular', // => summaryTitle: string | null,
          'Subtitle', // => summarySubTitle: string | null,
          'Reps', // => summaryMainMetricTitle: string | null
          'clean reps', // => summaryMainMetricSubTitle: string | null
        ),
        new SMWorkoutLibrary.SMAssessmentExercise(
          'LungeFrontRight', // Name
          30, // Duration in seconds
          'LungeFrontRight', // Video instruction name
          null, // Exercise intro
          [
            SMWorkoutLibrary.UIElement.GaugeOfMotion,
            SMWorkoutLibrary.UIElement.Timer,
          ],
          'LungeFront', // Detector
          'stam', // Closure
          new SMWorkoutLibrary.SMScoringParams(
            SMWorkoutLibrary.ScoringType.Reps, // Scoring type
            0.5, // Score factor
            null, // Target time
            20, // Target repetitions
            null,
            null,
          ),
          'LungeFrontRight', // => summaryTitle: string | null
          'Subtitle', // => summarySubTitle: string | null
          'timeInPosition', // => summaryMainMetricTitle: string | null
          'clean reps', // => summaryMainMetricSubTitle: string | null
        ),
        new SMWorkoutLibrary.SMAssessmentExercise(
          'LungeFrontLeft', // Name
          30, // Duration in seconds
          'LungeFrontLeft', // Video instruction name
          null, // Exercise intro
          [
            SMWorkoutLibrary.UIElement.GaugeOfMotion,
            SMWorkoutLibrary.UIElement.Timer,
          ],
          'LungeFront', // Detector
          'stam', // Closure
          new SMWorkoutLibrary.SMScoringParams(
            SMWorkoutLibrary.ScoringType.Reps, // Scoring type
            0.5, // Score factor
            null, // Target time
            20, // Target repetitions
            null,
            null,
          ),
          'LungeFrontLeft', // => summaryTitle: string | null
          'Subtitle', // => summarySubTitle: string | null
          'timeInPosition', // => summaryMainMetricTitle: string | null
          'clean reps', // => summaryMainMetricSubTitle: string | null
        ),
      ];

      var assessment = new SMWorkoutLibrary.SMWorkout(
        '50', // => id: string | null
        'demo workout', // => name: string | null
        null, // => workoutIntro: string | null (url for a sound)
        null, // => soundtrack: string | null (url for a sound)
        exercises, // => exercises: SMExercise[]
        null, // =>  getInFrame: string | null (url for a sound)
        null, // =>  bodycalFinished: string | null (url for a sound)
        null, // =>  workoutClosure: string | null (url for a sound)
      );

      /**
       * Initiates a custom assessment session.
       *
       * @param {SMWorkoutLibrary.SMWorkout} assessment - The assessment configuration for the session.
       * @returns {Promise<{ summary: string; didFinish: boolean }>} - A promise that resolves with an object containing the summary and a flag indicating if the assessment finished.
       */
      var result = await startCustomWorkout(assessment);
      console.log(result.summary);
      console.log(result.didFinish);
    } catch (e) {
      console.error(e);
      showAlert('Custom workout error', e + '');
    }
  }
};

function showAlert(title: string, massege: string) {
  Alert.alert(title, massege, [
    {text: 'OK', onPress: () => console.log('OK Pressed')},
  ]);
}

async function startSMKitUICustomAssessment() {
  try {
    // list of exercies
    var exercises = [
      new SMWorkoutLibrary.SMAssessmentExercise(
        'Crunches', // => name:string | null
        35, // => totalSeconds: number | null
        'Crunches', // => videoInstruction: string | null (url for a video)
        null, // => exerciseIntro: string | null (url for a sound)
        [
          SMWorkoutLibrary.UIElement.RepsCounter,
          SMWorkoutLibrary.UIElement.Timer,
        ], // => uiElements: UIElement[] | null
        'Crunches', // => detector: string
        null, // => exerciseClosure: string | null (url for a sound)
        new SMWorkoutLibrary.SMScoringParams(
          SMWorkoutLibrary.ScoringType.Reps,
          0.3, // => scoreFactor: number | null
          null, // => targetTime: number | null
          20, // => targetReps: number | null
          null,
          null,
        ),
        'Crunches', // => summaryTitle: string | null
        'Subtitle', // => summarySubTitle: string | null
        'Reps', // => summaryMainMetricTitle: string | null
        'clean reps', // => summaryMainMetricSubTitle: string | null
      ),
      new SMWorkoutLibrary.SMAssessmentExercise(
        'GlutesBridge', // => name:string | null
        35, // => totalSeconds: number | null
        'GlutesBridge', // => videoInstruction: string | null (url for a video)
        null, // => exerciseIntro: string | null (url for a sound)
        [
          SMWorkoutLibrary.UIElement.RepsCounter,
          SMWorkoutLibrary.UIElement.Timer,
        ], // => uiElements: UIElement[] | null
        'GlutesBridge', // => detector: string
        null, // => exerciseClosure: string | null (url for a sound)
        new SMWorkoutLibrary.SMScoringParams(
          SMWorkoutLibrary.ScoringType.Reps,
          0.3, // => scoreFactor: number | null
          null, // => targetTime: number | null
          20, // => targetReps: number | null
          null,
          null,
        ),
        'GlutesBridge', // => summaryTitle: string | null
        'Subtitle', // => summarySubTitle: string | null
        'Reps', // => summaryMainMetricTitle: string | null
        'clean reps', // => summaryMainMetricSubTitle: string | null
      ),
      new SMWorkoutLibrary.SMAssessmentExercise(
        'HighKnees', // => name:string | null
        35, // => totalSeconds: number | null
        'HighKnees', // => videoInstruction: string | null (url for a video)
        null, // => exerciseIntro: string | null (url for a sound)
        [
          SMWorkoutLibrary.UIElement.RepsCounter,
          SMWorkoutLibrary.UIElement.Timer,
        ], // => uiElements: UIElement[] | null
        'HighKnees', // => detector: string
        null, // => exerciseClosure: string | null (url for a sound)
        new SMWorkoutLibrary.SMScoringParams(
          SMWorkoutLibrary.ScoringType.Reps,
          0.3, // => scoreFactor: number | null
          null, // => targetTime: number | null
          20, // => targetReps: number | null
          null,
          null,
        ),
        'HighKnees', // => summaryTitle: string | null
        'Subtitle', // => summarySubTitle: string | null
        'Reps', // => summaryMainMetricTitle: string | null
        'clean reps', // => summaryMainMetricSubTitle: string | null
      ),
      new SMWorkoutLibrary.SMAssessmentExercise(
        'JeffersonCurlRight', // => name:string | null
        35, // => totalSeconds: number | null
        'JeffersonCurlRight', // => videoInstruction: string | null (url for a video)
        null, // => exerciseIntro: string | null (url for a sound)
        [
          SMWorkoutLibrary.UIElement.GaugeOfMotion,
          SMWorkoutLibrary.UIElement.Timer,
        ], // => uiElements: UIElement[] | null
        'JeffersonCurlRight', // => detector: string
        null, // => exerciseClosure: string | null (url for a sound)
        new SMWorkoutLibrary.SMScoringParams(
          SMWorkoutLibrary.ScoringType.Time,
          0.3, // => scoreFactor: number | null
          35, // => targetTime: number | null
          null, // => targetReps: number | null
          null,
          null,
        ),
        'JeffersonCurlRight', // => summaryTitle: string | null
        'Subtitle', // => summarySubTitle: string | null
        'Reps', // => summaryMainMetricTitle: string | null
        'clean reps', // => summaryMainMetricSubTitle: string | null
      ),
      new SMWorkoutLibrary.SMAssessmentExercise(
        'JumpingJacks', // => name:string | null
        35, // => totalSeconds: number | null
        'JumpingJacks', // => videoInstruction: string | null (url for a video)
        null, // => exerciseIntro: string | null (url for a sound)
        [
          SMWorkoutLibrary.UIElement.RepsCounter,
          SMWorkoutLibrary.UIElement.Timer,
        ], // => uiElements: UIElement[] | null
        'JumpingJacks', // => detector: string
        null, // => exerciseClosure: string | null (url for a sound)
        new SMWorkoutLibrary.SMScoringParams(
          SMWorkoutLibrary.ScoringType.Reps,
          0.3, // => scoreFactor: number | null
          null, // => targetTime: number | null
          20, // => targetReps: number | null
          null,
          null,
        ),
        'JumpingJacks', // => summaryTitle: string | null
        'Subtitle', // => summarySubTitle: string | null
        'Reps', // => summaryMainMetricTitle: string | null
        'clean reps', // => summaryMainMetricSubTitle: string | null
      ),
      new SMWorkoutLibrary.SMAssessmentExercise(
        'LungeSideLeft', // => name:string | null
        35, // => totalSeconds: number | null
        'LungeSideLeft', // => videoInstruction: string | null (url for a video)
        null, // => exerciseIntro: string | null (url for a sound)
        [
          SMWorkoutLibrary.UIElement.RepsCounter,
          SMWorkoutLibrary.UIElement.Timer,
        ], // => uiElements: UIElement[] | null
        'LungeSideLeft', // => detector: string
        null, // => exerciseClosure: string | null (url for a sound)
        new SMWorkoutLibrary.SMScoringParams(
          SMWorkoutLibrary.ScoringType.Reps,
          0.3, // => scoreFactor: number | null
          null, // => targetTime: number | null
          20, // => targetReps: number | null
          null,
          null,
        ),
        'LungeSideLeft', // => summaryTitle: string | null
        'Subtitle', // => summarySubTitle: string | null
        'Reps', // => summaryMainMetricTitle: string | null
        'clean reps', // => summaryMainMetricSubTitle: string | null
      ),
      new SMWorkoutLibrary.SMAssessmentExercise(
        'LungeSideRight', // => name:string | null
        35, // => totalSeconds: number | null
        'LungeSideRight', // => videoInstruction: string | null (url for a video)
        null, // => exerciseIntro: string | null (url for a sound)
        [
          SMWorkoutLibrary.UIElement.RepsCounter,
          SMWorkoutLibrary.UIElement.Timer,
        ], // => uiElements: UIElement[] | null
        'LungeSideRight', // => detector: string
        null, // => exerciseClosure: string | null (url for a sound)
        new SMWorkoutLibrary.SMScoringParams(
          SMWorkoutLibrary.ScoringType.Reps,
          0.3, // => scoreFactor: number | null
          null, // => targetTime: number | null
          20, // => targetReps: number | null
          null,
          null,
        ),
        'LungeSideRight', // => summaryTitle: string | null
        'Subtitle', // => summarySubTitle: string | null
        'Reps', // => summaryMainMetricTitle: string | null
        'clean reps', // => summaryMainMetricSubTitle: string | null
      ),
      new SMWorkoutLibrary.SMAssessmentExercise(
        'PlankHighShoulderTaps', // => name:string | null
        35, // => totalSeconds: number | null
        'PlankHighShoulderTaps', // => videoInstruction: string | null (url for a video)
        null, // => exerciseIntro: string | null (url for a sound)
        [
          SMWorkoutLibrary.UIElement.RepsCounter,
          SMWorkoutLibrary.UIElement.Timer,
        ], // => uiElements: UIElement[] | null
        'PlankHighShoulderTaps', // => detector: string
        null, // => exerciseClosure: string | null (url for a sound)
        new SMWorkoutLibrary.SMScoringParams(
          SMWorkoutLibrary.ScoringType.Reps,
          0.3, // => scoreFactor: number | null
          null, // => targetTime: number | null
          20, // => targetReps: number | null
          null,
          null,
        ),
        'PlankHighShoulderTaps', // => summaryTitle: string | null
        'Subtitle', // => summarySubTitle: string | null
        'Reps', // => summaryMainMetricTitle: string | null
        'clean reps', // => summaryMainMetricSubTitle: string | null
      ),
      new SMWorkoutLibrary.SMAssessmentExercise(
        'PlankHighStatic', // => name:string | null
        35, // => totalSeconds: number | null
        'PlankHighStatic', // => videoInstruction: string | null (url for a video)
        null, // => exerciseIntro: string | null (url for a sound)
        [
          SMWorkoutLibrary.UIElement.GaugeOfMotion,
          SMWorkoutLibrary.UIElement.Timer,
        ], // => uiElements: UIElement[] | null
        'PlankHighStatic', // => detector: string
        null, // => exerciseClosure: string | null (url for a sound)
        new SMWorkoutLibrary.SMScoringParams(
          SMWorkoutLibrary.ScoringType.Time,
          0.3, // => scoreFactor: number | null
          35, // => targetTime: number | null
          null, // => targetReps: number | null
          null,
          null,
        ),
        'PlankHighStatic', // => summaryTitle: string | null
        'Subtitle', // => summarySubTitle: string | null
        'Reps', // => summaryMainMetricTitle: string | null
        'clean reps', // => summaryMainMetricSubTitle: string | null
      ),
      new SMWorkoutLibrary.SMAssessmentExercise(
        'PlankSideLowStatic', // => name:string | null
        35, // => totalSeconds: number | null
        'PlankSideLowStatic', // => videoInstruction: string | null (url for a video)
        null, // => exerciseIntro: string | null (url for a sound)
        [
          SMWorkoutLibrary.UIElement.GaugeOfMotion,
          SMWorkoutLibrary.UIElement.Timer,
        ], // => uiElements: UIElement[] | null
        'PlankSideLowStatic', // => detector: string
        null, // => exerciseClosure: string | null (url for a sound)
        new SMWorkoutLibrary.SMScoringParams(
          SMWorkoutLibrary.ScoringType.Time,
          0.3, // => scoreFactor: number | null
          35, // => targetTime: number | null
          null, // => targetReps: number | null
          null,
          null,
        ),
        'PlankSideLowStatic', // => summaryTitle: string | null
        'Subtitle', // => summarySubTitle: string | null
        'Reps', // => summaryMainMetricTitle: string | null
        'clean reps', // => summaryMainMetricSubTitle: string | null
      ),
      new SMWorkoutLibrary.SMAssessmentExercise(
        'PushupRegular', // => name:string | null
        35, // => totalSeconds: number | null
        'PushupRegular', // => videoInstruction: string | null (url for a video)
        null, // => exerciseIntro: string | null (url for a sound)
        [
          SMWorkoutLibrary.UIElement.RepsCounter,
          SMWorkoutLibrary.UIElement.Timer,
        ], // => uiElements: UIElement[] | null
        'PushupRegular', // => detector: string
        null, // => exerciseClosure: string | null (url for a sound)
        new SMWorkoutLibrary.SMScoringParams(
          SMWorkoutLibrary.ScoringType.Reps,
          0.3, // => scoreFactor: number | null
          null, // => targetTime: number | null
          20, // => targetReps: number | null
          null,
          null,
        ),
        'PushupRegular', // => summaryTitle: string | null
        'Subtitle', // => summarySubTitle: string | null
        'Reps', // => summaryMainMetricTitle: string | null
        'clean reps', // => summaryMainMetricSubTitle: string | null
      ),
      new SMWorkoutLibrary.SMAssessmentExercise(
        'ReverseSitToTableTop', // => name:string | null
        35, // => totalSeconds: number | null
        'ReverseSitToTableTop', // => videoInstruction: string | null (url for a video)
        null, // => exerciseIntro: string | null (url for a sound)
        [
          SMWorkoutLibrary.UIElement.RepsCounter,
          SMWorkoutLibrary.UIElement.Timer,
        ], // => uiElements: UIElement[] | null
        'ReverseSitToTableTop', // => detector: string
        null, // => exerciseClosure: string | null (url for a sound)
        new SMWorkoutLibrary.SMScoringParams(
          SMWorkoutLibrary.ScoringType.Reps,
          0.3, // => scoreFactor: number | null
          null, // => targetTime: number | null
          20, // => targetReps: number | null
          null,
          null,
        ),
        'ReverseSitToTableTop', // => summaryTitle: string | null
        'Subtitle', // => summarySubTitle: string | null
        'Reps', // => summaryMainMetricTitle: string | null
        'clean reps', // => summaryMainMetricSubTitle: string | null
      ),
      new SMWorkoutLibrary.SMAssessmentExercise(
        'SkaterHops', // => name:string | null
        35, // => totalSeconds: number | null
        'SkaterHops', // => videoInstruction: string | null (url for a video)
        null, // => exerciseIntro: string | null (url for a sound)
        [
          SMWorkoutLibrary.UIElement.RepsCounter,
          SMWorkoutLibrary.UIElement.Timer,
        ], // => uiElements: UIElement[] | null
        'SkaterHops', // => detector: string
        null, // => exerciseClosure: string | null (url for a sound)
        new SMWorkoutLibrary.SMScoringParams(
          SMWorkoutLibrary.ScoringType.Reps,
          0.3, // => scoreFactor: number | null
          null, // => targetTime: number | null
          20, // => targetReps: number | null
          null,
          null,
        ),
        'SkaterHops', // => summaryTitle: string | null
        'Subtitle', // => summarySubTitle: string | null
        'Reps', // => summaryMainMetricTitle: string | null
        'clean reps', // => summaryMainMetricSubTitle: string | null
      ),
      new SMWorkoutLibrary.SMAssessmentExercise(
        'SkiJumps', // => name:string | null
        35, // => totalSeconds: number | null
        'SkiJumps', // => videoInstruction: string | null (url for a video)
        null, // => exerciseIntro: string | null (url for a sound)
        [
          SMWorkoutLibrary.UIElement.RepsCounter,
          SMWorkoutLibrary.UIElement.Timer,
        ], // => uiElements: UIElement[] | null
        'SkiJumps', // => detector: string
        null, // => exerciseClosure: string | null (url for a sound)
        new SMWorkoutLibrary.SMScoringParams(
          SMWorkoutLibrary.ScoringType.Reps,
          0.3, // => scoreFactor: number | null
          null, // => targetTime: number | null
          20, // => targetReps: number | null
          null,
          null,
        ),
        'SkiJumps', // => summaryTitle: string | null
        'Subtitle', // => summarySubTitle: string | null
        'Reps', // => summaryMainMetricTitle: string | null
        'clean reps', // => summaryMainMetricSubTitle: string | null
      ),
      new SMWorkoutLibrary.SMAssessmentExercise(
        'ShouldersPress', // => name:string | null
        35, // => totalSeconds: number | null
        'ShouldersPress', // => videoInstruction: string | null (url for a video)
        null, // => exerciseIntro: string | null (url for a sound)
        [
          SMWorkoutLibrary.UIElement.RepsCounter,
          SMWorkoutLibrary.UIElement.Timer,
        ], // => uiElements: UIElement[] | null
        'ShouldersPress', // => detector: string
        null, // => exerciseClosure: string | null (url for a sound)
        new SMWorkoutLibrary.SMScoringParams(
          SMWorkoutLibrary.ScoringType.Reps,
          0.3, // => scoreFactor: number | null
          null, // => targetTime: number | null
          20, // => targetReps: number | null
          null,
          null,
        ),
        'ShouldersPress', // => summaryTitle: string | null
        'Subtitle', // => summarySubTitle: string | null
        'Reps', // => summaryMainMetricTitle: string | null
        'clean reps', // => summaryMainMetricSubTitle: string | null
      ),
      new SMWorkoutLibrary.SMAssessmentExercise(
        'SquatRegular', // => name:string | null
        35, // => totalSeconds: number | null
        'SquatRegular', // => videoInstruction: string | null (url for a video)
        null, // => exerciseIntro: string | null (url for a sound)
        [
          SMWorkoutLibrary.UIElement.RepsCounter,
          SMWorkoutLibrary.UIElement.Timer,
        ], // => uiElements: UIElement[] | null
        'SquatRegular', // => detector: string
        null, // => exerciseClosure: string | null (url for a sound)
        new SMWorkoutLibrary.SMScoringParams(
          SMWorkoutLibrary.ScoringType.Reps,
          0.3, // => scoreFactor: number | null
          null, // => targetTime: number | null
          20, // => targetReps: number | null
          null,
          null,
        ),
        'SquatRegular', // => summaryTitle: string | null
        'Subtitle', // => summarySubTitle: string | null
        'Reps', // => summaryMainMetricTitle: string | null
        'clean reps', // => summaryMainMetricSubTitle: string | null
      ),
      new SMWorkoutLibrary.SMAssessmentExercise(
        'SquatRegularOverheadStatic', // => name:string | null
        35, // => totalSeconds: number | null
        'SquatRegularOverheadStatic', // => videoInstruction: string | null (url for a video)
        null, // => exerciseIntro: string | null (url for a sound)
        [
          SMWorkoutLibrary.UIElement.GaugeOfMotion,
          SMWorkoutLibrary.UIElement.Timer,
        ], // => uiElements: UIElement[] | null
        'SquatRegularOverheadStatic', // => detector: string
        null, // => exerciseClosure: string | null (url for a sound)
        new SMWorkoutLibrary.SMScoringParams(
          SMWorkoutLibrary.ScoringType.Time,
          0.3, // => scoreFactor: number | null
          35, // => targetTime: number | null
          null, // => targetReps: number | null
          null,
          null,
        ),
        'SquatRegularOverheadStatic', // => summaryTitle: string | null
        'Subtitle', // => summarySubTitle: string | null
        'Reps', // => summaryMainMetricTitle: string | null
        'clean reps', // => summaryMainMetricSubTitle: string | null
      ),
      new SMWorkoutLibrary.SMAssessmentExercise(
        'SquatRegularStatic', // => name:string | null
        35, // => totalSeconds: number | null
        'SquatRegularStatic', // => videoInstruction: string | null (url for a video)
        null, // => exerciseIntro: string | null (url for a sound)
        [
          SMWorkoutLibrary.UIElement.GaugeOfMotion,
          SMWorkoutLibrary.UIElement.Timer,
        ], // => uiElements: UIElement[] | null
        'SquatRegularStatic', // => detector: string
        null, // => exerciseClosure: string | null (url for a sound)
        new SMWorkoutLibrary.SMScoringParams(
          SMWorkoutLibrary.ScoringType.Time,
          0.3, // => scoreFactor: number | null
          35, // => targetTime: number | null
          null, // => targetReps: number | null
          null,
          null,
        ),
        'SquatRegularStatic', // => summaryTitle: string | null
        'Subtitle', // => summarySubTitle: string | null
        'Reps', // => summaryMainMetricTitle: string | null
        'clean reps', // => summaryMainMetricSubTitle: string | null
      ),
      new SMWorkoutLibrary.SMAssessmentExercise(
        'StandingKneeRaiseLeft', // => name:string | null
        35, // => totalSeconds: number | null
        'StandingKneeRaiseLeft', // => videoInstruction: string | null (url for a video)
        null, // => exerciseIntro: string | null (url for a sound)
        [
          SMWorkoutLibrary.UIElement.GaugeOfMotion,
          SMWorkoutLibrary.UIElement.Timer,
        ], // => uiElements: UIElement[] | null
        'StandingKneeRaiseLeft', // => detector: string
        null, // => exerciseClosure: string | null (url for a sound)
        new SMWorkoutLibrary.SMScoringParams(
          SMWorkoutLibrary.ScoringType.Time,
          0.3, // => scoreFactor: number | null
          35, // => targetTime: number | null
          null, // => targetReps: number | null
          null,
          null,
        ),
        'StandingKneeRaiseLeft', // => summaryTitle: string | null
        'Subtitle', // => summarySubTitle: string | null
        'Reps', // => summaryMainMetricTitle: string | null
        'clean reps', // => summaryMainMetricSubTitle: string | null
      ),
      new SMWorkoutLibrary.SMAssessmentExercise(
        'StandingKneeRaiseRight', // => name:string | null
        35, // => totalSeconds: number | null
        'StandingKneeRaiseRight', // => videoInstruction: string | null (url for a video)
        null, // => exerciseIntro: string | null (url for a sound)
        [
          SMWorkoutLibrary.UIElement.GaugeOfMotion,
          SMWorkoutLibrary.UIElement.Timer,
        ], // => uiElements: UIElement[] | null
        'StandingKneeRaiseRight', // => detector: string
        null, // => exerciseClosure: string | null (url for a sound)
        new SMWorkoutLibrary.SMScoringParams(
          SMWorkoutLibrary.ScoringType.Time,
          0.3, // => scoreFactor: number | null
          35, // => targetTime: number | null
          null, // => targetReps: number | null
          null,
          null,
        ),
        'StandingKneeRaiseRight', // => summaryTitle: string | null
        'Subtitle', // => summarySubTitle: string | null
        'Reps', // => summaryMainMetricTitle: string | null
        'clean reps', // => summaryMainMetricSubTitle: string | null
      ),
      new SMWorkoutLibrary.SMAssessmentExercise(
        'LungeFront', // => name:string | null
        35, // => totalSeconds: number | null
        'LungeFront', // => videoInstruction: string | null (url for a video)
        null, // => exerciseIntro: string | null (url for a sound)
        [
          SMWorkoutLibrary.UIElement.RepsCounter,
          SMWorkoutLibrary.UIElement.Timer,
        ], // => uiElements: UIElement[] | null
        'LungeFront', // => detector: string
        null, // => exerciseClosure: string | null (url for a sound)
        new SMWorkoutLibrary.SMScoringParams(
          SMWorkoutLibrary.ScoringType.Reps,
          0.3, // => scoreFactor: number | null
          null, // => targetTime: number | null
          20, // => targetReps: number | null
          null,
          null,
        ),
        'LungeFront', // => summaryTitle: string | null
        'Subtitle', // => summarySubTitle: string | null
        'Reps', // => summaryMainMetricTitle: string | null
        'clean reps', // => summaryMainMetricSubTitle: string | null
      ),
      new SMWorkoutLibrary.SMAssessmentExercise(
        'StandingObliqueCrunches', // => name:string | null
        35, // => totalSeconds: number | null
        'StandingObliqueCrunches', // => videoInstruction: string | null (url for a video)
        null, // => exerciseIntro: string | null (url for a sound)
        [
          SMWorkoutLibrary.UIElement.RepsCounter,
          SMWorkoutLibrary.UIElement.Timer,
        ], // => uiElements: UIElement[] | null
        'StandingObliqueCrunches', // => detector: string
        null, // => exerciseClosure: string | null (url for a sound)
        new SMWorkoutLibrary.SMScoringParams(
          SMWorkoutLibrary.ScoringType.Reps,
          0.3, // => scoreFactor: number | null
          null, // => targetTime: number | null
          20, // => targetReps: number | null
          null,
          null,
        ),
        'StandingObliqueCrunches', // => summaryTitle: string | null
        'Subtitle', // => summarySubTitle: string | null
        'Reps', // => summaryMainMetricTitle: string | null
        'clean reps', // => summaryMainMetricSubTitle: string | null
      ),
      new SMWorkoutLibrary.SMAssessmentExercise(
        'StandingSideBendLeft', // => name:string | null
        35, // => totalSeconds: number | null
        'StandingSideBendLeft', // => videoInstruction: string | null (url for a video)
        null, // => exerciseIntro: string | null (url for a sound)
        [
          SMWorkoutLibrary.UIElement.GaugeOfMotion,
          SMWorkoutLibrary.UIElement.Timer,
        ], // => uiElements: UIElement[] | null
        'StandingSideBendLeft', // => detector: string
        null, // => exerciseClosure: string | null (url for a sound)
        new SMWorkoutLibrary.SMScoringParams(
          SMWorkoutLibrary.ScoringType.Time,
          0.3, // => scoreFactor: number | null
          35, // => targetTime: number | null
          null, // => targetReps: number | null
          null,
          null,
        ),
        'StandingSideBendLeft', // => summaryTitle: string | null
        'Subtitle', // => summarySubTitle: string | null
        'Reps', // => summaryMainMetricTitle: string | null
        'clean reps', // => summaryMainMetricSubTitle: string | null
      ),
      new SMWorkoutLibrary.SMAssessmentExercise(
        'StandingSideBendRight', // => name:string | null
        35, // => totalSeconds: number | null
        'StandingSideBendRight', // => videoInstruction: string | null (url for a video)
        null, // => exerciseIntro: string | null (url for a sound)
        [
          SMWorkoutLibrary.UIElement.GaugeOfMotion,
          SMWorkoutLibrary.UIElement.Timer,
        ], // => uiElements: UIElement[] | null
        'StandingSideBendRight', // => detector: string
        null, // => exerciseClosure: string | null (url for a sound)
        new SMWorkoutLibrary.SMScoringParams(
          SMWorkoutLibrary.ScoringType.Time,
          0.3, // => scoreFactor: number | null
          35, // => targetTime: number | null
          null, // => targetReps: number | null
          null,
          null,
        ),
        'StandingSideBendRight', // => summaryTitle: string | null
        'Subtitle', // => summarySubTitle: string | null
        'Reps', // => summaryMainMetricTitle: string | null
        'clean reps', // => summaryMainMetricSubTitle: string | null
      ),
      new SMWorkoutLibrary.SMAssessmentExercise(
        'TuckHold', // => name:string | null
        25, // => totalSeconds: number | null
        'TuckHold', // => videoInstruction: string | null (url for a video)
        null, // => exerciseIntro: string | null (url for a sound)
        [
          SMWorkoutLibrary.UIElement.GaugeOfMotion,
          SMWorkoutLibrary.UIElement.Timer,
        ], // => uiElements: UIElement[] | null
        'TuckHold', // => detector: string
        null, // => exerciseClosure: string | null (url for a sound)
        new SMWorkoutLibrary.SMScoringParams(
          SMWorkoutLibrary.ScoringType.Time,
          0.5, // => scoreFactor: number | null
          25, // => targetTime: number | null
          null, // => targetReps: number | null
          null,
          null,
        ),
        'TuckHold', // => summaryTitle: string | null,
        'Subtitle', // => summarySubTitle: string | null,
        'timeInPosition',
        'clean reps', // => summaryMainMetricSubTitle: string | null
      ),
    ];

    var assessment = new SMWorkoutLibrary.SMWorkout(
      '50', // => id: string | null
      'demo workout', // => name: string | null
      null, // => workoutIntro: string | null (url for a sound)
      null, // => soundtrack: string | null (url for a sound)
      exercises, // => exercises: SMExercise[]
      null, // =>  getInFrame: string | null (url for a sound)
      null, // =>  bodycalFinished: string | null (url for a sound)
      null, // =>  workoutClosure: string | null (url for a sound)
    );

    /**
     * Initiates a custom assessment session.
     *
     * @param {SMWorkoutLibrary.SMWorkout} assessment - The assessment configuration for the session.
     * @param {SMWorkoutLibrary.UserData | null} userData - User data for the assessment, or `null` if no user data is provided.
     * @param {boolean} [forceShowUserDataScreen=false] - Forces the display of the user data screen even if user data is provided.
     * @param {boolean} [showSummary=true] - Determines if the summary should be shown after assessment completion.
     * @returns {Promise<{ summary: string; didFinish: boolean }>} - A promise that resolves with an object containing the summary and a flag indicating if the assessment finished.
     */
    var res = setSessionLanguge(SMWorkoutLibrary.Language.Hebrew);
    var result = await startCustomAssessment(assessment, null, true, false);
    console.log(result.summary);
    console.log(result.didFinish);
  } catch (e) {
    console.error(e);
    showAlert('Custom workout error', e + '');
  }
}

const styles = StyleSheet.create({
  sdk: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textStyle: {
    color: 'blue',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textStyleWFP: {
    color: '#007BFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonGroup: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  container: {
    flex: 1,
    padding: 120,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    height: '60%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#007BFF',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: 'red',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default App;
