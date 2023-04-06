
import time
import matplotlib.pyplot as plt
import sys

def iterative_fac(n):
    temp = 1
    for i in range(1, n+1):
        temp *= i
    return temp


def tail_recur_fac(n):
    if n == 1:
        return 1
    return n * tail_recur_fac(n-1)

def nontail_recur_fac(n, acc=1):
    if n == 1:
        return acc
    return nontail_recur_fac(n-1, acc*n)

print("System recursion limit:", sys.getrecursionlimit())
sys.setrecursionlimit(2100)
print("System recursion limit:", sys.getrecursionlimit())
time_iter = []
time_nontail = []
time_tail = []
data_range = []
run_times = 4


for i in range(1, 2001):
    data_range += [i, ]

for i in range(1, 2001):
    runTime = 0
    for each in range(run_times):
        start = time.perf_counter()
        iterative_fac(i)
        end = time.perf_counter()
        runTime += end - start
    time_iter += [runTime / 10, ]

    runTime = 0
    for each in range(run_times):
        start = time.perf_counter()
        nontail_recur_fac(i)
        end = time.perf_counter()
        runTime += end - start
    time_nontail += [runTime / 10, ]

    runTime = 0
    for each in range(run_times):
        start = time.perf_counter()
        tail_recur_fac(i)
        end = time.perf_counter()
        runTime += end - start
    time_tail += [runTime / 10, ]

plt.plot(data_range, time_iter, label='iterative')
plt.plot(data_range, time_nontail, label='non-tail recursive')
plt.plot(data_range, time_tail, label='tail recursive')

plt.xlabel('value')
plt.ylabel('run time')
plt.legend()
plt.show()