// set a global info window
let openInfoWindow = null;

//const loaderContainer = document.querySelector('.loader-container');

// create 3 different icon for stations
const  lowIcon= {
    path: "M-1.547 12l6.563-6.609-1.406-1.406-5.156 5.203-2.063-2.109-1.406 1.406zM0 0q2.906 0 4.945 2.039t2.039 4.945q0 1.453-0.727 3.328t-1.758 3.516-2.039 3.070-1.711 2.273l-0.75 0.797q-0.281-0.328-0.75-0.867t-1.688-2.156-2.133-3.141-1.664-3.445-0.75-3.375q0-2.906 2.039-4.945t4.945-2.039z",
    fillOpacity: 1,
    fillColor: "#cb123f",
    scale: 1.5,
};
const  mediumIcon= {
    path: "M-1.547 12l6.563-6.609-1.406-1.406-5.156 5.203-2.063-2.109-1.406 1.406zM0 0q2.906 0 4.945 2.039t2.039 4.945q0 1.453-0.727 3.328t-1.758 3.516-2.039 3.070-1.711 2.273l-0.75 0.797q-0.281-0.328-0.75-0.867t-1.688-2.156-2.133-3.141-1.664-3.445-0.75-3.375q0-2.906 2.039-4.945t4.945-2.039z",
    fillColor: "#5468fa",
    fillOpacity: 1,
    scale: 1.5,
};
const  highIcon= {
    path: "M-1.547 12l6.563-6.609-1.406-1.406-5.156 5.203-2.063-2.109-1.406 1.406zM0 0q2.906 0 4.945 2.039t2.039 4.945q0 1.453-0.727 3.328t-1.758 3.516-2.039 3.070-1.711 2.273l-0.75 0.797q-0.281-0.328-0.75-0.867t-1.688-2.156-2.133-3.141-1.664-3.445-0.75-3.375q0-2.906 2.039-4.945t4.945-2.039z",
    fillColor: "#77e151",
    fillOpacity: 1,
    scale: 1.5,
};


// insert map and call other functions
function initMap() {
    map = new google.maps.Map(document.getElementById("map"),
    {
        center: { lat: 53.346569, lng: -6.265171 },
        zoom: 14,
        zoomControl: true
    });
    // loading the packages of graph drawing
    google.charts.load('current', {'packages':['bar']});
    google.charts.load('current', {'packages':['corechart']});
    add_marker();
    station_dropdown();
    predict_day_dropdown();
    // show the current weather and time each second
    setInterval(display_weather, 500);
    forecast();
    autocomplete_search();
    debounce_on();
}

// add markers to each station and call the info window of station
// when click the marker in the map, the statistic graph and available table will be called
function add_marker() {
    fetch("/stations").then(response => {
        return response.json();
    }).then(data => {
        data.forEach(station => {
              create_marker(station);
        });
    });
}

function create_marker(station) {
    var marker = new google.maps.Marker({
        position: { lat: station.position_lat, lng: station.position_lng },
        map: map,
        title: station.address,
        icon: station.available_bikes <= 5 ? lowIcon :
        station.available_bikes <= 15 ? mediumIcon : highIcon

    });

    marker.addListener("click", () => {
        document.getElementById("station_select").value = station.number;
        display_station_info();
    });
    return marker;
}

// use to open the info window
function open_infowindow(station, marker){
    if (openInfoWindow) {
        openInfoWindow.close();
    }

    const infowindow = new google.maps.InfoWindow();
    infowindow.setContent("<h3>" + station.name + "</h3>"
        + "<p><b>Available Bikes: </b>" + station.available_bikes + "</p>"
        + "<p><b>Available Stands: </b>" + station.available_bike_stands + "</p>"
        + "<p><b>Status: </b>" + station.status + "</p>");

    infowindow.open(map, marker);
    openInfoWindow = infowindow;
}

