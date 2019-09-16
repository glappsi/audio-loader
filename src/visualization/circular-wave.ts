import { init } from 'echarts';
import debounce from 'lodash.debounce';
import domReady from '../lib/dom-ready';

export class CircularAudioWave {
  lastMaxR = 0;
  maxChartValue = 240;
  minChartValue = 100;
  playing = false;
  lineColorOffset = 0;
  chartOptions: any;
  currentChartOptions: any;
  context: AudioContext;
  chart: any;
  sourceNode?: AudioBufferSourceNode;
  analyser?: AnalyserNode;
  _debouncedDraw: Function;
  currentAnimationFrame?: number;
  container: HTMLDivElement;
  canvas: HTMLCanvasElement;

  constructor(
    audioContext: AudioContext,
    masterGain: GainNode,
    colors: any = {}
  ) {
    const { container, canvas } = this.createContainer();
    this.container = container;
    this.canvas = canvas;

    domReady().then(() => {
      document.body.appendChild(container);
      if (document.body.clientWidth > 672) {
        this.container.style.height = '200px';
        this.container.style.textAlign = 'center';
        this.container.style.boxShadow = '0 0 20px 1px rgba(255,255,255,0.7)';
        this.canvas.style.width = '400px';
      }
    });

    this.chartOptions = this.buildChartOptions(colors);
    this.currentChartOptions = JSON.parse(JSON.stringify(this.chartOptions));
    this.context = audioContext;
    this.chart = init(this.canvas);
    this.chart.setOption(this.chartOptions, true);
    this._debouncedDraw = debounce(this._drawAnimation.bind(this), 25);

    if (!this.context) {
      console.warn('AUDIO LOGGER VISUALIZATION: No context could be found');
    } else {
      this.analyser = this.context.createAnalyser();
      masterGain.connect(this.analyser);
      // this.analyser.connect(audioContext.destination);
    }
  }

  createContainer() {
    const container = document.createElement('div') as HTMLDivElement;
    const canvas = document.createElement('canvas') as HTMLCanvasElement;

    container.classList.add('circular-wave-container');
    container.style.position = 'fixed';
    container.style.bottom = '0px';
    container.style.left = '0px';
    container.style.width = '100vw';
    container.style.height = '25vh';
    container.style.opacity = '0';
    container.style.zIndex = '-1';
    container.style.transition = '0.5s opacity';
    container.style.backgroundColor = 'rgba(255,255,255,0.5)';

    canvas.classList.add('circular-wave-canvas');
    canvas.style.height = '100%';
    canvas.style.width = '100%';

    container.appendChild(canvas);

    return { canvas, container };
  }

  start(bpm: number) {
    this.container.classList.add('started');
    this.container.style.opacity = '1';
    this.container.style.zIndex = '9999';
    this._setBpm(bpm);
    this._debouncedDraw();
  }

  stop() {
    this.container.classList.add('stopped');
    this.container.style.opacity = '0';
    this.container.style.zIndex = '-1';
    if (this.currentAnimationFrame) {
      cancelAnimationFrame(this.currentAnimationFrame);
    }
    this.reset();
  }

  destroy() {
    this.chart.dispose();
  }

  reset() {
    this.currentChartOptions = JSON.parse(JSON.stringify(this.chartOptions));
  }

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

  buildChartOptions(colors: any) {
    const { wave = {} } = colors || {};
    return {
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
                  color: colors.secondary || '#e91e63'
                },
                {
                  offset: 0.3,
                  color: colors.primary || '#3f51b5'
                }
              ]
            },
            shadowColor: wave.shadow || 'blue',
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
            color: wave.accent || '#87b9ca',
            shadowColor: wave.accent || '#87b9ca',
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
                  color: wave.accent || '#87b9ca'
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
  }
}
