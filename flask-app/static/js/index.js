function initMap() {
    map = new google.maps.Map(document.getElementById("map"),
    {
        center: { lat: 53.346569, lng: -6.265171 },
        zoom: 14,
        zoomControl: true
    });
    
    getStations();

}


function addMarkers(data){

    const  lowIcon= {
        path: "M-1.547 12l6.563-6.609-1.406-1.406-5.156 5.203-2.063-2.109-1.406 1.406zM0 0q2.906 0 4.945 2.039t2.039 4.945q0 1.453-0.727 3.328t-1.758 3.516-2.039 3.070-1.711 2.273l-0.75 0.797q-0.281-0.328-0.75-0.867t-1.688-2.156-2.133-3.141-1.664-3.445-0.75-3.375q0-2.906 2.039-4.945t4.945-2.039z",
        fillColor: "red",
        fillOpacity: 0.6,
        strokeWeight: 0,
        rotation: 0,
        scale: 2,
    };

    const  mediumIcon= {
        path: "M-1.547 12l6.563-6.609-1.406-1.406-5.156 5.203-2.063-2.109-1.406 1.406zM0 0q2.906 0 4.945 2.039t2.039 4.945q0 1.453-0.727 3.328t-1.758 3.516-2.039 3.070-1.711 2.273l-0.75 0.797q-0.281-0.328-0.75-0.867t-1.688-2.156-2.133-3.141-1.664-3.445-0.75-3.375q0-2.906 2.039-4.945t4.945-2.039z",
        fillColor: "blue",
        fillOpacity: 0.6,
        strokeWeight: 0,
        rotation: 0,
        scale: 2,
    };

    const  highIcon= {
        path: "M-1.547 12l6.563-6.609-1.406-1.406-5.156 5.203-2.063-2.109-1.406 1.406zM0 0q2.906 0 4.945 2.039t2.039 4.945q0 1.453-0.727 3.328t-1.758 3.516-2.039 3.070-1.711 2.273l-0.75 0.797q-0.281-0.328-0.75-0.867t-1.688-2.156-2.133-3.141-1.664-3.445-0.75-3.375q0-2.906 2.039-4.945t4.945-2.039z",
        fillColor: "green",
        fillOpacity: 0.6,
        strokeWeight: 0,
        rotation: 0,
        scale: 2,
    };

    data.forEach(station => {
        var marker = new google.maps.Marker({
            position: { lat: station.position_lat, lng: station.position_lng },
            map: map,
            title: station.address,
            icon: station.available_bikes <= 10 ? lowIcon : 
            station.available_bikes <= 25 ? mediumIcon : highIcon
        
        });

        const infowindow = new google.maps.InfoWindow();
        
        marker.addListener("click", () => {

            infowindow.setContent("<h2>" + station.name + "</h2>"
            + "<p><b>Available Bikes: </b>" + station.available_bikes + "</p>"
            + "<p><b>Available Stands: </b>" + station.available_bike_stands + "</p>"
            + "<p><b>Status: </b>" + station.status + "</p>");

            infowindow.open(map, marker);
        });
            
        infowindow.addListener("closeclick", () => {
        infowindow.close();
    });

});
}


function getStations() {
fetch("/stations").then(response => {
  return response.json();
  }).then(data => {
      console.log("fetch response", typeof data);
      addMarkers(data);
});
}


function station_dropdown() {
    fetch("/static_stations").then(response => {
        return response.json()
    }).then(data => {
        var station_option_output = "<option value='' disabled selected>-- Please Select --</option>";
       
        data.forEach(station => {
            station_option_output += "<option value=" + station.number + ">" + station.name + "</option><br>";
        })
        
        document.getElementById("station-select").innerHTML = station_option_output;
  
        var dropdown = document.getElementById("station-select");
        dropdown.addEventListener("change", function() {
        var selectedStation = dropdown.value;
  
        var marker = markers.find(function(m) {
          return m.stationNumber == selectedStation;
        });
  
        google.maps.event.trigger(marker, "click");
      });
  
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
                      + "<th>Number: " + station.number + "</th>"
                      + "<th>Name: " + station.name + "</th>"
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

function now_time(){
    var time = new Date();
    var year = time.getFullYear();
    var month = time.getMonth()+1;
    var day = time.getDay();
    var hour = time.getHours();
    var minutes = time.getMinutes();
    var seconds = time.getSeconds().toString().padStart(2, '0');
    var rs = "time: "+year+"/"+month+"/"+day+" "+hour+":"+minutes+":"+seconds;
    return rs;
}

function display_weather() {

    fetch("/weather").then(response => {
        return response.json();
    }).then(data => {

        var weather_output = data[0].weather_description;
        document.getElementById("weather-description").innerHTML = weather_output;

        var temperature = (data[0].temp - 274.15).toFixed(2) + "℃";
        document.getElementById("temperature").innerHTML = temperature;

        var time_string = now_time();
        document.getElementById("time-detail").innerHTML = time_string;

        var weather_img = document.getElementById("weather-icon");
        weather_img.src = "https://openweathermap.org/img/wn/" + data[0].icon + "@2x.png";

    })
}