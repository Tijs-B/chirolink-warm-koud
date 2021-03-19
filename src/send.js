import { v4 as uuidv4 } from 'uuid';

let lastSend = 0;
const url = "http://ade7a4a596.duckdns.org:7767/location/post";

const LOCALSTORAGE_UUID = 'locationUUID';

function getUUID() {
    let uuid = localStorage.getItem(LOCALSTORAGE_UUID);
    if (uuid === null) {
        uuid = uuidv4();
        localStorage.setItem(LOCALSTORAGE_UUID, uuid)
    }
    return uuid;
}

export function send(lat, lon) {
    let currentTime = new Date().getTime();
    if (currentTime - lastSend < 5000) {
        return;
    }
    lastSend = currentTime;

    let uuid = getUUID();

    let data = new FormData();
    data.append("lat", lat);
    data.append("lon", lon);
    data.append("uuid", uuid);

    fetch(url, {
        method: "POST",
        mode: "no-cors",
        body: data,
    })
}
