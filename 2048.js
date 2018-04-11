$.fn.game = function(options = "")
{
	var settings = $.extend({
		block : "body",
		backgroundColor : "red",
		start_size : 4,
		color0 : "#A9A9A9",
		color2 : "#D2691E",
		color4 : "#FF7F50",
		color8 : "#ffbf00",			
		color16 : "#bfff00",
		color32 : "#40ff00",
		color64 : "#00bfff",
		color128 : "#FF7F50",
		color256 : "#0040ff",
		color512 : "#ff0080",
		color1024 : "#D2691E",
		color2048 : "#FF7F50",
		color4096 : "#ffbf00",
		colorDefault : "#ff0080",
		textColor : "white"

	})

	setSettings();
	createGame();

	var move_left;
	var move_right;
	var move_up;
	var move_down;	
	var best = 0;
	var score = 0;
	var size = settings.start_size;
	
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext('2d');

	var sizeInput = $("#size");
	var changeSize = $("#change_size");
	var scoreLabel = $("#score");
	var restart = $("#restart");
	var left = $("#left");
	var up = $("#up");
	var right = $("#right");
	var down = $("#down");

	var width = canvas.width / size - 6;
	var move = true;
	var cells = [];
	var copyCells = [];
	var fontSize;
	var loss = false;
	var moves = true;
	var loadedGame = false;

	startGame();

	left.click(function()
	{
		moveLeft();
		scoreLabel.html("Score : " + score);
	})
	up.click(function()
	{
		moveUp();
		scoreLabel.html("Score : " + score);
	})
	right.click(function()
	{
		moveRight();
		scoreLabel.html("Score : " + score);
	})
	down.click(function()
	{
		moveDown();
		scoreLabel.html("Score : " + score);
	})
	restart.click(function()
	{
		localStorage.setItem("score" , 0);
		canvas.style.opacity = "1";
	  	canvasClean();
		drawAllCells();
		pasteNewCell();
		pasteNewCell();
	})	

	function setSettings()
	{
		if(options.block)
		{
			settings.block = options.block;
		}
		if(options.backgroundColor)
		{
			settings.backgroundColor = options.backgroundColor;
		}
		if(options.start_size)
		{
			settings.start_size = options.start_size;
		}
		if(options.color0)
		{
			settings.color0 = options.color0;
		}
		if(options.textColor)
		{
			settings.textColor = options.textColor
		}
		for(var i = 2; i < 4097; i *= 2)
		{
			var test = "color" + i;
			if(options[test])
			{
				settings[test] = options[test];
			}
		}
	}

	function createGame()
	{
		$(settings.block).append('<div id="2048_game"></div>');
		$("#2048_game").append('<h1>2048</h1>')
		$("#2048_game").append('<p id="score">Score : '+score+'</p><p id="best">best : '+best+'</p>');
		$("#2048_game").append('<div id="restart_game"><button id="restart">restart</button></div>');
		$("#2048_game").append('<div id="canvas_block">');
		$("#canvas_block").append('<canvas id="canvas" width="500" height="500"></canvas>');
		$("#2048_game").append('</div>');
		$("#2048_game").append('<div id="play_buttons">');
		$("#play_buttons").append('<div id="up">&uarr;</div>');
		$("#play_buttons").append('<div id="left_right">');
		$("#left_right").append('<div id="left">&larr;</div>');
		$("#left_right").append('<div id="right">&rarr;</div>');
		$("#play_buttons").append('</div>');
		$("#play_buttons").append('<div id="down">&darr;</div>');
		$("#2048_game").append('</div>');
		createCss();

	}

	function createCss()
	{
		$("#2048_game").css("background-color",''+settings.backgroundColor+'');
		$("#2048_game p").css("color",settings.textColor);
		$("#2048_game p").css("font-size","20px");
		$("#2048_game h1").css("text-align","center");
		$("#2048_game h1").css("color", settings.textColor);
		$("#2048_game #score").css("text-align","center");
		$("#2048_game #best").css("text-align","center");
		$("#2048_game .clear").css("clear","both");
		$("#2048_game #restart_game").css("margin-left","-50px");
		$("#2048_game #restart_game").css("padding-left","50%");
		$("#2048_game #canvas").css("background-color","burlywood");
		$("#2048_game #canvas_block").css("margin-left","-250px");
		$("#2048_game #canvas_block").css("padding-left","50%");
		$("#2048_game #restart_game").css("margin-top","20px");
		$("#2048_game #restart_game").css("margin-bottom","20px");
		$("#2048_game #play_buttons").css("text-align","center");
		$("#2048_game #play_buttons").css("margin-top","40px");
		$("#2048_game #play_buttons").css("font-size","40px");
		$("#2048_game #play_buttons").css("float","left");
		$("#2048_game #play_buttons").css("padding-left","50%");
		$("#2048_game #play_buttons").css("height","50px");
		$("#2048_game #play_buttons #left").css("float","left");
		$("#2048_game #play_buttons #right").css("float","left");		
	}

	function saveGame()
	{
		var save_of_cells = "";
		localStorage.setItem("bestscore" , best);
		localStorage.setItem("score" , score);
		for(var x = 0; x < size;x++)
		{
			for(var y = 0; y < size;y++)
			{
				if(cells[x][y].value)
				save_of_cells += 'cell:x='+x+':y='+y+':value='+cells[x][y].value+';';
			}
		}	
		save_of_cells += "gamestate:loss=" + loss;
		localStorage.setItem("cells" , save_of_cells);
	}

	function getGame()
	{
		var x = [];
		var y = [];
		var value = [];
		if(localStorage.getItem("bestscore"))
		{
			best = parseInt(localStorage.getItem("bestscore"));
			$("#best").html("best : " + best);
		}
		if(localStorage.getItem("score"))
		{
			score = parseInt(localStorage.getItem("score"));
			$("#score").html("score : " + score);
		}
		if(localStorage.getItem("cells"))
		{
			var test = localStorage.getItem("cells");
			console.log(test);
			test2 = test.split(";");
			for(var i = 0; i < test2.length;i++)
			{
				test3 = test2[i].split(":");
				for(var j = 1; j < test3.length;j++)
				{
					test4 = test3[j].split("=");
					if(test4[0] == "x")
					{
						x[i]= test4[1];
						loadedGame = true;
					}
					if(test4[0] == "y")
					{
						y[i] = test4[1];
					}
					if(test4[0] == "value")
					{
						value[i] = test4[1];
					}
					if(test4[0] == "loss")
					{
						if(test4[1] == "true")
						{
							loss = true;
						}
					}
				}				
			}
			for(var i = 0; i < x.length;i++)
			{
				var temp_x = x[i];
				var temp_y = y[i];
				cells[temp_x][temp_y].value = value[i];
			}
			
		}

	}

	function cell(row, coll) 
	{
		this.value = 0;
		this.x = coll * width + 5 * (coll + 1);
		this.y = row * width + 5 * (row + 1);
	}

	function createCells() 
	{
		for (var x = 0; x < size; x++) 
		{
			cells[x] = [];
			for (var y = 0; y < size; y++) 
			{
				cells[x][y] = new cell(x, y);
			}
		}
	}

	function drawCell(cell) 
	{
		ctx.beginPath();
		ctx.rect(cell.x, cell.y, width, width);
		console.log(cell.value);
		switch (cell.value)
		{
			case 0 : ctx.fillStyle = settings.color0; break;
    	 	case 2 : ctx.fillStyle = settings.color2; break;
    	 	case 4 : ctx.fillStyle = settings.color4; break;
    	 	case 8 : ctx.fillStyle = settings.color8; break;
    	 	case 16 : ctx.fillStyle = settings.color16; break;
    	 	case 32 : ctx.fillStyle = settings.color32; break;
    	 	case 64 : ctx.fillStyle = settings.color64; break;
    	 	case 128 : ctx.fillStyle = settings.color128; break;
    	 	case 256 : ctx.fillStyle = settings.color256; break;
    	 	case 512 : ctx.fillStyle = settings.color512; break;
    	 	case 1024 : ctx.fillStyle = settings.color1024; break;
    	 	case 2048 : ctx.fillStyle = settings.color2048; break;
    	 	case 4096 : ctx.fillStyle = settings.color4096; break;
    	 	default : ctx.fillStyle = settings.colorDefault;
  		}

  		ctx.fill();

  		if (cell.value)
  		{
			fontSize = width/2;
    		ctx.font = fontSize + "px Arial";
    		ctx.fillStyle = settings.textColor;
    		ctx.textAlign = "center";
    		ctx.fillText(cell.value, cell.x + width / 2, cell.y + width / 2 + width/7);
  		}
  		saveGame();
	}

	function canvasClean() 
	{
		score = 0;		
		ctx.clearRect(0, 0, 500, 500);
		createCells();
	}

	document.onkeydown  = function (event) 
	{
		scoreLabel.html("Score : " + score);
    	if(score > best)
		{
			$("#best").html("best : " + score);
			best = score;
		}
    	if (event.keyCode == 38 || event.keyCode == 87) 
    	{
    		moveUp();
    	}
    	else if (event.keyCode == 39 || event.keyCode == 68) 
    	{
	 			moveRight();
		}
   	 	else if (event.keyCode == 40 || event.keyCode == 83) 
    	{
    		moveDown();
    	}
    	else if (event.keyCode == 37 || event.keyCode == 65) 
    	{
    		moveLeft();
    	}
	  	if(event.keyCode == 82)
	  	{
	  		localStorage.setItem("score" , 0);
	  		canvas.style.opacity = "1";
	  		canvasClean();
			drawAllCells();
			pasteNewCell();
			pasteNewCell();
	  	}
	}

	function copyTable()
	{
		for(var x = 0; x < size;x++)
		{
			copyCells[x] = cells[x];
			for(var y = 0; y < size;y++)
			{
				copyCells[x][y] = cells[x][y];
			}
		}
	}

	function startGame() 
	{

		loss = false;
		canvas.style.opacity = "1";
		createCells();
		getGame();
		drawAllCells();
		console.log(loadedGame)
		if(loadedGame == false)
		{
			pasteNewCell();
			pasteNewCell();
		}

	}

	function finishGame() 
	{
		if(score > best)
		{
			$("#best").html("best : " + score);
			best = score;
		}
		canvas.style.opacity = "0.5";
		loss = true;
	}

	function drawAllCells() 
	{
		for (var x = 0; x < size; x++) 
		{
			for (var y = 0; y < size; y++) 
			{
				drawCell(cells[x][y]);
	    	}
	  	}
	}

	function pasteNewCell() 
	{

		while (true) 
		{
    		var row = Math.floor(Math.random() * size);
    		var coll = Math.floor(Math.random() * size);
    	  	if (!cells[row][coll].value) 
    		{
    	  		cells[row][coll].value = 2 * Math.ceil(Math.random() * 2);
    	  		drawAllCells();
    	  		return;
    	 	}
  		}
	}

	function checkover()
	{
		var countFree = 0;
	  	for (var i = 0; i < size; i++) 
	  	{
	    	for (var j = 0; j < size; j++) 
	    	{
	      		if (!cells[i][j].value) 
	      		{
	        		countFree++;
	      		}
	    	}
	  	}
		if (!countFree)
	  	{
	  		if(move_left == false && move_right == false && move_up == false && move_down == false)
			{  
	  			finishGame();
	    	}
	    	return;
	  	}
	}

	function moveRight () 
	{
		move_right = false;
		for (var x = 0; x < size; x++) 
		{
	    	for (var y = size - 2; y >= 0; y--) 
	    	{
	      		if (cells[x][y].value) 
	      		{
	        		var coll = y;
	        		while (coll + 1 < size) 
	        		{
	          			if (!cells[x][coll + 1].value) 
	          			{
	            			cells[x][coll + 1].value = cells[x][coll].value;
	            			cells[x][coll].value = 0;
	            			coll++;
	            			move_right = true;
	          			}
	          			else if (cells[x][coll].value == cells[x][coll + 1].value) 
	          			{
	            			cells[x][coll + 1].value *= 2;
	            			score +=  +cells[x][coll + 1].value;
	            			cells[x][coll].value = 0;
	            			move_right = true;
	            			break;
	          			}
	          			else
   		       			{
        	  				break;
        	  			}
        			}
	      		}
	    	}
	  	}
	  	checkover();
	    if(move_right == true)
	  	{
	  		pasteNewCell();
	  	}
	}

	function moveLeft() 
	{
		move_left = false;
		for (var x = 0; x < size; x++) 
		{
	    	for (var y = 1; y < size; y++) 
	    	{
	      		if (cells[x][y].value) 
	      		{
	      			var coll = y;
	        		while (coll - 1 >= 0) 
	        		{
	          			if (!cells[x][coll - 1].value) 
	          			{
	            			cells[x][coll - 1].value = cells[x][coll].value;
	            			cells[x][coll].value = 0;
   		         			coll--;
	            			move_left = true;
	          			}
	          			else if (cells[x][coll].value == cells[x][coll - 1].value) 
	          			{
	            			cells[x][coll - 1].value *= 2;
	            			score +=   +cells[x][coll - 1].value;
	            			cells[x][coll].value = 0;
	            			move_left = true;
	           				break;
	          			}
	          			else
	          			{ 
   	       				break;
	   	       			}
	        		}	
	      		}
	    	}
	  	}
	  	checkover();
	  	if (move_left === true)
	  	{
	  		pasteNewCell();
	  	}
	}

	function moveUp() 
	{
		move_up = false;
		for (var j = 0; j < size; j++) 
		{
	    	for (var i = 1; i < size; i++) 
	    	{
	      		if (cells[i][j].value) 
	      		{
	        		var row = i;
	        		while (row > 0) 
	        		{
	          			if (!cells[row - 1][j].value) 
	          			{
	            			cells[row - 1][j].value = cells[row][j].value;
	            			cells[row][j].value = 0;
	            			row--;
	            			move_up = true;
	          			}	
	          			else if (cells[row][j].value == cells[row - 1][j].value) 
	          			{
	            			cells[row - 1][j].value *= 2;
	            			score +=  +cells[row - 1][j].value;
	            			cells[row][j].value = 0;
	            			move_up = true;
	            			break;
	          			}
	          			else
	          			{
	          				break;
	        			}
	        		}
	      		}	
	    	}
	  	}
	  	checkover();
	  	if(move_up == true)
	  	{
	  		pasteNewCell();
	  	}
	}

	function moveDown() 
	{
		move_down = false;
		for (var j = 0; j < size; j++) 
		{
	    	for (var i = size - 2; i >= 0; i--) 
	    	{
	      		if (cells[i][j].value) 
	      		{
	        		var row = i;
        			while (row + 1 < size)
	         		{
	          			if (!cells[row + 1][j].value)
	           			{
	            			cells[row + 1][j].value = cells[row][j].value;
	            			cells[row][j].value = 0;
	            			row++;
	            			move_down = true;
	          			}
	          			else if (cells[row][j].value == cells[row + 1][j].value) 
	          			{
	            			cells[row + 1][j].value *= 2;
	            			score +=  +cells[row + 1][j].value;
	            			cells[row][j].value = 0;
	            			move_down = true
	            			break;
	          			}
	          			else 
	          			{
	          				break;
	          			}
	        		}
	      		}
	    	}
	  	}
 	 	checkover();
 	 	if(move_down == true)
 	 	{
 	 		pasteNewCell();
	  	}
	}
}