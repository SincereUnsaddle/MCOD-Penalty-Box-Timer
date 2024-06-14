document.addEventListener('DOMContentLoaded', function() {
    const stopwatches = [
        { id: 'whiteBlocker1', label: 'White Blocker 1' },
        { id: 'whiteBlocker2', label: 'White Blocker 2' },
        { id: 'whiteJammer', label: 'White Jammer' },
        { id: 'blackBlocker1', label: 'Black Blocker 1' },
        { id: 'blackBlocker2', label: 'Black Blocker 2' },
        { id: 'blackJammer', label: 'Black Jammer' }
    ];

    stopwatches.forEach(sw => {
        const stopwatch = document.getElementById(sw.id);

        stopwatch.innerHTML = `
            <div class="message"></div>
            <div class="time-container">
                <div class="time">30</div>
                <button class="add-time-button" onclick="addTime('${sw.id}', 30)">+</button>
            </div>
            <div class="controls">
                <button class="start-button" onclick="toggleStopwatch('${sw.id}', this)">Start</button>
                <button class="reset-button" onclick="resetStopwatch('${sw.id}')">Reset</button>
            </div>
        `;
    });

    updateMasterButton();
});

const intervals = {};
const remainingTimes = {}; // Store remaining times in hundredths of a second

function toggleStopwatch(id, button) {
    const stopwatch = document.getElementById(id);
    const timeDiv = stopwatch.querySelector('.time');
    const messageDiv = stopwatch.querySelector('.message');

    if (!intervals[id]) { // Timer is not running
        let startTime = Date.now();
		if (id=='whiteJammer'&&remainingTimes['blackJammer']){ //update jammer time if jammer is in the box
			remainingTimes['whiteJammer']=3000+(-remainingTimes['blackJammer']%3000);
			resetStopwatch('blackJammer');
		}
		if (id=='blackJammer'&&remainingTimes['whiteJammer']){
			remainingTimes['blackJammer']=3000+(-remainingTimes['whiteJammer']%3000);
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
                timeDiv.textContent = '0:0';
                clearInterval(intervals[id]);
                delete intervals[id];
                delete remainingTimes[id];

                setTimeout(() => {
                    resetStopwatch(id); // Reset after showing "Go"
                }, 1000); // Show "Go" for 1 second

                updateMasterButton(); // Ensure the master button state is updated
            } else {
                if (remainingTimes[id] <= 1000) {
                    stopwatch.classList.add('red');
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
    stopwatch.classList.remove('green');
    messageDiv.textContent = '';
    timeDiv.textContent = '30';

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
        masterButton.textContent = 'Stop';
        masterButton.classList.add('stop-button');
        masterButton.style.backgroundColor = '#ec008c';
        masterButton.disabled = false;
    } else if (anyStopped) {
        masterButton.textContent = 'Continue';
        masterButton.classList.remove('stop-button');
        masterButton.style.backgroundColor = 'black';
        masterButton.style.color = 'white';
        masterButton.disabled = false;
    } else {
        masterButton.textContent = 'Empty Box';
        masterButton.classList.remove('stop-button');
        masterButton.style.backgroundColor = 'white';
        masterButton.style.color = 'black';
        masterButton.style.cursor = 'not-allowed';
        masterButton.disabled = true;
    }
}
document.addEventListener('DOMContentLoaded', function() {
    const settingsIcon = document.getElementById('settings-icon');
    const settingsMenu = document.getElementById('settings-menu');
    const backgroundSelect = document.getElementById('background');

    // Toggle visibility of settings menu
    settingsIcon.addEventListener('click', function() {
        if (settingsMenu.classList.contains('hidden')) {
            settingsMenu.classList.remove('hidden');
            settingsMenu.classList.add('visible');
        } else {
            settingsMenu.classList.remove('visible');
            settingsMenu.classList.add('hidden');
        }
    });

    // Change background color
    backgroundSelect.addEventListener('change', function() {
        document.body.style.background = backgroundSelect.value;
    });
});
