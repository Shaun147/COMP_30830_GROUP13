import pymysql 
import traceback
import requests
import time
from datetime import datetime
import json

NAME = "Dublin"
STATIONS = "https://api.jcdecaux.com/vls/v1/stations"
APIKEY = "8baeb25cfb9a5eb1f76dec99338e19bcd20e4386"
USER = "group13"
PASSWORD = "123456789"
HOST = "dublinbikegroup13.c1msfserw61n.us-east-1.rds.amazonaws.com"
PORT = 3306
DATABASE = "test"
r = requests.get("https://api.jcdecaux.com/vls/v1/stations?contract=Dublin&apiKey=8baeb25cfb9a5eb1f76dec99338e19bcd20e4386")


weather_apiKey = "3520d30989c43e2dd17f8369bcc0a282"
city_name = 'Dublin,ie'
parameters = {"q" : city_name, "appid" : weather_apiKey} 
weather_URL = "https://api.openweathermap.org/data/2.5/weather?q=Dublin&appid=3520d30989c43e2dd17f8369bcc0a282"

while True:
    try:
        db = pymysql.connect(
            host="dbbikes1.citjnbrbkplf.us-east-1.rds.amazonaws.com",
            user="admin",
            password="12345678",
            port=3306,
            database="dbbikes1")
        cursor = db.cursor()  
            
        create_table()

        now = datetime.now()
        r = requests.get(weather_URL, params = parameters)
        print(r,now)
            
        write_to_db(r.text)
            
        time.sleep(5*60)
        
    except:
        print(traceback.format_exc())    