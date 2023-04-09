// set a global info window
let openInfoWindow = null;

// create 3 different icon for stations
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
    // show the current weather and time each second
    setInterval(display_weather, 1000);
    forecast();
    test();
    debounce_on();
}

// add markers to each station and call the info window of station
// when click the marker in the map, the statistic graph and available table will be called
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
                open_infowindow(station, marker);
                console.log(station.number);
                document.getElementById("station_select").value = station.number;
                display_station_info(marker);
            });
        });
    });
}

// use to open the info window
function open_infowindow(station, marker){
    console.log("open_infowindow work");
    if (openInfoWindow) {
        openInfoWindow.close();
    }

    const infowindow = new google.maps.InfoWindow();
    infowindow.setContent("<h2>" + station.name + "</h2>"
        + "<p><b>Available Bikes: </b>" + station.available_bikes + "</p>"
        + "<p><b>Available Stands: </b>" + station.available_bike_stands + "</p>"
        + "<p><b>Status: </b>" + station.status + "</p>");

    infowindow.open(map, marker);
    openInfoWindow = infowindow;
}

// create the options to dropdown
function station_dropdown() {
    fetch("/static_stations").then(response => {
        return response.json()
    }).then(data => {
        var station_option_output = "<option value='' disabled selected>-- Please Select The Station --</option>";
        data.forEach(station => {
            station_option_output += "<option value=" + station.number + ">" + station.name + "</option><br>";
        })
        document.getElementById("station_select").innerHTML = station_option_output;
        document.getElementById("predict_hour").innerHTML =
            "<option value='' disabled selected>-- Please Select The Day First--</option>";
        document.getElementById("station_select2").innerHTML = station_option_output;
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
    document.getElementById('graph_title').innerHTML = "Using Condition Statistic By Day<br><br>";
    const dropdown = document.getElementById('station_select');
    var value = dropdown.value;

    fetch("/availability_data/"+value).then( response => {
        return response.json();
    }).then(data => {
        var week_data = google.visualization.arrayToDataTable([]);
        week_data.addColumn('string', 'day of week');
        week_data.addColumn('number', 'Available Bikes');
        week_data.addColumn('number', 'Available Stands');
        week_data.addColumn('number', 'All Places');

        data.forEach(day => {
            const all_places = day.avg_bikes + day.avg_stands;
            week_data.addRow([getShortDayName(day.day_name), day.avg_bikes, day.avg_stands, all_places]);
        });

        var options = {
            colors: ['#a9f0f5', '#8e9096', '#f5a074'],
            width: 450,
            height: 250
        };

        var chart = new google.charts.Bar(document.getElementById('graph-container'));
        chart.draw(week_data, google.charts.Bar.convertOptions(options));
    });
}

// use to show the graph of hourly using
function display_graph_hourly() {
    document.getElementById('graph_title').innerHTML = "Using Condition Statistic By Hour<br><br>";
    const dropdown = document.getElementById('station_select');
    var value = dropdown.value;

    fetch("/hourly_data/"+value).then( response => {
        return response.json();
    }).then(data => {
        var hour_data = google.visualization.arrayToDataTable([]);
        hour_data.addColumn('string', 'time of day');
        hour_data.addColumn('number', 'Available Bikes');
        hour_data.addColumn('number', 'Available Stands');
        hour_data.addColumn('number', 'All Places');

        data.forEach(day => {
            const all_places = day.avg_bikes + day.avg_stands;
            hour_data.addRow([day.hourly.toString()+":00", day.avg_bikes, day.avg_stands, all_places]);
        });

        var options = {
            legend: { position: 'bottom' },
            colors: ['#a9f0f5', '#f5a074', '#8e9096'],
            width:500,
            height: 250,
            chartArea: {
                    right: '30%',
                    top:'10%',
                },
        };

        var chart = new google.visualization.LineChart(document.getElementById('graph-container'));
        chart.draw(hour_data, options);
    });
}

// use to show the available information
// when showing available information, statistic graph showing
function display_station_info(marker){
    const dropdown = document.getElementById('station_select');
    var value = dropdown.value;

    fetch("/stations").then(response => {
        return response.json();
    }).then(data => {
        data.forEach(station => {
            if(station.number == value){
                var table_content = "<tbody>"
                      + "<tr><th>Name: " + station.name + "</th></tr>"
                      + "<tr><th>Available Stands: " + station.available_bike_stands + "</th></tr>"
                      + "<tr><th>Available Bikes: " + station.available_bikes + "</th></tr>"
                      + "<tr><th>Status: " + station.status + "</th></tr>"
                      +"</tbody>";
                document.getElementById("station_table").innerHTML = table_content;
                if(typeof(marker) == "undefined") {
                    marker = new google.maps.Marker({
                        position: { lat: station.position_lat, lng: station.position_lng },
                        map: map,
                        title: station.address,
                        icon: station.available_bikes <= 10 ? lowIcon :
                        station.available_bikes <= 25 ? mediumIcon : highIcon
                    });
                }
                open_infowindow(station, marker);
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
    var rs = "PRESENT TIME: "+day+"/"+month+"/"+ year+" "+hour+":"+minutes+":"+seconds;
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
                    + "@2x.png' alt='Weather icon'><br>"
                    + main_weather_info(main_weather) + "<br>"
                    + "MIN-TEMP:"+(temp_min-274)+ "°C" + "<br>MAX-TEMP:" + (temp_max-274)+ "°C" + "<br>DATE:"
                    + date.getDate() +"/"+ (date.getMonth()+1);
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
        const date_list = [];
        data.forEach(each_data => {
            var input_feature_list = [each_data.feels_like, get_weather_value(each_data.main_weather),
                each_data.wind_speed, each_data.humidity, each_data.pressure,
                each_data.day_of_week, each_data.hourly];
            var day_of_week = each_data.day_of_week;
            const time = parseInt(Date.now());
            if(each_data.dt*1000 >= time) {
                const date = new Date(each_data.dt*1000);

                date_list.push(date);
                predict(value, input_feature_list).then(resultArray => {
                    hourly_predict_bikes.push(resultArray[0][1]);
                    hourly_predict_stands.push(resultArray[0][0]);
                    count += 1;
                    if(count >= 39){
                        var hour_data = google.visualization.arrayToDataTable([]);
                        hour_data.addColumn('string', 'hourly');
                        hour_data.addColumn('number', 'predict bikes');
                        for (var i = 0; i < count; i++) {
                              hour_data.addRow([date_list[i].getDate().toString()+'/'+
                              (date_list[i].getHours()-1).toString()+':00',
                              hourly_predict_bikes[i]]);
                        }
                        var options = {
                            chart: {
                                title: 'prediction by hourly',
                                subtitle: 'bikes and stands',
                            }
                        };

                        var chart = new google.charts.Bar(document.getElementById('graph-container2'));
                        chart.draw(hour_data, google.charts.Bar.convertOptions(options));
                    }
                });
            }
        });
    });
    predict_day_dropdown();
}

// create the options to dropdown
function predict_day_dropdown(){
    document.getElementById("predict_hour").innerHTML =
    "<option value='' disabled selected>-- Please Select The Day First--</option>";

    var time = new Date();
    var day = time.getDate();
    var month = time.getMonth();

    var day_option_output = "<option value='' disabled selected>-- Please Select The Day --</option>";
        for(var i=0; i< 5; i++){
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
    const dropdown_station = document.getElementById('station_select2');
    const dropdown_day = document.getElementById('predict_day');
    const dropdown_hour = document.getElementById('predict_hour');

    var station_value = dropdown_station.value;
    var day_value = dropdown_day.value;
    var hour_value = dropdown_hour.value;

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

            predict(station_value, input_feature_list).then(resultArray => {
                console.log('work');
                var table_content = "<tr>"
                  + "<th>Predict Stands: " + resultArray[0][0].toFixed(0) + '~'
                  + (resultArray[0][0]+1).toFixed(0) + "</th>"
                  + "<th>Predict Bikes: " + resultArray[0][1].toFixed(0) + '~'
                  + (resultArray[0][1]+1).toFixed(0) + "</th>"
                  +"</tr>";
                document.getElementById("predict_table").innerHTML = table_content;
            });
        });
    });
}
//*********************************************************test
function test(){
    var sites = [];

    fetch("/static_stations").then(response => {
        return response.json();
    }).then(data => {
        data.forEach(station => {
            sites.push(station.address)
        });
    });

    function autocomplete(inp, arr) {
        /*自动填充函数有两个参数，input 输入框元素和自动填充的数组*/
        var currentFocus;
        /* 监听 input 输入框，当在 input 输入框元素中时执行以下函数*/
        inp.addEventListener("input", function(e) {
            var a, b, i, val = this.value;
            /*关闭已打开的自动填充列表*/
             closeAllLists();
            if (!val)  return false;
        currentFocus = -1;
        /*创建 DIV 元素用于放置自动填充列表的值*/
        a = document.createElement("div");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*DIV 作为自动填充容器的子元素*/
        this.parentNode.appendChild(a);
        /*循环数组*/
        for (i = 0; i < arr.length; i++) {
        /*检查填充项是否有与文本字段值相同的内容，不区分大小写*/
            if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            /*为每个匹配元素创建一个 DIV 元素 */
            b = document.createElement("div");
            /*匹配项加粗*/
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            /*选中的填充项插入到隐藏 input 输入字段，用于保存当前选中值*/
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            /*当有人点击填充项（DIV 元素）时执行函数*/
            b.addEventListener("click", function(e) {
            /*选中的填充项插入到隐藏 input 搜索字段*/
            inp.value = this.getElementsByTagName("input")[0].value;

            closeAllLists();
          });
          a.appendChild(b);
        }
      }
    });
    /*按下键盘上的一个键时执行函数*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
        /*如果按下箭头向下键，currentFocus 变量加 1，即向下移动一位*/
        currentFocus++;
        /*使当前选中项更醒目*/
        addActive(x);
      } else if (e.keyCode == 38) { //up
        /*按下箭头向上键，选中列表项向上移动一位*/
        currentFocus--;
        /*使当前选中项更醒目*/
        addActive(x);
      } else if (e.keyCode == 13) {
        /*如果按下 ENTER 键，阻止提交，你也可以设置 submit 提交*/
        e.preventDefault();
        if (currentFocus > -1) {
          /*模拟点击选中项*/
          if (x) x[currentFocus].click();
        }
      }
    });
    function addActive(x) {
        /*设置选中的选项函数*/
        if (!x) return false;
        /*移动选项设置不同选中选项的背景颜色*/
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        /*添加 "autocomplete-active" 类*/
     x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
     /*移除没有选中选项的 "autocomplete-active" 类*/
    for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
        }
    }
    function closeAllLists(elmnt) {
        /*关闭自动添加列表*/
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    /*点击 HTML 文档任意位置关闭填充列表*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
        });
    }

    autocomplete(document.getElementById("myInput"), sites);
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
                    console.log('li')
                    document.getElementById("station_select").value = station.number;
                    display_station_info();
                    var element = document.getElementById('card_title_map');
                    element.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
                    input_right_flag = 0;
                    document.getElementById('myInput').value = "";
                    document.getElementById('myInput').placeholder = "Enter Station Name";
                }
            });
            if(input_right_flag == 1){
                document.getElementById('myInput').placeholder = "Please Enter Right Station Name";
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
    const debouncedSearch = debounce(test, 500);
    document.querySelector('#graph-container').addEventListener('input', event => {
        debouncedSearch(event.target.value);
    });
}


//*********************************************************test

function scroll_to_map() {
  var element = document.getElementById('card_title_map');
  element.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
}


//function get_location(){
//    if(navigator.geolocation) {
//        navigator.geolocation.getCurrentPosition(show_position, show_error);
//    } else {
//        console.log("Geolocation is not supported by this browser.");
//    }
//}
//
//function show_position(position) {
//    const userLat = position.coords.latitude;
//    const userLng = position.coords.longitude;
//    console.log("Latitude: " + userLat + ", Longitude: " + userLng);
//}
//
//function show_error(error) {
//    console.log("Error code: " + error.code + ", Message: " + error.message);
//}

