var Chance = require('chance');
var chance = new Chance();

var express = require('express');
var app = express();


app.get('/', function(req, res) {
	res.send( generateAnimal() );
});
app.listen(3000, function () {
	console.log('Accepting request on port 3000!');
});

function generateAnimal() {
	var allowedTypes = ['ocean', 'desert', 'grassland', 'forest',
	'farm', 'pet', 'zoo'];
	var numberOfAnimals = chance.integer({
		min: 5,
		max: 50
	});
	console.log(numberOfAnimals);
	var animals = [];
	for(var i = 0; i < numberOfAnimals;	i++) {
		var type = chance.integer({
			min: 0,
			max: 6
		});
		animals.push({
			animal: chance.animal({
				type: allowedTypes[type]
			}),
			type: allowedTypes[type]
		})
	};
	console.log(animals);
	return animals;
}