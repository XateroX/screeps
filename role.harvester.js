// This file is used in my account of the online MMO Screeps

var roleHarvester = {
    run: function (creep) {
        let state = creep.memory.state;

        // META - always check for the least-targeted source --------------------
        var sources = creep.room.find(FIND_SOURCES);
        var targetSource = sources[0];
        var targetSourceDistance = creep.pos.getRangeTo(targetSource);

        // find the nearest source 
        for (let i = 0; i < sources.length; i++) {
            let source = sources[i];
            let sourceDistance = creep.pos.getRangeTo(source);

            // if closest so far, set it as the target source
            if (sourceDistance < targetSourceDistance) {
                targetSource = source;
                targetSourceDistance = sourceDistance;
            }
        }

        // set the target source as the creep's target
        creep.memory.targetSource = targetSource;
        // END META -------------------------------------------------------------


        // if the creeps state is GETTING_ENERGY, move to the source and harvest from it
        if (state == 'GETTING_ENERGY') {
            getEnergy(creep);
            console.log("creep " + creep.name + " is getting energy");
        }
        else if (state == 'RETURNING_ENERGY') {
            returnEnergy(creep);
            console.log("creep " + creep.name + " is returning energy");
        }
        else if (state == 'GIVING_TO_RCL') {
            giveToRCL(creep);
            console.log("creep " + creep.name + " is giving energy to the RCL");
        }
    }
};

function getEnergy(creep) {
    // execute logic of if not full, go to source then harvest
    // else, go to spawn and transfer energy
    if (creep.store.getFreeCapacity() > 0) {
        // if the creep is not at the target source, move to it
        let result = creep.harvest(creep.memory.targetSource);
        if (result == ERR_NOT_IN_RANGE) {
            let result = creep.moveTo(creep.memory.targetSource);
            console.log("creep " + creep.name + " is moving to source: " + result);
        }
    }
    // if the creep is full, change its state to RETURNING_ENERGY
    else {
        creep.memory.state = 'RETURNING_ENERGY';
        console.log("creep " + creep.name + " is full");
    }
}

function returnEnergy(creep) {
    // if the creep is not at the target spawn, move to it
    let result = creep.moveTo(Game.spawns[creep.memory.spawner]);
    console.log("creep " + creep.name + " is moving to spawner: " + result);

    // if the creep is at the target spawn, transfer energy to it
    if (result == OK) {
        let result = creep.transfer(Game.spawns[creep.memory.spawner], RESOURCE_ENERGY);
        console.log("creep " + creep.name + " is transferring energy: " + result);

        // if the spawner is full, set state to GIVING_TO_RCL
        if (result != OK) {
            creep.memory.state = 'GIVING_TO_RCL';
            console.log("creep " + creep.name + " is giving to RCL");
        }
    }

    // if the creep is empty, change its state to GETTING_ENERGY
    if (creep.store.getUsedCapacity() == 0) {
        creep.memory.state = 'GETTING_ENERGY';
        console.log("creep " + creep.name + " is empty");
    }
}

function giveToRCL(creep) {
    // transfer energy to it
    let result = creep.upgradeController(creep.room.controller);
    console.log(result + " while trying to upgrade")
    if (result == ERR_NOT_IN_RANGE) {
        let result = creep.moveTo(creep.room.controller);
        console.log("creep " + creep.name + " is moving to RCL: " + result);
    }
    if (creep.store.getUsedCapacity() == 0) {
        creep.memory.state = 'GETTING_ENERGY';
        console.log("creep " + creep.name + " is empty");
    }
}

module.exports = roleHarvester