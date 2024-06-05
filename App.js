import React, { useState } from 'react';
import { View, Text, requireNativeComponent, StyleSheet, Pressable} from 'react-native';
import { configure, startAssessment, startCustomWorkout, AssessmentTypes, startWorkoutProgram } from '@sency/react-native-smkit-ui-dev/src/index.tsx';
import SMKitUI from '@sency/react-native-smkit-ui-dev/src/SMKitUIView.tsx';
import * as SMWorkoutLibrary from '@sency/react-native-smkit-ui-dev/src/SMWorkout.tsx';

const App = () => {
  const [didConfig, setDidConfig] = useState(false);

  return (
    <View style={styles.centeredView}>
    <SMKitUI/>
      <Pressable
        style={[styles.button]}
        onPress={() => configureSMKitUI()}>
        <Text style={styles.textStyle}>Configure</Text>
      </Pressable>
      {didConfig && (
        <View>
        <Pressable
          style={[styles.button]}
          onPress={() => startFitnessAssessment()}>
          <Text style={styles.textStyle}>Start Assessment</Text>
        </Pressable>

        <Pressable
          style={[styles.button]}
          onPress={() => startSMKitUICustomWorkout()}>
          <Text style={styles.textStyle}>Start startCustomWorkout</Text>
        </Pressable>
        </View>
      )}
    </View>
  );

  async function configureSMKitUI(){
    try{
      var res = await configure("YOUR_AUTH_KEY");
      console.log("DONE config");
      setDidConfig(true);
    }catch (e) {
      console.error(e);
    }
  }

  async function startFitnessAssessment(){
    try{
      var result = await startAssessment(AssessmentTypes.Fitness, true); // => type: SMWorkoutLibrary.AssessmentTypes, showSummary:boolean
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
          13, // => targetReps: number | null
          20, // => targetTime: number | null
          0.3 // => scoreFactor: number | null
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
          null, // => targetReps: number | null
          20, // => targetTime: number | null
          0.3 // => scoreFactor: number | null
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
    borderColor: "black",
    borderWidth: 1,
    margin: 5
  },
  textStyle: {
    color: 'black',
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