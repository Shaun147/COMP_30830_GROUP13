import pymysql 
import traceback
import requests
import time
from datetime import datetime
import json

weather_apiKey = "e7138528cfa0e09e1ad22a15e2e2532a"
lat = 53.3498
lon = 6.2603
part = "current,daily,minutely"
parameters = {"lat": lat, "lon": lon, "exclude": part, "appid" : weather_apiKey} 
weather_URL = "https://openweathermap.org/city/2964574"


# Initialise new table of future weather in databese dbbike13
def create_table():
    sql = """
    CREATE TABLE IF NOT EXISTS future_weather(
    clouds INTEGER,
    dew_point DOUBLE,
    dt VARCHAR(255),
    feels_like DOUBLE,
    humidity INTEGER,
    pop DOUBLE,
    pressure INTEGER,
    temp DOUBLE,
    uvi DOUBLE,
    visibility INTEGER,
    weather_description VARCHAR(255),
    weather_main VARCHAR(255),
    wind_deg INTEGER,
    wind_gust DOUBLE,
    wind_speed DOUBLE
    );
    """   
    try:
        cursor.execute(sql)
        print('create ok')
    except Exception as e:
        print(e)


# Add details of table of weather
def write_to_db(text):
    future_weather_data = json.loads(text)
    for future_hour in range(len(future_weather_data['hourly'])):
        weather_vals = (
            str(future_weather_data['hourly'][future_hour]['clouds']), 
            str(future_weather_data['hourly'][future_hour]['dew_point']),
            str(datetime.fromtimestamp(future_weather_data['hourly'][future_hour]['dt'])),
            str(future_weather_data['hourly'][future_hour]['feels_like']),
            str(future_weather_data['hourly'][future_hour]['humidity']), 
            str(future_weather_data['hourly'][future_hour]['pop']),
            str(future_weather_data['hourly'][future_hour]['pressure']), 
            str(future_weather_data['hourly'][future_hour]['temp']),
            str(future_weather_data['hourly'][future_hour]['uvi']),
            str(future_weather_data['hourly'][future_hour]['visibility']),
            str(future_weather_data['hourly'][future_hour]['weather'][0]['description']), 
            str(future_weather_data['hourly'][future_hour]['weather'][0]['main']),
            str(future_weather_data['hourly'][future_hour]['wind_deg']), 
            str(future_weather_data['hourly'][future_hour]['wind_gust']),
            str(future_weather_data['hourly'][future_hour]['wind_speed'])
            )
        
        sql = """INSERT INTO dbbike13.future_weather (clouds,dew_point,dt,feels_like,humidity,
        pop,pressure,temp,uvi,visibility,weather_description,weather_main,wind_deg,wind_gust,wind_speed) 
        VALUES ('%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s')""" % weather_vals
    
        try:
            cursor.execute(sql)
            db.commit()
            print("insert ok")
        except:
            db.rollback()
            print("insert wrong")
    db.close()
    

while True:
    try:
        db = pymysql.connect(
            host="dublinbikegroup13.c1msfserw61n.us-east-1.rds.amazonaws.com",
            user="group13",
            password="123456789",
            port=3306,
            database="dbbike13")
        cursor = db.cursor()
        create_table()

        now = datetime.now()
        r = requests.get(weather_URL, params=parameters)
        print(r, now)

        write_to_db(r.text)

        time.sleep(5 * 60)

    except:
        print(traceback.format_exc())