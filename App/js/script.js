// Raw Javascript Variables
var vid = document.getElementById("parallax-vid");
var transportOutput = document.getElementById("transport-info");
var costOutput = document.getElementById("cost-info");
var caloriesOutput = document.getElementById("calories-info");

// Fuel cost per litre
var fuelCost = 1.859;

// Calories burnt per kilometre.
var calories = 32.5;

// Setting all global variables up here
var map, userMarker, directionsDisplay, distanceFromOrigin, recommendedTransport, travelCost, dailyCost, days, litrePerHundred, popupBox, locateOrigin;

// Object containing the information about vehicles and cost. That way, future developer can
// update the existing costs.
var drivingOptions = [
	{
		vehicle: "Motorbike",
		costPerDay: 109,
		litrePerHundredKm: 3.7
	},
	{
		vehicle: "Small Car",
		costPerDay: 129,
		litrePerHundredKm: 8.5
	},
	{
		vehicle: "Large Car",
		costPerDay: 144,
		litrePerHundredKm: 9.7
	},
	{
		vehicle: "Motor Home",
		costPerDay: 129,
		litrePerHundredKm: 17
	}
];

 // All the scripts are loaded once the whole document is ready.
$(document).ready(function(){
	// jQuery Variables
	var inputContainer = $("#input-form");
	var increase = $(".up");
	var decrease = $(".down");
	var selectedTransport, error, people;
	var firstLoad = true;

	// Playing the video once things are fully loaded
	vid.play();

	// Setting page reload for TNZ Logo on click
	$("#home-reload").click(function(){
		location.reload();
	});

	// Fade out the Tutorial Swiper once clicked
	$("#fade-intro").click(function(){
		$("#intro-container").fadeOut(300);
		$("#nav-container").delay(300).fadeIn(300);
		toggleForm(300);
	});

	// Hide the splash stage and fade in the nav with the
	// input form.
	$("#start").click(function(){
		$("#splash").fadeOut(300);
		$("#video-container").fadeOut(300);
		$("#intro-container").fadeIn(300);
		initialiseIntro();
	});

	// Show Form Function
	function toggleForm(delayMe){
		var icon = $("#menu-link");
		var mapStageContainer = $("#map-stage");
		var openCloseIcon = $("#menu-link")[0].classList[1];

		 if(openCloseIcon === "fa-th-list"){
		 	icon.removeClass("fa-th-list");
		 	icon.addClass("fa-map-signs");
		 	mapStageContainer.fadeOut(300);
		 } else if (openCloseIcon === "fa-map-signs"){
		 	icon.addClass("fa-th-list");
		 	icon.removeClass("fa-map-signs");
		 	mapStageContainer.fadeIn(300);
		 }

		inputContainer.delay(delayMe).fadeToggle(300);
	}

	// Toggle the menu through clicking on the menu icon
	$("#menu-link").click(function(){
		toggleForm(0);
	});

	// Plus and Minus button function
	increase.click(function(){
		var integerValue = this.parentNode;
		var inputField = this.parentNode;
		var maxValue = Number(integerValue.childNodes[12].max);

		integerValue = integerValue.childNodes[12];
		integerValue = Number(integerValue.value);

		if(integerValue === maxValue){
			return;
		} else if(integerValue < maxValue){
			inputField.childNodes[12].value = integerValue + 1;
		}
	});

	decrease.click(function(){
		var integerValue = this.parentNode;
		var inputField = this.parentNode;
		var minValue = Number(integerValue.childNodes[12].min);

		integerValue = integerValue.childNodes[12];
		integerValue = Number(integerValue.value);
		
		if(integerValue === minValue){
			return;
		} else if(integerValue > minValue){
			inputField.childNodes[12].value = integerValue - 1;
		}
	});

	// Form Validation
	$("#submit").click(function(event){
		people = $("#people").val();
		days = $("#days").val();
		selectedTransport = $("#transport").val();

		event.preventDefault();
		var peopleInfo = validateInput(people, error, 1, 6);
		var daysInfo = validateInput(days, error, 1, 15);

		if(peopleInfo[0] == true && daysInfo[0] == true){

			// This will run calculations related to the driving selection.
			if (selectedTransport === "DRIVING"){
				runCalculations(peopleInfo[1], daysInfo[1]);
			} else if(selectedTransport === "WALKING" || selectedTransport === "BICYCLING"){
				calculateCalories(selectedTransport);
			}

			$("#map").fadeIn(300);
			toggleForm();
		}
	});

	// Close Route Prompter
	$("#close-prompt").click(function(){
		// if(firstLoad === true){
		firstLoad = false;
		initialiseMap();
			// }
		$("#prompt-route").fadeOut(300);
	});

	// Slider Slide Up and Down Function
	$("#chevron-toggle").click(function(){
		var icon = $("#chevron-toggle")[0].classList[1];
		var openCloseIcon = $("#chevron-toggle");
		
		if(icon === "fa-times"){
			openCloseIcon.removeClass("fa-times");
			openCloseIcon.addClass("fa-chevron-up");
			openCloseIcon.css("color", "#FFF");
		} else if(icon === "fa-chevron-up"){
			openCloseIcon.addClass("fa-times");
			openCloseIcon.removeClass("fa-chevron-up");
		}

		$("#slider-info").slideToggle(300);
	});
});

