# Assessment Workout Options

This document explains the various workout options available during assessments.

## EndExercisePreferences

### Explention

`EndExercisePreferences` defines how each exercise session ends.

| Preferences | Behavior
|-------------| ---------------------------------------------------------------------------------------------------------------------------------|
| Default     | The exercise session ends when the timer expires.                                                                                   |
| TargetBased | The exercise session ends when either the target is reached using targetTime for static exercises or targetReps for dynamic exercises or when the timer expires.|

### How to use

Before starting an assessment, set the exercise end preference by calling the `setEndExercisePreferences` method:

```js
import {
    setEndExercisePreferences
} from '@sency/react-native-smkit-ui';

import * as SMWorkoutLibrary from '@sency/react-native-smkit-ui/src/SMWorkout';

setEndExercisePreferences( SMWorkoutLibrary.EndExercisePreferences.TargetBased );
```

## CounterPreferences

### Explention

`CounterPreferences` determines which movement data will be tracked in the user interface.

| Preferences | Behavior
|-------------| ---------------------------------------------------------------------------------------------------------------------------------|
| Default     | All movements are counted.                                                                                                    |
| PerfectOnly | Only movements performed perfectly are counted.                                                                                     |

### How to use

Before starting an assessment, set the counter preference by calling the `setCounterPreferences` method:

```js
import {
    setCounterPreferences
} from '@sency/react-native-smkit-ui';

import * as SMWorkoutLibrary from '@sency/react-native-smkit-ui/src/SMWorkout';

setCounterPreferences( SMWorkoutLibrary.CounterPreferences.PerfectOnly );
```
