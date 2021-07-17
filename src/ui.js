const statuses = {};
for (let status of ['extreme-kou', 'vrieskou', 'koud', 'lauw', 'vrij-warm', 'super-heet']) {
    statuses[status] = require(`./img/${status}.jpg`);
}

let lastUpdated = 0;

const accuracyElement = document.getElementById("accuracy");
const lastUpdatedElement = document.getElementById("last-updated");
const progressElement = document.getElementById("progress");
const bottomLeftElement = document.getElementById("bottom-left");
const errorElement = document.getElementById("error-msg");
const openAlertElement = document.getElementById('open-alert');

export function initUI() {
    window.setInterval(() => {
        if (lastUpdated !== 0) {
            let secondsPassed = Math.floor((new Date().getTime() - lastUpdated) / 1000);
            secondsPassed = Math.max(0, secondsPassed);
            lastUpdatedElement.innerText = secondsPassed.toString();
        }
    }, 1000);

    openAlertElement.addEventListener('click', () => showInfoAlert());
}

export function setStatus(status) {
    lastUpdated = new Date().getTime();
    for (let div of document.getElementsByClassName("status")) {
        div.style.display = 'none';
    }

    if (!status || status === 'none') {
        document.documentElement.style.cssText = `background: none;`;
        document.body.style.color = 'black';
        document.body.style.textShadow = "";
        return;
    }

    showError('');

    document.getElementById(status).style.display = 'block';
    document.documentElement.style.cssText = `background: url(${statuses[status]}) no-repeat center center fixed;
                                                  background-size: cover;`;
    document.body.style.color = 'white';
    document.body.style.textShadow = '0 0 24px black';
}


export function setAccuracy(accuracy) {
    accuracyElement.innerText = Math.round(accuracy).toString();
    bottomLeftElement.style.visibility = 'visible';
}

export function setProgress(currentDistance, totalDistance) {
    progressElement.innerText =
        `${Math.round(currentDistance)} / ${Math.round(totalDistance)}m`;
    bottomLeftElement.style.visibility = 'visible';
}

export function showError(message) {
    if (message.length > 0) {
        setStatus('none');
        errorElement.innerText = message;
    } else {
        errorElement.innerText = "";
    }
}

export function showInfoAlert() {
    alert(`Gemaakt voor Chirolink 2021. Als je problemen hebt, doe dan de analoge tochttechniek.

Je locatiegegevens blijven altijd binnen je apparaat: ze worden naar niemand doorgestuurd, ook niet naar Chirolink.

Je kan het codeboekje voor de tocht van Maaseik downloaden op de site van Chirolink: https://chirolink.be/dagtochten/maaseik/

Versie: ${__VERSION__}

Commit: ${__COMMIT_HASH__}`);
}
