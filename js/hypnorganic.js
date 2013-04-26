/*******************************************
*** HYPNORGANIC*****************************
*******************************************/
/*
	NEBOJSA PETROVIC (c) 2013
	Last updated: 2013-04-25
*/



/*******************************************
*** Color Class ****************************
*******************************************/
function Color(r,g,b,a) {
	this.r = r;
	this.g = g;
	this.b = b;
	this.a = a;
	this.rgba = function() {
		return "rgba("+this.r+","+this.g+","+this.b+","+this.a+")";
	}
	this.rgbaC = function() {
		var rC = this.r;
		var gC = this.g;
		var bC = this.b;
		
		var scale =  0.5;
		rC = Math.floor(rC*scale);
		gC = Math.floor(gC*scale);
		bC = Math.floor(bC*scale);
		
		return "rgba("+rC+","+gC+","+bC+","+this.a+")";
	}
}


/*******************************************
*** PathHelper Class ***********************
*******************************************/
function PathHelper(ctx) {
	this.ctx = ctx;
	this.traceQuarterCircleNE = function(x,y,r,rotation) {
		if(!rotation) rotation = 0;
		
		var startAngle = 0;
		var endAngle = Math.PI*3/2;
		this.ctx.moveTo(x,y);
		this.ctx.arc(x,y,r,startAngle + rotation,endAngle + rotation, true); 
	}
	this.traceQuarterCircleNW = function(x,y,r,rotation) {
		if(!rotation) rotation = 0;
		
		var startAngle = Math.PI*3/2;
		var endAngle = Math.PI;
		this.ctx.moveTo(x,y);
		this.ctx.arc(x,y,r,startAngle + rotation,endAngle + rotation, true); 
	}
	this.traceQuarterCircleSE = function(x,y,r,rotation) {
		if(!rotation) rotation = 0;
		
		var startAngle = Math.PI/2;
		var endAngle = Math.PI*2;
		this.ctx.moveTo(x,y);
		this.ctx.arc(x,y,r,startAngle + rotation,endAngle + rotation, true); 
	}
	this.traceQuarterCircleSW = function(x,y,r,rotation) {
		if(!rotation) rotation = 0;
		
		var startAngle = Math.PI;
		var endAngle = Math.PI/2;
		this.ctx.moveTo(x,y);
		this.ctx.arc(x,y,r,startAngle + rotation,endAngle + rotation, true); 
	}			
}

/*******************************************
*** Node Class *****************************
*******************************************/
function Node(x,y,r,color,parent) {
	this.x = x;
	this.y = y;
	this.r = r;
	this.color = color;
	this.parent = parent;
	this.reproductionProbability = 0.4;
	this.childScale = 0.9; 
	this.isAlive = true;
	this.isDying = false;
	this.minChildR = 3.0;
	this.spread = 1.3;
	this.decayRate = 0.97;
	this.minAlpha = 0.1;
	this.angle = 0;
	this.deltaAngle = Math.random()*4 - 2;
	this.speed = 1;
	this.agitation = 0.1;
	
	// If this node spawns a child it will return it here.  Otherwise it returns null
	this.step = function() {
		
		// Rotate the node
		this.angle += this.deltaAngle;
		if(this.angle > Math.PI * 2) this.angle = 0;			
		else if(this.angle <= 0) this.angle = Math.PI * 2;			
		
		// Randomly shift its position so that it's not static
		this.x += Math.random()*2*this.speed-this.speed;
		this.y += Math.random()*2*this.speed-this.speed;

		// Accelerate
		this.speed += this.agitation;
		
		if(this.isDying) {
			return null;
		}
		
		// Check whether this node should spawn a child
		if(Math.random() < this.reproductionProbability) {
			// Spawn a child
			var childr = this.r * this.childScale;
			
			// If the child is too small, don't add it (to save memory)
			if(childr < this.minChildR) {
				this.isDying = true;
				return null;
			}
			
			var maxd = (this.r + childr) * this.spread;
			var childx = this.x + (Math.random() * 2 * maxd - maxd);
			var childy = this.y + (Math.random() * 2 * maxd - maxd);
			var childcolor = new Color(this.color.r,this.color.g,this.color.b,this.color.a);
			
			this.isDying = true;
			
			return new Node(childx,childy,childr,childcolor,this);
		}else {
			return null;
		}
	}
	this.draw = function(ctx) {
		if(!this.isAlive) return;
		
		// When the node has fully decayed, return false
		if(this.color.a <= this.minAlpha) {
			this.isAlive = false;
		}
		
		// If the node is dying, slowly decay it
		if(this.isDying) {
			this.color.a *= this.decayRate;
		}

		var ph = new PathHelper(ctx);

		ctx.fillStyle = this.color.rgba();
		ctx.beginPath();
		ph.traceQuarterCircleNE(this.x,this.y,this.r,this.angle);
		ph.traceQuarterCircleSW(this.x,this.y,this.r,this.angle);	
		ctx.closePath();
		ctx.fill();		
		
		ctx.fillStyle = this.color.rgbaC();	
		ctx.beginPath();
		ph.traceQuarterCircleNW(this.x,this.y,this.r,this.angle);
		ph.traceQuarterCircleSE(this.x,this.y,this.r,this.angle);				
		ctx.closePath();
		ctx.fill();		
		
		
	}
	this.debugLog = function() {
		console.log("--Node: At ("+this.x + "," + this.y +")");
	}	
}


