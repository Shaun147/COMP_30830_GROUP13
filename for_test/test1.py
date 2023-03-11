import sched
import time

# Define the functions to be executed
def func1():
    print("This function runs every 5 minutes")

def func2():
    print("This function runs every 3 hours")

# Create a scheduler object
scheduler = sched.scheduler(time.time, time.sleep)

# Schedule the execution of func1 every 5 minutes
def run_func1():
    func1()
    print('ok')
    scheduler.enter(5, 1, run_func1)

# Schedule the execution of func2 every 3 hours
def run_func2():
    func2()
    scheduler.enter(20, 1, run_func2)

# Start the scheduler
scheduler.enter(0, 1, run_func1)
scheduler.enter(0, 1, run_func2)
scheduler.run()
