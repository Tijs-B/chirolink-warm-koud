DROP TABLE IF EXISTS positions;

CREATE TABLE positions
(
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    lat  REAL      NOT NULL,
    lon  REAL      NOT NULL,
    ts   TIMESTAMP NOT NULL,
    uuid TEXT      NOT NULL
);

CREATE INDEX idx_uuid ON positions (uuid);
CREATE INDEX idx_ts ON positions (ts DESC);
