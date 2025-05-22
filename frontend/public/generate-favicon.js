const sharp = require('sharp');
const fs = require('fs');

// Read the SVG logo
const logo = fs.readFileSync('logo.svg', 'utf8');

// Convert SVG to PNG first
sharp(Buffer.from(logo))
    .resize(32, 32)
    .png()
    .toBuffer()
    .then(buffer => {
        // Convert PNG to ICO
        return sharp(buffer)
            .resize(32, 32)
            .ico()
            .toFile('favicon.ico')
            .then(() => {
                console.log('Favicon generated successfully!');
            });
    })
    .catch(err => {
        console.error('Error generating favicon:', err);
    });
