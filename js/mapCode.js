var mapContainer = document.getElementById("map");
var style = window.getComputedStyle(mapContainer);
console.log(style.display);

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
		zoom:6,
		disableDefaultUI:true,
		scrollwheel:true,
		draggable:true,
		fullScreenControl:true,
		keybosrdShortcuts:false,
		mapTypeControlOptions: {
			position:google.maps.ControlPosition.TOP_CENTER
		}
	}

	map = new google.maps.Map(document.getElementById("map"), defaultOptions);
};

// Line to load all the information written in the init function.
if (style.display === "block"){
	console.log("Working");
	google.maps.event.addDomListener(window, "load", initialiseMap);
}