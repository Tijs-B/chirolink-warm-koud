import {calculateDistanceToTrack} from './track.js';
import {showError, setAccuracy, setProgress, setStatus} from "./ui.js";
import './style.scss';


let lastUpdated = 0;
let gotFix = false;


function positionSuccess(position) {
    console.log(position);

    resetShortTimer();
    resetLongTimer();

    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const accuracy = position.coords.accuracy;

    if (accuracy > 30) {
        if (!gotFix) {
            showError(`De nauwkeurigheid van de GPS is momenteel te laag (${accuracy} m). We wachten op een beter signaal... ` +
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

function positionError(error) {
    if (error.code === 1) {
        // Permission denied
        showError("Je hebt geen toestemming gegeven voor de GPS locatie. Probeer de pagina te vernieuwen. " +
            "Als je niet opnieuw wordt gevraagd om toestemming te geven, klik dan op het hangslotje " +
            "in je adresbalk om de toestemming tot locatie te geven.");
        console.log(error.message);
    } else {
        // Position unavailable
        showError("Je positie is momenteel niet beschikbaar... " +
            "Als je dit probleem blijft hebben, doe dan de analoge tochttechniek.");
        console.log(error.message);
    }
}

window.setInterval(() => {
    if (lastUpdated !== 0) {
        let secondsPassed = Math.floor((new Date().getTime() - lastUpdated) / 1000);
        secondsPassed = Math.max(0, secondsPassed);
        document.getElementById("updated").innerText = secondsPassed.toString();

        if (secondsPassed >= 100) {
            resetPositionWatch();
        }
    }
}, 1000);

const positionOptions = {
    enableHighAccuracy: true
};
showError('We wachten op een GPS signaal. Als je nog geen toegang hebt gegeven tot je locatie, moet je dit nog doen');

let positionWatch;
let positionTimerShort;
let positionTimerLong;

function resetShortTimer() {
    if (typeof positionTimerShort !== 'undefined') {
        window.clearTimeout(positionTimerShort);
    }
    positionTimerShort = window.setTimeout(noNewPositionShort, 10 * 1000);
}

function resetLongTimer() {
    if (typeof positionTimerLong !== 'undefined') {
        window.clearTimeout(positionTimerLong);
    }
    positionTimerLong = window.setTimeout(noNewPositionLong, 30 * 1000);
}

function resetPositionWatch() {
    if (typeof positionWatch !== 'undefined') {
        navigator.geolocation.clearWatch(positionWatch);
    }
    positionWatch = navigator.geolocation.watchPosition(positionSuccess, positionError, positionOptions);
}

function noNewPositionShort() {
    resetPositionWatch();
    resetShortTimer();
}

function noNewPositionLong() {
    showError('We hebben al lange tijd geen nieuwe locatie gekregen. Probeer je pagina te verversen.');
    resetLongTimer();
}

resetShortTimer();
resetLongTimer();
resetPositionWatch();

window.addEventListener('focus', resetPositionWatch);

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(registration => {
            console.log('SW registered: ', registration);
        }).catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
        });
    });
}

document.getElementById('open-alert').addEventListener('click', () => {
    alert(`Gemaakt voor Chirolink 2021. Als je problemen hebt, doe dan de analoge tochttechniek. Deze tochttechniek werkt doorgaans ook beter op een android smartphone dan op een iPhone.

Je locatiegegevens blijven altijd binnen je apparaat: ze worden naar niemand doorgestuurd.

Versie: ${__VERSION__}`);
});

