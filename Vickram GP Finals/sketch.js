//Global variables
let video;
let capturedImage = null;
let faceEffect = "none";

//Threshold sliders
let sliderThreshRed;
let sliderThreshGreen;
let sliderThreshBlue;
let sliderThreshLab;
let sliderThreshV;

//Background blur slider
let sliderBlur;

//Variables for buttons
let captureButton;
let resetButton;
let flipView = false;

//Instructions for face effects
let instructionsP;

//Variables for Extension 2 (Drawing feature)
let ext2Graphics;
let ext2Mode = "draw";
let ext2DrawButton, ext2EraseButton, ext2ThicknessSlider;

//Variable for Extension 3 canvas (age and gender predictor)
let ext3Canvas = null;

//Grid layout constants
const cellWidth = 160;
const cellHeight = 120;
const colSpacing = 20;
const rowSpacing = 20;
const extensionGap = 80;

//labels for each box.
const labelsRow1 = ["Webcam image", "Grayscale and brightness + 20%"];
const labelsRow2 = ["Red channel", "Green channel", "Blue channel"];
const labelsRow3 = ["Red Threshold", "Green Threshold", "Blue Threshold"];
const labelsRow4 = ["Webcam image (repeat)", "L*a*b", "HSV"];
const labelsRow5 = ["Face detection / edited face image", "Threshold image L*a*b", "Threshold image HSV"];
//personal extension row
const labelsRow6 = ["Background Blur", "Drawing Feature", "Age and gender predictor"];


//Compute the top Y position for the box area
function rowY(rowIndex) {
  return rowIndex * (cellHeight + rowSpacing);
}

function setup() {
  pixelDensity(1);
  noSmooth();

  //Increase canvas height
  let canvasWidth = 3.02 * cellWidth + 2 * colSpacing;
  let canvasHeight = 920;
  createCanvas(canvasWidth, canvasHeight);

  video = createCapture(VIDEO);
  video.size(cellWidth, cellHeight);
  video.hide();

  //Row 3 threshold sliders
  let row3_boxY = rowY(2);
  let sliderYRow3 = row3_boxY + cellHeight + 5;
  sliderThreshRed = createSlider(0, 255, 128);
  sliderThreshRed.position(0, sliderYRow3);
  sliderThreshRed.style('width', cellWidth + 'px');

  sliderThreshGreen = createSlider(0, 255, 128);
  sliderThreshGreen.position(cellWidth + colSpacing, sliderYRow3);
  sliderThreshGreen.style('width', cellWidth + 'px');

  sliderThreshBlue = createSlider(0, 255, 128);
  sliderThreshBlue.position(2 * (cellWidth + colSpacing), sliderYRow3);
  sliderThreshBlue.style('width', cellWidth + 'px');

  //Row 5 threshold sliders for Lab and HSV
  let row5_boxY = rowY(4);
  let sliderYRow5 = row5_boxY + cellHeight + 5;
  sliderThreshLab = createSlider(0, 100, 50);
  sliderThreshLab.position(cellWidth + colSpacing, sliderYRow5);
  sliderThreshLab.style('width', cellWidth + 'px');

  sliderThreshV = createSlider(0, 360, 180);
  sliderThreshV.position(2 * (cellWidth + colSpacing), sliderYRow5);
  sliderThreshV.style('width', cellWidth + 'px');

  //Create slider for blur intensity for Background blur.
  let row6_boxY = rowY(5) + extensionGap;
  sliderBlur = createSlider(0, 20, 3, 0.5);
  sliderBlur.position(0, row6_boxY + cellHeight + 5);
  sliderBlur.style('width', cellWidth + 'px');

  //Create instructions for the 4 face filters
  instructionsP = createP("Press 1: Greyscale face | 2: Blur face | 3: Colour conversion filter | 4: Pixelate face");
  instructionsP.style('color', 'blue');
  instructionsP.position(10, height + 20);

  //Create capture button and its position
  captureButton = createButton("Capture Image");
  captureButton.position(width + 20, 40);
  captureButton.mousePressed(() => {
    capturedImage = video.get();
    ext3Canvas = null; // Reset Extension 3 processing for new image
  });

  //Create reset button and its position
  resetButton = createButton("Reset Image");
  resetButton.position(width + 20, 80);
  resetButton.mousePressed(() => {
    capturedImage = null;
    ext3Canvas = null;
  });

  //Create flip button and its positioned
  let flipButton = createButton("Flip Cameras");
  flipButton.position(width + 20, 120);
  flipButton.mousePressed(() => {
    flipView = !flipView;
  });


  //SETUP FOR EXTENSION 2 (Drawing feature)
  let ext2_x = cellWidth + colSpacing;
  let ext2_y = rowY(5) + extensionGap;
  //Create an off-screen graphics buffer for drawing.
  ext2Graphics = createGraphics(cellWidth, cellHeight);
  ext2Graphics.clear();

  //Create the "Draw" button.
  ext2DrawButton = createButton("Draw");
  ext2DrawButton.position(ext2_x + 10, ext2_y + cellHeight - 110);
  ext2DrawButton.mousePressed(() => { ext2Mode = "draw"; });

  //Create the "Erase" button.
  ext2EraseButton = createButton("Erase");
  ext2EraseButton.position(ext2_x + cellWidth - 45, ext2_y + cellHeight - 110);
  ext2EraseButton.mousePressed(() => { ext2Mode = "erase"; });

  //Create the thickness slider
  ext2ThicknessSlider = createSlider(1, 20, 3, 1);
  ext2ThicknessSlider.position(ext2_x, ext2_y + cellHeight + 5);
  ext2ThicknessSlider.style('width', cellWidth + 'px');
}

