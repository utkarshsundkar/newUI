# [react-native-smkit-ui demo](https://github.com/sency-ai/smkit-sdk)

1. [ Installation ](#inst)
2. [ Setup ](#setup)
3. [ Configure ](#conf)
4. [ Start ](#start)
5. [ Data ](#data)

<a name="inst"></a>
## 1. Installation
1. run `npm install @sency/react-native-smkit-ui`

2. Update *Podfile* in `iOS` folder:
```
[1] add the source to the top of your Podfile.
source 'https://bitbucket.org/sency-ios/sency_ios_sdk.git'
source 'https://github.com/CocoaPods/Specs.git'

[2] add use_frameworks! commend to your target
target 'YOUR_TARGET' do
  use_frameworks!
```

3. Run `NO_FLIPPER=1 pod install` to install the necessary pods.

## 2. Setup <a name="setup"></a>

### iOS
Add camera permission request to `Info.plist`
```Xml
<key>NSCameraUsageDescription</key>
<string>Camera access is needed</string>
```

### Android
In order to integrate SMKitUI you need to import the smkitui dependency
Add on project level build.gradle:
 ```
allprojects {
  repositories {
    ...
    maven {
      url "${artifactory_contentUrl}"
      credentials {
        username = "${artifactory_user}"
        password = "${artifactory_password}"
      }
    }
  }
}
```

#### FBJNI

Both React Native and SencyMotion use **fbjni**. For example, the versions for SMKitUI that are used for
development are:

React Native (<= 0.64) uses fbjni **0.0.2**
SMKitUI uses fbjni **0.2.2**.
Therefore we need to exclude fbjbi on app level build.gradle:
 ```
dependencies {
  ...
  implementation("com.sency.smkitui:smkitui:${SMKitUI_Version}") {
    exclude group: 'com.facebook.fbjni', module: 'fbjni-java-only'
  }
  ...
}
```

## 3. Configure <a name="conf"></a>

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

## 4. Start <a name="start"></a>

1. Import the sdk
```js
import { startAssessment, startCustomWorkout, AssessmentTypes } from '@sency/react-native-smkit-ui-dev/src/index.tsx';
import SMKitUI from '@sency/react-native-smkit-ui-dev/src/SMKitUIView.tsx';
import * as SMWorkoutLibrary from '@sency/react-native-smkit-ui-dev/src/SMWorkout.tsx';
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
async function startFitnessAssessment(){
  try{
    var result = await startAssessment(AssessmentTypes.Fitness);
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
