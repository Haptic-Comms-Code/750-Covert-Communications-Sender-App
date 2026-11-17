//frontend objects
const form = document.getElementById("form");
const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const displayStatus = document.getElementById("displayMessage");

let vibeThreshold = 0.1;
const RECEIVE_WINDOW = 500; //2bps
let SamplesPerSecond = 240;
let intervalID = null;
let accelerometer = null;

let vibratedThisWindow = false; // latch: true once a vibration is seen this window
let prevSample = null;
let message = "";

document.getElementById("displaySensitivity").innerHTML = vibeThreshold;
document.getElementById("displaySPS").innerHTML = SamplesPerSecond;

window.addEventListener("error", (e) => {
    document.body.insertAdjacentHTML("afterbegin", `<pre style="color:red">${e.message}</pre>`);
});

function stopReceiver(){
    displayStatus.innerHTML = "Stopping Receiver";
    stopButton.disabled = true;
    startButton.disabled = false;
    clearInterval(intervalID);
    intervalID = null;
    if (accelerometer) accelerometer.stop();
}

form.addEventListener("submit", (event) => {
    event.preventDefault();
    vibeThreshold = parseFloat(document.getElementById("sensitivity").value);
    SamplesPerSecond = parseInt(document.getElementById("sps").value);
    document.getElementById("displaySensitivity").innerHTML = vibeThreshold;
    document.getElementById("displaySPS").innerHTML = SamplesPerSecond;
    stopReceiver();
});

function binToString(binaryOutput, message){
    const code = parseInt(binaryOutput, 2);
    return message + String.fromCharCode(code);
}

// Runs on EVERY sensor sample (~SamplesPerSecond times/sec)
function onReading(){
    if (vibratedThisWindow) return;      // already got one this window: ignore the rest

    if (prevSample){
        const difference = Math.hypot(
            accelerometer.x - prevSample.x,
            accelerometer.y - prevSample.y,
            accelerometer.z - prevSample.z
        );
        if (difference >= vibeThreshold){
            vibratedThisWindow = true;   // latch
        }
    }
    prevSample = {x: accelerometer.x, y: accelerometer.y, z: accelerometer.z};
}

function interval(){
    if (intervalID !== null) return;     // never run two intervals at once

    let binaryOutput = "";
    message = "";
    vibratedThisWindow = false;
    prevSample = null;
    let ticks = 0;

    intervalID = setInterval(() => {
        binaryOutput += vibratedThisWindow ? "1" : "0";
        vibratedThisWindow = false;      // open the next window

        displayStatus.innerHTML = ticks++;
        console.log("Output: " + binaryOutput);

        if (binaryOutput.length == 8){
            message = binToString(binaryOutput, message);
            console.log("Message so far: " + message);
            displayStatus.innerHTML = binaryOutput;
            binaryOutput = "";
        }
    }, RECEIVE_WINDOW);
}

startButton.addEventListener("click", () => {
    stopButton.disabled = false;
    startButton.disabled = true;
    try {
        displayStatus.innerHTML = "Entered try block. If this message persists, enable the accelerometer on your phone and try again.";
        accelerometer = new Accelerometer({frequency: SamplesPerSecond});
        accelerometer.addEventListener("reading", onReading);
        accelerometer.addEventListener("activate", () => {
            displayStatus.innerHTML = "Starting Receiver";
            interval();
        }, {once: true});
        accelerometer.addEventListener("error", (e) => {
            displayStatus.innerHTML = e.error.name + ": " + e.error.message;
        });
        accelerometer.start();
    } catch (error) {
        displayStatus.innerHTML = error;
        console.error(error);
        startButton.disabled = false;
        stopButton.disabled = true;
    }
});

stopButton.addEventListener("click", stopReceiver);
