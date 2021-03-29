let gpxParser = require("gpxparser");

module.exports = function (source) {
    this.cacheable();
    let gpx = new gpxParser();
    gpx.parse(source);
    let track = gpx.tracks[0];
    return 'module.exports = ' + JSON.stringify({
        distance: track.distance.total,
        points: track.points.map(({lat, lon, ...rest}) => {
            return {lat: lat, lon: lon}
        }),
    });
}