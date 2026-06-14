const Jimp = require('jimp');
const path = require('path');

async function cropAIWatermark(filename) {
    const imgPath = path.join(__dirname, 'public', filename);
    const outPath = path.join(__dirname, 'public', 'cropped_' + filename);
    
    try {
        const image = await Jimp.read(imgPath);
        const w = image.bitmap.width;
        const h = image.bitmap.height;
        
        let cropY = h - 1;
        const scanX = Math.floor(w / 2); // Scan the middle column
        
        // Read the color of the very bottom-middle pixel
        const bottomColor = Jimp.intToRGBA(image.getPixelColor(scanX, h - 1));
        
        // Walk up until the color changes significantly
        for (let y = h - 1; y >= 0; y--) {
            const pixel = Jimp.intToRGBA(image.getPixelColor(scanX, y));
            
            // Calculate color distance
            const rDiff = Math.abs(pixel.r - bottomColor.r);
            const gDiff = Math.abs(pixel.g - bottomColor.g);
            const bDiff = Math.abs(pixel.b - bottomColor.b);
            
            // If the color differs by more than a threshold, we found the boundary
            if (rDiff > 30 || gDiff > 30 || bDiff > 30) {
                cropY = y;
                break;
            }
        }
        
        // Add a small safety margin (don't crop too tightly, or maybe we want exact)
        // If the AI red block has a small border, we might want to just crop at cropY.
        
        console.log(`File ${filename}: Detected AI banner height: ${h - cropY}px. Total height: ${h}. Cropping at Y=${cropY}`);
        
        if (cropY < h - 10) {
            // Crop from 0,0 to width, cropY
            image.crop(0, 0, w, cropY);
            await image.writeAsync(outPath);
            console.log(`Successfully cropped and saved ${outPath}`);
        } else {
            console.log(`No significant block found at bottom for ${filename}`);
        }
        
    } catch (e) {
        console.error('Error processing ' + filename, e);
    }
}

async function run() {
    await cropAIWatermark('info1.png');
    await cropAIWatermark('info2.png');
}

run();
