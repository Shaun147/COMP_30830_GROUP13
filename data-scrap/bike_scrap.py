import datetime as dt
import requests
import time
import pymysql
import json


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


# Initialise station and availability table
def initialise_db():
    sql="""
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
        cursor.execute(sql)
    except Exception as e:
        print(e)
        
    sql="""
    CREATE TABLE IF NOT EXISTS availability(
        number INTEGER ,
        last_update DateTime ,
        available_bike_stands INTEGER,
        available_bikes INTEGER,
        status VARCHAR(128),
        primary key (number,last_update) 
    )
    """
    
    try:
        db.cursor.execute(sql)
        print("create ok")
    except Exception as e:
        print(e)
    write_to_db_sation()
    

# Add specific columns and values to station table
def get_stations():
    stationList=[]
    stations=json.loads(RESOURCE.text)
    for station in stations:
        vals_station=(
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
        stationList.append(vals_station)
    return stationList

# Add specific columns and values to availability table
def get_availability():
    availList=[]
    stations=json.loads(r.text)
    for station in stations:
        vals_availability=(
        station.get('number'),
        dt.datetime.fromtimestamp(int(station.get('last_update') / 1e3)),
        station.get('available_bike_stands'),
        station.get('available_bikes'),
        station.get('status')      
            )
        availList.append(vals_availability)
    return availList


# Synchronize tables to database and update it
def write_to_db_sation():
    vals= get_stations()
    try:
        for val in vals:
            sql = """
            INSERT INTO `dbbike13`.`station` (`number`, `name`, `address`, 
            `position_lat`, `position_lng`, `bike_stands`, `banking`, `bonus`, 
            `contract_name`) VALUES (%s,"%s","%s",%s,%s,%s,%s,%s,"%s")
            """ % val
            db.cursor.execute(sql)
            db.commit()
            print("insert ok")
    except:
        db.rollback()
        print("insert wrong")

def write_to_db_availability():
    vals= get_availability()
    try:
        for val in vals:
            sql = """
            INSERT INTO `dbbike13`.`availability` (`number`, `last_update`, 
            `available_bike_stands`, `available_bikes`, `status`) VALUES 
            ("%s","%s","%s","%s","%s")
            """ % val
            print(sql)
            db.cursor.execute(sql)
            db.commit()
            print(a)
            print("insert ok")
    except:
        db.rollback()
        print("insert wrong")
    db.close()

# Check the replicated data of weather
def is_exist_avail(list):
    list = (list[0], list[1])
    sql = """
    SELECT * FROM dbbike13.availability
        WHERE number = "%s"
        and last_update = "%s"
    """ % list
    db.cursor.execute(sql)
    rs = db.cursor.fetchall()
    if rs == ():
        return True
    print("is exist")
    return False


# write_to_db_station()
while True:
    write_to_db_availability()
    time.sleep(5 * 60)







    