function draw() {
  background(0);

  //Use the captured image if available.
  let srcUsed = capturedImage ? capturedImage : video.get();

  //ROW 1
  let row1_boxY = rowY(0);
  drawImageFlipped(srcUsed, 0, row1_boxY, cellWidth, cellHeight);
  drawLabelInBox(labelsRow1[0], 0, row1_boxY);
  let grayImg = createGrayscaleAndBright(srcUsed);
  drawImageFlipped(grayImg, cellWidth + colSpacing, row1_boxY, cellWidth, cellHeight);
  drawLabelInBox(labelsRow1[1], cellWidth + colSpacing, row1_boxY);

  //ROW 2
  let row2_boxY = rowY(1);
  let redImg = createRedChannel(srcUsed);
  let greenImg = createGreenChannel(srcUsed);
  let blueImg = createBlueChannel(srcUsed);
  drawImageFlipped(redImg, 0, row2_boxY, cellWidth, cellHeight);
  drawLabelInBox(labelsRow2[0], 0, row2_boxY);
  drawImageFlipped(greenImg, cellWidth + colSpacing, row2_boxY, cellWidth, cellHeight);
  drawLabelInBox(labelsRow2[1], cellWidth + colSpacing, row2_boxY);
  drawImageFlipped(blueImg, 2 * (cellWidth + colSpacing), row2_boxY, cellWidth, cellHeight);
  drawLabelInBox(labelsRow2[2], 2 * (cellWidth + colSpacing), row2_boxY);

  //ROW 3: RGB thresholds
  let row3_boxY = rowY(2);
  let threshRedImg = createThresholdImage(srcUsed, "red", sliderThreshRed.value());
  let threshGreenImg = createThresholdImage(srcUsed, "green", sliderThreshGreen.value());
  let threshBlueImg = createThresholdImage(srcUsed, "blue", sliderThreshBlue.value());
  drawImageFlipped(threshRedImg, 0, row3_boxY, cellWidth, cellHeight);
  drawLabelInBox(labelsRow3[0], 0, row3_boxY);
  drawImageFlipped(threshGreenImg, cellWidth + colSpacing, row3_boxY, cellWidth, cellHeight);
  drawLabelInBox(labelsRow3[1], cellWidth + colSpacing, row3_boxY);
  drawImageFlipped(threshBlueImg, 2 * (cellWidth + colSpacing), row3_boxY, cellWidth, cellHeight);
  drawLabelInBox(labelsRow3[2], 2 * (cellWidth + colSpacing), row3_boxY);

  //ROW 4: L*a*b and HSV
  let row4_boxY = rowY(3);
  drawImageFlipped(srcUsed, 0, row4_boxY, cellWidth, cellHeight);
  drawLabelInBox(labelsRow4[0], 0, row4_boxY);
  let labImg = createLabImage(srcUsed);
  drawImageFlipped(labImg, cellWidth + colSpacing, row4_boxY, cellWidth, cellHeight);
  drawLabelInBox(labelsRow4[1], cellWidth + colSpacing, row4_boxY);
  let hsvImg = createHSVImage(srcUsed);
  drawImageFlipped(hsvImg, 2 * (cellWidth + colSpacing), row4_boxY, cellWidth, cellHeight);
  drawLabelInBox(labelsRow4[2], 2 * (cellWidth + colSpacing), row4_boxY);

  //ROW 5: Face detection/edited face image + L*a*b and HSV thresholds.
  let row5_boxY = rowY(4);
  if (capturedImage) {
    let faceEdited = createFaceEditedImage(capturedImage);
    drawImageFlipped(faceEdited, 0, row5_boxY, cellWidth, cellHeight);
  } else {
    noFill();
    stroke(255);
    rect(0, row5_boxY, cellWidth, cellHeight);
    noStroke();
    fill(255);
    textAlign(CENTER, CENTER);
    text("No captured image", cellWidth / 2, row5_boxY + cellHeight / 2);
  }
  drawLabelInBox(labelsRow5[0], 0, row5_boxY);

  let threshLabImg = createLabThresholdImage(labImg, sliderThreshLab.value());
  drawImageFlipped(threshLabImg, cellWidth + colSpacing, row5_boxY, cellWidth, cellHeight);
  drawLabelInBox(labelsRow5[1], cellWidth + colSpacing, row5_boxY);
  let threshHSVImg = createHSVThresholdImage(hsvImg, sliderThreshV.value());
  drawImageFlipped(threshHSVImg, 2 * (cellWidth + colSpacing), row5_boxY, cellWidth, cellHeight);
  drawLabelInBox(labelsRow5[2], 2 * (cellWidth + colSpacing), row5_boxY);

  //ROW 6: Personal Extensions
  let row6_boxY = rowY(5) + extensionGap;

  //Draw gap to seperate personal extensions from others.
  let canvasWidth = 3 * cellWidth + 2 * colSpacing;
  noStroke();
  fill(255);
  textSize(20);
  textAlign(CENTER, CENTER);
  text("My Own Extensions", canvasWidth / 2, rowY(5) + extensionGap / 1.4);

  //Extension 1: Background Blur.
  if (capturedImage) {
    let ext1 = createExtension1Image(capturedImage);
    drawImageFlipped(ext1, 0, row6_boxY, cellWidth, cellHeight);
  } else {
    noFill();
    stroke(255);
    rect(0, row6_boxY, cellWidth, cellHeight);
    noStroke();
    fill(255);
    textAlign(CENTER, CENTER);
    text("No captured image", cellWidth / 2, row6_boxY + cellHeight / 2);
  }
  drawLabelInBox(labelsRow6[0], 0, row6_boxY);

  //Extension 2: Drawing Feature.
  let ext2_x = cellWidth + colSpacing;
  let ext2_y = row6_boxY;
  if (capturedImage) {
    drawImageFlipped(capturedImage, ext2_x, ext2_y, cellWidth, cellHeight);
  } else {
    fill(200);
    rect(ext2_x, ext2_y, cellWidth, cellHeight);
  }
  image(ext2Graphics, ext2_x, ext2_y, cellWidth, cellHeight);
  drawLabelInBox(labelsRow6[1], ext2_x, ext2_y);

  //Extension 3: Age and Gender predictor (randomised).
  let ext3_x = 2 * (cellWidth + colSpacing);
  if (capturedImage) {
    if (!ext3Canvas) {
      //Process the captured image to detect faces and guess age and gender.
      ext3Canvas = detectFacesExtension3(capturedImage);
    }
    drawImageFlipped(ext3Canvas, ext3_x, row6_boxY, cellWidth, cellHeight);
  } else {
    noFill();
    stroke(255);
    rect(ext3_x, row6_boxY, cellWidth, cellHeight);
    noStroke();
    fill(255);
    textAlign(CENTER, CENTER);
    text("No captured image", ext3_x + cellWidth / 2, row6_boxY + cellHeight / 2);
  }
  drawLabelInBox(labelsRow6[2], ext3_x, row6_boxY);
}

