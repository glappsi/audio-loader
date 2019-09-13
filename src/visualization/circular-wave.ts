import { init } from 'echarts';
import { debounce } from 'lodash';

export class CircularAudioWave {
  lastMaxR = 0;
  maxChartValue = 240;
  minChartValue = 100;
  playing = false;
  lineColorOffset = 0;
  tick = 0;
  bgColor = '#2E2733';
  chartOptions = {
    angleAxis: {
      type: 'value',
      clockwise: false,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        show: false
      },
      splitLine: {
        show: false
      }
    },
    radiusAxis: {
      min: 0,
      max: this.maxChartValue + 50,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        show: false
      },
      splitLine: {
        show: false
      }
    },
    polar: {
      radius: '100%'
    },
    series: [
      {
        coordinateSystem: 'polar',
        name: 'line',
        type: 'line',
        showSymbol: false,
        lineStyle: {
          color: {
            colorStops: [
              {
                offset: 0.7,
                color: '#e91e63'
              },
              {
                offset: 0.3,
                color: '#3f51b5'
              }
            ]
          },
          shadowColor: 'blue',
          shadowBlur: 10
        },
        zlevel: 2,
        data: Array.from(new Array(361), (item, i) => {
          return [this.minChartValue, i];
        }),
        silent: true,
        hoverAnimation: false
      },
      {
        coordinateSystem: 'polar',
        name: 'maxbar',
        type: 'line',
        showSymbol: false,
        lineStyle: {
          color: '#87b9ca',
          shadowColor: '#87b9ca',
          shadowBlur: 10
        },
        data: Array.from(new Array(361), (item, i) => {
          return [this.minChartValue, i];
        }),
        silent: true,
        hoverAnimation: false
      },
      {
        coordinateSystem: 'polar',
        name: 'interior',
        type: 'effectScatter',
        showSymbol: false,
        data: [0],
        symbolSize: 100,
        rippleEffect: {
          period: 3.5,
          scale: 3
        },
        itemStyle: {
          color: {
            type: 'radial',
            colorStops: [
              {
                offset: 0,
                color: '#87b9ca'
              },
              {
                offset: 1,
                color: 'white'
              }
            ]
          }
        },
        silent: true,
        hoverAnimation: false,
        animation: false
      }
    ]
  };
  currentChartOptions = JSON.parse(JSON.stringify(this.chartOptions));
  context: AudioContext;
  chart: any;
  sourceNode?: AudioBufferSourceNode;
  analyser?: AnalyserNode;
  _debouncedDraw: Function;
  currentAnimationFrame?: number;
  container: HTMLCanvasElement;

  constructor(audioContext: AudioContext, masterGain: GainNode) {
    const container = document.createElement('canvas') as HTMLCanvasElement;
    document.addEventListener('DOMContentLoaded', () => {
      document.body.appendChild(container);
    });

    this.container = container;
    this.container.style.position = 'fixed';
    this.container.style.bottom = '0px';
    this.container.style.left = '0px';
    this.container.style.width = '100vw';
    this.container.style.height = '25vh';
    this.container.style.opacity = '0';
    this.container.style.zIndex = '9999';
    this.container.style.transition = '0.5s opacity';

    this.context = audioContext;
    this.chart = init(this.container);
    this.chart.setOption(this.chartOptions, true);
    this._debouncedDraw = debounce(this._drawAnimation.bind(this), 25);

    if (!this.context) {
      console.warn('AUDIO LOGGER VISUALIZATION: No context could be found');
    } else {
      this.analyser = this.context.createAnalyser();
      masterGain.connect(this.analyser);
      this.analyser.connect(audioContext.destination);
    }
  }

  start(bpm: number) {
    this.container.classList.add('started');
    this.container.style.opacity = '1';
    this._setBpm(bpm);
    this._debouncedDraw();
  }

  stop() {
    this.container.classList.add('stopped');
    this.container.style.opacity = '0';
    if (this.currentAnimationFrame) {
      cancelAnimationFrame(this.currentAnimationFrame);
    }
  }

  destroy() {
    this.chart.dispose();
  }

  reset() {
    this.tick = 0;
    this.currentChartOptions = JSON.parse(JSON.stringify(this.chartOptions));
  }

  // TODO: Allow callback
  // onended() {
  //   if (!this.opts.loop) {
  //     this.playing = false;
  //     this.context.close();
  //     this.sourceNode.buffer = null;
  //     this.offlineSource.buffer = null;
  //     this.reset();

  //     this.context = new AudioContext();
  //     this.offlineContext = new OfflineAudioContext(2, 30 * 44100, 44100);
  //     this.sourceNode = this.context.createBufferSource();
  //     this.offlineSource = this.offlineContext.createBufferSource();
  //     this.analyser = this.context.createAnalyser();
  //     this.loadAudio(this.filePath);
  //   }
  // }

  // _setupAudioNodes() {
  //   this.analyser.smoothingTimeConstant = 0.3;
  //   this.analyser.fftSize = 2048;

  //   this.sourceNode.connect(this.analyser);

  //   this.sourceNode.connect(this.context.destination);
  //   this.sourceNode.onended = this.onended.bind(this);
  // }

  _setBpm(bpm: number) {
    this.currentChartOptions.series[0].animation = false;
    if (this.currentChartOptions.series[2].rippleEffect) {
      this.currentChartOptions.series[2].rippleEffect.period = 150 / bpm;
    }
  }

  _drawAnimation() {
    if (!this.analyser) {
      return;
    }

    let freqData = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(freqData);
    this._draw(freqData);
    requestAnimationFrame(this._debouncedDraw.bind(this));
  }

  _draw(freqData: any) {
    let waveData = this._generateWaveData(freqData);
    this.currentChartOptions.series[0].data = waveData.data;

    if (waveData.maxR > this.lastMaxR) {
      this.lastMaxR = waveData.maxR + 4;
    } else if (this.playing) {
      this.lastMaxR -= 2;
    } else {
      this.lastMaxR = this.minChartValue;
    }

    // maxbar
    this.currentChartOptions.series[1].data = Array.from(
      new Array(361),
      (item, i) => {
        return [this.lastMaxR, i];
      }
    );

    this.chart.setOption(this.currentChartOptions, true);
    this.tick++;
  }

  _generateWaveData(data: any) {
    let waveData = [];
    let maxR = 0;

    for (let i = 0; i <= 360; i++) {
      // (((OldValue - OldMin) * (NewMax - NewMin)) / (OldMax - OldMin)) + NewMin
      let freq = data[i];
      var r =
        ((freq - 0) * (this.maxChartValue - this.minChartValue)) / (255 - 0) +
        this.minChartValue;
      if (r > maxR) {
        maxR = r;
      }
      waveData.push([r, i]);
    }
    waveData.push([waveData[0][0], 360]);

    return {
      maxR: maxR,
      data: waveData
    };
  }
}