// create the options to dropdown
function station_dropdown() {
    var station_option_output = '';
    fetch("/static_stations").then(response => {
        return response.json()
    }).then(data => {
        data.forEach(station => {
            station_option_output += "<option value=" + station.number + ">" + station.name + "</option><br>";
        })
        document.getElementById("station_select").innerHTML = "<option value='' "
        + "disabled selected>-- Please Select The Station --</option>" + station_option_output;
        document.getElementById("station_select2").innerHTML = "<option value='' "
        + "disabled selected>-- Please Select The Station --</option>" + station_option_output;
        document.getElementById("station_select3").innerHTML = "<option value='' "
        + "disabled selected>-- Start Station --</option>" + station_option_output;
        document.getElementById("station_select4").innerHTML = "<option value='' "
        + "disabled selected>-- Destination Station --</option>" + station_option_output;
    })
}

// short the name of the day
function getShortDayName(dayName) {
  const shortDayNames = {
    'Sunday': 'Sun',
    'Monday': 'Mon',
    'Tuesday': 'Tue',
    'Wednesday': 'Wed',
    'Thursday': 'Thu',
    'Friday': 'Fri',
    'Saturday': 'Sat'
  };
  return shortDayNames[dayName] || '';
}

// use to show the graph of everyday using
function display_graph_week(){
    const dropdown = document.getElementById('station_select');
    var value = dropdown.value;

    fetch("/availability_data/"+value).then( response => {
        return response.json();
    }).then(data => {
        document.getElementById('graph_title').innerHTML = "Using Condition Statistic By Day<br><br>";
        var week_data = google.visualization.arrayToDataTable([]);
        week_data.addColumn('string', 'day of week');
        week_data.addColumn('number', 'Available Bikes');
        week_data.addColumn('number', 'Available Stands');

        data.forEach(day => {
            const all_places = day.avg_bikes + day.avg_stands;
            week_data.addRow([getShortDayName(day.day_name), day.avg_bikes, day.avg_stands]);
        });

        var options = {
            legend: { position: 'bottom' },
            colors: ['#a9f0f5', '#f5a074'],
            width:500,
            height: 250,
            chartArea: {
                    right: '20%',
                    top:'10%',
                },

        };

        var chart = new google.visualization.ColumnChart(document.getElementById('graph-container'));
        chart.draw(week_data, options);
    });
}

// use to show the graph of hourly using
function display_graph_hourly() {
    const dropdown = document.getElementById('station_select');
    var value = dropdown.value;

    fetch("/hourly_data/"+value).then( response => {
        return response.json();
    }).then(data => {
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const date = new Date();
        const dayOfWeekString = daysOfWeek[date.getDay()];
        document.getElementById('graph_title').innerHTML = "Using Condition Statistic of "
                                                            +dayOfWeekString+" By Hour<br><br>";
        var hour_data = google.visualization.arrayToDataTable([]);
        hour_data.addColumn('string', 'time of day');
        hour_data.addColumn('number', 'Available Bikes');
        hour_data.addColumn('number', 'Available Stands');
        hour_data.addColumn('number', 'All');

        data.forEach(day => {
            console.log(dayOfWeekString, day.day_name);
            if(dayOfWeekString == day.day_name){
                const all_places = day.avg_bikes + day.avg_stands;
                hour_data.addRow([day.hourly.toString()+":00", day.avg_bikes, day.avg_stands, all_places]);
            }
        });

        var options = {
            legend: { position: 'bottom' },
            colors: ['#a9f0f5', '#f5a074', '#8e9096'],
            width:500,
            height: 250,
            chartArea: {
                    right: '20%',
                    top:'10%',
                },
        };

        var chart = new google.visualization.LineChart(document.getElementById('graph-container'));
        chart.draw(hour_data, options);
    });
}

// use to show the available information
// when showing available information, statistic graph showing
function display_station_info(){
    document.getElementById('text_after').textContent = '';
    const dropdown = document.getElementById('station_select');
    var value = dropdown.value;

    fetch("/stations").then(response => {
        return response.json();
    }).then(data => {
        data.forEach(station => {
            if(station.number == value){
                var table_content = "<tbody>"
                      + "<tr><th class='text_left'>Name: </th><th class='text_right'>"
                      + station.name + "</th></tr>"
                      + "<tr><th class='text_left'>Available Stands: </th><th class='text_right'>"
                      + station.available_bike_stands + "</th></tr>"
                      + "<tr><th class='text_left'>Available Bikes: </th><th class='text_right'>"
                      + station.available_bikes + "</th></tr>"
                      + "<tr><th class='text_left'>Status: </th><th class='text_right'>"
                      + station.status + "</th></tr>"
                      +"</tbody>";
                document.getElementById("station_table").innerHTML = table_content;
                open_infowindow(station, create_marker(station));
            }
        })

        display_graph_week();
    })
}

