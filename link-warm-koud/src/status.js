// import ExtremeKou from './img/extreme-kou.jpg';
// import Vrieskou from './img/vrieskou.jpg';
// import Koud from './img/koud.jpg';
// import Lauw from './img/lauw.jpg';
// import VrijWarm from './img/vrij-warm.jpg';
// import SuperHeet from './img/super-heet.jpg';

const statusNames = ['extreme-kou', 'vrieskou', 'koud', 'lauw', 'vrij-warm', 'super-heet'];
let statuses = {};

for (let status of statusNames) {
    statuses[status] = require(`./img/${status}.jpg`);
}

export function setStatus(status) {
    let divsToHide = document.getElementsByClassName("status");
    for (let i = 0; i < divsToHide.length; i++) {
        divsToHide[i].style.display = 'none';
    }
    document.getElementById(status).style.display = 'block';

    let image = statuses[status];

    document.documentElement.style.cssText = `background: url(${image}) no-repeat center center fixed;
                                                  background-size: cover;`;
    document.body.style.color = 'white';
    document.body.style.textShadow = '0 0 24px black';

    document.getElementById("nauwkeurigheid-te-laag").style.display = 'none';
}



