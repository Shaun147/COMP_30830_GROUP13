import random


def generate_sparse_graph(num_nodes, density):
    def generate_sparse_list(num_nodes, density):
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

    flag = 0

    distances = generate_sparse_list(num_nodes, density)

    for i in range(len(distances)):
        for j in range(len(distances)):
            if distances[i][:2] == (distances[j][1], distances[j][0]):
                distances[j] = (distances[i][1], distances[i][0], distances[i][2])
                flag = 1
        if flag == 0:
            distances.append((distances[i][1], distances[i][0], distances[i][2]))
        flag = 0

    result = []
    for i in range(num_nodes):
        result.append([])
        for j in range(num_nodes):
            for edge in distances:
                if edge[0] - 1 == i and edge[1] - 1 == j:
                    result[i].append((edge[1], edge[2]))

    return result


# creat class Union to check and connect two island
class Union:
    def __init__(self, n: int, if_show_graph, distances):
        self.parent = [0 for _ in range(n + 1)]
        self.rank = [0 for _ in range(n + 1)]
        for i in range(n + 1):
            self.parent[i] = i
            self.rank[i] = 1
        self.result = []
        self.if_print = if_show_graph
        self.distances = distances

    def find(self, x):
        if x == self.parent[x]:
            return x
        return self.find(self.parent[x])

    def if_connect(self, x, y):
        xt, yt = self.find(x), self.find(y)
        return xt == yt

    def connect(self, x, y):
        xt, yt = self.find(x), self.find(y)
        if xt == yt:
            return
        if self.rank[xt] >= self.rank[yt]:
            self.parent[y] = xt
            self.rank[xt] += self.rank[yt]
        else:
            self.parent[x] = yt
            self.rank[yt] += self.rank[xt]
        add_edge = (x, y,
                    next(distance for (island, distance) in self.distances[x - 1] if island == y))
        self.result.append(add_edge)
        if self.if_print:
            print("parent: \t", [num + 1 for num in self.parent])
            print('rank: \t\t', self.rank)
            print('add edge: \t', add_edge)


def kruskal_algorithm(distances, if_show_graph):
    num_island = len(distances)
    union = Union(num_island, if_show_graph, distances)
    edges = []

    # Preprocessed array
    for island in range(num_island):
        for neighbor, distance in distances[island]:
            edges.append((island + 1, neighbor, distance))

    # remove repeated paths
    def remove_duplicates(edges):
        rs = []
        for edge in edges:
            if edge not in rs and (edge[1], edge[0], edge[2]) not in rs:
                rs.append(edge)

        return rs

    # sort
    edges.sort(key=lambda x: x[2])
    edges_update = remove_duplicates(edges)

    for island_x, island_y, distance in edges_update:
        if not union.if_connect(island_x, island_y):
            union.connect(island_x, island_y)


    return union.result

test = generate_sparse_graph(100, 0.2)

tree = kruskal_algorithm(test, False)
print('minimum spanning tree: ', tree)