// Running the needed swiper variable with parameters in order for the intro to work
function initialiseIntro(){
	var swiper = new Swiper('.swiper-container', {
	    pagination: '.swiper-pagination',
	    paginationType: 'progress',
		direction: 'vertical'
	});
}

// Initialising the Google Map
function initialiseMap(){
	// Setting the position of the map as well as the default interactivity
	var defaultOptions = {
		// Map center position is the a view of New Zealand
		center: {
			lat:-41.2165668,
			lng:172.6385759
		},
		// Zoom should be 10
		zoom:5,
		disableDefaultUI:true,
		scrollwheel:true,
		draggable:true,
		fullScreenControl:true,
		keybosrdShortcuts:false,
		mapTypeControlOptions: {
			position:google.maps.ControlPosition.TOP_CENTER
		}
	};

	map = new google.maps.Map(document.getElementById("map"), defaultOptions);
	findMe();
	runMap();
	injectAttractions();

	// This event listener calls addMarker() when the map is clicked.
    google.maps.event.addListener(map, 'click', function(event) {
      addMarker(event.latLng, map);
    });
}

// Line to load all the information written in the init function.
function runMap(){
	google.maps.event.addDomListener(window, "load", initialiseMap);
}

// Showing all markers using ajax and external json files
function injectAttractions(){
	$.ajax({
		url: "js/attractions.json",
		dataType: 'json',
		success: function(DataFromJSON){
			for (var i = 0; i < DataFromJSON.length; i++) {
				var marker = new google.maps.Marker({
					position: {
						lat: DataFromJSON[i].lat,
						lng: DataFromJSON[i].lng
					},
					map: map,
					animation:google.maps.Animation.DROP,
					title:DataFromJSON[i].title,
					description:DataFromJSON[i].description,
					icon: "images/binoculars-icon.png"
				});

				// Adding event listener to function
				popup(marker);
			}
		},	
		error: function(){
			console.log("Something went wrong!");
		}
	});
}

// Information is being displayed using this function about each marker.
function popup(marker){
	if(popupBox){
		popupBox.close();
	}

	popupBox = new google.maps.InfoWindow();
	google.maps.event.addListener(marker, "click", function(){
		popupBox.setContent("<div id='title'><p><strong>"+marker.title+"</strong></p></div>"+
							"<div id='description'><i>"+marker.description+"</i></div>");
		popupBox.open(map,marker);
	});
	return;
}

// Locate the user
function findMe(){
	if(navigator.geolocation){
		navigator.geolocation.getCurrentPosition(function(position){
			locateOrigin = new google.maps.Marker({
				position:{
					lat: position.coords.latitude,
					lng: position.coords.longitude
				},
				map:map
			});
			map.panTo(locateOrigin.position);
		});
	}
}

// Adds a marker to the map.
function addMarker(location, map) {
	if (userMarker){
		userMarker.setMap(null);
	}

	userMarker = new google.maps.Marker({
		position: location,
		map: map
	});

	showDirection(userMarker.position);
}

function showDirection(location){
	if(directionsDisplay){
		directionsDisplay.setMap(null);
	}

	var directionsService = new google.maps.DirectionsService();
	directionsDisplay = new google.maps.DirectionsRenderer();

	var selectedMode = selectTravelMode();

	directionsDisplay.setMap(map);
	directionsService.route({
		origin: locateOrigin.position,
		destination: location,
		travelMode: google.maps.TravelMode[selectedMode]
	}, function(response, status){
		if(status === "OK"){
			directionsDisplay.setDirections(response);
			distanceFromOrigin = response.routes[0].legs[0].distance.value;

			// This will convert the string to first letter capitalised
			if (selectedMode !== "DRIVING" && selectedMode !== "TRANSIT"){
				calculateCalories(selectedMode);
				selectedMode = selectedMode[0].toUpperCase() + selectedMode.slice(1).toLowerCase();
				transportOutput.innerText = selectedMode;
			} else if(selectedMode === "DRIVING"){
				calculateFuelCost();
			} else if(selectedMode === "TRANSIT"){
				selectedMode = selectedMode[0].toUpperCase() + selectedMode.slice(1).toLowerCase();
				costOutput.innerText = " NA ";
				caloriesOutput.innerText = " NA ";
				transportOutput.innerText = selectedMode;
			}
			showDistance(distanceFromOrigin);
		} else if(status === "NOT_FOUND"){
			sendError(status);
		} else if (status === "ZERO_RESULTS"){
			sendError(status);
		}
	});
}

