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
document.getElementById("downloadButton")!.addEventListener("click", downloadImage, false);
canvas.addEventListener("mousedown", startDrag, false);
canvas.addEventListener("mousemove", drag, false);
canvas.addEventListener("mouseup", endDrag, false);

function handleFileSelect(event: Event) {
  const files = (event.target as HTMLInputElement).files!;
  images = [];

  const sortedFiles = Array.from(files).sort((a, b) =>
    a.name < b.name ? -1 : 1
  );
  console.log(sortedFiles);

  function readFile(index: number) {
    if (index >= sortedFiles.length) {
      return;
    }

    const file = sortedFiles[index];
    const reader = new FileReader();

    reader.onload = function (e: ProgressEvent<FileReader>) {
      let img = new Image();
      img.onload = () => {
        images.push(img);
        if (images.length === 1) {
          drawImage(0);
        }
        readFile(index + 1);
      };
      img.src = e.target!.result as string;
    };

    reader.readAsDataURL(file);
  }

  readFile(0);
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
    redrawCanvas();
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
  ctx.strokeStyle = "red";
  selectedAreas.forEach((area, index) => {
    ctx.strokeRect(area.x, area.y, area.width, area.height);
  });
  updateSelectedAreasList();
}

function updateSelectedAreasList() {
  const listElement = document.getElementById("selectedAreasList")!;
  listElement.innerHTML = ""; // リストをクリア
  selectedAreas.forEach((area, index) => {
    const areaElement = document.createElement("div");
    areaElement.innerText = `Area ${index + 1}: (${area.x}, ${area.y}) - ${
      area.width
    }x${area.height}`;
    const deleteButton = document.createElement("button");
    deleteButton.classList.add("btn");
    deleteButton.classList.add("btn-danger");
    deleteButton.innerText = "Delete";
    deleteButton.addEventListener("click", () => deleteArea(index));
    areaElement.appendChild(deleteButton);
    listElement.appendChild(areaElement);
  });
}

function deleteArea(index: number) {
  selectedAreas.splice(index, 1);
  redrawCanvas();
}

function cropImage() {
  const combinedCanvas = document.createElement("canvas");
  let totalHeight = 0;
  let maxWidth = 0;

  selectedAreas.forEach((area) => {
    const scaleFactor = MAX_WIDTH / images[currentImageIndex].width;
    const originalArea = {
      x: area.x / scaleFactor,
      y: area.y / scaleFactor,
      width: area.width / scaleFactor,
      height: area.height / scaleFactor,
    };

    totalHeight += originalArea.height;
    maxWidth = Math.max(maxWidth, originalArea.width);
  });

  combinedCanvas.width = maxWidth;
  combinedCanvas.height = totalHeight;
  const combinedCtx = combinedCanvas.getContext("2d")!;

  let currentY = 0;
  selectedAreas.forEach((area) => {
    // 各画像を描画
    const scaleFactor = MAX_WIDTH / images[currentImageIndex].width;
    const originalArea = {
      x: area.x / scaleFactor,
      y: area.y / scaleFactor,
      width: area.width / scaleFactor,
      height: area.height / scaleFactor,
    };

    combinedCtx.drawImage(
      images[currentImageIndex],
      originalArea.x,
      originalArea.y,
      originalArea.width,
      originalArea.height,
      0,
      currentY,
      originalArea.width,
      originalArea.height
    );

    document.getElementById("croppedImages")!.appendChild(combinedCanvas);
    currentY += originalArea.height;
  });
}

function downloadImage() {
  const croppedCanvases = document
    .getElementById("croppedImages")!
    .getElementsByTagName("canvas");
  const numOfCanvases = croppedCanvases.length;

  if (numOfCanvases === 0) {
    console.error("No cropped images to combine.");
    return;
  }

  let totalHeight = 0;
  let maxWidth = 0;

  Array.from(croppedCanvases).forEach((canvas) => {
    totalHeight += canvas.height;
    maxWidth = Math.max(maxWidth, canvas.width);
  });

  const combinedCanvas = document.createElement("canvas");
  combinedCanvas.width = maxWidth;
  combinedCanvas.height = totalHeight;
  const combinedCtx = combinedCanvas.getContext("2d")!;

  let currentY = 0;
  Array.from(croppedCanvases).forEach((canvas) => {
    combinedCtx.drawImage(canvas, 0, currentY);
    currentY += canvas.height;
  });

  const dataURL = combinedCanvas.toDataURL("image/jpeg");

  const downloadLink = document.createElement("a");
  downloadLink.href = dataURL;
  downloadLink.download = "combined_image.jpg";
  downloadLink.innerText = "Download Combined Image";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}
