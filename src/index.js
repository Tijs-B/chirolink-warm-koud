import {calculateDistanceToTrack} from './track.js';
import {initUI, showError, setAccuracy, setProgress, setStatus} from "./ui.js";
import {initAudio, stopAudio, updateAudioStatus} from "./audio";

initUI();
initAudio();

let gotFix = false;
const isDev = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development');

function positionSuccess(position) {
    if (isDev) {
        console.log(position);
    }

    resetShortTimer();
    resetLongTimer();

    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const accuracy = position.coords.accuracy;

    if (! isDev && accuracy > 30) {
        if (!gotFix) {
            showError(`De nauwkeurigheid van je locatie is momenteel te laag (${Math.round(accuracy)}m). We wachten op een beter signaal... ` +
                'Als je dit probleem blijft hebben, probeer dan de GPS op je gsm aan te zetten en/of de pagina te ' +
                'vernieuwen. Als dat niet lukt, doe dan de analoge tochttechniek.');
            stopAudio();
        }
        return;
    }
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
    updateAudioStatus(status);
}

function positionError(error) {
    if (error.code === 1) {
        // Permission denied
        showError("Je hebt geen toestemming gegeven voor de GPS locatie. Probeer de pagina te vernieuwen. " +
            "Als je niet opnieuw wordt gevraagd om toestemming te geven, klik dan op het hangslotje " +
            "in je adresbalk om de toestemming tot locatie te geven.");
        stopAudio();
        console.log(error.message);
    } else {
        // Position unavailable
        showError("Je positie is momenteel niet beschikbaar... " +
            "Als je dit probleem blijft hebben, doe dan de analoge tochttechniek.");
        stopAudio();
        console.log(error.message);
    }
}

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
    console.log("Short timer ran out, resetting position watch");
    resetPositionWatch();
    resetShortTimer();
}

function noNewPositionLong() {
    console.log("Long timer ran out, showing warning to user");
    showError('We hebben al lange tijd geen nieuwe locatie gekregen. Probeer je pagina te verversen.');
    stopAudio();
    resetLongTimer();
}

resetShortTimer();
resetLongTimer();
resetPositionWatch();

window.addEventListener('focus', resetPositionWatch);

if (! isDev && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(registration => {
            console.log('SW registered: ', registration);
        }).catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
        });
    });
}


