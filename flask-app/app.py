from datetime import datetime
from flask import Flask, jsonify, render_template, request, url_for,g
from sqlalchemy import create_engine
from flask_mysqldb import MySQL
import pymysql
import pandas as pd
import requests
import os

app = Flask(__name__)

app.config.from_object("config.Config")

def connect_to_database():
    engine = create_engine(
        f"mysql://{app.config['DB_USERNAME']}:{app.config['DB_PASSWORD']}@{app.config['DB_HOST']}:{app.config['DB_PORT']}/{app.config['DB_NAME']}",
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
def stations(): 
    conn = get_db().connect()
    
    sql = "SELECT s.number,s.bike_stands, s.name, s.address, s.position_lat, s.position_lng, a.available_bike_stands, a.available_bikes, " \
          "a.status, MAX(a.last_update) AS `current_availability` " \
          "FROM dbbikes1.availability as a " \
          "INNER JOIN dbbikes1.station as s ON s.number = a.number " \
          "GROUP BY s.number " \
          "ORDER BY s.number;"

    df = pd.read_sql(sql, get_db())
    print(df)

    return df.to_json(orient="records")


@app.route("/static_stations")
def static_stations():
    conn = get_db().connect()

    sql = "SELECT * FROM dbbikes1.station " \
          "ORDER BY name;"

    df = pd.read_sql(sql, get_db())

    return df.to_json(orient="records")


@app.route('/occupancy/<int:station_id>')
def get_occupancy(station_id):
    conn = get_db().connect() 

    sql = f"""SELECT s.name, avg(a.available_bike_stands) as Avg_bike_stands,
        avg(a.available_bikes) as Avg_bikes_free, DAYNAME(a.last_update) as DayName
        FROM dbbikes1.availability as a
        JOIN dbbikes1.station as s
        ON s.number = a.number
        WHERE s.number = {station_id}
        GROUP BY s.name , DayName 
        ORDER BY s.name , DayName;"""

    df = pd.read_sql(sql, get_db())

    return df.to_json(orient="records")


@app.route('/hourly/<int:station_id>')
def get_hourly_data(station_id):
    conn = get_db().connect() 

    sql = f"""SELECT s.name,count(a.number),avg(available_bike_stands) as Avg_bike_stands,
        avg(available_bikes) as Avg_bikes_free,EXTRACT(HOUR FROM last_update) as Hourly
        FROM dbbikes1.availability as a
        JOIN dbbikes1.station as s
        ON s.number = a.number
        WHERE a.number = {station_id}
        GROUP BY EXTRACT(HOUR FROM last_update) 
        ORDER BY EXTRACT(HOUR FROM last_update) asc"""

    df = pd.read_sql(sql, get_db())

    return df.to_json(orient="records")


@app.route("/weather_forecast")
def weather_forecast():
    conn = get_db().connect()
    print("************************")

    sql = f"""SELECT weather_description, weather_main, humidity, wind_speed,visibility,sunrise,sunset,pressure 
    FROM dbbikes1.weather_Dublin
    ORDER BY dt DESC
    LIMIT 1;"""

    df = pd.read_sql(sql, get_db())

    return df.to_json(orient="records")

if __name__ == '__main__':
    app.run(debug=True)