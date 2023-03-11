import requests
import pymysql
import json
import datetime as dt
import time

NAME = "Dublin"
STATIONS = "https://api.jcdecaux.com/vls/v1/stations"
APIKEY = "8baeb25cfb9a5eb1f76dec99338e19bcd20e4386"

USER = "group13"
PASSWORD = "123456789"
HOST = "dublinbikegroup13.c1msfserw61n.us-east-1.rds.amazonaws.com"
PORT = 3306
DATABASE = "dbbike13"

RESOURCE = requests.get("https://api.jcdecaux.com/vls/v1/stations?contract=Dublin&apiKey=8baeb25cfb9a5eb1f76dec99338e19bcd20e4386")

db = pymysql.connect(
host=HOST,
user=USER,
password=PASSWORD,
port=PORT,
database=DATABASE)
cur = db.cursor()


def initialise_table():
    sql = """
      CREATE TABLE IF NOT EXISTS station(
        number INTEGER PRIMARY KEY,
        name VARCHAR(128),
        address VARCHAR(128),
        position_lat DOUBLE,
        position_lng DOUBLE,
        bike_stands INTEGER,
        banking INTEGER,
        bonus INTEGER,
        contract_name VARCHAR(128)
    )
    """
    try:
        db.cursor().execute(sql)
    except Exception as e:
        print(e)

    sql = """
    CREATE TABLE IF NOT EXISTS availability(
        number INTEGER ,
        last_update DateTime ,
        available_bike_stands INTEGER,
        available_bikes INTEGER,
        status VARCHAR(128),
        primary key (number,last_update ) 
    )
    """
    try:
        db.cursor().execute(sql)
        print("table station and availability created")
    except Exception as e:
        print(e)



# initialise_table()
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
    try:
        for station in station_lists:
            sql = """
            INSERT INTO `dbbike13`.`station` (`number`, `name`, `address`, 
            `position_lat`, `position_lng`, `bike_stands`, `banking`, `bonus`, 
            `contract_name`) VALUES (%s,"%s","%s",%s,%s,%s,%s,%s,"%s")""" % station
            db.cursor().execute(sql)
            db.commit()
            print("insert ok")
    except:
        db.rollback()
        print("insert wrong")

def write_to_db_availability():
    availability_lists = get_availability()
    try:
        for availability in availability_lists:
            sql = """
            INSERT INTO `dbbike13`.`availability` (`number`, `last_update`, 
            `available_bike_stands`, `available_bikes`, `status`) VALUES 
            ("%s","%s","%s","%s","%s")""" % availability
            print(sql)
            if is_exist_avail(availability):
                cur.execute(sql)
                db.commit()
                print("insert ok")
    except:
        db.rollback()
        print("insert wrong")

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
        print("none")
        return True
    print("is exist")
    return False

