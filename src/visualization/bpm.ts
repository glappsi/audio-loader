import { DISABLE_HEADER } from '..';

const OfflineAudioContext =
  (window as any).OfflineAudioContext ||
  (window as any).webkitOfflineAudioContext;
let offlineContext: OfflineAudioContext;
let offlineSource: AudioBufferSourceNode;
if (!OfflineAudioContext) {
  console.warn('AUDIO LOGGER VISUALIZATION: no audio web api support');
} else {
  offlineContext = new OfflineAudioContext(2, 30 * 44100, 44100);
  offlineSource = offlineContext.createBufferSource();

  // Beats generally occur around the 100 to 150 hz range.
  let lowpass = offlineContext.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.setValueAtTime(150, 0);
  lowpass.Q.setValueAtTime(1, 0);

  offlineSource.connect(lowpass);

  let highpass = offlineContext.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.setValueAtTime(100, 0);
  highpass.Q.setValueAtTime(1, 0);
  lowpass.connect(highpass);
  highpass.connect(offlineContext.destination);
}

function _getBPM(data: any): number {
  let partSize = 22050,
    parts = data[0].length / partSize,
    peaks: any[] = [];

  for (let i = 0; i < parts; i++) {
    let max: any = 0;
    for (let j = i * partSize; j < (i + 1) * partSize; j++) {
      let volume = Math.max(Math.abs(data[0][j]), Math.abs(data[1][j]));
      if (!max || volume > max.volume) {
        max = {
          position: j,
          volume: volume
        };
      }
    }
    peaks.push(max);
  }

  peaks.sort((a, b) => {
    return b.volume - a.volume;
  });
  peaks = peaks.splice(0, peaks.length * 0.5);
  peaks.sort((a, b) => {
    return a.position - b.position;
  });

  let groups: any[] = [];
  peaks.forEach((peak, index) => {
    for (let i = 1; index + i < peaks.length && i < 10; i++) {
      let group = {
        bpm: (60 * 44100) / (peaks[index + i].position - peak.position),
        count: 1
      };

      while (group.bpm < 90) {
        group.bpm *= 2;
      }

      while (group.bpm > 180) {
        group.bpm /= 2;
      }

      group.bpm = Math.round(group.bpm);

      if (
        !groups.some(interval => {
          return interval.bpm === group.bpm ? interval.count++ : 0;
        })
      ) {
        groups.push(group);
      }
    }
  });

  let bpm = groups.sort((intA, intB) => {
    return intB.count - intA.count;
  })[0].bpm;

  return bpm;
}

export default (filePath: string) => {
  if (!OfflineAudioContext) {
    return Promise.reject('no audio context');
  }

  var request = new XMLHttpRequest();
  request.open('GET', filePath, true);
  request.setRequestHeader(DISABLE_HEADER, 'yoman');
  request.responseType = 'arraybuffer';
  request.send();
  return new Promise((resolve, reject) => {
    request.onload = () => {
      // Preprocess buffer for bpm
      offlineContext.decodeAudioData(request.response, buffer => {
        offlineSource.buffer = buffer;
        offlineSource.start(0);
        offlineContext.startRendering();
      });

      offlineContext.oncomplete = e => {
        let buffer = e.renderedBuffer;
        const bpm = _getBPM([
          buffer.getChannelData(0),
          buffer.getChannelData(1)
        ]);

        resolve(bpm);
      };
    };

    request.onerror = () => reject();
  });
};
