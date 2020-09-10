const args = new URLSearchParams(location.search);
const batch = +args.get('batch')
const stop = ({
  basic: (srcLight, i) => srcLight < +args.get('stopBasic'),
  random: (srcLight, i) => srcLight < Math.random(),
  invert: (srcLight, i) => srcLight < (1-(1/i)),
  linear: (srcLight, i) => srcLight < (i / +args.get('stopLinearDivider')),
  looped: (srcLight, i) => ((srcLight * +args.get('stopLoopedMultiplier')) % 1) < (i / +args.get('stopLoopedDivider')),
})[args.get('stop')];
const stopAt = +args.get('stopAt');
const src = args.get('src');
const palette = {
  '000': args.get('palette-000'),
  '00f': args.get('palette-00f'),
  '0f0': args.get('palette-0f0'),
  '0ff': args.get('palette-0ff'),
  'f00': args.get('palette-f00'),
  'f0f': args.get('palette-f0f'),
  'ff0': args.get('palette-ff0'),
  'fff': args.get('palette-fff'),
};

const image = new Image();
image.src = src;

image.onload = () => {
  const { width, height } = image;
  
  const createMatrix = (fn) => (new Array(width)).fill().map((_, x) => (
    (new Array(height)).fill().map((_, y) => (
      fn(x, y)
    ))
  ));

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
        drawnR[posR.x][posR.y] ? 'f' : '0',
        drawnG[posR.x][posR.y] ? 'f' : '0',
        drawnB[posR.x][posR.y] ? 'f' : '0',
      ].join('')
    ];
    context.fillRect(posR.x, posR.y, 1, 1);

    drawnG[posG.x][posG.y] = true;
    context.fillStyle = palette[
      [
        drawnR[posG.x][posG.y] ? 'f' : '0',
        drawnG[posG.x][posG.y] ? 'f' : '0',
        drawnB[posG.x][posG.y] ? 'f' : '0',
      ].join('')
    ];
    context.fillRect(posG.x, posG.y, 1, 1);

    drawnB[posB.x][posB.y] = true;
    context.fillStyle = palette[
      [
        drawnR[posB.x][posB.y] ? 'f' : '0',
        drawnG[posB.x][posB.y] ? 'f' : '0',
        drawnB[posB.x][posB.y] ? 'f' : '0',
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
        if (stop(src[x][y], i)) {
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
      if (nbDrawn > 3 * width * height * stopAt ) throw 'done';
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
