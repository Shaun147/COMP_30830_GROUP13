import os

class Config:
    NAME = "Dublin"
    STATIONS = "https://api.jcdecaux.com/vls/v1/stations"
    USER = "group13"
    PASSWORD = "123456789"
    HOST = "dublinbikegroup13.c1msfserw61n.us-east-1.rds.amazonaws.com"
    PORT = 3306
    DATABASE = "dbbike13"
    
    SECRET_KEY = os.environ.get("8baeb25cfb9a5eb1f76dec99338e19bcd20e4386")