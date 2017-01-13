/* globals TextGroup, resourceNames, rcrs*/
var BaseObject = function(resources, primaryResource) {
  //whether or not a base is active
  //needs to be like this so we can use a getter and setter
  this._active = false;

  //reference to the resource composition of the sector
  //can be used to lower resource abundance in sector data
  //but currently just used to read abundance of each material
  this.resources = resources;

  //resources to be counted
  //TODO initialize this to the length of resourceNames
  this.resourceCount = [0, 0, 0, 0, 0, 0];

  //gatherers represent arbitrary units which gather resources
  //we can make them automiton or people for gameplay sake
  this.gatherers = [1, 1, 1, 1, 1, 1];

  //capacity represents a cap on resources
  this.capacity = [10, 10, 10, 10, 10, 10];

  //this is an object that should hold all the info that the base is going to display
  //should have a type 'label' which doesnt get updated
  //and allows us to display information about the base
  this.information = [{name: 'Resources',
                       type: 'resource', // type may be unecessary
                       x: 20 + game.world.width,
                       y: game.world.centerY,
                       anchor: [0.0, 0.0],
                       context: this,
                       updater: this.getResources},
                      {name: 'Gatherers',
                       type: 'gatherers', 
                       x: 170 + game.world.width,
                       y: game.world.centerY,
                       anchor: [0.0, 0.0],
                       context: this,
                       updater: this.getGatherers},
                      {name: 'abundance',
                       type: 'abundance', 
                       x: 300 + game.world.width,
                       y: game.world.centerY,
                       anchor: [0.0, 0.0],
                       context: this,
                       updater: this.getAbundance},
                      {name: 'Storage', 
                       type: 'storage',
                       x: 450 + game.world.width,
                       y: game.world.centerY,
                       anchor: [0.0, 0.0],
                       context: this,
                       updater: this.getStorage}];

  this.buttons = [{name: primaryResource,
                   x: 10 + game.world.width,
                   y: game.world.height - 10,
                   anchor: [0.0, 1.0],
                   context: this,
                   callback: this.collectRandom}];
  //setup up buttons for manually collecting each resource
  //timer should be shared across all buttons
  for (var i = 0; i < resourceNames.length; i++) {
    this.buttons.push({name: "Collect " + resourceNames[i],
                       resourceType: resourceNames[i], //could use index but this way it is more informative for error handling 
                       x: 200 + game.world.width, 
                       y: 10 + i * 30,
                       context: this, 
                       callback: this.collectResource});
  }
  
  //setup for building gatheres of each resource
  //TODO make the name more interesting
  //  e.g add robotic smelter for metal
  //  this could be tied into procedural resource generation
  for (var i = 0; i < resourceNames.length; i++) {
    this.buttons.push({name: "Expand " + resourceNames[i] + " Production",
                       resourceType: resourceNames[i], //could use index but this way it is more informative for error handling 
                       x: game.world.width * 2 - 620, 
                       y: 10 + i * 30,
                       context: this, 
                       callback: this.expandProduction});
  }

  //setup for building storage of each resource
  for (var i = 0; i < resourceNames.length; i++) {
    this.buttons.push({name: "Build " + resourceNames[i] + " Storage",
                       resourceType: resourceNames[i], //could use index but this way it is more informative for error handling 
                       x: game.world.width * 2 - 290, 
                       y: 10 + i * 30,
                       context: this, 
                       callback: this.buildStorage});
  }

  //and this is the object that actually displays our text
  //it might not be a bad idea to move all this stuff into the sectordata object
  //but for the time being it makes more sense here
  this.infoDisplay = null; // new TextGroup(this, 0, 0, this.information);

};

