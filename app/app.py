
import pickle


from flask import request, jsonify
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

# HOST = "127.0.0.1"
# USER = "root"
# PORT = 3306
# DATABASE = "dbbike13"
# PASSWORD = "qweqweqwe"

engine = create_engine("mysql+pymysql://{}:{}@{}:{}/{}".format(USER, PASSWORD, HOST, PORT, DATABASE), echo=True)

@app.route("/")
def hello():
    # return "hello"
    return flask.render_template("index.html")


@app.route("/stations")
def stations():
    sql = """
    SELECT s.number,s.bike_stands, s.name, s.address, s.position_lat, 
    s.position_lng, ANY_VALUE(a.available_bike_stands) AS `available_bike_stands`, 
    ANY_VALUE(a.available_bikes) AS `available_bikes`, ANY_VALUE(a.status) AS `status`,
    MAX(a.last_update) AS `current_availability`
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

@app.route("/availability_data/<int:station_id>")
def availability_data(station_id):
    sql = """
    SELECT  avg(available_bike_stands) as avg_stands,
    avg(available_bikes) as avg_bikes, 
    DAYNAME(last_update) as day_name
    FROM dbbike13.availability
    WHERE number = %d
    GROUP BY day_name 
    """%station_id
    rs = pd.read_sql(sql, engine)
    return rs.to_json(orient="records")

@app.route("/hourly_data/<int:station_id>")
def hourly_data(station_id):
    sql = """
    SELECT avg(available_bike_stands) as avg_stands,
    avg(available_bikes) as avg_bikes,EXTRACT(HOUR FROM last_update) as hourly
    FROM dbbike13.availability 
    WHERE number = %d
    GROUP BY EXTRACT(HOUR FROM last_update)
    ORDER BY EXTRACT(HOUR FROM last_update)
    """%station_id
    rs = pd.read_sql(sql, engine)
    return rs.to_json(orient="records")

@app.route("/all_availability_data")
def all_availability_data():
    sql = f"""
    SELECT * 
    FROM dbbike13.availability
    """
    rs = pd.read_sql(sql, engine)
    return rs.to_json(orient="records")

@app.route("/weather")
def weather():
    sql = """SELECT weather_description, weather_main, humidity, 
    wind_speed,visibility,sunrise,sunset,pressure,icon,temp
    FROM dbbike13.weather
    ORDER BY dt DESC
    LIMIT 1;"""
    rs = pd.read_sql(sql, engine)
    return rs.to_json(orient="records")

@app.route("/forecast")
def forecast():
    sql = """
    SELECT*
    FROM (SELECT * 
    FROM dbbike13.weather_future
    ORDER BY dt DESC
    LIMIT 48) AS temp
    ORDER BY dt
    """
    rs = pd.read_sql(sql, engine)
    return rs.to_json(orient="records")

@app.route("/prediction", methods=['POST'])
def prediction():
    data = request.get_json()
    number = data['number']
    input_features = data['input_features']

    with open(f'../machine_learning/station_{number}.pkl', 'rb') as f:
        rf = pickle.load(f)

    prediction = rf.predict([input_features]).tolist()
    response = {'prediction': prediction}
    return jsonify(response)

@app.route("/predict_plan/<int:timestamp>")
def predict_plan(timestamp):
    sql = """
    SELECT * FROM dbbike13.weather_future
    ORDER BY ABS(%d - `dt`) asc
    LIMIT 1;
    """%timestamp
    rs = pd.read_sql(sql, engine)
    return rs.to_json(orient="records")

if __name__ == "__main__":

    app.run(host='0.0.0.0', port=8001)

