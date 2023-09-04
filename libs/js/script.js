//Preloader
$(window).on('load', function () {
    if ($('#preloader').length) {
        $('#preloader').delay(1000).fadeOut('slow',function () {
            $(this).remove();
        });
    }
});

//Initialize map
var map = L.map('map', { drawControl: true }).fitWorld().zoomIn();

var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
osm.addTo(map);

var googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3'],
    attribution: '&copy; <a href="https://www.google.com/intl/en-GB_ALL/permissions/geoguidelines/">ThanksToGoogleMap</a> contributors'
});

var baseMaps = {
    "OSM" : osm,
    "Satellite": googleSat
};

var controlLayersAdded = false;

//Get json data and append them to select.
$.ajax ( {
    url: "libs/php/GetAllCountriesNames.php",
    dataType: "json",
    success: function (data) {
        console.log(data);
        var geoData = data;
        var geoDataSort = geoData.sort(function(a, b) {
            var textA = a.name.toUpperCase();
            var textB = b.name.toUpperCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
        var select = $("#selectMenu")
        $(geoDataSort).each(function() {
            select.append($("<option>").attr('value',this.iso_a2).text(this.name));
           });
           navigator.geolocation.getCurrentPosition(success, error, options);

    }
} );

//Set user's country on map
map.locate({setView: true, maxZoom: 16});

var options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  };
    function success(pos) {
    var crd = pos.coords;

    $.ajax({
        url: "libs/php/getCountryInfo.php",
        type: 'POST',
        data: {
            lat: crd.latitude,
            lng: crd.longitude
        },
        success: function(result) {

            if (result.status.name == "ok") {

                var countryCode = result['data'];
                $("select").val(countryCode).change();
                
            }
        
        },
        error: function(textStatus) {
            console.log(textStatus);
        }
    }); 
    }

    function error(err) {
        
            if($("#selectMenu").prop("selectedIndex", 1).val() != ""){
                var iso_a2 = $("#selectMenu").prop("selectedIndex", 1).val();
                $("select").val(iso_a2).change();

            }   

    }






var infoButton = L.easyButton({
    states: [
      {
        icon: 'fa-solid fa-info',
        title: 'Info',
        onClick: function () {
          if ($("#selectMenu option:selected").text() != "Select Country") {
            $('#infoModal').modal('show');
          } else {
            alert("Please Select A country");
          }
        },
      },
    ],

  });
  
  // Add the custom button to the map
  infoButton.addTo(map);

L.easyButton('fa-solid fa-cloud', function(btn, map){
    if($( "#selectMenu option:selected" ).text() !="Select Country") $('#weatherModal').modal('show');
    else alert("Please Select A country");
}).addTo(map);

L.easyButton('fa-solid fa-coins', function(btn, map){
    if($( "#selectMenu option:selected" ).text() !="Select Country") $('#currencyModal').modal('show');
    else alert("Please Select A country");
}).addTo(map);

L.easyButton('fa-solid fa-newspaper', function(btn, map){
    if($( "#selectMenu option:selected" ).text() !="Select Country") $('#NewsModal').modal('show');
    else alert("Please Select A country");
}).addTo(map);


//Get the selected country and make a PHP call to get the polygon data
$('select').on('change', function() {
   
    var iso_a2= $(this).val();
    
    //Remove the previous flag class from the modal dialog.
    $("#flags").removeClass();

    $.ajax({
        url: "libs/php/GetSelectedPolygon.php",
        type: 'POST',
        data: {iso_a2: iso_a2},
        success: function(result) {
           
            if(result !==null && result !== ""){
                map.eachLayer(function(layer){if(!!layer.toGeoJSON) map.removeLayer(layer);});
                var polygonCor = jQuery.parseJSON(result);

                var myStyle = {
                    "color": "#E97451",
                    "weight": 4,
                    "opacity": 0.65
                };  
                
                var geoJSON = L.geoJson(polygonCor, {style: myStyle}).addTo(map)
                
                
                map.fitBounds(geoJSON.getBounds());  
               
                var center = geoJSON.getBounds().getCenter();


                //Assign data to the modal dialog
                //Get country, capital, population data and flag.
                $.ajax({
                    url: "libs/php/getGeoNamesCountryInfo.php",
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        country: iso_a2,
                        lang: "eng"
                    },
                    success: function(result) {
        
                        //console.log(JSON.stringify(result));
        
                        if (result.status.name == "ok") {
                            
                            function numberWithCommas(x) {
                                return x.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                            }
        
                            //console.log(result);   
                            if(result['data'][0]['countryName']) var modalCountry = result['data'][0]['countryName'];
                            else var modalCountry = "N/A";

                            if(result['data'][0]['capital']) var modalCapital = result['data'][0]['capital'];
                            else var modalCapital = "N/A";

                            if(result['data'][0]['population']) {
                                var modalPopulation = result['data'][0]['population'];
                                var infoPopulation = numberWithCommas(modalPopulation);                               
                            }
                            else var modalPopulation = "N/A";
                            
                            
                            $('#flags').addClass( "flag flag-" + iso_a2.toLowerCase());

                            $('#infoCapital').html(modalCapital); 
                            $('#infoPopulation').html(infoPopulation);    
                            
                            
                            $('#cityName').html(modalCountry);
                            $('#NewsModalLabel').html(modalCountry + "'s News");

                            var continentName = result['data'][0]['continentName'] ?  result['data'][0]['continentName'] : "N/A";
                            $('#infoTitle').html(modalCountry + ", " + continentName);
                           
                            var areaInSqKm  =  result['data'][0]['areaInSqKm'] ?  result['data'][0]['areaInSqKm'] : "N/A";
                           
                            $('#infoArea').html(areaInSqKm + " km&#178;");
                            
                            var wikiCountry = modalCountry.replace(/\s+/g, '%20')
                            
                            $.ajax({
                                url: "libs/php/GetWikipediaLink.php",
                                type: 'POST',
                                dataType: 'json',
                                data: {
                                    q: wikiCountry
                                    
                                },
                                success: function(result) {
                    
                                    if (result.status.name == "ok") {
                                        //console.log(result);
                                        var wikipediaLink1 = result['data'][0].wikipediaUrl ? result['data'][0].wikipediaUrl : "N/A";
                                        var wikipediaLink1Title = result['data'][0].title ? result['data'][0].title : "N/A";
                                        var wikipediaLink1Image = result['data'][0].thumbnailImg ? result['data'][0].thumbnailImg : wikipediaLink1Title;
                                                  
                                        var wikipediaLink2 = result['data'][1].wikipediaUrl ? result['data'][1].wikipediaUrl : "N/A"
                                        var wikipediaLink2Title = result['data'][1].title ? result['data'][1].title : "N/A";
                                        var wikipediaLink2Image = result['data'][1].thumbnailImg ? result['data'][1].thumbnailImg : wikipediaLink2Title;
                                                    
                                        $("#modalwikipediaLink1").attr("href", "http://" + wikipediaLink1);
                                        $("#modalwikipediaLink2").attr("href", "http://" + wikipediaLink2);
                                                  
                                        $("#modalwikipediaImage1").attr("src", wikipediaLink1Image);
                                        $("#modalwikipediaImage2").attr("src", wikipediaLink2Image);
                                       
            
                                        $("#modalwikipediaImage1").attr("alt", wikipediaLink1Title);
                                        $("#modalwikipediaImage2").attr("alt", wikipediaLink2Title);
                                            
                                    }
                                
                                },
                                error: function(textStatus, errorThrown) {
                                   
                                    console.log(textStatus + errorThrown);
                                }
                            }); 

                           
                            $.ajax({
                                url: "libs/php/GetNews.php",
                                type: 'POST',
                                dataType: 'json',
                                data: {
                                    q: wikiCountry
                                },
                                success: function(result) {
                                    var formatDate = function(date){
                                        var today = new Date(date);
                                            var dd = String(today.getDate()).padStart(2, '0');
                                            var mm = String(today.getMonth() + 1).padStart(2, '0'); 
                                            var yyyy = today.getFullYear();

                                            today = mm + '/' + dd + '/' + yyyy;
                                            return today;
                                    }

                                    if (result.status.name == "ok") {
                                        //console.log(result);
                                        $('#newsModalTableAll tbody').empty();
                                        for(var i=0; i<result['data'].length; i++){
                                            var article = result['data'][i];
                                            $('#newsModalTable').append( '<tr><td colspan="2" id="dataPublisherNews">' + formatDate(article.publishedAt) + " &#183; " + article.source.name + '</td></tr><tr><td>'+ article.title + '</br><a id="articleLink" href="' + article.url + '" target="_blank">Click For More</a></td><td rowspan="2"><img src="' + article.urlToImage + '"height="50px" width="70px"/></td></tr>' );    
                                        }
                                        
                                                       
                                    }
                                
                                },
                                error: function(jqXHR, textStatus, errorThrown) {
                                    
                                    console.log(textStatus + errorThrown);
                                }
                            }); 

                        }
                    
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.log(errorThrown);
                        
                    }
                }); 

                var latlng = center.lat + "," + center.lng;

                //Get currency and timezone data
                $.ajax({
                    url: "libs/php/GetOpenCageData.php",
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        latlng: latlng
                    },
                    success: function(result) {
            
                        //console.log(result);
                        var openCageData = result['data'][0];

                        if (result.status.name == "ok") {
                            //console.log(result);
                            if(result['data'][0].annotations.currency.iso_code) var currencyISOcode = result['data'][0].annotations.currency.iso_code;
                            else var currencyISOcode = "";

                            if(result['data'][0].annotations.currency.name) var modalCurrency = result['data'][0].annotations.currency.name;
                            else var modalCurrency = "N/A";

                            if(result['data'][0].annotations.currency.symbol) var modalSymbol = result['data'][0].annotations.currency.symbol;
                            else var modalSymbol = "N/A";

                            $('#currencyCurrent').html(modalCurrency + " (" + modalSymbol + ")");
                            
                            if(result['data'][0].annotations.timezone.name) var modalTimezone = result['data'][0].annotations.timezone.name;
                            else var modalTimezone = "N/A";

                            if(result['data'][0].annotations.timezone.offset_string) var modalTimezoneOffset = result['data'][0].annotations.timezone.offset_string;
                            else var modalTimezoneOffset = "N/A";

                            $('#infoTimeZone').html(modalTimezone + " (GMT" + modalTimezoneOffset + ")");   

                            //Get exchange rate data with USD base
                            $.ajax({
                                url: "libs/php/GetExchangeRates.php",
                                type: 'POST',
                                dataType: 'json',
            
                                success: function(result) {                    
                                    if (result.status.name == "ok") {
                                        //console.log(result);

                                        
                                        if(result['data']){
                                            var exchangeRatesUSDbased = result['data'];
                                            $('#allCurrenciesTableAll tbody').empty();
                                            for (var key in exchangeRatesUSDbased) {
                                              
                                                if((key == currencyISOcode) && (currencyISOcode!="USD"))  $('#currencyUSDExchange').html("1 USD = " + exchangeRatesUSDbased[key] + " " + key); 
                                                else if(currencyISOcode == "USD") $('#currencyUSDExchange').html("The base for the exchange rate is USD");
                                                else if(currencyISOcode == "")$('#currencyUSDExchange').html("N/A");
                                                //var symbol = getCurrencySymbol("en-US", key) ?  getCurrencySymbol("en-US", key) : "";
                                                $('#allCurrenciesTable').append( '<tr><td>' + key  + '</td> <td>' + exchangeRatesUSDbased[key] + '</td></tr>' );
                                            } 

                                            
                                        }
                                    }                                
                                },
                                error: function(jqXHR, textStatus, errorThrown) {
                                    // your error code
                                }
                            });
                            
                                                                                        
                        }
                    
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.log(textStatus + errorThrown);
                    }
                });  
                
                

                //Get weather forecast for the next 5 days every 3 hours
                $.ajax({
                    url: "libs/php/GetOpenWeatherDataForecast.php",
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        lat: center.lat,
                        lon: center.lng
                    },
                    success: function(result) {
        
                        //console.log(JSON.stringify(result));
        
                        if (result.status.name == "ok") {                        

                            $("#main-icon").removeClass();
                            $("forecast-day-1-icon").removeClass();
                            $("#forecast-day-2-icon").removeClass();
                            $("#forecast-day-3-icon").removeClass();
                            $("#forecast-day-4-icon").removeClass();

                            var weatherIconsMap = {
                                "01d": "wi wi-day-sunny",
                                "01n": "wi wi-night-clear",
                                "02d": "wi wi-day-cloudy",
                                "02n": "wi wi-night-cloudy",
                                "03d": "wi wi-cloud",
                                "03n": "wi wi-cloud",
                                "04d": "wi wi-cloudy",
                                "04n": "wi wi-cloudy",
                                "09d": "wi wi-showers",
                                "09n": "wi wi-showers",
                                "10d": "wi wi-day-hail",
                                "10n": "wi wi-night-hail",
                                "11d": "wi wi-thunderstorm",
                                "11n": "wi wi-thunderstorm",
                                "13d": "wi wi-snow",
                                "13n": "wi wi-snow",
                                "50d": "wi wi-fog",
                                "50n": "wi wi-fog"
                              };
                            updateForecast(result);                                                                           
                          
                            //console.log(result);

                            function updateForecast(result){                   
                                //Present day
                                var today = result['data'][0];
                                $("#tempDescription").text(toCamelCase(today.weather[0].description));
                                $("#humidity").text(today.main.humidity);
                                $("#wind").text(today.wind.speed);
                                $("#localDate").text(getFormattedDate(today.dt));
                                $("#main-icon").addClass(weatherIconsMap[today.weather[0].icon]);
                                $("#mainTemperature").text(Math.round(today.main.temp));
                                $("#mainTempHot").text(Math.round(today.main.feels_like) + "°C");
                                $("#mainTempLow").text(Math.round(today.main.temp_min) + "°C");


                                //Following days data
                                var weatherForecast = result['data'];
                                var modalDays = 1;
                                var currentDate = new Date();
                                for(var i=0; i<weatherForecast.length; i++){       
                                    
                                    
                                    var forecastDate = new Date(weatherForecast[i].dt_txt) ? new Date(weatherForecast[i].dt_txt) : "";
                                   
                                    if((weatherForecast[i].main.temp) && (currentDate.getTime() < forecastDate.getTime()) && forecastDate.getHours() == 12) {
                                        currentDate = forecastDate;
                                        var day = weatherForecast[i];
                                        var dayName = getFormattedDate(day.dt).substring(0,3);
                                        var weatherIcon = weatherIconsMap[day.weather[0].icon];

                                        $("#forecast-day-" + modalDays + "-name").text(dayName);
                                        $("#forecast-day-" + modalDays + "-icon").addClass(weatherIcon);
                                        $("#forecast-day-" + modalDays + "-main").text(Math.round(day.main.temp));
                                        $("#forecast-day-" + modalDays + "-ht").text(Math.round(day.main.temp_max) + "°C");
                                        $("#forecast-day-" + modalDays + "-lt").text(Math.round(day.main.temp_min) + "°C");                                        
                                        modalDays ++;        
                                    } 
                                   
                                }
                            }

                           
                            function getFormattedDate(date){
                                var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                                return new Date(date * 1000).toLocaleDateString("en-US",options);
                            }

                            
                            function toCamelCase(str) {
                                var arr = str.split(" ").map(
                                function(sentence){
                                    return sentence.charAt(0).toUpperCase() + sentence.substring(1);
                                }
                                );
                                return arr.join(" ");
                            }
        
                        }
                    
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        
                        console.log(textStatus + errorThrown);
                    }
                });


                
                //debugger;
                var citiesMarkers = L.markerClusterGroup({
                    polygonOptions: { 
                        color: "#e35930",
                        weight: 2,
                        opacity: 0.65 
                    },
                    animateAddingMarkers : true
                });
                var isoForTriposo = iso_a2;
                if(iso_a2 == "GB") isoForTriposo = "UK";
                $.ajax({
                    url: "libs/php/GetTriposoCityInfo.php",
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        countrycode: isoForTriposo
                    },
                    success: function(result) {

                        if (result.status.name == "ok") {
                            //console.log(result);
                            //debugger;
                           

                              var cityMarkerIcon = L.ExtraMarkers.icon({
                                icon: 'fa-solid fa-city',
                                markerColor: 'yellow',
                                shape: 'square',
                                prefix: 'fa'
                              });

                            
                            for(var i=0; i<result['data'].length; i++){
                                var city = result['data'][i];
                                
                                var cityMarkerLocation = new L.LatLng(city.coordinates.latitude, city.coordinates.longitude);
                                var cityMarker = new L.Marker(cityMarkerLocation, {icon: cityMarkerIcon}).bindPopup("<b>" + city.name  + "</b>" + "<br>" + city.snippet);
                                
                                citiesMarkers.addLayer(cityMarker);
                                   
                            }
                            map.addLayer(citiesMarkers);                            
                                           
                        }
                    
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        
                        console.log(textStatus + errorThrown);
                    }
                }); 

                $.ajax({
                    url: "libs/php/GetTriposoParksInfo.php",
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        countrycode: isoForTriposo
                    },
                    success: function(result) {

                        if (result.status.name == "ok") {
                            console.log(result);
                            //debugger;                          

                              var parkMarkerIcon = L.ExtraMarkers.icon({
                                icon: 'fa-solid fa-tree',
                                markerColor: 'green',
                                shape: 'square',
                                prefix: 'fa'
                              });


                            for(var i=0; i<result['data'].length; i++){
                                var park = result['data'][i];
                                
                                var parkMarkerLocation = new L.LatLng(park.coordinates.latitude, park.coordinates.longitude);
                                var parkMarker = new L.Marker(parkMarkerLocation, {icon: parkMarkerIcon}).bindPopup("<b>" + park.name  + "</b>" + "<br>" + park.snippet);
                                citiesMarkers.addLayer(parkMarker); 
                                   
                            }

                            map.addLayer(citiesMarkers);                           
                                           
                        }
                    
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        
                        console.log(textStatus + errorThrown);
                    }
                }); 
                var overlayMaps = {
                    "Country Data": citiesMarkers
                };
                debugger;
                var addControlLayers = (function () {
                    var controlLayers;
                
                    return function () {
                        if (!controlLayersAdded) {
                            controlLayers = L.control.layers(baseMaps).addTo(map);
                            controlLayersAdded = true; // Set to true after adding control layers
                        }
                    };
                })();
                
                // Call the function to add control layers when needed
                addControlLayers();
                                

                                
            }          
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus);
        }
    });    
    
})

