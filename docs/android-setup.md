# Android Setup

In order to integrate SMKitUI you need your app to target minSdk 26
Add on project level `build.gradle`:

```groovy
buildscript {
    ext {
        minSdkVersion = 26
    }
}
```

Add on project level build.gradle:

```groovy
allprojects {
    maven {
        url "https://artifacts.sency.ai/artifactory/release/"
    }
}
```