//Keypress for face effects
function keyPressed() {
  if (key === '1') {
    faceEffect = "greyscale";
  } else if (key === '2') {
    faceEffect = "blur";
  } else if (key === '3') {
    faceEffect = "color";
  } else if (key === '4') {
    faceEffect = "pixelate";
  }
}

//Handle mouse events for Extension 2 drawing.
function mousePressed() {
  let ext2_x = cellWidth + colSpacing;
  let ext2_y = rowY(5) + extensionGap;
  if (mouseX > ext2_x && mouseX < ext2_x + cellWidth &&
    mouseY > ext2_y && mouseY < ext2_y + cellHeight) {
    let x = mouseX - ext2_x;
    let y = mouseY - ext2_y;
    ext2Graphics.strokeWeight(ext2ThicknessSlider.value());
    if (ext2Mode === "draw") {
      ext2Graphics.noErase();
      ext2Graphics.stroke(0);
    } else if (ext2Mode === "erase") {
      ext2Graphics.erase();
      ext2Graphics.stroke(255);
    }
    ext2Graphics.point(x, y);
    if (ext2Mode === "erase") {
      ext2Graphics.noErase();
    }
  }
}

function mouseDragged() {
  let ext2_x = cellWidth + colSpacing;
  let ext2_y = rowY(5) + extensionGap;
  if (mouseX > ext2_x && mouseX < ext2_x + cellWidth &&
    mouseY > ext2_y && mouseY < ext2_y + cellHeight) {
    let x = mouseX - ext2_x;
    let y = mouseY - ext2_y;
    let px = pmouseX - ext2_x;
    let py = pmouseY - ext2_y;
    ext2Graphics.strokeWeight(ext2ThicknessSlider.value());
    if (ext2Mode === "draw") {
      ext2Graphics.noErase();
      ext2Graphics.stroke(0);
    } else if (ext2Mode === "erase") {
      ext2Graphics.erase();
      ext2Graphics.stroke(255);
    }
    ext2Graphics.line(px, py, x, y);
    if (ext2Mode === "erase") {
      ext2Graphics.noErase();
    }
  }
}

//Helper function to draw title inside image box.
function drawLabelInBox(labelText, boxX, boxY) {
  push();
  textSize(10);
  textAlign(LEFT, BOTTOM);
  let padding = 5;
  let textHeightVal = textAscent() + textDescent();
  let tw = textWidth(labelText);
  noStroke();
  fill(0, 150);
  rect(boxX + padding - 2, boxY + cellHeight - textHeightVal - padding - 2, tw + 4, textHeightVal + padding * 2);
  fill(255);
  text(labelText, boxX + padding, boxY + cellHeight - padding);
  pop();
}

