import datetime

from flask import (
    Blueprint, request, jsonify, session, Response
)

from linkviewer.db import get_db

bp = Blueprint('location', __name__, url_prefix='/location')


@bp.route('/post', methods=['POST'])
def post():
    lat = request.form['lat']
    lon = request.form['lon']
    uuid = request.form['uuid']

    ts = datetime.datetime.now()

    db = get_db()
    db.execute('INSERT INTO positions (lat, lon, ts, uuid) VALUES (?, ?, ?, ?)', (lat, lon, ts, uuid))
    db.commit()
    return 'OK'


@bp.route('/get-all')
def get_all():
    if "loggedin" not in session:
        return Response("Not authorized", status=401)

    db = get_db()
    rows = db.execute('SELECT * FROM positions').fetchall()
    return jsonify([{
        "id": r["id"],
        "lat": r["lat"],
        "lon": r["lon"],
        "ts": r["ts"].timestamp(),
        "uuid": r["uuid"]
    } for r in rows])


@bp.route('/get-last')
def get_last():
    if "loggedin" not in session:
        return Response("Not authorized", status=401)

    db = get_db()
    rows = db.execute('''SELECT * FROM positions p1
    INNER JOIN
    ( 
        SELECT lat, lon, uuid, max(ts) max_ts FROM positions GROUP BY uuid
    ) p2
    ON p1.ts = p2.max_ts AND p1.uuid = p2.uuid AND p1.lat = p2.lat AND p1.lon = p2.lon
    ''')

    return jsonify([{
        "id": r["id"],
        "lat": r["lat"],
        "lon": r["lon"],
        "ts": r["ts"].timestamp(),
        "uuid": r["uuid"]
    } for r in rows])
