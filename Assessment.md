# Assessment

> Sency offers two primary types of assessments: Sency Blueprint assessments and Customized assessments.

> **Sency Blueprint Assessments:** Developed in collaboration with Sency’s medical and fitness experts, these assessments provide a standardized, professional way to measure core aspects of movement, fitness, and a healthy lifestyle. Simply follow the "start assessment" instructions and select the [type of assessment](#assessment-types) you need.

> **Sency Customized Assessments:** For those who prefer to build their own assessments, you can create a customized evaluation using the exercises and movements from our movement catalog, according to your specific requirements (check the CustomizedAssessment.md file for more info).

> To see all Assessment workout options, please refer to [Assessment Workout Options](https://github.com/sency-ai/smkit-ui-react-native-demo/blob/main/Assessment-Workout-Options.md)

```js
import {
  startAssessment,
  startCustomWorkout,
  AssessmentTypes,
  startWorkoutProgram,
} from '@sency/react-native-smkit-ui/src/index.tsx';
import * as SMWorkoutLibrary from '@sency/react-native-smkit-ui/src/SMWorkout.tsx';
```

### Run Assessment

**startAssessment** starts one of Sency's blueprint assessments.
You can select the assessment `type` by setting the type to any value from the `AssessmentTypes` enum.

```js
async function startAssessmentSession(
  type: AssessmentTypes, // => The type of assessment, which can be either AssessmentTypes.Fitness or AssessmentTypes.Custom.
  showSummary: boolean, // => Determines whether the summary screen will be presented at the end of the exercise.
  customAssessmentID: string, // If you have more than one custom assessment, use the customAssessmentID to specify which one to call, if not please use null.
) {
  try {
    var userData = new SMWorkoutLibrary.UserData(
      SMWorkoutLibrary.Gender.Female,
      27,
    );

    /**
     * start an assessment session.
     *
     * @param {SMWorkoutLibrary.AssessmentTypes} type - The type of assessment to start.
     * @param {boolean} [showSummary=true] - Determines if the summary should be shown after assessment completion.
     * @param {SMWorkoutLibrary.UserData | null} userData - User data for the assessment session, or `null` if no user data is provided.
     * @param {boolean} [forceShowUserDataScreen=false] - Forces the display of the user data screen even if user data is provided.
     * @param {string} customAssessmentID - A unique identifier for a custom assessment session.
     * @returns {Promise<{ summary: string; didFinish: boolean }>} - A promise that resolves with an object containing the summary and a flag indicating whether the assessment finished.
     */
    var result = await startAssessment(
      type,
      showSummary,
      userData,
      false,
      customAssessmentID,
    );
    console.log(result.summary); // Summary payload of the assessment
    console.log(result.didFinish); // If the assessment ended manually ? true : false
  } catch (e) {
    console.error(e);
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

### Blueprint AssessmentTypes <a name="assessment-types"></a>

| Name (enum) | Description                                                                                                                                                                    | More info                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Fitness     | For individuals of any activity level who seek to enhance their physical abilities, strength, and endurance through a tailored plan.                                           | [Link](https://github.com/sency-ai/smkit-sdk/blob/main/Assessments/AI-Fitness-Assessment.md) |
| Body360     | Designed for individuals of any age and activity level, this assessment determines the need for a preventative plan or medical support.                                        | [Link](https://github.com/sency-ai/smkit-sdk/blob/main/Assessments/360-Body-Assessment.md)   |
| Strength    | For individuals of any activity level who seek to assess their strength capabilities (core and endurance) \* This assessment will be available soon. Contact us for more info. | [Link](https://github.com/sency-ai/smkit-sdk/blob/main/Assessments/Strength.md)              |
| Cardio      | For individuals of any activity level who seek to assess their cardiovascular capabilities \* This assessment will be available soon. Contact us for more info.                | [Link](https://github.com/sency-ai/smkit-sdk/blob/main/Assessments/Cardio.md)                |
| Custom      | If Sency created a tailored assessment for you, you probably know it, and you should use this enum.                                                                            |                                                                                              |
