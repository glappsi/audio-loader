import domReady from '../lib/dom-ready';

const STYLES = (colors: any) => `
  .slider{
    position: fixed;
    top: 0;
    width: 100vw;
    left: 0;
    height:5px;
  }

  .line{
    position:absolute;
    opacity: 0.4;
    background:${colors.primary || '#3f51b5'};
    width:150%;
    height:5px;
  }

  .subline{
    position:absolute;
    background:${colors.primary || '#3f51b5'};
    box-shadow: 0 0 10px 1px ${colors.primary || '#3f51b5'};
    height:5px; 
  }
  .inc{
    animation: increase 2s infinite;
  }
  .dec{
    animation: decrease 2s 0.5s infinite;
  }

  @keyframes increase {
    from { left: -5%; width: 5%; }
    to { left: 130%; width: 100%;}
  }
  @keyframes decrease {
    from { left: -80%; width: 80%; }
    to { left: 110%; width: 10%;}
  }
`;

const HTML = (colors: any) => `
  <style>
    ${STYLES(colors)}
  </style>
  <div id="al-progress-bar" class="slider">
    <div class="line"></div>
    <div class="subline inc"></div>
    <div class="subline dec"></div>
  </div>
`;

let BAR: HTMLDivElement;

function setBar() {
  BAR = document.querySelector('#al-progress-bar') as HTMLDivElement;
}

function showBar() {
  BAR.style.display = 'block';
}

export function show(colors: any = {}) {
  if (!BAR) {
    domReady().then(() => {
      document.body.insertAdjacentHTML('beforeend', HTML(colors));
      setBar();
      showBar();
    });
  } else {
    showBar();
  }
}

export function hide() {
  BAR.style.display = 'none';
}