//Helper function to draw images when flipView is true.
function drawImageFlipped(img, x, y, w, h) {
  push();
  if (flipView) {
    translate(x + w, y);
    scale(-1, 1);
    image(img, 0, 0, w, h);
  } else {
    image(img, x, y, w, h);
  }
  pop();
}


//==================== FACE EDITING FUNCTIONS ====================
function createFaceEditedImage(srcImg) {
  if (faceEffect === "none") {
    return applyFaceDetection(srcImg);
  }
  let output = createImage(srcImg.width, srcImg.height);
  output.copy(srcImg, 0, 0, srcImg.width, srcImg.height, 0, 0, srcImg.width, srcImg.height);

  let pg = createGraphics(srcImg.width, srcImg.height);
  pg.image(srcImg, 0, 0);
  let detector = new objectdetect.detector(srcImg.width, srcImg.height, 1.1, objectdetect.frontalface);
  let faces = detector.detect(pg.canvas);

  for (let i = 0; i < faces.length; i++) {
    let face = faces[i];
    let x = face[0], y = face[1], w = face[2], h = face[3];
    let aspect = w / h;
    if (aspect < 0.8 || aspect > 1.2) continue;
    if (w < 30 || h < 30) continue;

    // Use a square region so the effect covers both width and height.
    let size = floor(max(w, h) * 1.2);
    let centerX = x + w / 2;
    let centerY = y + h / 2;
    let regionX = floor(centerX - size / 2);
    let regionY = floor(centerY - size / 2);

    // Clip the region if it extends beyond the image.
    if (regionX < 0) { size += regionX; regionX = 0; }
    if (regionY < 0) { size += regionY; regionY = 0; }
    if (regionX + size > srcImg.width) { size = srcImg.width - regionX; }
    if (regionY + size > srcImg.height) { size = srcImg.height - regionY; }

    let faceImg = srcImg.get(regionX, regionY, size, size);
    if (faceEffect === "greyscale") {
      faceImg = applyGreyscale(faceImg);
    } else if (faceEffect === "blur") {
      faceImg = applyBlur(faceImg);
    } else if (faceEffect === "color") {
      faceImg = createLabImage(faceImg);
    } else if (faceEffect === "pixelate") {
      faceImg = applyPixelate(faceImg);
    }
    output.copy(faceImg, 0, 0, faceImg.width, faceImg.height, regionX, regionY, faceImg.width, faceImg.height);
  }
  return output;
}

function applyFaceDetection(img) {
  let pg = createGraphics(img.width, img.height);
  pg.image(img, 0, 0);
  let detector = new objectdetect.detector(img.width, img.height, 1.1, objectdetect.frontalface);
  let faces = detector.detect(pg.canvas);
  pg.noFill();
  pg.stroke(255, 0, 0);
  pg.strokeWeight(2);
  for (let i = 0; i < faces.length; i++) {
    let face = faces[i];
    let x = face[0], y = face[1], w = face[2], h = face[3];
    let aspect = w / h;
    if (aspect < 0.8 || aspect > 1.2) continue;
    if (w < 30 || h < 30) continue;
    let size = floor(max(w, h));
    let centerX = x + w / 2;
    let centerY = y + h / 2;
    let squareX = floor(centerX - size / 2);
    let squareY = floor(centerY - size / 2);
    pg.rect(squareX, squareY, size, size);
  }
  return pg;
}



//==================== EXTENSION 1: BACKGROUND BLUR ====================
function createExtension1Image(srcImg) {
  let blurredBuffer = applyBlur(srcImg, sliderBlur.value());
  let output = blurredBuffer.get();

  let tempPg = createGraphics(srcImg.width, srcImg.height);
  tempPg.image(srcImg, 0, 0);
  let detector = new objectdetect.detector(srcImg.width, srcImg.height, 1.1, objectdetect.frontalface);
  let faces = detector.detect(tempPg.canvas);

  for (let i = 0; i < faces.length; i++) {
    let face = faces[i];
    let x = face[0], y = face[1], w = face[2], h = face[3];
    let aspect = w / h;
    if (aspect < 0.8 || aspect > 1.2) continue;
    if (w < 30 || h < 30) continue;
    let size = max(w, h) * 1.2;
    let centerX = x + w / 2;
    let centerY = y + h / 2;
    let squareX = centerX - size / 2;
    let squareY = centerY - size / 2;
    let sx = squareX;
    let sy = squareY;
    let sWidth = size;
    let sHeight = size;
    if (sx < 0) { sWidth += sx; sx = 0; }
    if (sy < 0) { sHeight += sy; sy = 0; }
    if (sx + sWidth > srcImg.width) { sWidth = srcImg.width - sx; }
    if (sy + sHeight > srcImg.height) { sHeight = srcImg.height - sy; }
    let faceRegion = srcImg.get(sx, sy, sWidth, sHeight);
    output.copy(faceRegion, 0, 0, faceRegion.width, faceRegion.height, sx, sy, faceRegion.width, faceRegion.height);
  }
  return output;
}

