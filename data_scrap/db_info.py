import pymysql

HOST = "127.0.0.1"
USER = "root"
PORT = 3306
DATABASE = "dbbike13"
PASSWORD = "qweqweqwe"

# USER = "group13"
# PASSWORD = "123456789"
# HOST = "dublinbikegroup13.c1msfserw61n.us-east-1.rds.amazonaws.com"
# PORT = 3306
# DATABASE = "dbbike13"


def db_info():
    db = pymysql.connect(
    host=HOST,
    user=USER,
    password=PASSWORD,
    port=PORT,
    database=DATABASE)

    return  db