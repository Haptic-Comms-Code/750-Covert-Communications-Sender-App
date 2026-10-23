/*
# SPDX-FileCopyrightText: 2026 Group 5
#
# SPDX-License-Identifier: MIT
*/
const form = document.getElementById("form");
const submitButton = document.getElementById("submit")
const stopButton = document.getElementById("stop");
const displayStatus = document.getElementById("displayStatus");
const startVibrateTime = 700
const waitTime = 500;
let runProcess = true;

stopButton.disabled = true;

/**
 * When the button is clicked, run the vibration program.
 */
form.addEventListener("submit", async(event) => {
    stopButton.disabled = false;
    submitButton.disabled = true;
    message = document.getElementById("message").value;
    console.log(message);
    document.getElementById("displayMessage").innerHTML = message;
    
    binaryOutput = ""
    for (var i = 0; i < message.length; i++){
        binaryOutput += message[i]
            .charCodeAt(0)      // Convert Ascii character to decimal,
            .toString(2)        // then convert it to binary,
            .padStart(8,'0')    // then add extra padding if result 
                                // is not 8 characters long.
            // + " "            // This line is for debug purposes only.
    }
    console.log(binaryOutput);
    document.getElementById("displayBinaryOutput").innerHTML = binaryOutput;
    
    // Send starting vibration, this will tell the reciever to start listening.
    displayStatus.innerHTML = "Starting..."
    try{
        navigator.vibrate(startVibrateTime);
    } catch { };
    await new Promise(r => setTimeout(r, startVibrateTime));

    //Send the message over
    for (var i = 0; i < binaryOutput.length; i++ ){
        // if the stop button is not pressed, do the if statement
        if (runProcess == true){
            console.log(binaryOutput[i]);
            statusMessage = `${binaryOutput[i]} (${i+1}/${binaryOutput.length})`;
            displayStatus.innerHTML = statusMessage;
            if (binaryOutput[i] == 1){
                try{
                    navigator.vibrate(waitTime);
                } catch { };
            }
            await new Promise(r => setTimeout(r, waitTime));
        } else {
            try{
                navigator.vibrate(0);
            } catch { };
            
            return;
        }
    }
    stopButton.disabled = true;
    submitButton.disabled = false;
    displayStatus.innerHTML = "Finished.";
});

/**
 * Stop the vibration program
 */
stopButton.addEventListener("click", async(event) => {
    runProcess = false;
    displayStatus.innerHTML = "Stopping Process.";
    await new Promise(r => setTimeout(r, startVibrateTime+500));
    stopButton.disabled = true;
    submitButton.disabled = false;
    runProcess = true;
    displayStatus.innerHTML = "Process Stopped.";
});