//==================== HELPER FUNCTIONS FOR FACE EFFECTS ====================
function applyGreyscale(img) {
  let result = createImage(img.width, img.height);
  img.loadPixels();
  result.loadPixels();
  for (let i = 0; i < img.pixels.length; i += 4) {
    let r = img.pixels[i],
      g = img.pixels[i + 1],
      b = img.pixels[i + 2];
    let gray = 0.299 * r + 0.587 * g + 0.114 * b;
    result.pixels[i] = gray;
    result.pixels[i + 1] = gray;
    result.pixels[i + 2] = gray;
    result.pixels[i + 3] = 255;
  }
  result.updatePixels();
  return result;
}

function applyBlur(img, intensity) {
  let pg = createGraphics(img.width, img.height);
  pg.image(img, 0, 0);
  if (intensity === undefined) {
    intensity = 3;
  }
  pg.filter(BLUR, intensity);
  return pg;
}

function applyPixelate(img) {
  // Step i: Convert image to greyscale
  let greyImg = applyGreyscale(img);
  let w = greyImg.width;
  let h = greyImg.height;

  // Create output image and initialize its pixel array.
  let outImage = createImage(w, h);
  outImage.loadPixels();

  let blockSize = 5;

  // Loop over the image in blocks of 5x5 pixels
  for (let y = 0; y < h; y += blockSize) {
    for (let x = 0; x < w; x += blockSize) {
      let sum = 0;
      let count = 0;

      // Step iii: Compute average pixel intensity within the block
      for (let j = 0; j < blockSize; j++) {
        for (let i = 0; i < blockSize; i++) {
          let xi = x + i;
          let yj = y + j;
          if (xi < w && yj < h) {
            let pix = greyImg.get(xi, yj);
            sum += pix[0];
            count++;
          }
        }
      }
      let avePixInt = sum / count;

      // Step iv & v: Paint the entire block with the average intensity using set()
      for (let j = 0; j < blockSize; j++) {
        for (let i = 0; i < blockSize; i++) {
          let xi = x + i;
          let yj = y + j;
          if (xi < w && yj < h) {
            outImage.set(xi, yj, avePixInt);
          }
        }
      }
    }
  }
  outImage.updatePixels();
  return outImage;
}


//==================== L*a*b CONVERSION FUNCTIONS ====================
function rgbToLab(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  r = (r > 0.04045) ? pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = (g > 0.04045) ? pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = (b > 0.04045) ? pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
  let X = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
  let Y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
  let Z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;
  let Xn = 0.95047, Yn = 1.00000, Zn = 1.08883;
  function f(t) {
    return (t > 0.008856) ? pow(t, 1 / 3) : (7.787 * t) + (16 / 116);
  }
  let fX = f(X / Xn), fY = f(Y / Yn), fZ = f(Z / Zn);
  let L = (116 * fY) - 16;
  let a = 500 * (fX - fY);
  let bVal = 200 * (fY - fZ);
  return { L: L, a: a, b: bVal };
}

function labToRgb(L, a, bVal) {
  let Y = (L + 16) / 116;
  let X = a / 500 + Y;
  let Z = Y - bVal / 200;
  function finv(t) {
    return (t * t * t > 0.008856) ? t * t * t : (t - 16 / 116) / 7.787;
  }
  let Xn = 0.95047, Yn = 1.00000, Zn = 1.08883;
  X = Xn * finv(X);
  Y = Yn * finv(Y);
  Z = Zn * finv(Z);
  let r = X * 3.2406 + Y * (-1.5372) + Z * (-0.4986);
  let g = X * (-0.9689) + Y * 1.8758 + Z * 0.0415;
  let b = X * 0.0557 + Y * (-0.2040) + Z * 1.0570;
  function gamma(u) {
    return (u > 0.0031308) ? 1.055 * pow(u, 1 / 2.4) - 0.055 : 12.92 * u;
  }
  r = gamma(r);
  g = gamma(g);
  b = gamma(b);
  r = constrain(r * 255, 0, 255);
  g = constrain(g * 255, 0, 255);
  b = constrain(b * 255, 0, 255);
  return { r: r, g: g, b: b };
}

function createLabImage(srcImg) {
  let img = createImage(srcImg.width, srcImg.height);
  srcImg.loadPixels();
  img.loadPixels();
  let factor = 5.0;
  for (let i = 0; i < srcImg.pixels.length; i += 4) {
    let r = srcImg.pixels[i], g = srcImg.pixels[i + 1], b = srcImg.pixels[i + 2];
    let lab = rgbToLab(r, g, b);
    lab.a *= factor;
    lab.b *= factor;
    let rgb = labToRgb(lab.L, lab.a, lab.b);
    img.pixels[i] = rgb.r;
    img.pixels[i + 1] = rgb.g;
    img.pixels[i + 2] = rgb.b;
    img.pixels[i + 3] = 255;
  }
  img.updatePixels();
  return img;
}

