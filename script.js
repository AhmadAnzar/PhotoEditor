
const removeBgButton = document.getElementById('removeBgButton');
const imageInput = document.getElementById('imageInput');
const resultImage = document.getElementById('resultImage');
const downloadButton = document.getElementById('downloadButton');
const brightnessSlider = document.getElementById('brightness');

let originalImage = null; // Store the original image for brightness adjustments
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

// Event listener for file input
imageInput.addEventListener('change', () => {
    const file = imageInput.files[0];
    if (file) {
        const previewURL = URL.createObjectURL(file);
        resultImage.src = previewURL; // Show preview in the output area
        originalImage = new Image();
        originalImage.src = previewURL; // Store original image
    }
});

// Remove Background API Integration
removeBgButton.addEventListener('click', async () => {
    const file = imageInput.files[0];
    if (!file) {
        alert('Please upload an image first.');
        return;
    }

    const formData = new FormData();
    formData.append('image_file', file);
    formData.append('size', 'auto');

    try {
        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
                'X-Api-Key': 'RV6qaJvwq1ADWpns5ypWoBhw'
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        resultImage.src = url;
        originalImage = new Image();
        originalImage.src = url; // Update original image after processing
    } catch (error) {
        console.error(error);
        alert('Failed to process the image.');
    }
});

// Download Button Functionality
downloadButton.addEventListener('click', () => {
    if (resultImage.src) {
        const link = document.createElement('a');
        link.href = resultImage.src;
        link.download = 'processed-image.png'; // Default name for the downloaded file
        link.click();
    } else {
        alert('No image to download!');
    }
});

// Brightness Adjustment Function
function adjustBrightness(image, brightness) {
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(data[i] * (brightness / 100), 255); // Red
        data[i + 1] = Math.min(data[i + 1] * (brightness / 100), 255); // Green
        data[i + 2] = Math.min(data[i + 2] * (brightness / 100), 255); // Blue
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL(); // Return the modified image as a data URL
}

// Brightness Slider Event Listener
brightnessSlider.addEventListener('input', (e) => {
    if (!originalImage) {
        alert('Please upload or process an image first.');
        return;
    }
    const brightness = e.target.value;
    resultImage.src = adjustBrightness(originalImage, brightness);
});


const cropCanvas = document.getElementById('cropCanvas');
const cropCtx = cropCanvas.getContext('2d');
let cropping = false;
let startX, startY, endX, endY;

// Event to handle mouse down (start cropping)
resultImage.addEventListener('mousedown', (e) => {
const rect = resultImage.getBoundingClientRect();
startX = e.clientX - rect.left;
startY = e.clientY - rect.top;
cropping = true;
});

// Event to handle mouse movement (visualizing crop area)
resultImage.addEventListener('mousemove', (e) => {
if (cropping) {
    const rect = resultImage.getBoundingClientRect();
    endX = e.clientX - rect.left;
    endY = e.clientY - rect.top;

    cropCtx.clearRect(0, 0, cropCanvas.width, cropCanvas.height);
    cropCanvas.width = resultImage.width;
    cropCanvas.height = resultImage.height;

    cropCtx.drawImage(resultImage, 0, 0);
    cropCtx.beginPath();
    cropCtx.rect(startX, startY, endX - startX, endY - startY);
    cropCtx.strokeStyle = 'red';
    cropCtx.lineWidth = 2;
    cropCtx.stroke();
    cropCtx.closePath();
}
});

// Event to handle mouse up (apply cropping)
resultImage.addEventListener('mouseup', () => {
if (cropping) {
    cropping = false;

    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);
    const croppedImageData = cropCtx.getImageData(startX, startY, width, height);

    cropCanvas.width = width;
    cropCanvas.height = height;
    cropCtx.putImageData(croppedImageData, 0, 0);

    // Display cropped image
    const croppedImageURL = cropCanvas.toDataURL();
    resultImage.src = croppedImageURL;
}
});
