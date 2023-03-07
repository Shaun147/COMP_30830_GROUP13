function display_station_info(value){
    fetch("/stations").then(response => {
        return response.json();
    }).then(data => {
        data.forEach{station => {
            if(station.number == value){
                var table_content = "<tr>"
                  + "<th>Name: " + data[value].number + "</th>"
                  + "<th>Available Stands: " + data[value].available_bike_stands + "</th>"
                  + "<th>Available Bikes: " + data[value].available_bikes + "</th>"
                  + "<th>Status: " + data[value].status + "</th>"
                  +"</tr>";
                }
            }
        }
        document.getElementById("station-table").innerHTML = table_content;
    })
}