function createLabThresholdImage(labImg, thresholdVal) {
  let img = createImage(labImg.width, labImg.height);
  labImg.loadPixels();
  img.loadPixels();
  for (let i = 0; i < labImg.pixels.length; i += 4) {
    let r = labImg.pixels[i], g = labImg.pixels[i + 1], b = labImg.pixels[i + 2];
    let lab = rgbToLab(r, g, b);
    if (lab.L > thresholdVal) {
      let rgb = labToRgb(lab.L, lab.a, lab.b);
      img.pixels[i] = rgb.r;
      img.pixels[i + 1] = rgb.g;
      img.pixels[i + 2] = rgb.b;
    } else {
      img.pixels[i] = 0;
      img.pixels[i + 1] = 0;
      img.pixels[i + 2] = 0;
    }
    img.pixels[i + 3] = 255;
  }
  img.updatePixels();
  return img;
}

//==================== OTHER IMAGE PROCESSING FUNCTIONS ====================
function createGrayscaleAndBright(srcImg) {
  let img = createImage(srcImg.width, srcImg.height);
  srcImg.loadPixels();
  img.loadPixels();
  //nested loop that converts webcam image to greyscale and increases brightness by 20% in the same nested loop
  for (let y = 0; y < srcImg.height; y++) {
    for (let x = 0; x < srcImg.width; x++) {
      let i = (y * srcImg.width + x) * 4;
      let r = srcImg.pixels[i];
      let g = srcImg.pixels[i + 1];
      let b = srcImg.pixels[i + 2];
      let gray = 0.299 * r + 0.587 * g + 0.114 * b;
      //increases brightness by 20% capping at 255 intensity
      let brightVal = constrain(gray * 1.2, 0, 255);

      img.pixels[i] = brightVal;
      img.pixels[i + 1] = brightVal;
      img.pixels[i + 2] = brightVal;
      img.pixels[i + 3] = 255;
    }
  }
  img.updatePixels();
  return img;
}

function createRedChannel(srcImg) {
  let img = createImage(srcImg.width, srcImg.height);
  srcImg.loadPixels();
  img.loadPixels();
  for (let i = 0; i < srcImg.pixels.length; i += 4) {
    img.pixels[i] = srcImg.pixels[i];
    img.pixels[i + 1] = 0;
    img.pixels[i + 2] = 0;
    img.pixels[i + 3] = 255;
  }
  img.updatePixels();
  return img;
}

function createGreenChannel(srcImg) {
  let img = createImage(srcImg.width, srcImg.height);
  srcImg.loadPixels();
  img.loadPixels();
  for (let i = 0; i < srcImg.pixels.length; i += 4) {
    img.pixels[i] = 0;
    img.pixels[i + 1] = srcImg.pixels[i + 1];
    img.pixels[i + 2] = 0;
    img.pixels[i + 3] = 255;
  }
  img.updatePixels();
  return img;
}

function createBlueChannel(srcImg) {
  let img = createImage(srcImg.width, srcImg.height);
  srcImg.loadPixels();
  img.loadPixels();
  for (let i = 0; i < srcImg.pixels.length; i += 4) {
    img.pixels[i] = 0;
    img.pixels[i + 1] = 0;
    img.pixels[i + 2] = srcImg.pixels[i + 2];
    img.pixels[i + 3] = 255;
  }
  img.updatePixels();
  return img;
}

function createThresholdImage(srcImg, channel, thresholdVal) {
  let img = createImage(srcImg.width, srcImg.height);
  srcImg.loadPixels();
  img.loadPixels();
  for (let i = 0; i < srcImg.pixels.length; i += 4) {
    if (channel === "red") {
      let r = srcImg.pixels[i];
      img.pixels[i] = (r > thresholdVal) ? r : 0;
      img.pixels[i + 1] = 0;
      img.pixels[i + 2] = 0;
    } else if (channel === "green") {
      let g = srcImg.pixels[i + 1];
      img.pixels[i + 1] = (g > thresholdVal) ? g : 0;
      img.pixels[i] = 0;
      img.pixels[i + 2] = 0;
    } else if (channel === "blue") {
      let b = srcImg.pixels[i + 2];
      img.pixels[i + 2] = (b > thresholdVal) ? b : 0;
      img.pixels[i] = 0;
      img.pixels[i + 1] = 0;
    } else {
      let avg = (srcImg.pixels[i] + srcImg.pixels[i + 1] + srcImg.pixels[i + 2]) / 3;
      let binary = avg > thresholdVal ? 255 : 0;
      img.pixels[i] = binary;
      img.pixels[i + 1] = binary;
      img.pixels[i + 2] = binary;
    }
    img.pixels[i + 3] = 255;
  }
  img.updatePixels();
  return img;
}

//==================== HSV CONVERSION FUNCTIONS ====================
function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  let maxVal = Math.max(r, g, b), minVal = Math.min(r, g, b);
  let h, s, v = maxVal;
  let d = maxVal - minVal;
  s = (maxVal === 0) ? 0 : d / maxVal;
  if (d === 0) {
    h = 0;
  } else {
    if (maxVal === r) {
      h = 60 * (((g - b) / d) % 6);
    } else if (maxVal === g) {
      h = 60 * (((b - r) / d) + 2);
    } else {
      h = 60 * (((r - g) / d) + 4);
    }
    if (h < 0) h += 360;
  }
  return { h: h, s: s, v: v };
}

