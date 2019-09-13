import domReady from '../lib/dom-ready';

const STYLES = `
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
    background:#4a8df8;
    width:150%;
    height:5px;
  }

  .subline{
    position:absolute;
    background:#4a8df8;
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

const HTML = `
  <style>
    ${STYLES}
  </style>
  <div id="al-progress-bar" class="slider">
    <div class="line"></div>
    <div class="subline inc"></div>
    <div class="subline dec"></div>
  </div>
`;

let LOADED = false;

function showBar() {
  const bar = document.querySelector('#al-progress-bar') as HTMLDivElement;
  bar.style.display = 'block';
}

export function show() {
  if (!LOADED) {
    domReady().then(() => {
      document.body.insertAdjacentHTML('beforeend', HTML);
      showBar();
      LOADED = true;
    });
  } else {
    showBar();
  }
}

export function hide() {
  const bar = document.querySelector('#al-progress-bar') as HTMLDivElement;
  bar.style.display = 'none';
}
