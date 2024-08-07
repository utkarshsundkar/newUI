# Android Setup

In order to integrate SMKitUI you need to import the smkitui dependency
Add on project level `build.gradle`:
 ```groovy
allprojects {
  repositories {
    google()
    jcenter()
    maven {
      url "${artifactory_contentUrl}"
    }
  }
}
```
#### Import SMKitUI and exclude FBJNI - ⚠️ do not skip this step
In order to use SMKitUI RN Bridge we need to import smkitui on app level `build.gradle`. 
Also both React Native and SMKitUI use **fbjni**.
Therefore we need to exclude fbjni while importing`:

 ```groovy
dependencies {
  implementation("com.sency.smkitui:smkitui:$latest_version") {
      exclude group: 'com.facebook.fbjni', module: 'fbjni-java-only'
  }
}
```

Inside `gradle.properties` insert those global properties:
```groovy
artifactory_contentUrl = https://artifacts.sency.ai/artifactory/release
```
