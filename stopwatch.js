document.addEventListener('DOMContentLoaded', function() {
    const stopwatches = [
        { id: 'whiteBlocker1', label: 'White Blocker 1' },
        { id: 'whiteBlocker2', label: 'White Blocker 2' },
		{ id: 'whiteBlocker3', label: 'White Blocker 3' },
		{ id: 'whiteBlocker4', label: 'White Blocker 4' },
        { id: 'whiteJammer', label: 'White Jammer' },
        { id: 'blackBlocker1', label: 'Black Blocker 1' },
        { id: 'blackBlocker2', label: 'Black Blocker 2' },
		{ id: 'blackBlocker3', label: 'Black Blocker 3' },
		{ id: 'blackBlocker4', label: 'Black Blocker 4' },
        { id: 'blackJammer', label: 'Black Jammer' }
    ];

    stopwatches.forEach(sw => {
		const initialTime = 30 * timeMultiplier;
        const stopwatch = document.getElementById(sw.id);

        stopwatch.innerHTML = `
            <div class="message"></div>
            <div class="time-container">
                <div class="time">${initialTime}</div>
               
            </div>
            <div class="controls">
                <button class="start-button" onclick="toggleStopwatch('${sw.id}', this)">Start</button>
                <button class="reset-button" onclick="resetStopwatch('${sw.id}')">Reset</button>
				 <button class="add-time-button" onclick="addTime('${sw.id}', (30 * timeMultiplier))">+</button>
            </div>
        `;
    });
    updateMasterButton();
});

const intervals = {};
const remainingTimes = {}; // Store remaining times in hundredths of a second
let timeMultiplier = 1;

function toggleStopwatch(id, button) {
    const stopwatch = document.getElementById(id);
    const timeDiv = stopwatch.querySelector('.time');
    const messageDiv = stopwatch.querySelector('.message');

    if (!intervals[id]) { // Timer is not running
        let startTime = Date.now();
		if (id=='whiteJammer'&&remainingTimes['blackJammer']){ //update jammer time if jammer is in the box
			remainingTimes['whiteJammer']=(3000 * timeMultiplier)+(-remainingTimes['blackJammer']%(3000 * timeMultiplier));
			resetStopwatch('blackJammer');
		}
		if (id=='blackJammer'&&remainingTimes['whiteJammer']){
			remainingTimes['blackJammer']=(3000 * timeMultiplier)+(-remainingTimes['whiteJammer']%(3000 * timeMultiplier));
			resetStopwatch('whiteJammer');
		}
		
        if (!remainingTimes[id]) {
			remainingTimes[id] = parseFloat(timeDiv.textContent) * 100;
		}
		
        intervals[id] = setInterval(update, 10);

        button.textContent = 'Stop';
        button.classList.add('stop-button');

        function update() {
            const currentTime = Date.now();
            const elapsed = (currentTime - startTime) / 10; // Convert to hundredths of a second
            remainingTimes[id] -= elapsed;

            if (remainingTimes[id] <= 0) {
                remainingTimes[id] = 0;
                messageDiv.textContent = 'Go';
                stopwatch.classList.remove('red');
                stopwatch.classList.add('green');
                timeDiv.textContent = '0"0';
                clearInterval(intervals[id]);
                delete intervals[id];
                delete remainingTimes[id];

                setTimeout(() => {
                    resetStopwatch(id); // Reset after showing "Go"
                }, 1000); // Show "Go" for 1 second

                updateMasterButton(); // Ensure the master button state is updated
            } else {
                if (remainingTimes[id] <= 1100) {
                    stopwatch.classList.add('yellow');
                    messageDiv.textContent = '';
                    timeDiv.textContent = (remainingTimes[id] / 100).toFixed(1).replace('.', '"');
                } 
				if (remainingTimes[id] <= 1000) {
                    stopwatch.classList.add('red');
					stopwatch.classList.remove('yellow');
                    messageDiv.textContent = 'Stand Up';
                    timeDiv.textContent = (remainingTimes[id] / 100).toFixed(1).replace('.', '"');
                } else {
                    timeDiv.textContent = Math.ceil(remainingTimes[id] / 100);
                }
            }

            startTime = currentTime;
        }
    } else { // Timer is running
        clearInterval(intervals[id]);
        delete intervals[id];

        button.textContent = 'Start';
        button.classList.remove('stop-button');
    }

    updateMasterButton(); // Update the master button state
}

function addTime(id, seconds) {
    const stopwatch = document.getElementById(id);
    const timeDiv = stopwatch.querySelector('.time');
    const messageDiv = stopwatch.querySelector('.message');

    if (!remainingTimes[id]) {
        remainingTimes[id] = parseFloat(timeDiv.textContent) * 100;
    }

    remainingTimes[id] += seconds * 100;
	
	messageDiv.textContent = '';
    stopwatch.classList.remove('red');
	stopwatch.classList.remove('yellow');

    if (!intervals[id]) {
        // If the timer is not running, update the display immediately
        if (remainingTimes[id] <= 1000) {
            timeDiv.textContent = (remainingTimes[id] / 100).toFixed(1).replace('.', ':');
        } else {
            timeDiv.textContent = Math.ceil(remainingTimes[id] / 100);
        }
    }
}

function resetStopwatch(id) {
    if (intervals[id]) {
        clearInterval(intervals[id]);
        delete intervals[id];
    }
    delete remainingTimes[id];

    const stopwatch = document.getElementById(id);
    const timeDiv = stopwatch.querySelector('.time');
    const messageDiv = stopwatch.querySelector('.message');
    const startButton = stopwatch.querySelector('.start-button');

    stopwatch.classList.remove('red');
	stopwatch.classList.remove('yellow');
    stopwatch.classList.remove('green');
    messageDiv.textContent = '';
    timeDiv.textContent = timeMultiplier * 30;

    // Change button to Start after reset
    startButton.textContent = 'Start';
    startButton.classList.remove('stop-button');

    updateMasterButton(); // Update the master button state
}