// Allows the user to see the distance from them to the point
function showDistance(distanceFromOrigin){
	var displayContent = document.getElementById("distance-info");
	displayContent.innerText = "";
	displayContent.innerText = (distanceFromOrigin/1000).toFixed(1);
}

// Sets the travelmode parameter to the value found under the select menu
// in the input form
function selectTravelMode(){
	var mode = document.getElementById("transport").value;
	return mode;
}

// This will calculate the cost of travel according to the users recommended
// vehicle if they were to drive.
function calculateFuelCost(){
	// Using this variable because the distanceFromOrigin variable is global
	// and affects other functions in the API.
	var travelDistance;
	var daysCost;

	caloriesOutput.innerText = " NA ";

	// Loop over the entire drivingOptions object until the vehicle
	// matches the recommended transport. 
	for (var i = 0; i < drivingOptions.length; i ++) {
		var vehicle = drivingOptions[i].vehicle;
		if(vehicle === recommendedTransport){
			// Using the properties to set variables for the calculations
			// regarding fuel and days.
			dailyCost = drivingOptions[i].costPerDay;
			litrePerHundred = drivingOptions[i].litrePerHundredKm;
			break;
		}
	}

	daysCost = dailyCost * days;
	travelDistance = distanceFromOrigin / 1000;
	travelCost = fuelCost * litrePerHundred * (travelDistance/10);
	travelCost /= 10;
	travelCost += daysCost;

	// Send the calculated value to be outputted through to the screen
	costOutput.innerText = "";
	costOutput.innerText = "$" + travelCost.toFixed(2);
}

function calculateCalories(selectedTransport){
	var travelDistance = distanceFromOrigin / 1000;
	caloriesOutput.innerText = "";
	costOutput.innerText = " NA ";
	caloriesOutput.innerText = (calories * travelDistance).toFixed(0);
}

// This is the error message displayed to the user if their route produces no 
// result or an error has occured
function sendError(status){
	if (status === "NOT_FOUND"){
		alert("Sorry! There was an error!");
	} else if(status === "ZERO_RESULTS"){
		alert("Sorry! Your route returned no results.");
	}
}

// Validating input fields about number of people and number of days
// This is called within jQuery and the returned values are sent through
// variables in the form validation function. This is a flexible piece of
// coding, allowing it to validate any number input that requires a min/max.
// This is a fail safe in case the validation under increase/decrease function should fail.
function validateInput(input, error, min, max){
	if (max === 6){
		error = document.getElementById("people-errors");
	} else if(max === 15){
		error = document.getElementById("days-errors");
	}

	// Clearing the inner text of the error span
	error.innerText = "";
	if(input < min){
		error.innerText = "Must be greater than " + (min - 1);
		return false;
	} else if (input > max){
		error.innerText = "Must be less than " + (max + 1);
		return false;
	}
	return [true, input];
}

// This is where calculations are made using the information
// provided by the user. With user input, the program will determine
// which vehicle to use. The information is passed through the variables
// people and days.
function runCalculations(people, days){
	transportOutput.innerText = "";

	if( people == 1 && days <= 5 ){
		// Motorbike Conditions
		recommendedTransport = drivingOptions[0].vehicle;
	}  else if( people < 3 && days <= 10 ){
		// Small Car Conditions
		recommendedTransport = drivingOptions[1].vehicle;
	} else if( people <= 5 && ( (days >= 3) && (days <= 10) ) ){
		// Large Car Conditions
		recommendedTransport = drivingOptions[2].vehicle;
	} else if( ( (people >= 2) && (people <= 6) ) && ( (days >= 2) && (days <= 15) ) ){
		// Motor Home Conditions
		recommendedTransport = drivingOptions[3].vehicle;
	} else{
		recommendedTransport = "Not Applicable";
	}

	// After running through the conditions, the output is updated.
	transportOutput.innerText = recommendedTransport;
}