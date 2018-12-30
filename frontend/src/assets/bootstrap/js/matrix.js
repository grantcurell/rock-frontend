IS_MATRIX_ON = false;
IS_MATRIX_RENDERED = false;

var c = document.getElementById("matrix");
var ctx = c.getContext("2d");
var font_size = 10;
var drops = [];

var message = "TFPLENUM";
message = message.split("");

function render(){
	//making the canvas full screen
	c.height = window.innerHeight;
	c.width = window.innerWidth;	

	//Ensures that letters do not fall below a certain size.
	if (c.width < 1920){
		c.width = 1920;
	}
		
	var columns = c.width/font_size; //number of columns for the rain
	//an array of drops - one per column

	//x below is the x coordinate
	//1 = y co-ordinate of the drop(same for every drop initially)
	for(var x = 0; x < columns; x++)
		drops[x] = 1; 
}

//drawing the characters
function draw()
{
	if (!IS_MATRIX_ON){
		ctx.clearRect(0, 0, c.width, c.height);
		return;
	}

	if (!IS_MATRIX_RENDERED){
		render();
		IS_MATRIX_RENDERED = true;
	}
	//Black BG for the canvas
	//translucent BG to show trail
	ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
	ctx.fillRect(0, 0, c.width, c.height);
	
	ctx.fillStyle = "#0F0"; //green text
	ctx.font = font_size + "px arial";
	//looping over drops	
	for(var i = 0; i < drops.length; i++)
	{
		//a random message character to print
		var text = message[Math.floor(Math.random()*message.length)];
		//x = i*font_size, y = value of drops[i]*font_size				
		ctx.fillText(text, i*font_size, drops[i]*font_size);
							
		//sending the drop back to the top randomly after it has crossed the screen
		//adding a randomness to the reset to make the drops scattered on the Y axis
		if(drops[i]*font_size > c.height && Math.random() > 0.975)
			drops[i] = 0;
		
		//incrementing Y coordinate
		drops[i]++;
	}
}

setInterval(draw, 70);
