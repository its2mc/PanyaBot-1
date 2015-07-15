//We define the methods that will access the websocket server.

$().ready(function() {
		//This part takes care of the speed. This is not necessary but it only
		//manages the speed algorithm to give an example of the update mechanism

		//Declare variables
		var switcher = true;
		var speedGain = 1;
		var distances = [0,0,0,0];
		var powerLevel = 5;
		var race;
		
		function registerCar(){
			
		}
		
		function startRace() {
			for(var i = 0;i<distances.length;i++) {
				if(distances[i]!=100) 
					distances[i]+=(powerLevel*speedGain);
			}

			$("#car1").attr("aria-valuenow",distances[0]);
			$("#car1").css("width",distances[0]+'%');
			$("#car2").attr("aria-valuenow",distances[1]);
			$("#car2").css("width",distances[1]+'%');
			$("#car3").attr("aria-valuenow",distances[2]);
			$("#car3").css("width",distances[2]+'%');
			$("#car4").attr("aria-valuenow",distances[3]);
			$("#car4").css("width",distances[3]+'%');
			
		}

		//Handling button events
		$("#startRace").click(function() {
			if(switcher==true){
				race = setInterval(function(){startRace()},1000);
				switcher = false;
			}
			else {
				clearInterval(race);
				for(var i = 0;i<distances.length;i++) distances[i]=0;
			}
			switcher = true?false:true;
		});

		$("#throwDice").click(function() {
			var randInt = Math.floor((Math.random() * 100) + 1);
			$("#result").val(randInt);
			var guessedVal = $("#input").val();
			if(guessedVal<100&&guessedVal>0)
				if(guessedVal == randInt)
					speedGain = 1;
				else
					speedGain = (100 - Math.abs(randInt - guessedVal)) / 100;
			else
				alert("Please enter valid Number, from 0 to 100!");
		});
		//
	});