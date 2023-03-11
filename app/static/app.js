let openInfoWindow = null;
const  lowIcon= {
    path: "M-1.547 12l6.563-6.609-1.406-1.406-5.156 5.203-2.063-2.109-1.406 1.406zM0 0q2.906 0 4.945 2.039t2.039 4.945q0 1.453-0.727 3.328t-1.758 3.516-2.039 3.070-1.711 2.273l-0.75 0.797q-0.281-0.328-0.75-0.867t-1.688-2.156-2.133-3.141-1.664-3.445-0.75-3.375q0-2.906 2.039-4.945t4.945-2.039z",
    fillOpacity: 0.8,
    fillColor: "red",
    scale: 1.5,
};
const  mediumIcon= {
    path: "M-1.547 12l6.563-6.609-1.406-1.406-5.156 5.203-2.063-2.109-1.406 1.406zM0 0q2.906 0 4.945 2.039t2.039 4.945q0 1.453-0.727 3.328t-1.758 3.516-2.039 3.070-1.711 2.273l-0.75 0.797q-0.281-0.328-0.75-0.867t-1.688-2.156-2.133-3.141-1.664-3.445-0.75-3.375q0-2.906 2.039-4.945t4.945-2.039z",
    fillColor: "blue",
    fillOpacity: 0.8,
    scale: 1.5,
};
const  highIcon= {
    path: "M-1.547 12l6.563-6.609-1.406-1.406-5.156 5.203-2.063-2.109-1.406 1.406zM0 0q2.906 0 4.945 2.039t2.039 4.945q0 1.453-0.727 3.328t-1.758 3.516-2.039 3.070-1.711 2.273l-0.75 0.797q-0.281-0.328-0.75-0.867t-1.688-2.156-2.133-3.141-1.664-3.445-0.75-3.375q0-2.906 2.039-4.945t4.945-2.039z",
    fillColor: "green",
    fillOpacity: 0.8,
    scale: 1.5,
};

function initMap() {
    map = new google.maps.Map(document.getElementById("map"),
    {
        center: { lat: 53.346569, lng: -6.265171 },
        zoom: 14,
        zoomControl: true
    });

    add_marker();
    station_dropdown();
    setInterval(display_weather, 1000);
    forecast();
}

function add_marker() {
    fetch("/stations").then(response => {
        return response.json();
    }).then(data => {

        data.forEach(station => {
            var marker = new google.maps.Marker({
                position: { lat: station.position_lat, lng: station.position_lng },
                map: map,
                title: station.address,
                icon: station.available_bikes <= 10 ? lowIcon :
                station.available_bikes <= 25 ? mediumIcon : highIcon

            });

            marker.addListener("click", () => {
                const infowindow = new google.maps.InfoWindow();
                open_infowindow(station, marker);
            });
        });
    });
}

function open_infowindow(station, marker){
    const infowindow = new google.maps.InfoWindow();
    infowindow.setContent("<h2>" + station.name + "</h2>"
        + "<p><b>Available Bikes: </b>" + station.available_bikes + "</p>"
        + "<p><b>Available Stands: </b>" + station.available_bike_stands + "</p>"
        + "<p><b>Status: </b>" + station.status + "</p>");

        if (openInfoWindow) {
            openInfoWindow.close();
        }
        infowindow.open(map, marker);
        openInfoWindow = infowindow;

}

function station_dropdown() {
    fetch("/static_stations").then(response => {
        return response.json()
    }).then(data => {
        var station_option_output = "<option value='' disabled selected>-- Please Select --</option>";
        data.forEach(station => {
            station_option_output += "<option value=" + station.number + ">" + station.name + "</option><br>";
        })
        document.getElementById("station_select").innerHTML = station_option_output;
    })
}

function display_station_info(value){
    fetch("/stations").then(response => {
        return response.json();
    }).then(data => {
        data.forEach(station => {
            if(station.number == value){
                var table_content = "<tr>"
                      + "<th>Name: " + station.name + "</th>"
                      + "<th>Available Stands: " + station.available_bike_stands + "</th>"
                      + "<th>Available Bikes: " + station.available_bikes + "</th>"
                      + "<th>Status: " + station.status + "</th>"
                      +"</tr>";
                document.getElementById("station_table").innerHTML = table_content;
                var marker = new google.maps.Marker({
                    position: { lat: station.position_lat, lng: station.position_lng },
                    map: map,
                    icon: station.available_bikes <= 10 ? lowIcon :
                    station.available_bikes <= 25 ? mediumIcon : highIcon
                })
                open_infowindow(station,marker);
            }
        })
    })
}

function now_time(){
    var time = new Date();
    var year = time.getFullYear();
    var month = time.getMonth()+1;
    var day = time.getDate();
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
        document.getElementById("weather_description").innerHTML = weather_output;

        var temperature = (data[0].temp - 274.15).toFixed(2) + "°C";
        document.getElementById("temperature").innerHTML = temperature;

        var time_string = now_time();
        document.getElementById("time_detail").innerHTML = time_string;

        var weather_img = document.getElementById("curr_weather_icon");
        weather_img.src = "https://openweathermap.org/img/wn/" + data[0].icon + "@2x.png";

    })
}

function main_weather_info(list) {
    var frequency = {};
    list.forEach(function(element){
        frequency[element] = (frequency[element] || 0) +1;
    });
    var mostFrequentElement;
    var highestFrequency = 0;

    for(var element in frequency){
        if(frequency[element] > highestFrequency){
        highestFrequency = frequency[element];
        mostFrequentElement = element;
        }
    }

    return mostFrequentElement;
}

function forecast(){
    fetch("/forecast").then(response=>{
        return response.json();
    }).then(data => {
        var time = new Date();
        time.setHours(0, 0, 0, 0);
        var today_timestamp = Math.floor(time.getTime() / 1000);
        var a_daytime = 24*60*60;
        console.log(a_daytime);
        console.log(today_timestamp);
        var temp_max = 0;
        var temp_min = 1000;
        var main_weather = [];
        var main_weather_icon = [];
        var tempt_value = 0;
        var date_future;
        var li_content = "";

        data.forEach(datetime => {
            i_day =Math.floor((datetime.dt - (today_timestamp + a_daytime)) / a_daytime)+1;
            if(i_day >= 0 && i_day <6){

                main_weather.push(datetime.main_weather);
                main_weather_icon.push(datetime.icon);
                if(i_day == 3){
                    console.log(main_weather);
                    console.log(main_weather_icon)
                }



                if(datetime.temp_max > temp_max){
                    temp_max = datetime.temp_max
                }
                if(datetime.temp_min < temp_min){
                    temp_min = datetime.temp_min
                }

                if(tempt_value != i_day){
                    var date = new Date((datetime.dt - a_daytime) * 1000);
                    li_content += "<li class='future_weather'>"
                    + "<img class='weather_icon'src='https://openweathermap.org/img/wn/"
                    + main_weather_info(main_weather_icon)
                    + "@2x.png' alt='Weather icon'><br>"
                    + main_weather_info(main_weather) + "<br>"
                    + "min:"+(temp_min-274.15).toFixed(2) + "<br>max:" + (temp_max-274.15).toFixed(2) + "<br>"
                    + (date.getMonth()+1) +"/"+ date.getDate();
                    + "</li>"

                    tempt_value = tempt_value + 1;
                    temp_max = 0;
                    temp_min = 1000;
                    main_weather = [];
                    main_weather_icon = [];
                }
            }
        })
        document.getElementById("forecast_window").innerHTML = li_content;

    })

}