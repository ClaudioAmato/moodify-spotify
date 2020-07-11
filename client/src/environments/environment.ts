// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: 'AIzaSyCVgFEGlKlplMr_D_dU1uOQwcF3GS08IMw',
    authDomain: 'moodify-spotify.firebaseapp.com',
    databaseURL: 'https://moodify-spotify.firebaseio.com',
    projectId: 'moodify-spotify',
    storageBucket: 'moodify-spotify.appspot.com',
    messagingSenderId: '303921443720',
    appId: '1:303921443720:web:b359c0f50f49bcaea1803d',
    measurementId: 'G-EE0FP6L4F2'
  }
};

export const keyToken = 'token';
export const keyRefreshToken = 'refreshToken';
export const keyPreviousDay = 'previousDay';
export const keyExpirationToken = 'expirationToken';
export const keyCurrentMood = 'currentMood';
export const keyTargetMood = 'targetMood';
export const keyUserProfile = 'userProfile';

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
