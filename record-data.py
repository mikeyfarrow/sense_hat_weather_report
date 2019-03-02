import os
import pprint
from sense_hat import SenseHat
from threading import Event, Thread

pp = pprint.PrettyPrinter(indent=4)

def get_cpu_temp():
    res = os.popen("vcgencmd measure_temp").readline()
    t = float(res.replace("temp=", "").replace("'C\n", ""))
    return(t)


def call_repeatedly(interval, func, *args):
    stopped = Event()

    def loop():
        while not stopped.wait(interval):  # the first call is in `interval` secs
            func(*args)
    Thread(target=loop).start()
    return stopped.set


def temp_corrected(temp):
  offset = (get_cpu_temp() - temp) / 5.466
  return temp - offset


def report_conditions():
    s = SenseHat()
    temp_hum = s.get_temperature_from_humidity()
    temp_press = s.get_temperature_from_pressure()
    temp_avg = (temp_hum + temp_press) / 2
    pressure = s.get_pressure()
    humidity = s.get_humidity()

    report = {
        "humidity": humidity,  # percentage
        "pressure": pressure,  # millibars
        "temp_from_humidity": temp_hum,  # celcius
        "temp_from_pressure": temp_press,  # celcius
        "temp_avg": temp_avg,
        "temp_from_pressure_corrected": temp_corrected(temp_press),
        "temp_from_humidity_corrected": temp_corrected(temp_hum),
        "temp_avg_corrected": temp_corrected(temp_avg)
    }
    pp.print(report)


# When reviewing the Enviro pHAT for the Pi Zero we came up with an equation
# to account for the CPU temperature affecting a hat's temperature reading.
# We just need the CPU temperature and a scaling factor to calculate the
# calibrated temperature:
# temp_calibrated = temp - ((cpu_temp - temp)/FACTOR) where FACTOR=5.466



print('Starting to record measurements. Kill program with Ctrl-Z')
call_repeatedly(5, report_conditions)
