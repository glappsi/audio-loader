import xhrIntercept from './interceptors/xhr';
import fetchIntercept from './interceptors/fetch';
import { Playlist } from './models/playlist';
import { IOptions } from './models/options';
import { show, hide } from './visualization/loading-bar';

export function AudioLoader(
  sources: string[],
  options: IOptions = {
    withVisualization: true,
    oneSoundPerRequest: false,
    withLoadingBar: false
  }
) {
  const playlist = new Playlist(sources, options);
  let requestsCount = 0;
  const start = () => {
    // just start this for the first request
    if (requestsCount === 0) {
      if (options.withLoadingBar) {
        show(options.colors || {});
      }
      playlist.play();
    }
    requestsCount++;
  };
  const end = () => {
    requestsCount--;
    // if this counter is above zero, there are multiple requests pending
    // wait for all of them to finish
    if (requestsCount > 0) {
      return;
    }

    if (options.withLoadingBar) {
      hide();
    }
    playlist.pause();
  };

  xhrIntercept(start, end);
  fetchIntercept(start, end);
}

export const DISABLE_HEADER = 'X-AUDIO-LOADER-OFF';

export * from './models/options';
