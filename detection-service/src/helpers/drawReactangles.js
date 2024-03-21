import { createCanvas } from 'canvas'

export function drawReactangles(rawImageData, predictions) {
    const canvas = createCanvas(rawImageData.width, rawImageData.height)
    const ctx = canvas.getContext('2d')

    const imageDataCanvas = ctx.createImageData(rawImageData.width, rawImageData.height)
    imageDataCanvas.data.set(rawImageData.data)
    ctx.putImageData(imageDataCanvas, 0, 0)
    ctx.strokeStyle = 'red'
    ctx.lineWidth = 3

    predictions.forEach(p => {
        ctx.beginPath()
        ctx.rect(p.bbox[0], p.bbox[1], p.bbox[2], p.bbox[3])
        ctx.stroke()
    })

    return canvas.toBuffer('image/jpeg')
}