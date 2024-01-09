interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

let canvas: HTMLCanvasElement = document.getElementById(
  "canvas"
) as HTMLCanvasElement;
let ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;
let image: HTMLImageElement = new Image();
let selectedArea: Rectangle = { x: 0, y: 0, width: 0, height: 0 };
let isDragging: boolean = false;

document
  .getElementById("imageInput")!
  .addEventListener("change", handleFileSelect, false);
document
  .getElementById("cropButton")!
  .addEventListener("click", cropImage, false);
canvas.addEventListener("mousedown", startDrag, false);
canvas.addEventListener("mousemove", drag, false);
canvas.addEventListener("mouseup", endDrag, false);

function handleFileSelect(event: Event) {
  const reader = new FileReader();
  reader.onload = function (e: ProgressEvent<FileReader>) {
    image.onload = function () {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
    };
    image.src = e.target!.result as string;
  };
  reader.readAsDataURL((event.target as HTMLInputElement).files![0]);
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
    ctx.drawImage(image, 0, 0);
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
    const croppedImage: ImageData = ctx.getImageData(
      selectedArea.x,
      selectedArea.y,
      selectedArea.width,
      selectedArea.height
    );
    const tempCanvas: HTMLCanvasElement = document.createElement("canvas");
    tempCanvas.width = selectedArea.width;
    tempCanvas.height = selectedArea.height;
    tempCanvas.getContext("2d")!.putImageData(croppedImage, 0, 0);

    document
      .getElementById("resultImage")!
      .setAttribute("src", tempCanvas.toDataURL());
    document.getElementById("resultImage")!.style.display = "block";
  }
}
