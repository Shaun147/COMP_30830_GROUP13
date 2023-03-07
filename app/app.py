from sqlalchemy import *
import flask
import pandas as pd


app = flask.Flask(__name__)
NAME = "Dublin"
STATIONS = "https://api.jcdecaux.com/vls/v1/stations"
APIKEY = "8baeb25cfb9a5eb1f76dec99338e19bcd20e4386"
USER = "group13"
PASSWORD = "123456789"
HOST = "dublinbikegroup13.c1msfserw61n.us-east-1.rds.amazonaws.com"
PORT = 3306
DATABASE = "dbbike13"

engine = create_engine("mysql+pymysql://{}:{}@{}:{}/{}".format(USER, PASSWORD, HOST, PORT, DATABASE), echo=True)

@app.route("/")
def hello():
    # return "hello"
    return flask.render_template("index1.html")


@app.route("/stations")
def stations():
    sql = """
    SELECT s.number,s.bike_stands, s.name, s.address, s.position_lat, 
    s.position_lng, a.available_bike_stands, a.available_bikes,
    a.status, MAX(a.last_update) AS `current_availability`
    FROM dbbike13.availability as a
    INNER JOIN dbbike13.station as s 
    WHERE s.number = a.number
    GROUP BY s.number
    ORDER BY s.number
    """
    rs = pd.read_sql(sql, engine)
    return rs.to_json(orient="records")

@app.route("/static_stations")
def static_stations():
    sql = """
    SELECT * FROM dbbike13.station
    ORDER BY name;
    """
    rs = pd.read_sql(sql, engine)
    return rs.to_json(orient="records")

@app.route('/occupancy/<int:station_id>')
def get_occupancy(station_id):
    sql = """
    SELECT s.name, avg(a.available_bike_stands) as Avg_bike_stands,
    avg(a.available_bikes) as Avg_bikes_free, DAYNAME(a.last_update) as DayName
    FROM dbbike13.availability as a
    JOIN dbbike13.station as s
    ON s.number = a.number
    WHERE s.number = %s
    GROUP BY s.name , DayName
    ORDER BY s.name , DayName;"""%station_id
    rs = pd.read_sql(sql, engine)

    return rs.to_json(orient="records")

@app.route("/weather")
def weather():
    sql = """SELECT weather_description, weather_main, humidity, wind_speed,visibility,sunrise,sunset,pressure 
    FROM dbbike13.weather_Dublin
    ORDER BY dt DESC
    LIMIT 1;"""
    rs = pd.read_sql(sql, engine)
    print(rs.to_json(orient="records"))
    return rs.to_json(orient="records")


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8000)
    # stations()