function hsvToRgb(h, s, v) {
  let c = v * s;
  let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  let m = v - c;
  let r1, g1, b1;
  if (h < 60) { r1 = c; g1 = x; b1 = 0; }
  else if (h < 120) { r1 = x; g1 = c; b1 = 0; }
  else if (h < 180) { r1 = 0; g1 = c; b1 = x; }
  else if (h < 240) { r1 = 0; g1 = x; b1 = c; }
  else if (h < 300) { r1 = x; g1 = 0; b1 = c; }
  else { r1 = c; g1 = 0; b1 = x; }
  return { r: (r1 + m) * 255, g: (g1 + m) * 255, b: (b1 + m) * 255 };
}

function createHSVImage(srcImg) {
  let img = createImage(srcImg.width, srcImg.height);
  srcImg.loadPixels();
  img.loadPixels();
  for (let i = 0; i < srcImg.pixels.length; i += 4) {
    let r = srcImg.pixels[i], g = srcImg.pixels[i + 1], b = srcImg.pixels[i + 2];
    let hsv = rgbToHsv(r, g, b);
    let rgb = hsvToRgb(hsv.h, 1, 1);
    img.pixels[i] = rgb.r;
    img.pixels[i + 1] = rgb.g;
    img.pixels[i + 2] = rgb.b;
    img.pixels[i + 3] = 255;
  }
  img.updatePixels();
  return img;
}

function createHSVThresholdImage(hsvImg, thresholdVal) {
  let img = createImage(hsvImg.width, hsvImg.height);
  hsvImg.loadPixels();
  img.loadPixels();
  for (let i = 0; i < hsvImg.pixels.length; i += 4) {
    let r = hsvImg.pixels[i], g = hsvImg.pixels[i + 1], b = hsvImg.pixels[i + 2];
    let hsv = rgbToHsv(r, g, b);
    if (hsv.h > thresholdVal) {
      let rgb = hsvToRgb(hsv.h, 1, 1);
      img.pixels[i] = rgb.r;
      img.pixels[i + 1] = rgb.g;
      img.pixels[i + 2] = rgb.b;
    } else {
      img.pixels[i] = 0;
      img.pixels[i + 1] = 0;
      img.pixels[i + 2] = 0;
    }
    img.pixels[i + 3] = 255;
  }
  img.updatePixels();
  return img;
}

//==================== EXTENSION 3: Age and Gender Predictor ====================

//Since I cannot use any other exteral libraries, it is randomized
function detectFacesExtension3(srcImg) {
  let pg = createGraphics(srcImg.width, srcImg.height);
  pg.image(srcImg, 0, 0);

  //Use the provided objectdetect file
  let detector = new objectdetect.detector(srcImg.width, srcImg.height, 1.1, objectdetect.frontalface);
  let faces = detector.detect(pg.canvas);

  pg.stroke(255, 0, 0);
  pg.strokeWeight(2);
  pg.textSize(16);
  pg.fill(255);

  for (let i = 0; i < faces.length; i++) {
    let face = faces[i];
    let x = face[0], y = face[1], w = face[2], h = face[3];
    let aspect = w / h;
    if (aspect < 0.8 || aspect > 1.2) continue;
    if (w < 30 || h < 30) continue;

    pg.noFill();
    pg.rect(x, y, w, h);

    //generate random predictions of age and gender.
    let predictedGender = (random() < 0.5 ? "male" : "female");
    let predictedAge = floor(random(15, 45));
    let label = predictedGender + " (" + predictedAge + ")";

    pg.noStroke();
    pg.fill(255, 0, 0);
    pg.text(label, x, y - 10);
  }

  return pg;
}




//=============================================== MY COMMENTS ON RESULT FOR TRESHOLDING OF EACH CHANNEL ============================================================= 

