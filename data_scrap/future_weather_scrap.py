import json
import db_info
import pandas as pd
import pickle

db = db_info.db_info()
cur = db.cursor()

def create_table():
    sql = """
    CREATE TABLE IF NOT EXISTS weather_future(
    `dt` INT NOT NULL,
    `dt_txt` VARCHAR(255) NOT NULL,
    `temp_min` INT NULL,
    `temp_max` INT NULL,
    `feels_like` INT NULL,
    `pressure` INT NULL,
    `humidity` INT NULL,
    `wind_speed` INT NULL,
    `main_weather` VARCHAR(255),
    `icon` VARCHAR(255),
    `day_of_week` INT NULL,
    `hourly` INT NULL,
    PRIMARY KEY (`dt`, `dt_txt`));
    """
    try:
        cur.execute(sql)
        print('table create ok')
    except Exception as e:
        print(e)


def write_to_db_future_weather(text):
    whole_data = json.loads(text)
    for each in whole_data['list']:
        print(each)
        data_vals = (
            str(each['dt']),
            str(each['dt_txt']),
            str(each['main']['temp_min']),
            str(each['main']['temp_max']),
            str(each['main']['feels_like']),
            str(each['main']['pressure']),
            str(each['main']['humidity']),
            str(each['wind']['speed']),
            str(each['weather'][0]['main']),
            str(each['weather'][0]['icon']),
            str(pd.to_datetime(each['dt'], unit='s').dayofweek),
            str(pd.to_datetime(each['dt'], unit='s').hour)
        )
        data_vals_update =(
            str(each['main']['temp_min']),
            str(each['main']['temp_max']),
            str(each['main']['feels_like']),
            str(each['main']['pressure']),
            str(each['main']['humidity']),
            str(each['wind']['speed']),
            str(each['weather'][0]['main']),
            str(each['weather'][0]['icon']),
            str(each['dt'])
        )

        sql = """
            INSERT INTO `dbbike13`.`weather_future` (`dt`, `dt_txt`, `temp_min`, 
            `temp_max`, `feels_like`,`pressure`, `humidity`, `wind_speed`, 
            `main_weather`, `icon`,`day_of_week`,`hourly`) 
            VALUES ('%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s');
        """ % data_vals
        print(sql)
        try:
            if is_exist_future_weather(data_vals[0], data_vals_update):
                cur.execute(sql)
                db.commit()
                print(f"weather {each['dt']} insert ok")
        except:
            db.rollback()
            print("future weather insert wrong")
    print("whole weather insert ok")

def is_exist_future_weather(time,data_vals_update):
    sql = """
        SELECT * FROM dbbike13.weather_future
        WHERE dt = "%s"
        """ % time
    cur.execute(sql)
    rs = cur.fetchall()
    if rs == ():
        return True
    print("future weather data is exist")
    update_future_weather(data_vals_update)
    return False

def update_future_weather(data_vals_update):
    sql = """
                UPDATE `dbbike13`.`weather_future` SET 
                `temp_min` = "%s", `temp_max` = "%s", 
                `feels_like` = "%s", `pressure` = "%s", `humidity` = "%s",
                `wind_speed`= "%s", `main_weather` = "%s", `icon` = "%s" 
                WHERE `dt` = "%s"
            """ % data_vals_update
    cur.execute(sql)
    db.commit()
    print("future weather info updated")

