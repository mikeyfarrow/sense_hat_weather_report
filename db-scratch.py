from sense_hat import SenseHat
import time
import requests

s = SenseHat()

while True: 
    report = {
      "humidity": s.get_humidity(), # percentage
      "temp_from_humidity": s.get_temperature_from_humidity(), # celcius
      "temp_from_pressure": s.get_temperature_from_pressure(), # celcius
      "pressure": s.get_pressure() # millibars
    }
    print(report)
    r = requests.post("http://localhost:8080/record", data=report)
    time.sleep(5)