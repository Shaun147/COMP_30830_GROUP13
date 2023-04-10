import sched
import time


def run_5m():
    print(1)
    scheduler.enter(10, 1, run_5m)


def run_1h():
    print(2)
    scheduler.enter(20, 1, run_1h)


scheduler = sched.scheduler(time.time, time.sleep)

scheduler.enter(0, 1, run_1h)
scheduler.enter(0, 1, run_5m)
scheduler.run()