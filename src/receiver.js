//frontend objects
const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const displayStatus = document.getElementById("displayMessage");

const vibeThreshold = 0.000001;
const RECEIVE_WINDOW = 500; //2bps
const SamplesPerSecond = 60; //tune up/down, higher requires more system resources
let intervalID; //required to stop the interval
let sensor = {x: 0.0, y: 0.0, z: 0.0};

window.addEventListener("error", (e) => {
	document.body.insertAdjacentHTML("afterbegin", `<pre style="color:red">${e.message}</pre>`);
});


function isVibrating(lastTime){
    return (performance.now() - lastTime) <= RECEIVE_WINDOW;
}

function binToString(binaryOutput, message){
    const code = parseInt(binaryOutput,2);
    message += String.fromCharCode(code);
    return message;
}

function receiver(previous, lastTime){
    if (previous){
        const diffrence = Math.hypot(sensor.x - previous.x, sensor.y - previous.y, sensor.z - previous.z);
        if(diffrence >= vibeThreshold){
            lastTime = performance.now();
        }   
    }

    previous = {x: sensor.x, y: sensor.y, z: sensor.z};
    return [lastTime, previous];
}
 
function interval(){
    
    binaryOutput = "";
    message = document.getElementById("displayMessage").value;
    let previous = {x: 0.0, y: 0.0, z: 0.0};
    let lastTime = -Infinity;
    displayStatus.innerHTML = "Check 1";
    let ticks = 0;
    intervalID = setInterval(() => {
        receiverValues = receiver(previous, lastTime);
	
        lastTime = receiverValues[0];
        previous = receiverValues[1];
	displayStatus.innerHTML = ticks;
	ticks += 1;
        if(isVibrating(lastTime)){
            binaryOutput += "1";
        }
        else{
            binaryOutput += "0";
        }
        if(binaryOutput.length == 8){ //This converts, in real time, the message to chars whenever 8 bytes have been sent.
            binToString(binaryOutput, message);
            displayStatus.innerHTML = binaryOutput;
            binaryOutput = "";
	}
    }, RECEIVE_WINDOW)


}
startButton.addEventListener("click", async(event) => {
    stopButton.disabled = false;
    startButton.disabled = true;
    try {
        let sensor = new Accelerometer({frequency: SamplesPerSecond});
        sensor.addEventListener("activate", () => {
        	now = performance.now();
        	displayStatus.innerHTML = "Starting Receiver 1";
        	interval();
        });
        sensor.start();
    } catch (error) {
        displayStatus.innerHTML = error;
        console.error(error);
    }

});


stopButton.addEventListener("click", async(event) => {
    displayStatus.innerHTML = "Stopping Receiver";
    stopButton.disabled = true;
    startButton.disabled = false;
    clearInterval(intervalID);

});
