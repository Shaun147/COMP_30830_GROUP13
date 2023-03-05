from sqlalchemy import create_engine
import requests

NAME = "Dublin"
STATIONS = "https://api.jcdecaux.com/vls/v1/stations"
APIKEY = "8baeb25cfb9a5eb1f76dec99338e19bcd20e4386"
USER = "group13"
PASSWORD = "123456789"
HOST = "dublinbikegroup13.c1msfserw61n.us-east-1.rds.amazonaws.com"
PORT = 3306
DATABASE = "dbbike13"
r = requests.get("https://api.jcdecaux.com/vls/v1/stations?contract=Dublin&apiKey=8baeb25cfb9a5eb1f76dec99338e19bcd20e4386")

engine = create_engine("mysql+pymysql://{}:{}@{}:{}/{}".format(USER, PASSWORD, HOST, PORT, DATABASE), echo=True)

sql = """
        CREATE DATABASE IF NOT EXISTS dbbike13;
"""

engine.execute(sql)