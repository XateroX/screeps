// This file is used in my account of the online MMO Screeps

var roleHarvester = {
    run: function (creep) {
        let state = creep.memory.state;

        // META - always check for the least-targeted source --------------------

        // find the source which has the least creeps targeting it
        var sources = creep.room.find(FIND_SOURCES);
        var targetSource = sources[0];
        for (var i = 1; i < sources.length; i++) {
            if (sources[i].pos.findInRange(FIND_CREEPS, 1).length < targetSource.pos.findInRange(FIND_CREEPS, 1).length) {
                targetSource = sources[i];
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

        // if the creep is full, change its state to RETURNING_ENERGY
        if (creep.store.getFreeCapacity() == 0) {
            creep.memory.state = 'RETURNING_ENERGY';
            console.log("creep " + creep.name + " is full");
        }
    }
}

function returnEnergy(creep) {
    // if the creep is not at the target spawn, move to it
    if (creep.pos.findInRange(FIND_MY_SPAWNS, 1).length == 0) {
        let result = creep.moveTo(Game.spawns[creep.memory.spawner]);
        console.log("creep " + creep.name + " is moving to spawn: " + result);
    }
    // if the creep is at the target spawn, transfer energy to it
    else {
        let result = creep.transfer(Game.spawns[creep.memory.spawner], RESOURCE_ENERGY);
        console.log("creep " + creep.name + " is transferring energy: " + result);
    }

    // if the creep is empty, change its state to GETTING_ENERGY
    if (creep.store.getUsedCapacity() == 0) {
        creep.memory.state = 'GETTING_ENERGY';
        console.log("creep " + creep.name + " is empty");
    }
}

module.exports = roleHarvester