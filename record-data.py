from sense_hat import SenseHat
from threading import Event, Thread


def call_repeatedly(interval, func, *args):
    stopped = Event()
    def loop():
        while not stopped.wait(interval): # the first call is in `interval` secs
            func(*args)
    thread=Thread(target=loop)
    thread.daemon = True
    thread.start()    
    return stopped.set

def report_conditions():
    s = SenseHat()
    report = {
      "humidity": s.get_humidity(), # percentage
      "temp_from_humidity": s.get_temperature_from_humidity(), # celcius
      "temp_from_pressure": s.get_temperature_from_pressure(), # celcius
      "pressure": s.get_pressure() # millibars
    }
    print(report)

# try:
  cancel = call_repeatedly(5, report_conditions)
# finally:
  # cancel()