import {calculateDistanceToTrack} from './track.js';
import './style.scss';

let statuses = {};
for (let status of ['extreme-kou', 'vrieskou', 'koud', 'lauw', 'vrij-warm', 'super-heet']) {
    statuses[status] = require(`./img/${status}.jpg`);
}

let lastUpdated = 0;
let gotFix = false;


function showError(message) {
    const element = document.getElementById("error-msg");
    if (message.length > 0) {
        setStatus('none');
        element.innerText = message;
    } else {
        element.innerText = "";
    }
}

function positionSuccess(position) {
    console.log(position);

    window.clearTimeout(positionTimerShort);
    window.clearTimeout(positionTimerLong);
    positionTimerShort = window.setTimeout(noNewPositionShort, 10 * 1000);
    positionTimerLong = window.setTimeout(noNewPositionLong, 30 * 1000);

    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const accuracy = position.coords.accuracy;

    if (accuracy > 30) {
        if (!gotFix) {
            setStatus('none');
            showError('De nauwkeurigheid van de GPS is momenteel te laag. We wachten op een beter signaal... ' +
                'Als je dit probleem blijft hebben, probeer dan de GPS op je gsm aan te zetten en/of de pagina te ' +
                'vernieuwen. Als dat niet lukt, doe dan de analoge tochttechniek');
        }
        return;
    }
    lastUpdated = new Date().getTime();
    gotFix = true;

    const data = calculateDistanceToTrack({lat: lat, lon: lon});
    const distance = data.distance;
    let trackDistance = data.trackDistance;

    let status;
    if (distance <= 10) {
        status = "super-heet";
    } else if (10 < distance && distance <= 20) {
        status = "vrij-warm";
    } else if (20 < distance && distance <= 50) {
        status = "lauw";
    } else if (50 <= distance && distance < 100) {
        status = "koud";
    } else if (100 <= distance && distance < 500) {
        status = "vrieskou";
    } else {
        status = "extreme-kou";
        trackDistance = 0;
    }

    setProgress(trackDistance, data.trackTotalDistance);
    setStatus(status);
    setAccuracy(accuracy);
    showError("");
}


function setStatus(status) {
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

function setAccuracy(accuracy) {
    const accuracyElement = document.getElementById("accuracy");
    accuracyElement.innerText = Math.round(accuracy).toString();
    document.getElementById("bottom-left").style.visibility = 'visible';
}

function setProgress(currentDistance, totalDistance) {
    const progressElement = document.getElementById("progress");
    progressElement.innerText =
        `${currentDistance.toFixed(0)} / ${totalDistance.toFixed(0)} m`;
    document.getElementById("bottom-left").style.visibility = 'visible';
}

function positionError(error) {
    if (error.code === 1) {
        // Permission denied
        showError("Je hebt geen toestemming gegeven voor de GPS locatie. Probeer de pagina te vernieuwen. " +
            "Als je niet opnieuw wordt gevraagd om toestemming te geven, klik dan op het hangslotje " +
            "in je adresbalk om de toestemming tot locatie te geven.");
        setStatus('none');
        console.log(error.message);
    } else {
        // Position unavailable
        showError("Je positie is momenteel niet beschikbaar... " +
            "Als je dit probleem blijft hebben, doe dan de analoge tochttechniek.");
        setStatus('none');
        console.log(error.message);
    }
}

window.setInterval(() => {
    if (lastUpdated !== 0) {
        let secondsPassed = Math.floor((new Date().getTime() - lastUpdated) / 1000);
        secondsPassed = Math.max(0, secondsPassed);
        document.getElementById("updated").innerText = secondsPassed.toString();
    }
}, 1000);

let positionOptions = {
    enableHighAccuracy: true
};
showError('We wachten op een GPS signaal. Als je nog geen toegang hebt gegeven tot je locatie, moet je dit nog doen');

let positionWatch;
positionWatch = navigator.geolocation.watchPosition(positionSuccess, positionError, positionOptions);

let positionTimerShort;
let positionTimerLong;

function noNewPositionShort() {
    console.log("Geen nieuwe positie voor 10 seconden, nieuwe watch zetten...");
    navigator.geolocation.clearWatch(positionWatch);
    positionWatch = navigator.geolocation.watchPosition(positionSuccess, positionError, positionOptions);

    window.clearTimeout(positionTimerShort);
    window.setTimeout(noNewPositionShort, 10 * 1000);
}

function noNewPositionLong() {
    console.log("Geen nieuwe positie voor 30 seconden, vraag aan gebruiker om pagina te verversen");
    showError('We hebben al lange tijd geen nieuwe locatie gekregen. Probeer je pagina te verversen.');
    setStatus('none');

    window.clearTimeout(positionTimerLong);
    window.setTimeout(noNewPositionShort, 30 * 1000);
}

positionTimerShort = window.setTimeout(noNewPositionShort, 10 * 1000);
positionTimerLong = window.setTimeout(noNewPositionLong, 30 * 1000);

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(registration => {
            console.log('SW registered: ', registration);
        }).catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
        });
    });
}
// setStatus('koud');
// setProgress(0.8);

document.getElementById('open-alert').addEventListener('click', () => {
    alert(`Gemaakt voor Chirolink 2021. Als je problemen hebt, doe dan de analoge tochttechniek. Deze tochttechniek werkt doorgaans ook beter op een android smartphone dan op een iPhone.

Je locatiegegevens blijven altijd binnen je apparaat: ze worden naar niemand doorgestuurd.

Versie: ${__VERSION__}`);
});

