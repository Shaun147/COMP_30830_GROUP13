

google.charts.load('current', {'packages':['bar']});

function getDayOfWeek(time) {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const date = new Date(time);
  const dayOfWeek = date.getDay();
  return daysOfWeek[dayOfWeek];
}

function statisData(data){
    const availabilityByDayOfWeek = {
        "Sunday": { "totalAvailableBikeStands": 0, "totalAvailableBikes": 0, "count": 0 },
        "Monday": { "totalAvailableBikeStands": 0, "totalAvailableBikes": 0, "count": 0 },
        "Tuesday": { "totalAvailableBikeStands": 0, "totalAvailableBikes": 0, "count": 0 },
        "Wednesday": { "totalAvailableBikeStands": 0, "totalAvailableBikes": 0, "count": 0 },
        "Thursday": { "totalAvailableBikeStands": 0, "totalAvailableBikes": 0, "count": 0 },
        "Friday": { "totalAvailableBikeStands": 0, "totalAvailableBikes": 0, "count": 0 },
        "Saturday": { "totalAvailableBikeStands": 0, "totalAvailableBikes": 0, "count": 0 }
    };
    const averageAvailabilityByDayOfWeek = {
        "Sunday": { "averageAvailableBikeStands": 0, "averageAvailableBikes": 0 },
        "Monday": { "averageAvailableBikeStands": 0, "averageAvailableBikes": 0 },
        "Tuesday": { "averageAvailableBikeStands": 0, "averageAvailableBikes": 0 },
        "Wednesday": { "averageAvailableBikeStands": 0, "averageAvailableBikes": 0 },
        "Thursday": { "averageAvailableBikeStands": 0, "averageAvailableBikes": 0 },
        "Friday": { "averageAvailableBikeStands": 0, "averageAvailableBikes": 0 },
        "Saturday": { "averageAvailableBikeStands": 0, "averageAvailableBikes": 0 }
      };

    data.forEach(station => {
        const date = new Date(station.last_update);
        const dayOfWeek = date.toLocaleString('en-us', { weekday: 'long' });
        availabilityByDayOfWeek[dayOfWeek]["totalAvailableBikeStands"] += station.available_bike_stands;
        availabilityByDayOfWeek[dayOfWeek]["totalAvailableBikes"] += station.available_bikes;
        availabilityByDayOfWeek[dayOfWeek]["count"]++;
    });

    for (const dayOfWeek in availabilityByDayOfWeek) {

        averageAvailabilityByDayOfWeek[dayOfWeek]["averageAvailableBikeStands"] =
        availabilityByDayOfWeek[dayOfWeek]["totalAvailableBikeStands"] /
        availabilityByDayOfWeek[dayOfWeek]["count"];

        averageAvailabilityByDayOfWeek[dayOfWeek]["averageAvailableBikes"] =
        availabilityByDayOfWeek[dayOfWeek]["totalAvailableBikes"] /
        availabilityByDayOfWeek[dayOfWeek]["count"];
    };
    return averageAvailabilityByDayOfWeek;
}
function draw_graph(data_dic){
    var data = google.visualization.arrayToDataTable([
      ['day Of Week', 'bikes', 'stands'],
      ['Mon', data_dic['Monday']['averageAvailableBikes'],
      data_dic['Monday']['averageAvailableBikeStands']],
      ['Tues', data_dic['Tuesday']['averageAvailableBikes'],
      data_dic['Tuesday']['averageAvailableBikeStands']],
      ['Wed', data_dic['Wednesday']['averageAvailableBikes'],
      data_dic['Wednesday']['averageAvailableBikeStands']],
      ['Thu', data_dic['Thursday']['averageAvailableBikes'],
      data_dic['Thursday']['averageAvailableBikeStands']],
      ['Fri', data_dic['Friday']['averageAvailableBikes'],
      data_dic['Friday']['averageAvailableBikeStands']],
      ['Sat', data_dic['Saturday']['averageAvailableBikes'],
      data_dic['Saturday']['averageAvailableBikeStands']],
      ['Sun', data_dic['Sunday']['averageAvailableBikes'],
      data_dic['Sunday']['averageAvailableBikeStands']],
    ]);

    var options = {
      chart: {
        title: 'the average of all stands',
        subtitle: 'bikes and stands',
      }
    };

    var chart = new google.charts.Bar(document.getElementById('graph-container'));
    chart.draw(data, options);
}

function click_button()
    const buttonWeek = document.querySelector('#graph-button');
    const container = document.querySelector('#graph-container');
    buttonWeek.addEventListener('click', function() {
        fetch("/all_availability_data").then( response => {
            return response.json();
        }).then(data => {
            averageAllStationByDayOfWeek = statisData(data);
            draw_graph(averageAllStationByDayOfWeek);
        });
    });

