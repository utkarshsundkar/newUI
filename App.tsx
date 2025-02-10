import {useState, useEffect} from 'react';

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
          '', //Closure Failed Sound
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
    var successSound =
      'https://cdn.pixabay.com/download/audio/2024/07/04/audio_5fd8f48411.mp3?filename=success-221935.mp3';
    var failedSound =
      'https://cdn.pixabay.com/download/audio/2024/12/20/audio_9ce4f6c763.mp3?filename=cartoon-fail-trumpet-278822.mp3';

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
        failedSound, // closureFailedSound
        'SquatRegular',
        'Subtitle',
        'Reps',
        'clean reps',
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
        failedSound, // closureFailedSound
        'LungeFront',
        'Subtitle',
        'Reps',
        'clean reps',
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
        failedSound, // closureFailedSound
        'HighKnees',
        'Subtitle',
        'Reps',
        'clean reps',
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
        failedSound, // closureFailedSound
        'SquatRegularOverheadStatic',
        'Subtitle',
        'Time',
        'seconds held',
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
        failedSound, // closureFailedSound
        'PlankHighStatic',
        'Subtitle',
        'Time',
        'seconds held',
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
        failedSound, // closureFailedSound
        'PlankHighStatic',
        'Subtitle',
        'Time',
        'seconds held',
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

    setEndExercisePreferences(
      SMWorkoutLibrary.EndExercisePreferences.TargetBased,
    );
    setCounterPreferences(SMWorkoutLibrary.CounterPreferences.PerfectOnly);

    /**
     * Initiates a custom assessment session.
     *
     * @param {SMWorkoutLibrary.SMWorkout} assessment - The assessment configuration for the session.
     * @param {SMWorkoutLibrary.UserData | null} userData - User data for the assessment, or `null` if no user data is provided.
     * @param {boolean} [forceShowUserDataScreen=false] - Forces the display of the user data screen even if user data is provided.
     * @param {boolean} [showSummary=true] - Determines if the summary should be shown after assessment completion.
     * @returns {Promise<{ summary: string; didFinish: boolean }>} - A promise that resolves with an object containing the summary and a flag indicating if the assessment finished.
     */
    var res = setSessionLanguage(SMWorkoutLibrary.Language.Hebrew);
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
