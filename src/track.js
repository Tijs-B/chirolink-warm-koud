import GPXData from './track.gpx';
const INTERPOLATION_RESOLUTION = 2;

function interpolatePoints(points) {
    let newPoints = []
    for (let i = 0; i < points.length - 2; i++) {
        const first = points[i];
        const second = points[i+1];
        const distance = calculateDistance(first, second);
        const numPoints = Math.round(distance / INTERPOLATION_RESOLUTION);
        for (let j = 0; j < numPoints; j++) {
            newPoints.push({
                lat: first.lat + j * ((second.lat - first.lat) / numPoints),
                lon: first.lon + j * ((second.lon - first.lon) / numPoints),
            });
        }
    }
    newPoints.push(points[points.length - 1]);
    return newPoints;
}

export function calculateDistance(point1, point2) {
    const R = 6371e3; // metres
    const phi1 = point1.lat * Math.PI / 180; // φ, λ in radians
    const phi2 = point2.lat * Math.PI / 180;
    const delta_phi = (point2.lat - point1.lat) * Math.PI / 180;
    const delta_lambda = (point2.lon - point1.lon) * Math.PI / 180;

    const a = Math.sin(delta_phi / 2) * Math.sin(delta_phi / 2) +
        Math.cos(phi1) * Math.cos(phi2) *
        Math.sin(delta_lambda / 2) * Math.sin(delta_lambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

const interpolated = interpolatePoints(GPXData.points);
const cumulativeDistance = [0];
for (let i = 1; i < interpolated.length; i++) {
    const currentDistance = calculateDistance(interpolated[i-1], interpolated[i]);
    const lastDistance = cumulativeDistance[cumulativeDistance.length - 1];
    cumulativeDistance.push(currentDistance + lastDistance);
}

export function calculateDistanceToTrack(point) {
    let minDistance = Infinity;
    let index = null;
    for (let i = 0; i < interpolated.length; i++) {
        let distance = calculateDistance(point, interpolated[i]);
        if (distance < minDistance) {
            minDistance = distance;
            index = i;
        }
    }
    return {
        distance: minDistance,
        trackDistance: cumulativeDistance[index],
        trackTotalDistance: GPXData.distance,
    };
}

