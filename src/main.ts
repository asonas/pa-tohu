interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

const MAX_WIDTH: number = 600;
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

function startDrag(event: MouseEvent) {
  selectedArea.x = event.offsetX;
  selectedArea.y = event.offsetY;
  selectedArea.width = 0;
  selectedArea.height = 0;
  isDragging = true;
}

function drag(event: MouseEvent) {
  if (isDragging) {
    selectedArea.width = event.offsetX - selectedArea.x;
    selectedArea.height = event.offsetY - selectedArea.y;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 現在選択されている画像を描画
    let img = images[currentImageIndex];
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "red";
    ctx.strokeRect(
      selectedArea.x,
      selectedArea.y,
      selectedArea.width,
      selectedArea.height
    );
  }
}

function endDrag() {
  isDragging = false;
}

function cropImage() {
  if (selectedArea.width > 0 && selectedArea.height > 0) {
    // 縮小表示のスケールを計算
    const scaleFactor = MAX_WIDTH / images[currentImageIndex].width;

    // 元の解像度に合わせて選択範囲を調整
    const originalArea = {
      x: selectedArea.x / scaleFactor,
      y: selectedArea.y / scaleFactor,
      width: selectedArea.width / scaleFactor,
      height: selectedArea.height / scaleFactor,
    };

    // 元の解像度の画像でクロップ
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

    document.getElementById("resultImage")!.src = croppedCanvas.toDataURL();
    document.getElementById("resultImage")!.style.display = "block";
  }
}
