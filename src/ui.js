const statuses = {};
for (let status of ['extreme-kou', 'vrieskou', 'koud', 'lauw', 'vrij-warm', 'super-heet']) {
    statuses[status] = require(`./img/${status}.jpg`);
}

let lastUpdated = 0;

export function initUI() {
    window.setInterval(() => {
        if (lastUpdated !== 0) {
            let secondsPassed = Math.floor((new Date().getTime() - lastUpdated) / 1000);
            secondsPassed = Math.max(0, secondsPassed);
            document.getElementById("updated").innerText = secondsPassed.toString();
        }
    }, 1000);
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
    const accuracyElement = document.getElementById("accuracy");
    accuracyElement.innerText = Math.round(accuracy).toString();
    document.getElementById("bottom-left").style.visibility = 'visible';
}

export function setProgress(currentDistance, totalDistance) {
    const progressElement = document.getElementById("progress");
    progressElement.innerText =
        `${currentDistance.toFixed(0)} / ${totalDistance.toFixed(0)}m`;
    document.getElementById("bottom-left").style.visibility = 'visible';
}

export function showError(message) {
    const element = document.getElementById("error-msg");
    if (message.length > 0) {
        setStatus('none');
        element.innerText = message;
    } else {
        element.innerText = "";
    }
}
