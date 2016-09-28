/**
	JavaScript file for my weather app 
	Author: RLaChance
*/


// Initial function calls
$(function(){
	updateTime();
	determineLocation();
});


/** 
	Void function that displays the date and time on the web page
*/
function updateTime(){
	var date = new Date();

	$('#theTime').append(date.toDateString() + ", " + formatTime(date.getHours(), date.getMinutes()));
}


/**
	Function that returns the time in 12hr format instead of 24
	@param hours - The value for hours in 24hr format from date object
	@param mins - The value for minutes from the date object
	@return - The time in a 12hr format, with am or pm as appropriate
*/
function formatTime(hours, mins){
	
	var amOrPm = 'am';

	if(hours >= 12){
		amOrPm = 'pm';
	}
	if(hours >= 13){
		hours = hours - 12;
	}
	if(mins <= 9){
		mins = '0' + mins;
	}

	return hours + ':' + mins + amOrPm;
}


/**
	Function to determine location if possible.  This is done by making use of the HTML Geo-location API
*/
function determineLocation(){

	var message = "Geo-location not supported!";

	if(navigator.geolocation){
		navigator.geolocation.getCurrentPosition(setLocation, determineError);
	}else{
		alert(message);
	}
}


/**
	Function that makes use of the error callback to alert the user that an error has occurred.
*/
function determineError(){
	alert("An error has occurred while determining your location! Try again later.");
}


/**
	Function that sets the location of the user with latitude and longitude values
	@param position - Location determined by Geo-location
*/
function setLocation(position) {
	var coords = position.coords;
	var userLat = coords.latitude.toFixed(2);
	var userLong = coords.longitude.toFixed(2);

	// Call to function to set weather
	getWeather(userLat, userLong);
}


/**
	Function that makes API call to open weather to get current details
	@param userLat - The latitude of the user's position as determined by Geo-location
	@param userLong - The longitude of the user's position as determined by Geo-location
*/
function getWeather(userLat, userLong){
	var dataRequest = new XMLHttpRequest();
	var key = "66d7c3f4ff53975e7a4086261c6dd8d6";
	var url = 
		"http://api.openweathermap.org/data/2.5/forecast?lat=" + userLat + "&lon=" +
		 userLong + "&units=imperial&APPID=" + key;


	dataRequest.onreadystatechange = function(){
		if(dataRequest.readyState === 4 && dataRequest.status === 200){
			var weatherData = JSON.parse(dataRequest.responseText);
			displayWeather(weatherData); // Call to function that displays the current weather
			displayExtendedWeather(weatherData); // Call to function that displays the extended forecast
		}
	}

	dataRequest.open("GET", url, true);
	dataRequest.send();
}


/**
	Function that updates the current weather details 
	@param curData - Object containing JSON weather details is passed in
*/
function displayWeather(currentData){
	$('#theLocation').text(currentData.city.name);
	$('#temp').prepend(Math.round(currentData.list[0].main.temp));
	$('#humidity').prepend(currentData.list[0].main.humidity);
	$('#condition').text(currentData.list[0].weather[0].main);
	$('#wind').prepend(Math.round(currentData.list[0].wind.speed));
	$('#direction').text(determineDirection(Math.round(currentData.list[0].wind.deg)));
	$('#curWeatherImg').attr('src', 'http://openweathermap.org/img/w/' + 
		currentData.list[0].weather[0].icon + '.png')
}


/**
	Function that loops through the weather data and pulls the basics of an extended forecast out.
	The weather icon used for the day's forecast is based upon the weather conditions at 12:00:00.  
	@param curData - The js/JSON object passed in which contains the weather data
*/
function displayExtendedWeather(currentData){

 	//var wedata = '';
	var day = 1;

  	for(var i = 0; i < currentData.list.length; i++){

  		var forcastTime = currentData.list[i].dt_txt.split(' ');
  	
  		if(forcastTime[1] === "12:00:00"){
  			$('#d' + day).text(alterDate(forcastTime[0]));
  			$('#day' + day + 'Img').attr('src','http://openweathermap.org/img/w/' +
  				currentData.list[i].weather[0].icon + '.png');
  			day = day + 1;
  		}
  	}
}


/**
	Function that returns a more directionally friendly direction, instead of degrees.
	The numeric value is replaced by letters N,E,S, or W (or a combination of them) to represent
	the direction in degrees. 
	@param dirDegrees - an int value that represents the direction of the wind in degrees
	@return A string that represents the wind direction in 1 or 2 chars 
*/
function determineDirection(directionInDegrees){
	var stringDegrees;

	if(directionInDegrees >= 337.5 || directionInDegrees <= 22.5)
		stringDegrees = "N";
	else if(directionInDegrees > 22.5 && directionInDegrees <= 67.5)
		stringDegrees = "NE";
	else if(directionInDegrees > 67.5 && directionInDegrees <= 112.5)
		stringDegrees = "E";
	else if(directionInDegrees > 112.5 && directionInDegrees <= 157.5)
		stringDegrees = "SE";
	else if(directionInDegrees > 157.5 && directionInDegrees <= 202.5)
		stringDegrees = "S";
	else if(directionInDegrees > 202.5 && directionInDegrees <= 247.5)
		stringDegrees = "SW";
	else if(directionInDegrees > 247.5 && directionInDegrees <= 292.5)
		stringDegrees = "W";
	else
		stringDegrees = "NW";

	return stringDegrees;
}


/**
	Function that edits the date to be in a month-date format.  Leaving the year off.
	@pre - The date is passed in the format of year-month-date
	@post - The date is returned in the format of month-date
	@param rawDate - The date passed in from the weather JSON
	@return - The date in a month-date format
*/
function alterDate(rawDate){
	var seperatedDate = rawDate.split('-');

	return seperatedDate[1] + '-' + seperatedDate[2];
}