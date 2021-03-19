import Data from './data.json';

export function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // metres
    const phi1 = lat1 * Math.PI / 180; // φ, λ in radians
    const phi2 = lat2 * Math.PI / 180;
    const delta_phi = (lat2 - lat1) * Math.PI / 180;
    const delta_lambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(delta_phi / 2) * Math.sin(delta_phi / 2) +
        Math.cos(phi1) * Math.cos(phi2) *
        Math.sin(delta_lambda / 2) * Math.sin(delta_lambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

export function calculateDistanceToTrack(lat, lon) {
    let minDistance = Infinity;
    let index = null;
    for (let i = 0; i < Data.length; i++) {
        let point = Data[i];
        let lat1 = point["lat"];
        let lon1 = point["lon"];
        let distance = calculateDistance(lat, lon, lat1, lon1);
        if (distance < minDistance) {
            minDistance = distance;
            index = i;
        }
    }
    let progress = index / Data.length;
    return {distance: minDistance, progress: progress};
}

