//frontend objects
const form = document.getElementById("form");
const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const displayStatus = document.getElementById("displayMessage");
const thresholdButton = document.getElementById("submit");

let vibeThreshold = 0.1;
const RECEIVE_WINDOW = 550; //2bps
let SamplesPerSecond = 240;
let intervalID;
let accelerometer = null;   // created when Start is clicked
let message = "";           // decoded text so far

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

function isVibrating(lastTime){
    return (performance.now() - lastTime) <= RECEIVE_WINDOW;
}

function binToString(binaryOutput, message){
    const code = parseInt(binaryOutput, 2);
    return message + String.fromCharCode(code);
}

function receiver(previous, lastTime){
    if (previous){
        const difference = Math.hypot(
            accelerometer.x - previous.x,
            accelerometer.y - previous.y,
            accelerometer.z - previous.z
        );
        if (difference >= vibeThreshold){
            lastTime = performance.now();
        }
    }
    previous = {x: accelerometer.x, y: accelerometer.y, z: accelerometer.z};
    return [lastTime, previous];
}

function interval(){
    let binaryOutput = "";
    message = "";
    let previous = null;
    let lastTime = -Infinity;
    let ticks = 0;

    intervalID = setInterval(() => {
        const receiverValues = receiver(previous, lastTime);
        lastTime = receiverValues[0];
        previous = receiverValues[1];

        displayStatus.innerHTML = ticks++;
        binaryOutput += isVibrating(lastTime) ? "1" : "0";

        console.log("Output: " + binaryOutput);
        console.log("Sensor (X Y Z): " + accelerometer.x + " " + accelerometer.y + " " + accelerometer.z);

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
        accelerometer.addEventListener("activate", () => {
            displayStatus.innerHTML = "Starting Receiver 1";
            interval();
        });
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
