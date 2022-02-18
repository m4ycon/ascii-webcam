const video = document.querySelector('#cam');
const canvas = document.querySelector("#canvas");
const btn = document.querySelector('#btn');
const asciiDiv = document.querySelector('#ascii');
const charsChainSelect = document.querySelector('#chars-chain-select');

const CANVAS_WIDTH = 300;

canvas.setAttribute('width', CANVAS_WIDTH);
canvas.setAttribute('height', CANVAS_WIDTH*3/4);

const chars = [
  "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~i!lI;:,\"^`'. ", // pesado
  "@%#*+=-:. ",
  " .:-=+*#%@Ñ",
  "@.-+#%*=: ", // alto contraste, muito bom
  "▉▊▋▍▎▏",
  "▏▎▍▋▊▉",
  "▂▃▅▆▇",
  "▇▆▅▃▂_",
  " ░▒▓█",
  "●◍",
];

let charsChain = " ░▒▓█";
let nColors = charsChain.length;
let bkPoints = [];



// inicia alguns valores iniciais
function setInitialValues() {
  calcBreakpoints();
  setSelectOptions();
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

function setSelectOptions() {
  // clear select options
  charsChainSelect.innerHTML = '';

  // set values
  chars.forEach(chain => {
    const option = document.createElement('option');
    option.value = chain;
    option.innerText = chain;
    charsChainSelect.appendChild(option);
  });

  // set initial value
  charsChainSelect.value = charsChain;
}

function handleOnSelectChange() {
  charsChain = charsChainSelect.value;
  nColors = charsChain.length;
  setInitialValues();
}
charsChainSelect.addEventListener('change', handleOnSelectChange);


btn.addEventListener('click', () => {
  const ctx = canvas.getContext('2d');
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const newImgData = grayscaleNColors(imgData);
  asciiDiv.innerHTML = asciiArt(newImgData);
});


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

    if ((i+4) % (CANVAS_WIDTH * 4) == 0)
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
