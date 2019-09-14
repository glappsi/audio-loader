# audio-loader
Start songs/sounds while performing a request. With audio visualization (opt out).

You just have to tell the lib which sounds it should use and then you are good to go.

## Demo

Have a look at the [DEMO](https://glappsi.github.io/audio-loader/).

## Installation
```
npm i --save @aurally/audio-loader
```

## Usage
Call it once, at the start of your application
```
import { AudioLoader } from '@aurally/audio-loader';
AudioLoader(['assets/loading.mp3'], <options>);
```

This will intercept all XHR and fetch requests. The given playlist will be played at the start of
every request. When the requests ends (if success or fail does not matter), it stops.

### But there is more!
You can also see a wonderful wave audio visalization at the bottom, visualizing the sound/song you ware currently hearing.
This behaviour is default, but opt-out-able.
Also the lib can add a loading bar to the top (in matching colors/design to the wave animation), which is disabled by default.

## Options
```
export interface IOptions {
  withVisualization: boolean;
  oneSoundPerRequest: boolean;
  withLoadingBar: boolean;
  colors?: {
    primary: string;
    secondary: string;
    wave?: {
      shadow: string;
      accent: string;
    };
  };
}
```

| property       | explanation    |
| ------------- | ---------- |
| withVisualization | enables/disables the wave animation |
| oneSoundPerRequest   | does not pauses the current sound after the request finished.<br>plays it till it ends. Does not start a new sound after. |
| withLoadingBar | enables/disables the loading bar |
| colors | lets you set the wave animation/ loading bar colors.<br>primary will be used for both, loading bar and wave.<br> secondary and wave is wave only |

## Disable for specific request
If you want to disable this library for specific requests, just import the `DISABLE_HEADER` and set any value to it.

## Dev
Start with
```
npm run start
```

Serve with (install `npm i -g http-server` first)
```
http-server .
```

Now its available at `localhost:8080`