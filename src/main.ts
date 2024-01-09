interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

const MAX_WIDTH: number = 750;
let canvas: HTMLCanvasElement = document.getElementById(
  "canvas"
) as HTMLCanvasElement;
let ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;
let images: HTMLImageElement[] = [];
let currentImageIndex: number = 0;
let selectedArea: Rectangle = { x: 0, y: 0, width: 0, height: 0 };
let isDragging: boolean = false;

document
  .getElementById("imageInput")!
  .addEventListener("change", handleFileSelect, false);
document
  .getElementById("prevButton")!
  .addEventListener("click", () => navigateImage(-1), false);
document
  .getElementById("nextButton")!
  .addEventListener("click", () => navigateImage(1), false);
document
  .getElementById("cropButton")!
  .addEventListener("click", cropImage, false);
canvas.addEventListener("mousedown", startDrag, false);
canvas.addEventListener("mousemove", drag, false);
canvas.addEventListener("mouseup", endDrag, false);

function handleFileSelect(event: Event) {
  const files = (event.target as HTMLInputElement).files!;
  console.log(files);
  images = [];
  Array.from(files).forEach((file) => {
    const reader = new FileReader();
    reader.onload = function (e: ProgressEvent<FileReader>) {
      let img = new Image();
      img.onload = () => {
        images.push(img);
        if (images.length === 1) {
          drawImage(0);
        }
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function drawImage(index: number) {
  if (index >= 0 && index < images.length) {
    currentImageIndex = index;
    let img = images[index];

    // 画像のサイズを調整
    const scaleFactor = MAX_WIDTH / img.width;
    canvas.width = MAX_WIDTH;
    canvas.height = img.height * scaleFactor;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }
}

function navigateImage(direction: number) {
  const newIndex = currentImageIndex + direction;
  if (newIndex >= 0 && newIndex < images.length) {
    drawImage(newIndex);
  }
}

let selectedAreas: Rectangle[] = [];

function startDrag(event: MouseEvent) {
  selectedArea = { x: 0, y: event.offsetY, width: canvas.width, height: 0 };
  isDragging = true;
}

function drag(event: MouseEvent) {
  if (isDragging) {
    selectedArea.height = event.offsetY - selectedArea.y;
    redrawCanvas();
  }
}

function endDrag() {
  if (isDragging && selectedArea.height > 0) {
    selectedAreas.push({ ...selectedArea });
    redrawCanvas();
  }
  isDragging = false;
}

function redrawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(images[currentImageIndex], 0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'red';
  selectedAreas.forEach(area => {
    ctx.strokeRect(area.x, area.y, area.width, area.height);
  });
}

function cropImage() {
  selectedAreas.forEach((area) => {
    const scaleFactor = MAX_WIDTH / images[currentImageIndex].width;
    const originalArea = {
      x: area.x / scaleFactor,
      y: area.y / scaleFactor,
      width: area.width / scaleFactor,
      height: area.height / scaleFactor,
    };

    const croppedCanvas = document.createElement("canvas");
    croppedCanvas.width = originalArea.width;
    croppedCanvas.height = originalArea.height;
    const croppedCtx = croppedCanvas.getContext("2d")!;
    croppedCtx.drawImage(
      images[currentImageIndex],
      originalArea.x,
      originalArea.y,
      originalArea.width,
      originalArea.height,
      0,
      0,
      originalArea.width,
      originalArea.height
    );

    // ここで各クロップされた画像を処理する
    document.getElementById("croppedImages")!.appendChild(croppedCanvas);
  });

  selectedAreas = [];
  redrawCanvas();
}