/*
Explanation of thresholding results per channel:

1. Thresholding the red channel:
   - Only the red component is considered.
   - Pixels with a red value greater than the threshold are retained (i.e., they keep their red value), while other pixels are set to 0.
   - This highlights features with a strong red presence in the image.
   
2. Thresholding the green channel:
   - Only the green component is evaluated.
   - Pixels with a green value above the threshold remain, highlighting green areas, while other pixels are set to 0.
   - This often emphasizes vegetation or objects with natural green hues.
   
3. Thresholding the blue channel:
   - Only the blue component is used.
   - Pixels with blue values exceeding the threshold retain their blue value; otherwise, they are set to 0.
   - This tends to emphasize blue areas, such as skies or water, depending on the image.
   
How are the results different?
- Each color channel (red, green, blue) represents different information and has its unique distribution within the image.
- The thresholding effect is channel-specific, meaning that thresholds applied to each channel highlight areas where that particular color is dominant.
- Averaging the channels reduces the impact of individual color variations and results in a contrast-based segmentation that reflects overall image brightness.





Comparison of thresholding results using RGB versus HSV:

1. RGB Thresholding:
   - In the earlier code, thresholding is performed on individual RGB channels or on the average intensity.
   - This method directly compares raw color intensities, which can be sensitive to variations in lighting.
   - As a result, the thresholded image might appear noisier since slight variations in brightness or color can cause pixels to be inconsistently classified.
   - Each channel's thresholding highlights areas where that specific color dominates, but it may also amplify noise in areas with mixed or low-intensity colors.

2. HSV Thresholding:
   - The new approach converts the image from RGB to HSV, where the color (hue), saturation, and brightness (value) are separated.
   - Thresholding on the hue component focuses on the actual color tone, reducing the influence of lighting variations (brightness) and color intensity fluctuations.
   - This separation often leads to a cleaner segmentation when trying to isolate specific colors, as hue is less affected by overall brightness.
   - However, if the saturation is low (i.e., the image has many grayish tones), the hue value might be less reliable, which could still introduce some noise.
   - Overall, using HSV can improve the thresholding results by providing a more stable criterion (hue) for color segmentation, potentially reducing noise compared to direct RGB thresholding.





Comparison of thresholding results using RGB versus L*a*b:

1. RGB Thresholding:
   - In the original RGB approach, thresholding is applied directly to individual channels (red, green, blue) or to the averaged intensity.
   - This method works on raw pixel values, which are not perceptually uniform. Small changes in intensity might result in large perceived differences.
   - As a consequence, the thresholded image can be noisier, particularly in areas with subtle color variations or uneven lighting.
   - The direct use of RGB values may highlight features based on high intensity in one channel, but this can also amplify noise in mixed or low-contrast regions.

2. Lab Thresholding:
   - The Lab color space separates lightness (L) from chromaticity (a and b), aligning more closely with human visual perception.
   - Thresholding on the L channel focuses on luminance, which is more uniform perceptually, often resulting in smoother and cleaner segmentation.
   - This approach is less sensitive to minor color variations that might not be visually significant, thereby reducing noise compared to raw RGB thresholding.
   - However, the conversion to Lab adds computational complexity and requires proper calibration (such as scaling the a and b channels) to avoid introducing artifacts.
   - Overall, Lab thresholding tends to yield a more consistent result in applications where accurate lightness segmentation is important.

3. Overall Comparison:
   - RGB thresholding is simple but can lead to a noisy, less reliable segmentation because it doesn't account for perceptual differences in color.
   - Lab thresholding improves segmentation quality by leveraging a color space designed for human vision, resulting in cleaner thresholded images.
   - The choice between these methods should be based on the specific application requirements and the characteristics of the input images.
*/





/*
-------------------------------------------------------------------------REPORT COMMENTARY------------------------------------------------------------------------------

Title: Webcam Image Processing Project Report
I approached this project with the goal of exploring real-time image processing using JavaScript and p5.js. My main focus was on image thresholding for each colour channel, face detection with various effects, and developing interactive extensions that add unique functionalities.
Image Thresholding and Colour Channel Analysis
I started by capturing a live webcam feed and converting it into multiple representations. I created a grayscale version with increased brightness to observe luminance changes. I then separated the image into red, green, and blue channels. For each channel, I implemented a thresholding function that retains only the pixels above a user-defined intensity value using sliders. This allowed me to understand how each colour channel contributes individually to the overall image. Additionally, I converted images into Lab and HSV colour spaces. The Lab conversion provided a perceptually uniform space, making it easier to adjust and threshold the image based on human vision, while the HSV conversion allowed for hue-based filtering—helpful in segmenting images by colour.
Face Detection and Applied Effects
A key component of the project was integrating face detection using the objectdetect library. Once a face is detected, I applied different effects triggered by keyboard input. This dynamic filtering not only showcased real-time image processing but also introduced an interactive element. I implemented constraints like aspect ratio and minimum size to improve the detection accuracy, though lighting variations and non-frontal faces still posed occasional challenges.
Challenges and Problem Solving
One of the major challenges was fine-tuning the threshold sliders to work reliably under different lighting conditions. Achieving consistent output required multiple iterations and adjustments. Performance issues also arose when processing live video with several filters simultaneously. To address these, I modularized the code into distinct functions and used off-screen graphics buffers for intensive tasks like interactive drawing and background blur. Although the face detection worked reasonably well with implemented constraints, occasional inaccuracies suggest that more robust detection algorithms could further enhance the results.
Project Completion and Future Directions
I successfully met the project’s core objectives, demonstrating a range of image processing techniques. However, there is room for improvement. In future iterations, I would consider adaptive thresholding techniques and more advanced face detection models to handle diverse environmental conditions more effectively. Additionally, integrating machine learning for age and gender prediction could replace the current random assignment, providing more meaningful insights.
Unique Extensions and Their Impact
The project includes three unique extensions that significantly enhance its interactivity and creative appeal.
Background Blur:
 Simulates shallow depth-of-field by blurring the image while keeping faces sharp, mimicking high-end photography and emphasizing the subject, mimicking high-end photography
Interactive Drawing:
 Lets users draw or erase directly on images with an adjustable brush, turning photos into interactive canvases for creative expression.
Age and Gender Predictor:
 Randomly assigns age and gender labels to faces, serving as a lightweight demo of image annotation without heavy libraries.
Unique Aspects:
 These features blend artistic effects with interactivity, empowering users to enhance and creatively modify images.


 */