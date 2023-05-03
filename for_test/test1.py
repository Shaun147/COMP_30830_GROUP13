import random

def generate_sparse_graph(num_nodes, density):
    distances = []
    for i in range(1, num_nodes + 1):
        row = []
        for j in range(1, num_nodes + 1):
            if i == j:
                continue
            if random.random() <= density:
                distance = random.randint(100, 1000)
                row.append((i, j, distance))
        distances.extend(row)
    return distances

num_nodes = 5
density = 0.3
distances = generate_sparse_graph(num_nodes, density)


print(distances)
flag = 0
for i in range(len(distances)):
    for j in range(len(distances)):
        if distances[i][:2] == (distances[j][1], distances[j][0]):
            distances[j] = (distances[i][1], distances[i][0], distances[i][2])
            flag = 1
    if flag == 0:
        distances.append((distances[i][1], distances[i][0], distances[i][2]))
    flag = 0
print(distances)

result = []
for i in range(num_nodes):
    result.append([])
    for j in range(num_nodes):
        for edge in distances:
            if edge[0]-1 == i and edge[1]-1 == j:
                result[i].append((edge[1], edge[2]))

print(result)



