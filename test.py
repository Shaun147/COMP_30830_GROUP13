import requests
import pymysql
import json
import datetime as dt
import time
import sched

NAME = "Dublin"
STATIONS = "https://api.jcdecaux.com/vls/v1/stations"
APIKEY = "8baeb25cfb9a5eb1f76dec99338e19bcd20e4386"

USER = "group13"
PASSWORD = "123456789"
HOST = "dublinbikegroup13.c1msfserw61n.us-east-1.rds.amazonaws.com"
PORT = 3306
DATABASE = "dbbike13"

weather_apiKey = "e7138528cfa0e09e1ad22a15e2e2532a"
city_name = 'Dublin,ie'

parameters = {"q": city_name, "appid": weather_apiKey}
weather_URL = "http://api.openweathermap.org/data/2.5/weather"
future_weather_URL = "http://api.openweathermap.org/data/2.5/forecast"

RESOURCE = requests.get("https://api.jcdecaux.com/vls/v1/stations?contract=Dublin&apiKey=%s" % APIKEY)
RESOURCE_WEATHER = requests.get(weather_URL, params=parameters)
RESOURCE_FUTURE_WEATHER = requests.get(future_weather_URL, params=parameters)

db = pymysql.connect(
host=HOST,
user=USER,
password=PASSWORD,
port=PORT,
database=DATABASE)
cur = db.cursor()


def get_stations():
    station_list=[]
    stations=json.loads(RESOURCE.text)
    for station in stations:
        station_vals=(
            int(station.get('number')),
            station.get('name'),
            station.get('address'),
            float(station.get('position').get('lat')),
            float(station.get('position').get('lng')),
            int(station.get('bike_stands')),
            int(station.get('banking')),
            int(station.get('bonus')),
            station.get('contract_name')
            )
        station_list.append(station_vals)
    return station_list

def get_availability():
    avail_list=[]
    stations=json.loads(RESOURCE.text)
    for station in stations:
        availability_vals=(
        station.get('number'),
        dt.datetime.fromtimestamp(int(station.get('last_update') / 1e3)),
        station.get('available_bike_stands'),
        station.get('available_bikes'),
        station.get('status')
            )
        avail_list.append(availability_vals)
    return avail_list

def write_to_db_station():
    station_lists = get_stations()
    for station in station_lists:
        sql = """
        INSERT INTO `dbbike13`.`station` (`number`, `name`, `address`, 
        `position_lat`, `position_lng`, `bike_stands`, `banking`, `bonus`, 
        `contract_name`) VALUES (%s,"%s","%s",%s,%s,%s,%s,%s,"%s")""" % station
        try:
            db.cursor().execute(sql)
            db.commit()
            print("insert ok")
        except:
            db.rollback()
            print("insert wrong")

def write_to_db_availability():
    availability_lists = get_availability()
    for availability in availability_lists:
        sql = """
        INSERT INTO `dbbike13`.`availability` (`number`, `last_update`, 
        `available_bike_stands`, `available_bikes`, `status`) VALUES 
        ("%s","%s","%s","%s","%s")""" % availability
        print(sql)
        try:
            if is_exist_avail(availability):
                cur.execute(sql)
                db.commit()
                print("availability insert ok")
        except:
            db.rollback()
            print("availability insert wrong")

def write_to_db_weather(text):
    weather_data = json.loads(text)
    weather_vals = (
        str(dt.datetime.fromtimestamp(weather_data['dt'])),
        str(weather_data['clouds']['all']),
        str(weather_data['main']['feels_like']),
        str(weather_data['main']['humidity']),
        str(weather_data['main']['pressure']),
        str(weather_data['main']['temp']),
        str(weather_data['main']['temp_max']),
        str(weather_data['main']['temp_min']),
        str(dt.datetime.fromtimestamp(weather_data['sys']['sunrise'])),
        str(dt.datetime.fromtimestamp(weather_data['sys']['sunset'])),
        str(weather_data['visibility']),
        str(weather_data['weather'][0]['description']),
        str(weather_data['weather'][0]['main']),
        str(weather_data['wind']['deg']),
        str(weather_data['wind']['speed']),
        str(weather_data['weather'][0]['icon'])
    )
    sql = """    
        INSERT INTO `dbbike13`.`weather` (`dt`, `Clouds`, `feels_like`, `humidity`, 
        `pressure`, `temp`, `temp_max`, `temp_min`, `sunrise`, `sunset`, `visibility`, 
        `weather_description`, `weather_main`, `wind_deg`, `wind_speed`, `icon`) VALUES 
        ('%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s')
        """ % weather_vals
    print(sql)
    try:
        if is_exist_weather(weather_vals):
            cur.execute(sql)
            db.commit()
            print("weather insert ok")
    except:
        db.rollback()
        print("weather insert wrong")

def is_exist_avail(list):
    list = (list[0], list[1])
    sql = """
    SELECT * FROM dbbike13.availability
    WHERE number = "%s"
    and last_update = "%s"
    """ % list
    cur.execute(sql)
    rs = cur.fetchall()
    if rs == ():
        return True
    print("availability data is exist")
    return False

def is_exist_weather(time):
    sql = """
        SELECT * FROM dbbike13.weather
        WHERE dt = "%s"
        """ % time[0]
    print(sql)
    cur.execute(sql)
    rs = cur.fetchall()
    if rs == ():
        return True
    print("weather data is exist")
    return False


def write_to_db_future_weather(text):
    whole_data = json.loads(text)
    for each in whole_data['list']:
        data_vals = (
            str(each['dt']),
            str(each['dt_txt']),
            str(each['main']['temp_min']),
            str(each['main']['temp_max']),
            str(each['weather'][0]['main']),
            str(each['weather'][0]['icon'])
        )

        sql = """
            INSERT INTO `dbbike13`.`weather_future` (`dt`, `dt_txt`, `temp_min`, 
            `temp_max`, `mian_weather`, `icon`) VALUES ('%s', '%s', '%s', '%s', '%s', '%s');
        """ % data_vals
        print(sql)
        try:
            if is_exist_future_weather(data_vals[0]):
                cur.execute(sql)
                db.commit()
                print(f"weather {each['dt']} insert ok")
        except:
            db.rollback()
            print("weather insert wrong")
    print("whole weather insert ok")

def is_exist_future_weather(time):
    sql = """
        SELECT * FROM dbbike13.weather_future
        WHERE dt = "%s"
        """ % time
    cur.execute(sql)
    rs = cur.fetchall()
    if rs == ():
        return True
    print("weather data is exist")
    return False

def run_5m():
    write_to_db_weather(RESOURCE_WEATHER.text)
    write_to_db_availability()
    scheduler.enter(300, 1, write_to_db_availability)

def run_3h():
    write_to_db_future_weather(RESOURCE_FUTURE_WEATHER.text)
    scheduler.enter(10800, 1, write_to_db_future_weather)

scheduler = sched.scheduler(time.time, time.sleep)

scheduler.enter(0, 1, run_5m)
scheduler.enter(0, 1, run_3h)
scheduler.run()


