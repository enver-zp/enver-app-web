const { Jimp } = require('jimp');

async function analyze(file) {
    try {
        const image = await Jimp.read('public/' + file);
        const w = image.bitmap.width;
        const h = image.bitmap.height;
        console.log(`\n--- Analyzing ${file} ---`);
        console.log(`Size: ${w}x${h}`);
        
        // Print the colors of the bottom 250 pixels at the center
        const centerX = Math.floor(w / 2);
        for (let y = h - 1; y >= h - 250; y -= 10) {
            const hex = image.getPixelColor(centerX, y).toString(16).padStart(8, '0');
            console.log(`Y=${y}: #${hex}`);
        }
        
    } catch (e) {
        console.error(e);
    }
}

async function run() {
    await analyze('info1.png');
    await analyze('info2.png');
}

run();