function toggleAllStopwatches() {
    const masterButton = document.getElementById('masterButton');
    const buttonText = masterButton.textContent;

    if (buttonText === 'Continue') {
        masterButton.textContent = 'Stop';
        masterButton.classList.add('stop-button');
        masterButton.style.backgroundColor = '#dc3545';

        // Start all stopped stopwatches that are not on initial value
        document.querySelectorAll('.stopwatch').forEach(sw => {
            const startButton = sw.querySelector('.start-button');
            if (startButton.textContent === 'Start' && remainingTimes[sw.id]) {
                toggleStopwatch(sw.id, startButton);
            }
        });
    } else {
        masterButton.textContent = 'Continue';
        masterButton.classList.remove('stop-button');
        masterButton.style.backgroundColor = '#007bff';

        // Stop all running stopwatches
        Object.keys(intervals).forEach(id => {
            clearInterval(intervals[id]);
            delete intervals[id];
            const startButton = document.querySelector(`#${id} .start-button`);
            startButton.textContent = 'Start';
            startButton.classList.remove('stop-button');
        });
    }

    updateMasterButton(); // Ensure the master button state is updated
}

function updateMasterButton() {
    const masterButton = document.getElementById('masterButton');
    const anyRunning = Object.keys(intervals).length > 0;
    const anyStopped = Object.keys(remainingTimes).length > 0;

    if (anyRunning) {
        masterButton.textContent = 'Stop All';
        masterButton.classList.add('stop-button');
        masterButton.style.backgroundColor = '#ec008c';
		masterButton.style.cursor = 'pointer';
        masterButton.disabled = false;
    } else if (anyStopped) {
        masterButton.textContent = 'Continue';
        masterButton.classList.remove('stop-button');
        masterButton.style.backgroundColor = 'black';
        masterButton.style.color = 'white';
		masterButton.style.cursor = 'pointer';
        masterButton.disabled = false;
    } else {
        masterButton.textContent = 'Empty Box';
        masterButton.classList.remove('stop-button');
        masterButton.style.backgroundColor = '#ec008c';
        masterButton.style.color = 'black';
        masterButton.style.cursor = 'not-allowed';
        masterButton.disabled = true;
    }
}



function saveSettings() {
    const background = document.getElementById('background').value;
    const team1Color = document.getElementById('team1-color').value;
    const team2Color = document.getElementById('team2-color').value;
	const team1Font = document.getElementById('team1fontColor').value;
    const team2Font = document.getElementById('team2fontColor').value;
    const penaltyDuration = parseInt(document.getElementById('penalty-duration').value); 
	const settingsMenu = document.getElementById('settings-menu');
	
	
	if (penaltyDuration !== (timeMultiplier * 30)) {
        timeMultiplier = penaltyDuration / 30;

        // Update the time displayed on each stopwatch
        const stopwatches = document.querySelectorAll('.time');
        stopwatches.forEach(timeDiv => {
            const newTime = 30 * timeMultiplier;
            timeDiv.textContent = newTime;
			
        });

        // Update remainingTimes to reflect the new timeMultiplier
        for (let id in remainingTimes) {
            if (remainingTimes.hasOwnProperty(id)) {
                remainingTimes[id] = 3000 * timeMultiplier;
            }
        }
    }
	
	document.getElementById("tbl").style.background = background;
	document.documentElement.style.setProperty('--team1Color', team1Color);
    document.documentElement.style.setProperty('--team2Color', team2Color);
	document.documentElement.style.setProperty('--team1fontColor', team1Font);
    document.documentElement.style.setProperty('--team2fontColor', team2Font);
	document.getElementById("settings-menu").style.width = "0%";
	
	

	
	 
}


function openNav() {
	const background = document.getElementById('background');
    const team1Color = document.getElementById('team1-color');
    const team2Color = document.getElementById('team2-color');
	const team1Font = document.getElementById('team1fontColor');
    const team2Font = document.getElementById('team2fontColor');
    const penaltyDuration = parseInt(document.getElementById('penalty-duration').value); 
	const settingsMenu = document.getElementById('settings-menu');
	document.getElementById("settings-tbl").style.background = background.value;
	document.getElementById("team1col").style.background = team1Color.value;
	document.getElementById("team1fon").style.background = team1Color.value;
	document.getElementById("team2col").style.background = team2Color.value;
	document.getElementById("team2fon").style.background = team2Color.value;
	document.getElementById("team1fon").style.color = team1Font.value;
	document.getElementById("team2fon").style.color = team2Font.value;
	document.getElementById("team1col").style.color = team1Font.value;
	document.getElementById("team2col").style.color = team2Font.value;
	
 settingsMenu.style.width = "100%";
  background.addEventListener('change', function() {
        document.getElementById("settings-tbl").style.background = background.value;
    });
	team1Color.addEventListener('change', function() {
        document.getElementById("team1col").style.background = team1Color.value;
		document.getElementById("team1fon").style.background = team1Color.value;
    });
	team2Color.addEventListener('change', function() {
        document.getElementById("team2col").style.background = team2Color.value;
		document.getElementById("team2fon").style.background = team2Color.value;
    });
	team1Font.addEventListener('change', function() {
        document.getElementById("team1fon").style.color = team1Font.value;
    });
	team2Font.addEventListener('change', function() {
        document.getElementById("team2fon").style.color = team2Font.value;
    });
	
}

/* Close when someone clicks on the "x" symbol inside the overlay */
function closeNav() {
  document.getElementById("settings-menu").style.width = "0%";
}