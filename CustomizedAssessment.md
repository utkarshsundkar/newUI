# Customized Assessmet

> The customized assessment enables you to create a personalized evaluation using the exercises and movements from our [Movement catalog](https://github.com/sency-ai/smkit-sdk/blob/main/SDK-Movement-Catalog.md), tailored to your professional standards or personal preferences.


Import the sdk and it's main functions
```js
import { startAssessment, startCustomWorkout, AssessmentTypes, startWorkoutProgram } from '@sency/react-native-smkit-ui/src/index.tsx';
import * as SMWorkoutLibrary from '@sency/react-native-smkit-ui/src/SMWorkout.tsx';
```

### Start Customized Assessment
**startAssessment** starts Sency's assessments with custom exercises.

```js
try{
    // list of exercies
    var exercises = [
    new SMWorkoutLibrary.SMAssessmentExercise(
        'First Exercise', // => name:string | null
        35, // => totalSeconds: number | null
        'HighKnees', // => videoInstruction: string | null (url for a video)
        null, // => exerciseIntro: string | null (url for a sound)
        [
            SMWorkoutLibrary.UIElement.RepsCounter,
            SMWorkoutLibrary.UIElement.Timer,
        ], // => uiElements: UIElement[] | null
        'HighKnees', // => detector: string
        null, // => exerciseClosure: string | null (url for a sound) **Note** in Android pass empty string instead of null
        new SMWorkoutLibrary.SMScoringParams(
            SMWorkoutLibrary.ScoringType.Reps,
            0.3, // => scoreFactor: number | null
            null, // => targetTime: number | null
            20, // => targetReps: number | null
            null,
            null
        ),
        'HighKnees', // => summaryTitle: string | null
        'Subtitle', // => summarySubTitle: string | null
        'Reps', // => summaryMainMetricTitle: string | null
        'clean reps', // => summaryMainMetricSubTitle: string | null
    ),
    new SMWorkoutLibrary.SMAssessmentExercise(
        'Second Exercise', // => name:string | null
        25, // => totalSeconds: number | null
        'SquatRegularOverheadStatic', // => videoInstruction: string | null (url for a video)
        null, // => exerciseIntro: string | null (url for a sound)
        [
            SMWorkoutLibrary.UIElement.GaugeOfMotion,
            SMWorkoutLibrary.UIElement.Timer,
        ], // => uiElements: UIElement[] | null
        'SquatRegularOverheadStatic', // => detector: string
        null, // => exerciseClosure: string | null (url for a sound) **Note** in Android pass empty string instead of null
        new SMWorkoutLibrary.SMScoringParams(
            SMWorkoutLibrary.ScoringType.Time,
            0.5, // => scoreFactor: number | null
            10, // => targetTime: number | null
            null, // => targetReps: number | null
            null,
            null
          ),
        "SquatRegularOverheadStatic", // => summaryTitle: string | null,
        "Subtitle", // => summarySubTitle: string | null,
        "timeInPosition",
        ),
    ];
    var assessment = new SMWorkoutLibrary.SMWorkout(
        "50", // => id: string | null
        "demo workout",// => name: string | null
        null, // => workoutIntro: string | null (url for a sound)
        null, // => soundtrack: string | null (url for a sound)
        exercises, // => exercises: SMExercise[]
        null, // =>  getInFrame: string | null (url for a sound)
        null, // =>  bodycalFinished: string | null (url for a sound)
        null // =>  workoutClosure: string | null (url for a sound)
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
    
    var result = await startCustomAssessment(
        assessment, 
        null, // => userData: SMWorkoutLibrary.UserData | null
        true, // => forceShowUserDataScreen: boolean
        true // => showSummary: boolean
    );
    console.log(result.summary);
    console.log(result.didFinish);
}catch(e){
    console.error(e);
    showAlert("Custom workout error", e + "");
}
```
