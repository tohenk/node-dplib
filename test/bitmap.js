/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2023 Toha <tohenk@yahoo.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */


const fs = require('fs');
const path = require('path');
const dp = require('..');

let xstatus = null;
let seq = 0;

dp.init();

console.log('Readers:', dp.getReaders());
console.log('\n=== Capture raw image, press Ctrl+C to end ===\n');

process.on('SIGINT', () => {
    console.log('Please wait doing cleanup...')
    dp.exit();
});

function capture(callback) {
    dp.startAcquire({raw: true}, (status, data) => {
        switch (status) {
            case 'disconnected':
                if (xstatus != status) {
                    console.log('Please connect fingerprint reader...');
                }
                break;
            case 'connected':
                console.log('Swipe your finger to capture the image...');
                break;
            case 'error':
                break;
            case 'complete':
                dp.stopAcquire(() => {
                    callback(data);
                });
                break;
        }
        xstatus = status;
    });
}

(function f() {
    capture(async data => {
        let filename;
        try {
            while (true) {
                filename = path.join(process.cwd(), `finger${++seq > 0 ? seq : ''}.bmp`);
                if (!fs.existsSync(filename)) {
                    break;
                }
            }
            fs.writeFileSync(filename, Buffer.from(data));
            console.log(`Saved to ${filename}`);
        }
        catch (err) {
            console.error(err);
        }
        f();
    });
})();
