from sqlalchemy import create_engine
import pandas as pd
import sys
import pickle

from sklearn.preprocessing import LabelEncoder

from sklearn.metrics import mean_squared_error
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split


USER = "group13"
PASSWORD = "123456789"
HOST = "dublinbikegroup13.c1msfserw61n.us-east-1.rds.amazonaws.com"
PORT = 3306
DATABASE = "dbbike13"
def update():
    try:
        engine = create_engine("mysql+pymysql://{}:{}@{}:{}/{}".format(USER, PASSWORD, HOST, PORT, DATABASE), echo=True)
    except Exception as e:
        sys.exit(e)

    df_availability = pd.read_sql_table("availability", engine)
    df_weather = pd.read_sql_table("weather", engine)

    df_availability['datetime_rounded'] = pd.to_datetime(df_availability['last_update']).dt.round('10min')

    df_weather['datetime_rounded'] = pd.to_datetime(df_weather['dt']).dt.round('10min')

    df_merged = pd.merge(df_availability, df_weather, on='datetime_rounded')

    df_whole = df_merged[
        ['number', 'datetime_rounded', 'available_bike_stands', 'available_bikes', 'feels_like', 'humidity', 'pressure',
         'weather_main', 'wind_speed']]

    df_whole.loc[:, 'day_of_week'] = df_whole['datetime_rounded'].dt.dayofweek
    df_whole.loc[:, 'hourly'] = df_whole['datetime_rounded'].dt.hour

    print(df_whole['weather_main'].unique())

    # Create a LabelEncoder object
    le = LabelEncoder()

    # Fit and transform the "weather_main" feature
    df_whole.loc[:, 'weather_main_value'] = le.fit_transform(df_whole['weather_main'])

    print(df_whole['weather_main_value'].unique())

    df_whole['datetime_numeric'] = (df_whole['datetime_rounded'] - pd.Timestamp('1970-01-01')) // pd.Timedelta('1s')

    df_whole.columns = df_whole.columns.astype(str)

    df_train, df_test = train_test_split(df_whole, test_size=0.3)
    print("Train set size:", len(df_train))
    print("Test set size:", len(df_test))

    # Define the input features and target variables
    input_features = ['feels_like', 'weather_main_value', 'wind_speed', 'humidity',
                      'pressure', 'day_of_week', 'hourly']

    x_train = df_train[input_features]
    y_train = df_train[['available_bike_stands', 'available_bikes']]

    x_test = df_test[input_features]
    y_test = df_test[['available_bike_stands', 'available_bikes']]

    # create list for station model
    rf_list = [0] * (len(df_whole['number'].unique()) + 10)

    input_features = ['feels_like', 'weather_main_value', 'wind_speed', 'humidity',
                      'pressure', 'day_of_week', 'hourly']

    # train for each station
    for i in df_whole['number'].unique():
        print(i, end=' ')

        x_train = df_train[df_train['number'] == i][input_features]
        y_train = df_train[df_train['number'] == i][['available_bike_stands', 'available_bikes']]

        rf = RandomForestRegressor(n_estimators=30)
        rf.fit(x_train, y_train)

        rf_list[i] = rf

    mse_sum = 0
    new_train_list = []
    for i in df_whole['number'].unique():
        print(i, end=' ')

        x_test = df_test[df_test['number'] == i][input_features]
        y_test = df_test[df_test['number'] == i][['available_bike_stands', 'available_bikes']]

        # Make predictions on the test data
        y_pred = rf_list[i].predict(x_test)
        #     print(y_pred.head(5))

        # Calculate the mean squared error
        mse = mean_squared_error(y_test, y_pred)
        #     print(y_pred.head(5))
        mse_sum += mse

        print('Mean squared error:', mse)
        if mse > 3:
            new_train_list += [i, ]

    for i in df_whole['number'].unique():
        with open('station_' + str(i) + '.pkl', 'wb') as handle:
            pickle.dump(rf_list[i], handle, pickle.HIGHEST_PROTOCOL)

    print(mse_sum / len(df_whole['number'].unique()))

update()

