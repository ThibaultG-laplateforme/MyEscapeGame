// pause.js
import { closeSettingsModal, openSettingsModal } from "./settings.js";
import { SESSION_TYPE } from "./main.js";

let timerInterval = null; 
let isTimerRunning = false; 
let isPaused = false; 
let remainingTime = 300; 
const timerElement = document.getElementById('timer'); 


export function startTimer() {
    if (!isTimerRunning && !isPaused) {
        isTimerRunning = true;
        timerInterval = setInterval(updateTimer, 1000);
    }
}

export function penalizeTime(timePenalty) {
    remainingTime -= timePenalty;
    if (remainingTime < 0) {
        remainingTime = 0;
    }
}

function stopTimer() {
    if (isTimerRunning) {
        clearInterval(timerInterval);
        isTimerRunning = false;
    }
}


function updateTimer() {
    if (remainingTime > 0) {
        remainingTime--; 
        const minutes = Math.floor(remainingTime / 60);
        const displaySeconds = remainingTime % 60;
        timerElement.textContent = `${minutes}:${displaySeconds.toString().padStart(2, '0')}`;
    } else {
        timerElement.textContent = "Temps écoulé!";
        stopTimer(); 
    }
}

export function togglePauseMenu(characterController) {
    const pauseModal = document.getElementById("settings-modal");
    if (!pauseModal) {
        console.error("Element 'settings-modal' not found!");
        return;
    }
    const isActive = pauseModal.classList.toggle("active");

    if (isActive) {
        if (localStorage.getItem("sessionType") == SESSION_TYPE.SOLO)
        {stopTimer();} 
        isPaused = true; 
        openSettingsModal();
        SDK3DVerse.disableInputs(); 
    } else {
        isPaused = false;
        SDK3DVerse.enableInputs();
        closeSettingsModal(characterController)
        startTimer(); 
    }
}

/*  ------------------------------------------------------------------------------------------------  */

export class Timer{
    timerInterval = null; 
    isTimerRunning = false; 
    isPaused = false; 
    remainingTime; 
    timerElement; 


    constructor(_remainingTime = 300){
        this.remainingTime = _remainingTime;
        this.timerElement = document.getElementById('timer');
    }

    startTimer() 
    {
        if (!this.isTimerRunning && !this.isPaused) {
            this.isTimerRunning = true;
            this.timerInterval = setInterval(this.updateTimer, 1000);
        }
    }

    penalizeTime(timePenalty)
    {
        this.remainingTime -= timePenalty;
        if (this.remainingTime < 0) {
            this.remainingTime = 0;
        }    
    }

    
    #stopTimer() {
        if (this.isTimerRunning) {
            clearInterval(this.timerInterval);
            this.isTimerRunning = false;
        }
    }

    #updateTimer() {
        if (this.remainingTime > 0) {
            this.remainingTime--; 
            this.renderTimer();
        } else {
            this.timerElement.textContent = "Temps écoulé!";
            this.stopTimer(); 
        }
    }

    #renderTimer(){
        const minutes = Math.floor(this.remainingTime / 60);
        const displaySeconds = this.remainingTime % 60;
        this.timerElement.textContent = `${minutes}:${displaySeconds.toString().padStart(2, '0')}`;
    }

    togglePauseMenu(characterController) {
        const pauseModal = document.getElementById("settings-modal");
        if (!pauseModal) {
            console.error("Element 'settings-modal' not found!");
            return;
        }
        const isActive = pauseModal.classList.toggle("active");
    
        if (isActive) {
            if (localStorage.getItem("sessionType") == SESSION_TYPE.SOLO)
            {this.stopTimer();} 
            this.isPaused = true; 
            openSettingsModal();
            SDK3DVerse.disableInputs(); 
        } else {
            this.isPaused = false;
            SDK3DVerse.enableInputs();
            closeSettingsModal(characterController)
            this.startTimer(); 
        }
    }
    
}
export let currentTimer;


/*  ------------------------------------------------------------------------------------------------  */