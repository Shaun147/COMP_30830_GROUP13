import requests
import time
import sched
import future_weather_scrap
import bike_scrap
import weather_scrap


NAME = "Dublin"
STATIONS = "https://api.jcdecaux.com/vls/v1/stations"
APIKEY = "8baeb25cfb9a5eb1f76dec99338e19bcd20e4386"

weather_apiKey = "e7138528cfa0e09e1ad22a15e2e2532a"
city_name = 'Dublin,ie'
parameters = {"q": city_name, "appid": weather_apiKey}
weather_URL = "http://api.openweathermap.org/data/2.5/weather"
future_weather_URL = "http://api.openweathermap.org/data/2.5/forecast"

RESOURCE = requests.get("https://api.jcdecaux.com/vls/v1/stations?contract=Dublin&apiKey=%s" % APIKEY)
RESOURCE_WEATHER = requests.get(weather_URL, params=parameters)
RESOURCE_FUTURE_WEATHER = requests.get(future_weather_URL, params=parameters)


def run_5m():
    weather_scrap.write_to_db_weather(RESOURCE_WEATHER.text)
    bike_scrap.write_to_db_availability()
    scheduler.enter(300, 1, run_5m)


def run_3h():
    future_weather_scrap.write_to_db_future_weather(RESOURCE_FUTURE_WEATHER.text)
    scheduler.enter(10800, 1, run_3h)


scheduler = sched.scheduler(time.time, time.sleep)

scheduler.enter(0, 1, run_5m)
scheduler.enter(0, 1, run_3h)
scheduler.run()


