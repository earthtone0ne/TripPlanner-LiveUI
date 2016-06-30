var fullstackAcademy = new google.maps.LatLng(40.705086, -74.009151);

var styleArr = [{
  featureType: 'landscape',
  stylers: [{ saturation: -100 }, { lightness: 60 }]
}, {
  featureType: 'road.local',
  stylers: [{ saturation: -100 }, { lightness: 40 }, { visibility: 'on' }]
}, {
  featureType: 'transit',
  stylers: [{ saturation: -100 }, { visibility: 'simplified' }]
}, {
  featureType: 'administrative.province',
  stylers: [{ visibility: 'off' }]
}, {
  featureType: 'water',
  stylers: [{ visibility: 'on' }, { lightness: 30 }]
}, {
  featureType: 'road.highway',
  elementType: 'geometry.fill',
  stylers: [{ color: '#ef8c25' }, { lightness: 40 }]
}, {
  featureType: 'road.highway',
  elementType: 'geometry.stroke',
  stylers: [{ visibility: 'off' }]
}, {
  featureType: 'poi.park',
  elementType: 'geometry.fill',
  stylers: [{ color: '#b6c54c' }, { lightness: 40 }, { saturation: -40 }]
}];

var iconURLs = {
    hotel: '/images/lodging_0star.png',
    restaurant: '/images/restaurant.png',
    activity: '/images/star-3.png'
};



function populateSelect (array,type){
    array.forEach(function (item) {
      $('#'+type+'-choices').append('<option>'+item.name+'</option>')
    });
}

var itineraryHtmlPart1 = '<div class="itinerary-item"><span class="title">';
var itineraryHtmlPart2 = '</span><button class="btn btn-xs btn-danger remove btn-circle">x</button></div>'

var markers = [];

$(document).ready(function() {
  var viewsArray = [];
  var markersArray = [];

  viewsArray[0] = $('#itinerary').children().clone();


  function drawMarker (type, coords) {
    var latLng = new google.maps.LatLng(coords[0], coords[1]);
    var iconURL = iconURLs[type];
    var marker = new google.maps.Marker({
      icon: iconURL,
      position: latLng
    });
    markers.push(marker); // keep so we can delete all?
    marker.setMap(currentMap);
    // console.log(markers[0].position.lat());
    // console.log(marker);
  }

  function removeMarker(coords) {
    // body...
  }

  var mapCanvas = document.getElementById('map-canvas');
  var currentMap = new google.maps.Map(mapCanvas, {
    center: fullstackAcademy,
    zoom: 13,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: styleArr
  });

  populateSelect(hotels,'hotel');
  populateSelect(activities,'activity');
  populateSelect(restaurants,'restaurant');
//yes, we know this isn't DRY:
  $('button.hotel').on('click', function() {
    var selectedHotel = $('#hotel-choices option:selected').val();
    $('ul.hotel').append(itineraryHtmlPart1 + selectedHotel + itineraryHtmlPart2);
    var coords;
    hotels.forEach(function (item) {
      if(item.name === selectedHotel) {
        coords = item.place.location;
        return;
      }
    });
    drawMarker('hotel', coords);
    var newMarker = {marker: markers[markers.length-1]};
    var buttonSelected = $('ul.hotel div:last-child button')[0];
    $(buttonSelected).data("marker", newMarker);
  });

  $('button.restaurant').on('click', function() {
    var selectedRestaurant = $('#restaurant-choices option:selected').val();
    $('ul.restaurant').append(itineraryHtmlPart1 + selectedRestaurant + itineraryHtmlPart2);
    var coords;
    restaurants.forEach(function (item) {
      if(item.name === selectedRestaurant) {
        coords = item.place.location;
        return;
      }
    });
    drawMarker('restaurant', coords);
    var newMarker = {marker: markers[markers.length-1]};
    var buttonSelected = $('ul.restaurant div:last-child button')[0];
    $(buttonSelected).data("marker", newMarker);
  });

   $('button.activity').on('click', function() {
    var selectedActivity = $('#activity-choices option:selected').val();
    $('ul.activity').append(itineraryHtmlPart1 + selectedActivity + itineraryHtmlPart2);
    var coords;
    activities.forEach(function (item) {
      if(item.name === selectedActivity) {
        coords = item.place.location;
        return;
      }
    });
    drawMarker('activity', coords);
    var newMarker = {marker: markers[markers.length-1]};
    var buttonSelected = $('ul.activity div:last-child button')[0];
    $(buttonSelected).data("marker", newMarker);
  });

  $('div#itinerary').on('click', 'button', function() {
    var name = $(this).prev().text();
    var marker = $(this).data()['marker'];
    marker.marker.setMap(null);
    console.log("I'm logging", marker);
    $(this).parent().remove();
  });

  // $('#day-add').on('click', function() {
  //   // $('.current-day').removeClass('current-day');

  // });



  function switchDay(day, self) {
    var currentDay = $('.current-day').first().text();
    viewsArray[currentDay] = $('#itinerary').children().clone();
    markersArray[currentDay]= getMarkers();
    setMapOnMarkers(markersArray[currentDay], null);
    $('#itinerary').empty();
    if (viewsArray[day]) {
      $('#itinerary').append(viewsArray[day]);
      setMapOnMarkers(markersArray[day],currentMap);
    } else {
      $('#itinerary').append(viewsArray[0]);
    }
    $('.current-day').removeClass('current-day');
    $(self).addClass('current-day');
    $('#day-title span').text($('.current-day').text());
  }

  function addDay() {
    var current = $('.current-day').first();
    var currentDay= current.text();
    viewsArray[currentDay] = $('#itinerary').children().clone();
    var buttons = $('.day-btn');
    $('<button class="btn btn-circle day-btn current-day">' + buttons.length + '</button>').insertBefore('#day-add');
    $('#day-title span').text($('.current-day').text());
    $('#itinerary').empty();
    $('#itinerary').append(viewsArray[0]);
    $(current).removeClass('current-day');
  }

  function getMarkers(){
    var buttons = $('#itinerary button').get();
    console.log(buttons);
    var markersArr = buttons.map(function(button) {
      console.log($(button).data());
      return $(button).data().marker.marker;
    })
    return markersArr;
  }

  function setMapOnMarkers(array, map){
    array.forEach(function (marker) {
      marker.setMap(map);
    })
  }

  $('.day-buttons').on('click', 'button', function() {

    if($(this).text() == '+')  {
      addDay();
    }
    else {
      switchDay($(this).text(), this)
    }
  });

  $('#day-title button').on('click', function() {

  });




});






