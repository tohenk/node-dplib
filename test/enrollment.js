/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2019-2023 Toha <tohenk@yahoo.com>
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

const dp = require('..');

const MAX_FMD = 4;
const fmds = [];
let xstatus = null;

dp.init();

console.log('Readers:', dp.getReaders());
console.log(`\nAttention!!! You need to enroll ${MAX_FMD} different fingers next.`);

function enroll() {
    let stage = 1;
    let stages = dp.getFeaturesLen();
    console.log('\n=== Fingerprint enrollment ===\n');
    dp.startAcquire(true, (status, data) => {
        switch (status) {
            case 'disconnected':
                if (xstatus != status) {
                    console.log('Please connect fingerprint reader...');
                }
                break;
            case 'connected':
                if (fmds.length > 0) {
                    console.log('Swipe another finger to enroll...');
                } else {
                    console.log('Swipe your finger to enroll...');
                }
                break;
            case 'error':
                console.log('Error occurred, please try again...');
                break;
            case 'complete':
                console.log('Finger acquired (%d/%d)', stage, stages);
                stage++;
                break;
            case 'enrolled':
                if (data) {
                    fmds.push(data);
                }
                dp.stopAcquire(() => {
                    if (fmds.length < MAX_FMD) {
                        console.log('Enroll another finger...');
                        enroll();
                    } else {
                        verify();
                    }
                });
                break;
        }
        xstatus = status;
    });
}

function verify() {
    console.log('\n=== Fingerprint identification ===\n');
    dp.startAcquire((status, data) => {
        switch (status) {
            case 'disconnected':
                if (xstatus != status) {
                    console.log('Please connect fingerprint reader...');
                }
                break;
            case 'connected':
                console.log('Swipe your finger to verify...');
                break;
            case 'error':
                break;
            case 'complete':
                dp.identify(data, fmds)
                    .then(idx => {
                        if (idx >= 0) {
                            console.log('Finger matched at %d', idx);
                            dp.stopAcquire(() => {
                                console.log('It is done, exiting...');
                                dp.exit();
                            });
                        } else {
                            console.log('Finger not matched, try again');
                            verify();
                        }
                    })
                    .catch(err => {
                        console.log(err);
                    });
                break;
        }
        xstatus = status;
    });
}

enroll();
