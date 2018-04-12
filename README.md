# recreate [![Build Status](https://travis-ci.org/agrc/recreate.svg?branch=master)](https://travis-ci.org/agrc/recreate)
React native app for recreation locations

## Development
This project was bootstrapped with [react-native-cli](https://github.com/facebook/react-native).

Run project in simulators:  
`react-native run-ios` && `react-native run-android`

Note: Android emulator needs to be started manually.

Run project in production:  
`react-native run-ios --configuration Release`

Run project on connected device:  
`react-native run-ios --device`  
**Note:** Running this command requires [this change](https://github.com/facebook/react-native/pull/17983/files) in the react-native package. This needs to be done manually in `node_modules` until `v0.55` is cut.

Lint (via eslint):
`npm run lint`  

### Deployment Steps
1. Bump version number in `package.json`, `ios/RecreateNative/Info.plist`, and `android/app/build.gradle`.

## Useful Tools
[`react-native-debugger`](https://github.com/jhen0409/react-native-debugger)

`⌘D` (iOS) & `⌘M` (Android) open the developer menu within the app. This can be used to enable live reload and remote debugging.

List of native-base icons: https://oblador.github.io/react-native-vector-icons/