/*******************************************
*** Tree Class *****************************
*******************************************/
function Tree(rootNode) {
	this.root = rootNode;
	this.nodes = new Array();
	this.step = function() {
		// If there are no nodes, create a root node
		if(this.nodes.length <= 0) {
			this.nodes.push(this.root);
		}

		// Step each nodes
		for(var i=0; i<this.nodes.length; i++) {	
			var child = this.nodes[i].step();
			
			// If the node returned a child we must add it to the tree
			if(child) {
				this.nodes.push(child);
			}
		}
		
		
	}
	this.draw = function(ctx) {
		for(var i=0; i<this.nodes.length; i++) {
			this.nodes[i].draw(ctx);
		}
	}
	this.debugLog = function() {
		console.log("-Tree: Contains " + this.nodes.length + " nodes.");
		
		for(var i=0; i<this.nodes.length; i++) {
			this.nodes[i].debugLog();
		}		
	}
	this.cleanup = function() {
		// Remove any dead nodes
		for(var i=0; i<this.nodes.length; i++) {
			if(!this.nodes[i].isAlive) {
				this.nodes.splice(i,1);
			}
		}		
	}	
}


/*******************************************
*** Forest Class ***************************
*******************************************/
function Forest() {
	this.trees = new Array();
	this.step = function() {
		for(var i=0; i<this.trees.length; i++) {
			this.trees[i].step();
		}
	}
	this.draw = function(ctx) {
		for(var i=0; i<this.trees.length; i++) {
			this.trees[i].draw(ctx);
		}		
	}
	this.addTree = function(tree) {
		this.trees.push(tree);
	}
	this.debugLog = function() {
		console.log("Forest: Contains " + this.trees.length + " trees.");
		
		for(var i=0; i<this.trees.length; i++) {
			this.trees[i].debugLog();
		}		
	}
	this.totalNodeCount = function() {
		var nodeCount = 0;
		for(var i=0; i<this.trees.length; i++) {
			nodeCount += this.trees[i].nodes.length;
		}		
		
		return nodeCount;
	}
	this.cleanup = function() {
		// Remove any dead nodes
		for(var i=0; i<this.trees.length; i++) {
			this.trees[i].cleanup();
		}		
	}	
	this.createTree = function(x,y) {
		var minR = 10;
		var maxR = 40;
		
		var r = Math.floor(Math.random() * 255);
		var g = Math.floor(Math.random() * 255);
		var b = Math.floor(Math.random() * 255);
		var c = new Color(r,g,b,1.0);
		var radius = Math.floor(Math.random() * (maxR-minR) + minR);
		var root = new Node(x,y,radius,c);
		var tree = new Tree(root);
		this.addTree(tree);		
	}
}


/*******************************************
*** Canvas Class ***************************
*******************************************/
function Canvas(x,y,w,h,domID) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.domID = domID;
	this.domElement = $('#' + domID)[0];
	this.ctx = this.domElement.getContext("2d");

	this.clear = function() {
		this.domElement.height = this.h;
		this.domElement.width = this.w;
		this.ctx.fillRect(this.x,this.y,this.w,this.h);
	}

}



/*******************************************
*** MAIN ***********************************
*******************************************/
$(document).ready(function(){
	
	// CONFIGURATION:
	var FPS = 60;
	var canvasID = "main-canvas";

	// INITIAL SETUP
	var ww = $(window).width();
	var wh = $(window).height();
	var canvas = new Canvas(0,0,ww,wh,canvasID);
	var forest = new Forest();
	
	// INPUT SETUP
	var isMouseDown = false;
	$(window).mousedown(function() {
		isMouseDown = true;
	});
	$(window).mouseup(function() {
		isMouseDown = false;
	});	
	$(window).mousemove(function(e) {
		// Uncomment this line to turn click&drag on
		if(!isMouseDown) return;
		forest.createTree(e.pageX,e.pageY);		
	});
	$(window).click(function(e) {
		forest.createTree(e.pageX,e.pageY);		
	});	
	
	// MAIN LOOP
	var step = function() {
		// Clear the canvas
		canvas.clear();
		
		forest.step();
		forest.draw(canvas.ctx);
		forest.cleanup();
		
		setTimeout(step,1000/FPS);
	}
	
	// START EVERYTHING ...
	step();
	

});