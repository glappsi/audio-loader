import xhrIntercept from './interceptors/xhr';
import fetchIntercept from './interceptors/fetch';
import { Playlist } from './models/playlist';
import { IOptions } from './models/options';

export function AudioLoader(
  sources: string[],
  options: IOptions = { withVisualization: true }
) {
  const playlist = new Playlist(sources, options);
  const start = () => playlist.play();
  const end = () => playlist.pause();

  xhrIntercept(start, end);
  fetchIntercept(start, end);
}

export const DISABLE_HEADER = 'X-AUDIO-LOADER-OFF';
