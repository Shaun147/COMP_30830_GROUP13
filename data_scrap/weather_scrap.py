import datetime as dt
import json
import db_info

db = db_info.db_info()
cur = db.cursor()

def create_table():
    sql = """
    CREATE TABLE IF NOT EXISTS weather(
        dt VARCHAR(255) PRIMARY KEY,
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
        icon VARCHAR(255)
    );
    """
    try:
        cur.execute(sql)
        print('create ok')
    except Exception as e:
        print(e)


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