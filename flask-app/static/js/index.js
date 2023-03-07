// Initialize and add the map
function initMap() {

    const dublin = { lat: 53.350140, lng: -6.266155 };
    // The map, centered at Dublin
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 12,
      center: dublin,
    });

    // const marker = new google.maps.Marker({
    // position: dublin,
    // map: map,
    // });

  getStations();

  }
    
var map = null;
window.initMap = initMap;


function addMarkers(stations){
  stations.forEach(station => {
    var marker = new google.maps.Marker({
    position: {
    lat: station.position_lat,
    lng: station.position_lng,
    },
    map: map,
    title: station.name,
    station_number: station.number,
    });
  });
}

function getStations(){
  fetch("/stations")
  .then((response) => response.json())
  .then((data) =>{
    console.log("fetch response", typeof data);
    addMarkers(data);
  });

}




  