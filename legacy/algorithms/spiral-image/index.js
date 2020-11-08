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

// ---

const createMatrix = (width, height, fn) => (new Array(width)).fill().map((_, x) => (
  (new Array(height)).fill().map((_, y) => (
    fn(x, y)
  ))
));

// ---

(async () => {

  const image = new Image();
  image.src = src;
  await new Promise((resolve) => image.onload = resolve);
  const { width, height } = image;

  const canvas = document.querySelector('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  
  context.filter = 'grayscale(100%)';
  context.drawImage(image, 0, 0);
  const srcGreyData = context.getImageData(0, 0, width, height).data;
  const srcGrey = createMatrix(width, height, (x, y) => srcGreyData[4 * (width * y + x)] / 256);
  context.filter = 'grayscale(0%)';
  context.drawImage(image, 0, 0);
  const srcColorData = context.getImageData(0, 0, width, height).data;

  const drawn = createMatrix(width, height, () => false);
  context.fillStyle = 'white';
  context.fillRect(0, 0, width, height);

  const pos = {
    x: Math.floor(width / 2),
    y: Math.floor(height / 2),
  };

  const draw = () => {
    context.fillStyle = '#' + [
      srcColorData[4 * (width * pos.y + pos.x)],
      srcColorData[4 * (width * pos.y + pos.x) + 1],
      srcColorData[4 * (width * pos.y + pos.x) + 2],
    ].map(n => n.toString(16).padStart(2, '0')).join('');
    context.fillRect(pos.x, pos.y, 1, 1);
    drawn[pos.x][pos.y] = true;
  };
  const move = () => {
    let k = 0;
    let { x, y } = pos;

    const isInCanvas = () => x >= 0 && y >= 0 && x < width && y < height;

    for( let i = 1; i < Math.min(width, height); i += 2) {
      k++;
      for (let j = 0; j < i; j++) {
        x++;
        if (isInCanvas() && !drawn[x][y]) {
          if (stop(srcGrey[x][y], k)) {
            pos.x = x;
            pos.y = y;
            return;
          }
        }
      }
      for (let j = 0; j < i; j++) {
        y++;
        if (isInCanvas() && !drawn[x][y]) {
          if (stop(srcGrey[x][y], k)) {
            pos.x = x;
            pos.y = y;
            return;
          }
        }
      }
      for (let j = 0; j < i + 1; j++) {
        x--;
        if (isInCanvas() && !drawn[x][y]) {
          if (stop(srcGrey[x][y], k)) {
            pos.x = x;
            pos.y = y;
            return;
          }
        }
      }
      for (let j = 0; j < i + 1; j++) {
        y--;
        if (isInCanvas() && !drawn[x][y]) {
          if (stop(srcGrey[x][y], k)) {
            pos.x = x;
            pos.y = y;
            return;
          }
        }
      }
    }
  };

  
    let nbDrawn = 0;
    const loop = () => {
      try {
        pos.x = Math.floor(Math.random() * width);
        pos.y = Math.floor(Math.random() * height);
        for (let i = 0; i < batch; i++) {
          move();
          draw();
          nbDrawn++;
        }
        if (nbDrawn > width * height * stopAt ) throw 'done drawn';
        requestAnimationFrame(loop);
      } catch(e) {
        console.log(e);
        if (!e.toString().startsWith('done')) throw e;
      }
    };
    loop();

})();
