function initMap() {
    fetch("/stations").then(response => {
        return response.json();
    }).then(data => {
        map = new google.maps.Map(document.getElementById("map"), {
            center: { lat: 53.346569, lng: -6.265171 },
            zoom: 15,
        });

        const infowindow = new google.maps.InfoWindow();

        data.forEach(station => {
            var markurl="http://maps.google.com/mapfiles/ms/icons/red.png";
            const marker = new google.maps.Marker({
                position: { lat: station.position_lat, lng: station.position_lng },
                icon: {url: markurl },
                map: map,
            });



            marker.addListener("click", () => {

                infowindow.setContent("<h3>" + station.name + "</h3>"
                + "<p><b>Available Bikes: </b>" + station.available_bikes + "</p>"
                + "<p><b>Available Stands: </b>" + station.available_bike_stands + "</p>"
                + "<p><b>Status: </b>" + station.status + "</p>");

                infowindow.open(map, marker);
            });
        });
    })
}

function displayWeather() {
    fetch("/weather").then(response => {
        return response.json();
    }).then(data => {

    var weather_output = "<div>123</div>";

    document.getElementById("weather").innerHTML = weather_output;
    })
}