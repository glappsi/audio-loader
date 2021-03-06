import { Howl, Howler } from 'howler';
import { IOptions } from './options';
import calculateBpm from '../visualization/bpm';
import { CircularAudioWave } from '../visualization/circular-wave';

interface ISound {
  playable: Howl;
  bpm?: number;
}

export class Playlist {
  sounds: ISound[];
  options: IOptions;
  currentIndex = 0;
  currentSoundId = 0;
  fadeInInMs = 1000;
  fadeOutInMs = 1200;
  circularWave?: CircularAudioWave;

  constructor(sources: string[], options: IOptions) {
    this.options = options;
    this.sounds = sources.map(s => this.createSound(s));

    if (this.options.withVisualization) {
      this.circularWave = new CircularAudioWave(
        Howler.ctx,
        Howler.masterGain,
        options.colors || {}
      );
    }
  }

  createSound(src: string) {
    const playable = new Howl({
      src: [src],
      onend: () => {
        // jump to the next sound after the first if there is one
        if (this.currentIndex < this.sounds.length - 1) {
          this.currentIndex++;
        } else {
          this.currentIndex = 0;
        }

        // do not continue to play the next sound
        // instead pause the playlist here
        if (this.options.oneSoundPerRequest) {
          if (this.circularWave) {
            this.circularWave.stop();
          }
          return;
        }

        setTimeout(() => {
          this.play();
        }, 500);
      }
    });

    const result: ISound = { playable };

    if (this.options.withVisualization) {
      // calculate the bpm for the waves ripple effect
      calculateBpm(src).then((bpm: any) => (result.bpm = bpm));
    }

    return result;
  }

  play() {
    const { playable, bpm } = this.sounds[this.currentIndex];

    if (this.circularWave) {
      this.circularWave.start(bpm || 120);
    }

    playable.fade(0, 1, this.fadeInInMs);
    playable.play();
  }

  pause() {
    const { playable } = this.sounds[this.currentIndex];

    // ignore pause since we wait till the sound ended
    if (this.options.oneSoundPerRequest) {
      return;
    }

    if (this.circularWave) {
      this.circularWave.stop();
    }

    // do not fade and pause when not playing to not cause sideeffects
    // but calling after stopping the wave since that could be
    // called during two sounds, with the wave still active
    if (!playable.playing()) {
      return;
    }
    playable.fade(1, 0, this.fadeOutInMs);
    setTimeout(() => {
      playable.pause();
    }, this.fadeOutInMs);
  }
}
