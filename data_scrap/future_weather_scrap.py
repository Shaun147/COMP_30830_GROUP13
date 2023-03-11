import pymysql
import json

db = pymysql.connect(
    host="dublinbikegroup13.c1msfserw61n.us-east-1.rds.amazonaws.com",
    user="group13",
    password="123456789",
    port=3306,
    database="dbbike13")
cur = db.cursor()

def create_table():
    sql = """
    CREATE TABLE IF NOT EXISTS weather_future(
      `dt` INT NOT NULL,
      `dt_txt` VARCHAR(255) NOT NULL,
      `temp_min` INT NULL,
      `temp_max` INT NULL,
      `main_weather` VARCHAR(255),
      `icon` VARCHAR(255),
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
        data_vals = (
            str(each['dt']),
            str(each['dt_txt']),
            str(each['main']['temp_min']),
            str(each['main']['temp_max']),
            str(each['weather'][0]['main']),
            str(each['weather'][0]['icon'])
        )
        data_vals_update =(
            str(each['main']['temp_min']),
            str(each['main']['temp_max']),
            str(each['weather'][0]['main']),
            str(each['weather'][0]['icon']),
            str(each['dt'])
        )

        sql = """
            INSERT INTO `dbbike13`.`weather_future` (`dt`, `dt_txt`, `temp_min`, 
            `temp_max`, `main_weather`, `icon`) VALUES ('%s', '%s', '%s', '%s', '%s', '%s');
        """ % data_vals
        print(sql)
        try:
            if is_exist_future_weather(data_vals[0], data_vals_update):
                cur.execute(sql)
                db.commit()
                print(f"weather {each['dt']} insert ok")
        except:
            db.rollback()
            print("weather insert wrong")
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
    print("weather data is exist")
    update_future_weather(data_vals_update)
    return False

def update_future_weather(data_vals_update):
    sql = """
                UPDATE `dbbike13`.`weather_future` SET 
                `temp_min` = "%s", `temp_max` = "%s", `main_weather` = "%s", `icon` = "%s" 
                WHERE `dt` = "%s"
            """ % data_vals_update
    cur.execute(sql)
    db.commit()
    print("weather info updated")
