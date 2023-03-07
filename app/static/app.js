function initMap() {
    fetch("/stations").then(response => {
        return response.json();
    }).then(data => {
        map = new google.maps.Map(document.getElementById("map"),
        {
            center: { lat: 53.346569, lng: -6.265171 },
            zoom: 14,
            zoomControl: true
        });

        const infowindow = new google.maps.InfoWindow();

        data.forEach(station => {
            var marker = new google.maps.Marker({
                position: { lat: station.position_lat, lng: station.position_lng },
                map: map,
                title: station.address
            });

            marker.addListener("click", () => {

                infowindow.setContent("<h2>" + station.name + "</h2>"
                + "<p><b>Available Bikes: </b>" + station.available_bikes + "</p>"
                + "<p><b>Available Stands: </b>" + station.available_bike_stands + "</p>"
                + "<p><b>Status: </b>" + station.status + "</p>");

                infowindow.open(map, marker);
            });
        });
    })
}

function station_dropdown() {
    fetch("/static_stations").then(response => {
        return response.json()
    }).then(data => {
        var station_option_output = "<option value='' disabled selected>-- Please Select --</option>";
        data.forEach(station => {
            station_option_output += "<option value=" + station.number + ">" + station.number + "</option><br>";
        })
        document.getElementById("station-select").innerHTML = station_option_output;
    })
}

//function display_station_info(value){
//    fetch("/stations").then(response => {
//        return response.json();
//    }).then(data => {
//        value = value - 1;
//        var table_content = "<tr>"
//                  + "<th>Name: " + data[value].number + "</th>"
//                  + "<th>Available Stands: " + data[value].available_bike_stands + "</th>"
//                  + "<th>Available Bikes: " + data[value].available_bikes + "</th>"
//                  + "<th>Status: " + data[value].status + "</th>"
//                  +"</tr>";
//        document.getElementById("station-table").innerHTML = table_content;
//    })
//
//}

function display_station_info(value){
    fetch("/stations").then(response => {
        return response.json();
    }).then(data => {
        data.forEach(station => {
            if(station.number == value){
                var table_content = "<tr>"
                      + "<th>Name: " + station.number + "</th>"
                      + "<th>Available Stands: " + station.available_bike_stands + "</th>"
                      + "<th>Available Bikes: " + station.available_bikes + "</th>"
                      + "<th>Status: " + station.status + "</th>"
                      +"</tr>";
                document.getElementById("station-table").innerHTML = table_content;
                }
            }
        )
    })
}

function display_weather() {

    fetch("/weather").then(response => {
        return response.json();
    }).then(data => {
        var weather_output = data[0].weather_description;
        document.getElementById("weather-description").innerHTML = weather_output;
    })

}