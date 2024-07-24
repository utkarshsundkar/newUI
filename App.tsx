import React, { useState, useEffect } from 'react';
import { View, Text, requireNativeComponent, StyleSheet, Pressable, ActivityIndicator, Alert} from 'react-native';
import { configure, startAssessment, startCustomWorkout, AssessmentTypes, startWorkoutProgram } from '@sency/react-native-smkit-ui/src/index';
import * as SMWorkoutLibrary from '@sency/react-native-smkit-ui/src/SMWorkout';

const App = () => {
  const [didConfig, setDidConfig] = useState(false);
  const [isLoading, setisLoading] = useState(false);

  useEffect(() => {
    configureSMKitUI();
  }, []);

  return (
    <View style={styles.centeredView}>
      {isLoading && (
        <ActivityIndicator size="large" color="#0000ff" />
      )}
        <View>
        <Pressable
          disabled={!didConfig}
          style={[styles.button]}
          onPress={() => startAssessmentSession(SMWorkoutLibrary.AssessmentTypes.Fitness, true, null)}>
          <Text style={styles.textStyle}>Start Assessment</Text>
        </Pressable>

        <Pressable
          disabled={!didConfig}
          style={[styles.button]}
          onPress={() => startAssessmentSession(SMWorkoutLibrary.AssessmentTypes.Custom, true, "YOUR_CUSTOM_ASSESSMENT")}>
          <Text style={styles.textStyle}>Start Custom Assessment</Text>
        </Pressable>

        <Pressable
          disabled={!didConfig}
          style={[styles.button]}
          onPress={() => startSMKitUICustomWorkout()}>
          <Text style={styles.textStyle}>Start startCustomWorkout</Text>
        </Pressable>
        </View>
    </View>
  );

  async function configureSMKitUI(){
    setisLoading(true);
    try{
      var res = await configure("YOUR_AUTH_KEY");
      setisLoading(false);
      setDidConfig(true);
    }catch (e) {
      setisLoading(false);
      Alert.alert("Configure Failed"),
      "",
      [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
    }
  }

  async function startAssessmentSession(
    type: SMWorkoutLibrary.AssessmentTypes, // => The type of assessment, which can be either AssessmentTypes.Fitness or AssessmentTypes.Custom.
    showSummary: boolean, // => Determines whether the summary screen will be presented at the end of the exercise.
    customAssessmentID: string, // If you have more than one custom assessment, use the customAssessmentID to specify which one to call, if not please use null.
  ) {
    try {
      var result = await startAssessment(type, showSummary, customAssessmentID);
      console.log(result.summary);
      console.log(result.didFinish);
    }catch(e) {
      console.error(e);
    }
  }

  async function startSMKitUICustomWorkout(){
    try{
      // list of exercies
      var exercises = [
        new SMWorkoutLibrary.SMExercise(
          "First Exercise", // => name:string | null
          35, // => totalSeconds: number | null
          5, // => introSeconds: number | null
          null, // => videoInstruction: string | null (url for a video)
          null, // => exerciseIntro: string | null (url for a sound)
          [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], // => uiElements: UIElement[] | null
          "HighKnees", // => detector: string
          true, // => repBased: boolean | null
          null, // => exerciseClosure: string | null (url for a sound)
          new SMWorkoutLibrary.SMScoringParams("", 0, 0, 0, "", null)
        ),
        new SMWorkoutLibrary.SMExercise(
          "Second Exercise", // => name:string | null
          25, // => totalSeconds: number | null
          5, // => introSeconds: number | null
          null, // => videoInstruction: string | null (url for a video)
          null, // => exerciseIntro: string | null (url for a sound)
          [SMWorkoutLibrary.UIElement.GaugeOfMotion, SMWorkoutLibrary.UIElement.Timer], // => uiElements: UIElement[] | null
          "SquatRegularOverheadStatic", // => detector: string
          false, // => repBased: boolean | null
          null, // => exerciseClosure: string | null (url for a sound)
          new SMWorkoutLibrary.SMScoringParams("", 0, 0, 0, "", null)
        ),
      ];
  
      var workout = new SMWorkoutLibrary.SMWorkout(
        "50", // => id: string | null
        "demo workout",// => name: string | null
        null, // => workoutIntro: string | null (url for a sound)
        null, // => soundtrack: string | null (url for a sound)
        exercises, // => exercises: SMExercise[]
        null, // =>  getInFrame: string | null (url for a sound)
        null, // =>  bodycalFinished: string | null (url for a sound)
        null // =>  workoutClosure: string | null (url for a sound)
        );
      var result = await startCustomWorkout(workout);
      console.log(result.summary);
      console.log(result.didFinish);
    }catch(e){
      console.error(e);
      showAlert("Custom workout error", e + "");
    }
  }

  async function startSMKitUIProgram(){
    try{
      //WorkoutConfig
      var config = new SMWorkoutLibrary.WorkoutConfig(
        3, // => week: number
        SMWorkoutLibrary.BodyZone.FullBody, // => bodyZone: BodyZone
        SMWorkoutLibrary.WorkoutDifficulty.HighDifficulty, // => difficultyLevel: WorkoutDifficulty
        SMWorkoutLibrary.WorkoutDuration.Short, // =>   workoutDuration: WorkoutDuration
        "YOUR_PROGRAM_ID" // =>   programID: string
      );
      var result = await startWorkoutProgram(config);
      console.log(result.summary);
      console.log(result.didFinish);
    }catch(e){
      console.error(e);
    }
  }

  function showAlert(title: string, massege: string){
    Alert.alert(title, massege, [
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
  }
}

const styles = StyleSheet.create({
  sdk:{
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  button: {
    padding: 10,
    elevation: 2,
    borderColor: "blue",
    borderWidth: 1,
    margin: 5
  },
  textStyle: {
    color: 'blue',
    fontWeight: 'bold',
    textAlign: 'center',
  },
    centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
});

export default App;
