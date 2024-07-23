# [react-native-smkit-ui demo](https://github.com/sency-ai/smkit-sdk)

1. [ Installation ](#inst)
2. [ Setup ](#setup)
3. [ API ](#api)
5. [ Data ](#data)

<a name="inst"></a>
## 1. Installation
run `npm install @sency/react-native-smkit-ui`



## 2. Setup <a name="setup"></a>
* [iOS](https://github.com/sency-ai/smkit-ui-react-native-demo/blob/main/docs/ios-setup.md)
* [Android](https://github.com/sency-ai/smkit-ui-react-native-demo/blob/main/docs/android-setup.md)

## API<a name="api"></a>
### 1. Configure <a name="conf"></a>

```js
[1] First import configure
import { configure } from '@sency/react-native-smkit-ui-dev/src/index.tsx';

[2] then call the configure function with your auth key
try{
  var res = await configure("YOUR_AUTH_KEY");
 }catch (e) {
  console.error(e);
}
```

To reduce wait time we recommend to call `configure` on app launch.

**⚠️ smkit_ui_library will not work if you don't first call configure.**

## 2. Start <a name="start"></a>

1. Import the sdk
```js
import { startAssessment, startCustomWorkout, AssessmentTypes } from '@sency/react-native-smkit-ui/src/index.tsx';
import SMKitUI from '@sency/react-native-smkit-ui/src/SMKitUIView.tsx';
import * as SMWorkoutLibrary from '@sency/react-native-smkit-ui/src/SMWorkout.tsx';
```

2. Add `SMKitUI` view:
```js
return (
  <View style={styles.centeredView}>
    <SMKitUI/>
  </View>
);
```

#### [Start Assessment](https://github.com/sency-ai/smkit-sdk/blob/main/AI-Fitness-Assessment.md)
**startAssessment** starts one of Sency's blueprint assessments. 
```js
async function startAssessmentSession(
    type: AssessmentTypes, // => The type of assessment, which can be either AssessmentTypes.Fitness or AssessmentTypes.Custom.
    showSummary: boolean, // => Determines whether the summary screen will be presented at the end of the exercise.
    customAssessmentID: string, // If you have more than one custom assessment, use the customAssessmentID to specify which one to call, if not please use null.
  ){
    try{
    var result = await startAssessment(type, showSummary, customAssessmentID);
    console.log(result.summary);
    console.log(result.didFinish);
  }catch(e) {
    console.error(e);
  }
}
```
> Check out [this info page](https://github.com/sency-ai/smkit-sdk/blob/main/AI-Fitness-Assessment.md) if you want to learn more about **Sency's AI Fitness Assessment**

### Start Custom Workout
**startWorkout** starts a custom workout.
```js
async function startSMKitUICustomWorkout(){
  try{
    // list of exercies
    var exercises = [
      new SMWorkoutLibrary.SMExercise(
        name: "First Exercise", // => name:string | null
        35,                     // => totalSeconds: number | null
        5,                      // => introSeconds: number | null
        null,                   // => videoInstruction: string | null (url for a video)
        null,                   // => exerciseIntro: string | null (url for a sound)
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
```

### Start Program
**startWorkoutProgram** starts a workout program according to your WorkoutConfig.
```js
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
```

## Available Data Types <a name="data"></a>
#### `AssessmentTypes`
| Name                |
|---------------------|
| Fitness             |
| Custom              |

Having issues? [Contact us](mailto:support@sency.ai) and let us know what the problem is.
