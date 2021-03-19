import {calculateDistanceToTrack} from './distance.js';
import {send} from './send.js';
import {setStatus} from './status.js';
import './style.scss';

let lastUpdated = 0;
let gotFix = false;


function showError(message) {
    const element = document.getElementById("error-msg");
    if (message.length > 0) {
        element.innerText = "!! " + message;
    } else {
        element.innerText = "";
    }
}

function positionSuccess(position) {
    console.log(position);
    let coords = position.coords;
    let timestamp = position.timestamp;

    let lat = coords.latitude;
    let lon = coords.longitude;
    let accuracy = coords.accuracy;

    document.getElementById("geef-toegang").style.display = 'none';

    if (accuracy > 50) {
        if (!gotFix) {
            document.getElementById("nauwkeurigheid-te-laag").style.display = "block";
        }
        return;
    }
    lastUpdated = timestamp;
    gotFix = true;

    let d = calculateDistanceToTrack(lat, lon);
    let distance = d["distance"];
    let progress = d["progress"];

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
        progress = 0;
    }

    setProgress(progress);
    setStatus(status);
    setAccuracy(accuracy);
    send(lat, lon);
    showError("");
}

function setAccuracy(accuracy) {
    // let element = document.getElementById("accuracy");
    // element.innerText = Math.round(accuracy).toString();
}

function setProgress(progress) {
    let percentage = Math.round(progress * 100).toString();
    document.getElementById("progress-inner").style.width = `${percentage}%`;
    let percentageElement = document.getElementById("progress-percentage");
    percentageElement.innerText = `${percentage}%`
    if (progress > 0.5) {
        percentageElement.style.color = 'black';
    } else {
        percentageElement.style.color = 'white';
    }
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
            "Als je dit probleem blijft hebben, doe dan de reserve tochttechniek.");
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
navigator.geolocation.watchPosition(positionSuccess, positionError, positionOptions);

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
