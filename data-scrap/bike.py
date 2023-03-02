import csv
import requests
import time

# Define the URL of the API and your API key
url = 'https://api.jcdecaux.com/vls/v1/stations'
api_key = 'bfc4737a34b6a2c8bab1da2b69c8803015e0199a'

# Set up the parameters for the API request
params = {'apiKey': api_key}

# Define the time interval for refreshing the data
interval = 5  # seconds

# Open the CSV file for writing
with open('dublin_bikes_data.csv', 'w', newline='') as csvfile:
    # Create a CSV writer object
    writer = csv.writer(csvfile)
    
    # Write the header row to the CSV file
    writer.writerow(['name', 'bikes', 'stands'])
    
    while True:
        # Send a GET request to the API and retrieve the station data
        response = requests.get(url, params=params)
        stations = response.json()
        
        # Loop through the station data and write it to the CSV file
        for station in stations:
            name = station['name']
            bikes = station['available_bikes']
            stands = station['available_bike_stands']
            
            # Write the data to the CSV file
            writer.writerow([name, bikes, stands])
        
        # Wait for the next refresh interval
        time.sleep(interval)