BaseObject.prototype = {
  //updates our resource count every frame
  update: function() {
    for (var i = 0; i < this.resourceCount.length; i++) {
      this.resourceCount[i] += game.time.physicsElapsed * this.gatherers[i] * this.resources.type[i].abundance;
    }

    for (var i = 0; i < resourceNames.length; i++) {
      if (this.resourceCount[i] > this.capacity[i]) {
        this.resourceCount[i] = this.capacity[i];
        //console.log(resourceNames[i] + " exceeded resource capacity no more resources will be stored until storage expanded")
      }
    }
  },

  //use getters and setters so that the textgroup is initialized when the base is created
  //not when the sector is initialized
  get active() {
    return this._active;
  },

  set active(x) {
    this._active = x;
    this.infoDisplay = new TextGroup(this, 0, 0, this.information);
  },

  updateText: function() {
    //update the information here
    //use the information to selectively update a textGroup
    if (this.information.length != this.infoDisplay.children.length) {
      this.infoDisplay.destroy();
      this.infoDisplay = new TextGroup(this, 0, 0, this.information);
    }

    for(var i = 0; i < this.information.length;i++) {
      this.infoDisplay.getChildAt(i).setText(this.information[i].updater(this.information[i].context));
    }
  },

  getResources: function(ctx) {
    //returns a formatted string with all the resources and curent values
    //currently only shows an integer version of resources but can be changed easily
    //the use of context here may seem a tad hacky but it is the only way for the information to
    //be both easily updated and manually retreived
    var context = ctx || this;
    var txt = "Resources:";
    for (var i = 0; i < context.resourceCount.length; i++) {
      txt += "\n" + resourceNames[i] + ": " + Math.floor(context.resourceCount[i]);
    }
    return txt;
  },

  getGatherers: function(ctx) {
    //returns a formatted string of how many workers there are in each resource
    var context = ctx || this;
    var txt = "Workers:";
    for (var i = 0; i < context.gatherers.length; i++) {
      txt += "\n" + resourceNames[i] + ": " + Math.floor(context.gatherers[i]);
    }
    return txt;
  }, 

  getAbundance: function(ctx) {
    //return a formatted string with the abundance of each resource in this sector
    var context = ctx || this;
    var txt = "Abundance:";
    for (var i = 0; i < context.resources.type.length; i++) {
      txt += "\n" + resourceNames[i] + ": " + context.resources.type[i].abundance.toPrecision(3);
    }
    return txt;
  },

  getStorage: function(ctx) {
    //return a formatted string with the storage caps of each resource in this sector
    var context = ctx || this;
    var txt = "Storage:";
    for (var i = 0; i < context.resources.type.length; i++) {
      txt += "\n" + resourceNames[i] + ": " + context.capacity[i];
    }
    return txt;
  },

  //TODO the amount added each time should be balanced as a gameplay feature
  //maybe make it a total of wealth (sum of all resource values)
  //TODO maybe remove this in favor of integrating it with the scene button
  //  that way exploration gives random resource
  //this picks a random resource weighted by abundance
  collectRandom: function() {
    var totalAbundance = 0.0;
    var resourceList = [];
    for (var i = 0; i < this.resources.type.length; i++) {
      totalAbundance += this.resources.type[i].abundance;
      resourceList.push(totalAbundance);
    }

    var ran = Math.random() * totalAbundance;
    var res = 0;
    for (var i = this.resources.type.length - 1; i >= 0; i--) {
      if (resourceList[i] > ran) {
        res = i;
      }
    }

    this.resourceCount[res] += 5.0;
    console.log("5 added to " + resourceNames[res]);    
  },

  collectResource: function(btn) {
    this.resourceCount[rcrs[btn.resourceType]] += 5.0;
    console.log(btn.resourceType);
  },

  //TODO add costs for building and varying degrees of payoff
  expandProduction: function(btn) {
    this.gatherers[rcrs[btn.resourceType]] += 1;
    console.log("1 " + btn.resourceType + " gatherer added!");
  },

  //TODO change the amount that the capacity increase by for better gameplay
  //TODO cost and growth curves should be edited for gameplay sake
  buildStorage: function(btn) {
    this.capacity[rcrs[btn.resourceType]] += 10;
    console.log("add storage to " + btn.resourceType);
  }

};
