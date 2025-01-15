# Workout From Program

> The Workout from Program enables you to run Sency's predefiend workouts. thoose are tailored for specific clients. If you didn't contanct us about your needs this page workout is not for you.

> A sample payload would look like this: [Payload](https://github.com/sency-ai/smkit-ui-react-native-demo/blob/main/Resources/program_summary_payload.json)

Import the sdk and it's main functions

```js
import {
  startAssessment,
  startCustomWorkout,
  AssessmentTypes,
  startWorkoutProgram,
} from '@sency/react-native-smkit-ui/src/index.tsx';
import * as SMWorkoutLibrary from '@sency/react-native-smkit-ui/src/SMWorkout.tsx';
```

### Start Workout From Program

**Build Config** in order to starts a workout from program, you need configuration:

```js
const config = new SMWorkoutLibrary.WorkoutConfig(
  6, // Week Number | number
  SMWorkoutLibrary.BodyZone.FullBody, // BodyZone | SMWorkoutLibrary.BodyZone
  SMWorkoutLibrary.WorkoutDifficulty.HighDifficulty, // Difficulty | SMWorkoutLibrary.WorkoutDifficulty
  SMWorkoutLibrary.WorkoutDuration.Long, // Duration | SMWorkoutLibrary.WorkoutDuration
  SMWorkoutLibrary.Language.English, // Langauge of the UI. Currently Supporting: EN & HE.
  'YOUR_PROGRAM_ID', // Program ID | String
);
```

**startWorkout** starts a workout from program.

```js
async function startWorkoutProgramSession() {
  try {
    var result = await startWorkoutProgram(config);
    console.log(result.summary);
    console.log(result.didFinish);
  } catch (e) {
    Alert.alert('Unable to start assessment'),
      '',
      [{text: 'OK', onPress: () => console.log('OK Pressed')}];
  }
}
```

**You can also Listen to Assessment's Callbacks**
if you want you can also recieve callbacks from our SDK:
** ⚠️ Currently available in Android **

```js
useEffect(() => {
  const didExitWorkoutSubscription = DeviceEventEmitter.addListener(
    'didExitWorkout',
    params => {
      console.log(
        'Received didExitWorkout event with message:',
        params.summary,
      );
    },
  );

  const workoutDidFinishSubscription = DeviceEventEmitter.addListener(
    'workoutDidFinish',
    params => {
      console.log(
        'Received workoutDidFinish event with message:',
        params.summary,
      );
    },
  );

  const workoutErrorSubscription = DeviceEventEmitter.addListener(
    'workoutError',
    params => {
      console.log('Received workoutError event with message:', params.error);
    },
  );

  const exerciseDidFinishSubscription = DeviceEventEmitter.addListener(
    'exerciseDidFinish',
    params => {
      console.log(
        'Received exerciseDidFinish event with message:',
        params.data,
      );
    },
  );

  // Clean up subscription
  return () => {
    didExitWorkoutSubscription.remove();
    workoutDidFinishSubscription.remove();
    workoutErrorSubscription.remove();
    exerciseDidFinishSubscription.remove();
  };
}, []);
```