// return a string of time of current time
function now_time(){
    var time = new Date();
    var year = time.getFullYear();
    var month = time.getMonth()+1;
    var day = time.getDate();
    var hour = time.getHours();
    var minutes = time.getMinutes().toString().padStart(2, '0');
    var seconds = time.getSeconds().toString().padStart(2, '0');
    var rs = "PRESENT TIME: "+day+"/"+month+"/"+ year+"<br>"+hour+":"+minutes+":"+seconds;
    return rs;
}

// using to show the weather info of current time
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

        var weather_img = document.getElementById("curr-weather-icon");
        weather_img.src = "https://openweathermap.org/img/wn/" + data[0].icon + "@2x.png";

    })
}

// there are 8 data points in one day
// acquire the most frequency data as main info
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

// using to show the future weather information
function forecast(){
    fetch("/forecast").then(response=>{
        return response.json();
    }).then(data => {
        // obtain the timestamp of 00:00 of current day
        var time = new Date();
        time.setHours(0, 0, 0, 0);
        var today_timestamp = Math.floor(time.getTime() / 1000);
        var a_daytime = 24*60*60;
        var temp_max = 0;
        var temp_min = 1000;
        var main_weather = [];
        var main_weather_icon = [];
        var tempt_value = 0;
        var date_future;
        var li_content = "";

        data.forEach(datetime => {
            // calculate the number of days after the current day
            i_day =Math.floor((datetime.dt - (today_timestamp + a_daytime)) / a_daytime)+1;

            // only show 5 days
            if(i_day >= 0 && i_day <6){

                main_weather.push(datetime.main_weather);
                main_weather_icon.push(datetime.icon);

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
                    + "@2x.png' alt='Weather icon'><br><b>"
                    + main_weather_info(main_weather) + "</b><br>"
                    + "MIN:<b>"+(temp_min-274)+ "</b>°C<br>MAX:<b>" + (temp_max-274)+ "</b>°C" + "<br>DATE:<b>"
                    + date.getDate() +"/"+ (date.getMonth()+1)+"</b>";
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

// a function used to convert the string to int for prediction
function get_weather_value(weather_str) {
    const weatherTypes = ['Clouds', 'Drizzle', 'Rain', 'Clear', 'Snow', 'Mist'];
    const weatherValues = [1, 2, 4, 0, 5, 3];

    const index = weatherTypes.indexOf(weather_str);
    return weatherValues[index];
}

// predict
function predict(number, list){
    return fetch('/prediction', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            'number': number,
            'input_features': list
        })
    })
    .then(response => response.json())
    .then(data => data.prediction)
}

// the statistic graph for future 40 hours
function prediction_statistic() {
    const dropdown = document.getElementById('station_select2');
    var value = dropdown.value;
    fetch("/forecast").then(response=>{
        return response.json();
    }).then(data => {
        var hourly_predict_bikes = [];
        var hourly_predict_stands = []
        var count = 0;
        var statistic_count = 0
        const date_list = [];

        data.forEach(each_data => {

            document.getElementById('graph_title2').innerHTML = "Using Prediction By Every 3-Hour";

            var input_feature_list = [each_data.feels_like, get_weather_value(each_data.main_weather),
                each_data.wind_speed, each_data.humidity, each_data.pressure,
                each_data.day_of_week, each_data.hourly];
            var day_of_week = each_data.day_of_week;
            const time = parseInt(Date.now());

            if(each_data.dt*1000 >= time) {
                statistic_count += 1;
                const date = new Date(each_data.dt*1000);
                date_list.push(date);

                predict(value, input_feature_list).then(resultArray => {
                    hourly_predict_bikes.push(resultArray[0][1]);
                    hourly_predict_stands.push(resultArray[0][0]);
                    count += 1;
                    if(count >= statistic_count){
                        var hour_data = google.visualization.arrayToDataTable([]);
                        hour_data.addColumn('string', 'hourly');
                        hour_data.addColumn('number', 'predict bikes(day / hour)');
                        for (var i = 0; i < count; i++) {
                              hour_data.addRow([date_list[i].getDate().toString()+'/'+
                              (date_list[i].getHours()).toString()+":00",
                              hourly_predict_bikes[i]]);
                        }
                        var options = {
                            legend: { position: 'bottom' },
                            colors: ['#005555', '#f5a074'],
                             hAxis: {
                                slantedText: true,
                                slantedTextAngle: 45,
                                 textStyle: {
                                        fontSize: 10
                                    }
                            },

                        };

                        var chart = new google.visualization.ColumnChart(document.getElementById('graph-container2'));
                        chart.draw(hour_data, options);
                    }
                });
            }
        });
    });
}

function predict_day_dropdown(){
    var temp_string = "<option value='' disabled selected>-- Please Select The Day First--</option>";
    document.getElementById("predict_hour").innerHTML = temp_string;


    var time = new Date();
    var day = time.getDate();
    var month = time.getMonth();
    var hour = time.getHours();

    var day_option_output = "<option value='' disabled selected>-- Please Select The Day --</option>";
        for(var i=0; i< 5; i++){
            if(hour == 23 && i == 0) i++;
            var time_new = new Date(time);
            time_new.setDate(time.getDate() + i);
            day_option_output += "<option value=" + (day+i) + ">" +
            (time_new.getMonth()+1)+'/'+time_new.getDate() + "</option><br>";
        }

    document.getElementById("predict_day").innerHTML = day_option_output;

}

// create the options to dropdown
function predict_hour_dropdown(){
    const dropdown = document.getElementById('predict_day');
    var value = dropdown.value;
    var time = new Date();
    var day = time.getDate();
    var hour = time.getHours();

    var hour_option_output = "<option value='' disabled selected>-- Please Select The Hour --</option>";
    for(var i=0; i< 24; i++){
        if (value != day) hour = -1;
        if (hour < i){
            hour_option_output += "<option value=" + i + ">" + i + ":00</option><br>";
        }
    }
    document.getElementById("predict_hour").innerHTML = hour_option_output
}

// predict the bikes and stands when input station and time
function prediction_result(){
    var dropdown_station_start = document.getElementById('station_select3').value;

    var dropdown_station_destination = document.getElementById('station_select4').value;

    var day_value = document.getElementById('predict_day').value;
    var hour_value = document.getElementById('predict_hour').value;

    var time = new Date();
    var day = time.getDate();
    var hour = time.getHours();

    var predict_timestamp = Math.floor(time.getTime()/1000) + ((day_value-day)*24 + (hour_value-hour))*3600;

    var time_new = new Date(predict_timestamp * 1000);
    var day_of_week = time_new.getDay();
    var hour_of_day = time_new.getHours();

    fetch("/predict_plan/"+predict_timestamp).then( response => {
        return response.json();
    }).then(data => {
        data.forEach(each_data => {

            var input_feature_list = [each_data.feels_like, get_weather_value(each_data.main_weather),
                each_data.wind_speed, each_data.humidity, each_data.pressure,
                day_of_week, hour_of_day];
            if(dropdown_station_start!='' && day_value!='' && hour_value!=''){
                console.log(dropdown_station_start);
                predict(dropdown_station_start, input_feature_list).then(resultArray => {
                    var table_content_bikes =resultArray[0][1].toFixed(0) + '~'
                    + (resultArray[0][1]+2).toFixed(0);
                    var table_content_stands =resultArray[0][0].toFixed(0) + '~'
                    + (resultArray[0][0]+2).toFixed(0);
                    document.getElementById("bike_start").innerHTML = table_content_bikes;
                    document.getElementById("stand_start").innerHTML = table_content_stands;
                });
            }
            if(dropdown_station_destination!='' && day_value!='' && hour_value!=''){
                predict(dropdown_station_destination, input_feature_list).then(resultArray => {
                    var table_content_bikes =resultArray[0][1].toFixed(0) + '~'
                    + (resultArray[0][1]+2).toFixed(0);
                    var table_content_stands =resultArray[0][0].toFixed(0) + '~'
                    + (resultArray[0][0]+2).toFixed(0);
                    document.getElementById("bike_destination").innerHTML = table_content_bikes;
                    document.getElementById("stand_destination").innerHTML = table_content_stands;
                });
            }
        });
    });
}


function autocomplete_search(){
    var list_data = [];

    fetch("/static_stations").then(response => {
        return response.json();
    }).then(data => {
        data.forEach(station => {
            list_data.push(station.address)
        });
    });

    //refer to https://c.runoob.com/codedemo/6190/
    function autocomplete(inp, arr) {
        var currentFocus;
        inp.addEventListener("input", function(event) {
            var input_div, list_div, val = this.value;
            /*Close the open autofill list*/
             closeAllLists();
            if (!val)  return false;
        currentFocus = -1;
        /*Create the div element to place the value of the autofill list*/
        input_div = document.createElement("div");
        input_div.setAttribute("id", this.id + "autocomplete-list");
        input_div.setAttribute("class", "autocomplete-items");
        /*DIV acts as a child of the auto-fill container*/
        this.parentNode.appendChild(input_div);

        for (var i = 0; i < arr.length; i++) {
            if (arr[i].toUpperCase().indexOf(val.toUpperCase()) === 0) {
            list_div = document.createElement("div");
            list_div.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            list_div.innerHTML += arr[i].substr(val.length);
            list_div.innerHTML += "<input type='hidden' value='" + arr[i].replace(/'/g, '&#39;') + "'>";
            list_div.addEventListener("click", function() {
                inp.value = this.getElementsByTagName("input")[0].value;
                closeAllLists();
            });
          input_div.appendChild(list_div);
        }
      }
    });

    inp.addEventListener("keydown", function(event) {
        var auto_list = document.getElementById(this.id + "autocomplete-list");
        if (auto_list) auto_list = auto_list.getElementsByTagName("div");
        if (event.keyCode == 40) {
        currentFocus++;
        addActive(auto_list);
      } else if (event.keyCode == 38) {
        currentFocus--;
        addActive(auto_list);
      } else if (event.keyCode == 13) {
        event.preventDefault();
        if (currentFocus > -1) {
          if (auto_list) auto_list[currentFocus].click();
        }
      }
    });
    function addActive(option) {
        if (!option) return false;
        removeActive(option);
        if (currentFocus >= option.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (option.length - 1);
        option[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(option) {
     /*Remove options that are not selected "autocomplete-active" class*/
    for (var i = 0; i < option.length; i++) {
        option[i].classList.remove("autocomplete-active");
        }
    }
    function closeAllLists(element) {
        /*Disable automatic list adding*/
        var items = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < items.length; i++) {
            if (element != items[i] && element != inp) {
                items[i].parentNode.removeChild(items[i]);
            }
        }
    }
    /*Click anywhere in the HTML document to close the fill list*/
    document.addEventListener("click", function (event) {
            closeAllLists(event.target);
    });
    }

    autocomplete(document.getElementById("myInput"), list_data);
}


function search_station(){
    const form = document.getElementById('search-form');
    var input = document.getElementById('myInput').value;
    var input_right_flag = 1;
    if (input !== '') {
        fetch("/static_stations").then(response => {
            return response.json();
        }).then(data => {

            data.forEach(station => {
                if(station.address == input) {
                    document.getElementById("station_select").value = station.number;
                    display_station_info();
                    var element = document.getElementById('card_title_map');
                    element.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
                    input_right_flag = 0;
                    document.getElementById('myInput').value = "";
                    document.getElementById('myInput').placeholder = "Station Name";
                }
            });
            if(input_right_flag == 1){
                document.getElementById('myInput').placeholder = "Wrong Name";
                document.getElementById('myInput').value = "";
            }
        });
    }
}

function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

function debounce_on(){
    const debouncedSearch = debounce(predict_day_dropdown, 100);
    document.querySelector('#graph-container').addEventListener('input', event => {
        debouncedSearch(event.target.value);
    });
}

function scroll_to_map() {
  var element = document.getElementById('card_title_map');
  element.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
}

function predict_under_map(){
    var select_value = document.getElementById('station_select').value;

    if (select_value != ''){
        document.getElementById('text_after').textContent = '';
        document.getElementById('station_select2').value = select_value;
        prediction_statistic();
        var element = document.getElementById('jump_predict');
        element.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"})
    } else{
        document.getElementById('text_after').textContent = 'Please select a station';
    }
}