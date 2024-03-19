require('@tensorflow/tfjs-node')
const cocoSsd = require('@tensorflow-models/coco-ssd')
const fs = require('fs')
const jpeg = require('jpeg-js')
const { createCanvas, loadImage } = require('canvas');

const image = fs.readFileSync('./image.jpg')
const rawImageData = jpeg.decode(image, true)

async function main() {
    const model = await cocoSsd.load();
    const predictions = await model.detect(rawImageData);

    const canvas = createCanvas(rawImageData.width, rawImageData.height);
    const ctx = canvas.getContext('2d');

    const imageDataCanvas = ctx.createImageData(rawImageData.width, rawImageData.height);
    imageDataCanvas.data.set(rawImageData.data);

    ctx.putImageData(imageDataCanvas, 0, 0);

    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;

    ctx.font = '24px Helvetica';
    for (let i = 0; i < predictions.length; i++) {
        const prediction = predictions[i];

            const text = `${prediction.class} (${Math.round(prediction.score * 100)}%)`;
            const textMetrics = ctx.measureText(text);
            const textWidth = textMetrics.width;
            const textHeight = parseInt(ctx.font, 8); 

            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.fillRect(prediction.bbox[0], prediction.bbox[1] - textHeight, textWidth, textHeight);

            
            ctx.fillStyle = 'black';
            ctx.fillText(prediction.class, prediction.bbox[0], prediction.bbox[1] - 5);
        ctx.beginPath();
        ctx.rect(prediction.bbox[0], prediction.bbox[1], prediction.bbox[2], prediction.bbox[3]);
        ctx.stroke();
    }

    const buffer = canvas.toBuffer('image/jpeg');

    if (!fs.existsSync('out')) {
        fs.mkdirSync('out');
    }

    fs.writeFileSync('out/image.jpg', buffer);

    console.log(predictions)
}

main()