//frontend objects
const startButton = document.getElementById("start")
const stopButton = document.getElementById("stop");
const displayStatus = document.getElementById("displayStatus");

const vibeThreshold = 1.0;
const RECEIVE_WINDOW = 500; //2bps
const SamplesPerSecond = 30; //tune up/down, higher requires more system resources
let intervalID; //required to stop the interval



function isVibrating(){
    return (performance.now() - lastTime) <= RECEIVE_WINDOW;
}

function binToString(binaryOutput, message){
    const code = parseInt(byte,2)
    message += String.fromCharCode(code)
    return message;
}

function reciever(){
    if (!("Accelerometer" in window)){
        console.error("API not supported. Use a different browser");
    }

    else{
        sensor = new Accelerometer({frequency: SamplesPerSecond}); 
    }

    let previous = null;
    let lastTime = -Infinity;

    sensor.addEventListener("activate", () => {
        now = performance.now();
    })

    if (previous){
        const diffrence = Math.hypot(sensor.x - previous.x, sensor.y - previous.y, sensor.z - previous.z);
        if(diffrence >= vibeThreshold){
            lastTime = performance.now();
        }   
    }

    previous = {x: sensor.x, y: sensor.y, z: sensor.z};

    binaryOutput = ""
    message = document.getElementById("message").value;

    intervalID = setInterval(() => {
        if(isVibrating){
            binaryOutput += "1";
        }
        else{
            binaryOutput += "0";
        }
        if(length(binaryOutput) == 8){ //This converts, in real time, the message to chars whenever 8 bytes have been sent.
            binToString(binaryOutput, message);
            document.getElementById("displayMessage").innerHTML = message;
        }
    }, RECEIVE_WINDOW)
    globalThis.intervalID


}
startButton.addEventListener("click", async(event) => {
    stopButton.disabled = false;
    startButton.disabled = true;
    displayStatus.innerHTML = "Starting Receiver";
    reciever()
});


stopButton.addEventListener("click", async(event) => {
    displayStatus.innerHTML = "Stopping Receiver";
    stopButton.disabled = true;
    startButton.disabled = false;
    clearInterval(intervalID)

});