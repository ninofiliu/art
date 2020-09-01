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
const pauseAt = 0.5;

const image = new Image();
image.src = '/images/red-lips.jpg';
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
    context.fillStyle = '#'+[
      drawnR[posR.x][posR.y] ? 'ff' : '00',
      drawnG[posR.x][posR.y] ? 'ff' : '00',
      drawnB[posR.x][posR.y] ? 'ff' : '00',
    ].join('');
    context.fillRect(posR.x, posR.y, 1, 1);

    drawnG[posG.x][posG.y] = true;
    context.fillStyle = '#'+[
      drawnR[posG.x][posG.y] ? 'ff' : '00',
      drawnG[posG.x][posG.y] ? 'ff' : '00',
      drawnB[posG.x][posG.y] ? 'ff' : '00',
    ].join('');
    context.fillRect(posG.x, posG.y, 1, 1);

    drawnB[posB.x][posB.y] = true;
    context.fillStyle = '#'+[
      drawnR[posB.x][posB.y] ? 'ff' : '00',
      drawnG[posB.x][posB.y] ? 'ff' : '00',
      drawnB[posB.x][posB.y] ? 'ff' : '00',
    ].join('');
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
      if (e==='done') console.log('done');
      else throw e;
    }
  };
  loop();

};
