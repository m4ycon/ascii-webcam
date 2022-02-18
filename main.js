const video = document.querySelector('#cam');
const canvas = document.querySelector("#canvas");
const asciiDiv = document.querySelector('#ascii');


const configs = [
  {
    chain: "@.-+#%*=: ", // contraste alto, o melhor
    nColors: 10,
    canvasWidth: 300,
    fontSize: '5px',
    lineHeight: '2.75px',
  }, {
    chain: " .:-=+*#%@Ñ",
    nColors: 11,
    canvasWidth: 300,
    fontSize: '5px',
    lineHeight: '2.75px',
  }, {
    chain: "Ñ@%#*+=-:. ",
    nColors: 11,
    canvasWidth: 300,
    fontSize: '5px',
    lineHeight: '2.75px',
  }, {
    chain: "@ Ñ.%:#-*=+", // contraste altissimo, não tão bom
    nColors: 11,
    canvasWidth: 300,
    fontSize: '5px',
    lineHeight: '2.75px',
  }, {
    chain: "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/|()1{}[]?-_+~i!lI;:,\"^`'. ",
    nColors: 68,
    canvasWidth: 80,
    fontSize: '18.75px',
    lineHeight: '10.3125px',
  }, {
    chain: " ░▒▓█",
    nColors: 5,
    canvasWidth: 300,
    fontSize: '5px',
    lineHeight: '2.75px',
  }, {
    chain: "▉▊▋▍▎▏",
    nColors: 6,
    canvasWidth: 300,
    fontSize: '2.75px',
    lineHeight: '2.75px',
  }, {
    chain: "▏▎▍▋▊▉",
    nColors: 6,
    canvasWidth: 300,
    fontSize: '2.75px',
    lineHeight: '2.75px',
  }, {
    chain: "▂▃▅▆▇",
    nColors: 5,
    canvasWidth: 300,
    fontSize: '2.75px',
    lineHeight: '2.75px',
  }, {
    chain: "▇▆▅▃▂_",
    nColors: 6,
    canvasWidth: 300,
    fontSize: '2.75px',
    lineHeight: '2.75px',
  },
]

let configChoice = configs[0];

let canvasWidth = configChoice.canvasWidth;
let charsChain = configChoice.chain;
let nColors = configChoice.nColors;
let bkPoints = [];



// inicia alguns valores iniciais
function setInitialValues() {
  setSelectOptions();
  handleConfigChange(0);
}

function handleConfigChange(i) {
  configChoice = configs[i];

  canvasWidth = configChoice.canvasWidth;
  charsChain = configChoice.chain;
  nColors = configChoice.nColors;

  calcBreakpoints();
  setStyles();
}

function setStyles() {
  const CANVAS_WIDTH = configChoice.canvasWidth;
  canvas.setAttribute('width', CANVAS_WIDTH);
  canvas.setAttribute('height', CANVAS_WIDTH*3/4); 
  document.body.style.fontSize = configChoice.fontSize;
  document.body.style.lineHeight = configChoice.lineHeight;
}

async function requestWebcam() {
  const stream = await navigator.mediaDevices
    .getUserMedia({ video: true, audio: false,  })
  video.srcObject = stream;
}

// define os "pontos de corte" nas cores de acordo com o nColors escolhido
function calcBreakpoints() {
  const newBkPoints = [0];
  for (let j = 1; j < nColors-1; j++)
    newBkPoints.push(Math.round(j * 255 / (nColors-1)));
  newBkPoints.push(255);

  bkPoints = newBkPoints;
}

//
function grayscaleNColors(imgData) {
  const setRGB = (imgData, i, r, g, b) => {
    imgData.data[i + 0] = r;
    imgData.data[i + 1] = g;
    imgData.data[i + 2] = b;
  };

  const newImgData = new ImageData(imgData.width, imgData.height);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const r = imgData.data[i + 0];
    const g = imgData.data[i + 1];
    const b = imgData.data[i + 2];
    // const a = imgData.data[i + 3];

    const avrg = 0.299*r + 0.587*g + 0.114*b;

    for (let j = 0; j < nColors; j++) {
      let bkPoint = 0;
      for(let k = 0; k < bkPoints.length - 1; k++) {
        // checa se o ponto está no intervalo
        if (avrg >= bkPoints[k] && avrg < bkPoints[k + 1]) {
          // checa qual cor o ponto está mais próximo
          bkPoint = Math.abs(bkPoints[k] - avrg) < Math.abs(bkPoints[k+1] - avrg)
            ? bkPoints[k]
            : bkPoints[k+1];
          break;
        }
      }

      setRGB(newImgData, i, bkPoint, bkPoint, bkPoint);
    }
    newImgData.data[i + 3] = 255;
  }
  return newImgData;
}

// return string with imgData converted to ascii art
function asciiArt(imgData) {
  let imgStr = '';
  for (let i = 0; i < imgData.data.length; i += 4) {
    const grayC = imgData.data[i];
    const char = charsChain[bkPoints.indexOf(grayC)];
    imgStr += char == " " ? "&nbsp" : char;

    if ((i+4) % (canvasWidth * 4) == 0)
      imgStr += '<br/>';
  }
  return imgStr;
}

// lettersArt é bem pesado, por causa do <span>
// let srcStr = 'CJR';
// function lettersArt(imgData) {
//   let imgStr = '';
//   for (let i = 0; i < imgData.data.length; i += 4) {
//     const grayC = imgData.data[i] / 255;
//     const char = srcStr[(i/4) % srcStr.length];
//     imgStr += "<span style='color:rgba(255,255,255," + grayC + ")'>" + char + "</span>";

//     if (i % (CANVAS_WIDTH * 4) == 0)
//       imgStr += '<br/>';
//   }
//   srcStr = srcStr[2] + srcStr.substring(0, 2);
//   return imgStr;
// }

function setup() {
  requestWebcam();
  setInitialValues();
}
setup();

function main() {
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const newImgData = grayscaleNColors(imgData);
  asciiDiv.innerHTML = asciiArt(newImgData);
  ctx.putImageData(newImgData, 0, 0);

  window.requestAnimationFrame(main);
}
window.requestAnimationFrame(main);
