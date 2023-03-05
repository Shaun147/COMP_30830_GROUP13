import os

class Config:
    DB_USERNAME = "group13"
    DB_PASSWORD = "123456789"
    DB_HOST = "dublinbikegroup13.c1msfserw61n.us-east-1.rds.amazonaws.com"
    DB_PORT = 3306
    DB_NAME = "dbbike13"
    
    SECRET_KEY = os.environ.get("SECRET_KEY") or "my_secret_key"