import { AudioLoader } from './src/index';
AudioLoader(['assets/loading.mp3'], {
  withVisualization: true,
  oneSoundPerRequest: false,
  withLoadingBar: true,
  colors: {
    primary: '#f77925',
    secondary: '#ffd147',
    wave: {
      shadow: '#ff8c00',
      accent: '#ffda91'
    }
  }
});
