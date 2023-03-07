from datetime import datetime
from flask import Flask, jsonify, render_template, request, url_for,g
from sqlalchemy import create_engine
from flask_mysqldb import MySQL
import pandas as pd
import traceback
import functools
import requests
import os

app = Flask(__name__)

app.config.from_object("config.Config")

def connect_to_database():
    engine = create_engine(
        f"mysql://{app.config['USER']}:{app.config['PASSWORD']}@{app.config['HOST']}:{app.config['PORT']}/{app.config['DATABASE']}",
        echo=True
    )
    return engine

# Use Flask's g object to store a reference to the database connection object
def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = connect_to_database()
    return db

# Close the database connection when the application context is destroyed
@app.teardown_appcontext
def close_db(error):
    db = getattr(g, '_database', None)
    if db is not None:
        db.dispose()


@app.route("/")
def hello():
    return render_template("index.html")


@app.route("/stations")
@functools.lru_cache(maxsize=128)
def get_stations():
    engine = get_db()
        
    sql = "SELECT s.number, s.bike_stands, s.name, s.address, s.position_lat, s.position_lng, a.available_bike_stands, a.available_bikes, " \
        "a.status, MAX(a.last_update) AS `current_availability` " \
        "FROM availability AS a " \
        "INNER JOIN station AS s ON s.number = a.number " \
        "GROUP BY s.number " \
        "ORDER BY s.number;"
          
    try:
        with engine.connect() as conn:
            rows = conn.execute(sql).fetchall()
            print(f"#found {len(rows)} stations", rows)
            return jsonify([dict(row) for row in rows])
    except Exception as e:
        print(traceback.format_exc())
        return f"error in get_stations: {e}", 404




@app.route("/static_stations")
def static_stations():
    engine = get_db()

    sql = "SELECT * FROM dbbikes1.station " \
          "ORDER BY name;"

    try:
        with engine.connect() as conn:
            rows = conn.execute(sql).fetchall()
            print(f"#found {len(rows)} stations", rows)
            return jsonify([dict(row) for row in rows])
    except Exception as e:
        print(traceback.format_exc())
        return f"error in get_stations: {e}", 404


@app.route('/occupancy/<int:station_id>')
def get_occupancy(station_id):
    engine = get_db()

    sql = f"""SELECT s.name, avg(a.available_bike_stands) as Avg_bike_stands,
        avg(a.available_bikes) as Avg_bikes_free, DAYNAME(a.last_update) as DayName
        FROM dbbikes1.availability as a
        JOIN dbbikes1.station as s
        ON s.number = a.number
        WHERE s.number = {station_id}
        GROUP BY s.name , DayName 
        ORDER BY s.name , DayName;"""

    try:
        with engine.connect() as conn:
            rows = conn.execute(sql).fetchall()
            print(f"#found {len(rows)} stations", rows)
            return jsonify([dict(row) for row in rows])
    except Exception as e:
        print(traceback.format_exc())
        return f"error in get_stations: {e}", 404






if __name__ == '__main__':
    app.run(debug=True)