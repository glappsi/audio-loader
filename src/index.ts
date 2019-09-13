import xhrIntercept from './interceptors/xhr';
import fetchIntercept from './interceptors/fetch';
import { Playlist } from './models/playlist';
import { IOptions } from './models/options';
import { show, hide } from './visualization/progress-bar';

export function AudioLoader(
  sources: string[],
  options: IOptions = {
    withVisualization: true,
    oneSoundPerRequest: false,
    withProgressBar: false
  }
) {
  const playlist = new Playlist(sources, options);
  const start = () => {
    if (options.withProgressBar) {
      show();
    }
    playlist.play();
  };
  const end = () => {
    if (options.withProgressBar) {
      hide();
    }
    playlist.pause();
  };

  xhrIntercept(start, end);
  fetchIntercept(start, end);
}

export const DISABLE_HEADER = 'X-AUDIO-LOADER-OFF';
