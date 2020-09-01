const batch = 200;
const shouldStop = {
  basic: (l) => l > 0.5,
  random: (l) => l > Math.random(),
  semiRandom: (l) => l > 0.99 - Math.random() * 0.3,
  invert: (l, i) => l > 1/i,
  linear: (l, i) => l > 1 - (i / 5),
  square: (l, i) => l < (i * i / 1000),
  looped: (l, i) => ((l * 5) % 1) < (i / 10),
}.looped;
const pauseAt = 0.09;
const palette = {
  'rgb': '#000',
  'rgB': '#555',
  'rGb': '#555',
  'rGB': '#5f5',
  'Rgb': '#500',
  'RgB': '#505',
  'RGb': '#550',
  'RGB': '#fff',
};

const image = new Image();
image.src = '/images/vampire-babe.jpg';
const { width, height } = image;

const createMatrix = (fn) => (new Array(width)).fill().map((_, x) => (
  (new Array(height)).fill().map((_, y) => (
    fn(x, y)
  ))
));

image.onload = () => {

  const canvas = document.querySelector('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0);
  const srcData = context.getImageData(0, 0, width, height).data;
  const srcR = createMatrix((x, y) => srcData[4*(width*y+x)] / 256);
  const srcG = createMatrix((x, y) => srcData[4*(width*y+x)+1] / 256);
  const srcB = createMatrix((x, y) => srcData[4*(width*y+x)+2] / 256);
  const drawnR = createMatrix(() => false);
  const drawnG = createMatrix(() => false);
  const drawnB = createMatrix(() => false);
  context.fillStyle = 'black';
  context.fillRect(0, 0, width, height);

  const posR = { x: Math.floor(width/2), y: Math.floor(height/2) };
  const posG = { x: Math.floor(width/2), y: Math.floor(height/2) };
  const posB = { x: Math.floor(width/2), y: Math.floor(height/2) };

  const draw = () => {
    drawnR[posR.x][posR.y] = true;
    context.fillStyle = palette[
      [
        drawnR[posR.x][posR.y] ? 'R' : 'r',
        drawnG[posR.x][posR.y] ? 'G' : 'g',
        drawnB[posR.x][posR.y] ? 'B' : 'b',
      ].join('')
    ];
    context.fillRect(posR.x, posR.y, 1, 1);

    drawnG[posG.x][posG.y] = true;
    context.fillStyle = palette[
      [
        drawnR[posG.x][posG.y] ? 'R' : 'r',
        drawnG[posG.x][posG.y] ? 'G' : 'g',
        drawnB[posG.x][posG.y] ? 'B' : 'b',
      ].join('')
    ];
    context.fillRect(posG.x, posG.y, 1, 1);

    drawnB[posB.x][posB.y] = true;
    context.fillStyle = palette[
      [
        drawnR[posB.x][posB.y] ? 'R' : 'r',
        drawnG[posB.x][posB.y] ? 'G' : 'g',
        drawnB[posB.x][posB.y] ? 'B' : 'b',
      ].join('')
    ];
    context.fillRect(posB.x, posB.y, 1, 1);
  };

  const isInCanvas = ({ x, y }) => x >=0 && x < width && y >= 0 && y < height;
  function* spiralPositions(pos) {
    const spiralPosition = { ...pos };
    for (let l = 1; l < Math.max(width, height); l += 2) {
      for (let i = 0; i < l; i++) {
        spiralPosition.x++;
        if (isInCanvas(spiralPosition)) yield spiralPosition;
      }
      for (let i = 0; i < l; i++) {
        spiralPosition.y++;
        if (isInCanvas(spiralPosition)) yield spiralPosition;
      }
      for (let i = 0; i < l + 1; i++) {
        spiralPosition.x--;
        if (isInCanvas(spiralPosition)) yield spiralPosition;
      }
      for (let i = 0; i < l + 1; i++) {
        spiralPosition.y--;
        if (isInCanvas(spiralPosition)) yield spiralPosition;
      }
    }
    throw 'done';
  }
  const moveColor = (drawn, pos, src) => {
    let i = 0;
    for (const spiralPosition of spiralPositions(pos)) {
      i++;
      const { x, y } = spiralPosition;
      if (!drawn[x][y]) {
        if (shouldStop(src[x][y], i)) {
          pos.x = spiralPosition.x;
          pos.y = spiralPosition.y;
          return i;
        }
      }
    }
  };
  const move = () => {
    moveColor(drawnR, posR, srcR);
    moveColor(drawnG, posG, srcG);
    moveColor(drawnB, posB, srcB);
  };

  let nbDrawn = 0;
  const stream = canvas.captureStream();
  const mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.start();
  const chunks = [];
  mediaRecorder.ondataavailable = e => {
    chunks.push(e.data);
  };
  mediaRecorder.onstop = () => {
    const blob = new Blob(chunks);
    const url = URL.createObjectURL(blob);
    console.log(url);
  };
  const loop = () => {
    try {
      for (let i = 0; i < batch; i++) {
        move();
        draw();
        nbDrawn++;
      }
      if (nbDrawn > 3 * width * height * pauseAt ) throw 'done';
      requestAnimationFrame(loop);
    } catch(e) {
      if (e==='done') {
        console.log('done');
        mediaRecorder.stop();
      }
      else throw e;
    }
  };
  loop();

};
