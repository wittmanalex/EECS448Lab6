const app = new Vue({
    el: '#app',
    data: {
    stops: [],
    numStops: 10,
    },
    computed: {
      filteredStops: function(){
        this.stops.sort((t1,t2) => t1.distance < t2.distance ? -1 : 1);
        return this.stops.slice(0, this.numStops);
      }
    }
})

fetch('https://utils.pauliankline.com/stops.json')
  .then(function(response) {
  return response.json();
  })
  .then(function(myJson) {
    for(let i = 0; i < myJson.length; i++)
    {
        myJson[i].distance = "Calculating...";
    }   
    app.stops = myJson;
});

Vue.component("BusCard", {
  template: "<div class=\"card\"> " + 
              "<div class=\"card-body\">" +
                "<h5 class=\"card-title\">{{title}}</h5>" +
                "<p class=\"card-text\">" + 
                  "{{text}}<br>" +
                  "Distance: {{distance}} km" +
                "</p>" +
              "</div>" +
            "</div>",
  props: ['title', 'text', 'distance']
})

let watchID = navigator.geolocation.watchPosition(function(position) {
  calcDistance(position);
});

function calcDistance(position)
{
  let Lat = position.coords.latitude;
  let Lon = position.coords.longitude;

  console.log(Lat, Lon);

  for(let i = 0; i < app.stops.length; i++)
  {
    let StopLat = app.stops[i].lat;
    let StopLon = app.stops[i].lon;
    
    //Distance algorithm from https://www.movable-type.co.uk/scripts/latlong.html

    let R = 6371000; // metres
    let φ1 = Lat.toRadians();
    let φ2 = StopLat.toRadians();
    let Δφ = (StopLat - Lat).toRadians();
    let Δλ = (StopLon - Lon).toRadians();

    let a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    let d = R * c / 1000;

    app.stops[i].distance = Math.round(d * 100) / 100;
  }
}

if (typeof(Number.prototype.toRad) === "undefined") {
  Number.prototype.toRadians = function() {
    return this * Math.PI / 180;
  }
}