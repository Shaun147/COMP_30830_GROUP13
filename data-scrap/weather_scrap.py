import pymysql 
import traceback
import requests
import time
from datetime import datetime
import json

weather_apiKey = "e7138528cfa0e09e1ad22a15e2e2532a"
city_name = 'Dublin,ie'
parameters = {"q": city_name, "appid": weather_apiKey}
weather_URL = "http://api.openweathermap.org/data/2.5/weather"


# Initialise new table of future weather in databese dbbike13
def create_table():
    sql = """
    CREATE TABLE IF NOT EXISTS weather_Dublin(
        Clouds INTEGER,
        feels_like DOUBLE,
        humidity INTEGER,
        pressure INTEGER,
        temp DOUBLE,
        temp_max DOUBLE,
        temp_min DOUBLE,
        sunrise VARCHAR(255),
        sunset VARCHAR(255),
        visibility INTEGER,
        weather_description VARCHAR(255),
        weather_main VARCHAR(255),
        wind_deg INTEGER,
        wind_speed DOUBLE,
        dt VARCHAR(255)
    );
    """
        
    try:
        cursor.execute(sql)
        print('create ok')
    except Exception as e:
        print(e)


# Add details of table of weather
def write_to_db(text):
    weather_data = json.loads(text)
    weather_vals = (
        str(weather_data['clouds']['all']),
        str(weather_data['main']['feels_like']),
        str(weather_data['main']['humidity']),
        str(weather_data['main']['pressure']),
        str(weather_data['main']['temp']),
        str(weather_data['main']['temp_max']),
        str(weather_data['main']['temp_min']),
        str(datetime.fromtimestamp(weather_data['sys']['sunrise'])),
        str(datetime.fromtimestamp(weather_data['sys']['sunset'])),
        str(weather_data['visibility']),
        str(weather_data['weather'][0]['description']),
        str(weather_data['weather'][0]['main']),
        str(weather_data['wind']['deg']),
        str(weather_data['wind']['speed']),
        str(datetime.fromtimestamp(weather_data['dt']))
    )

    sql = """
    INSERT INTO `test`.`weather_Dublin` (`Clouds`, `feels_like`, `humidity`, 
    `pressure`, `temp`, `temp_max`, `temp_min`, `sunrise`, `sunset`, `visibility`, 
    `weather_description`, `weather_main`, `wind_deg`, `wind_speed`, `dt`) VALUES 
    ('%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s')
    """ % weather_vals

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