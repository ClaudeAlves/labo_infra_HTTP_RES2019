$(function() {
	console.log("Loading animals...");
	
	function loadAnimals() {
	$.getJSON( "/api/animals/", function(animals) {
			console.log(animals)
			var message = "Oh look it's a ";
			message += animals[0].animal + " it comes from the " + animals[0].type;
			$(".lead").text(message);
		});
	};
	loadAnimals();
	setInterval(loadAnimals, 3000);
});