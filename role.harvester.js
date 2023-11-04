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
        creep.memory.targetSource = targetSource.id;

        // END META -------------------------------------------------------------


        // if the creeps state is GETTING_ENERGY, move to the source and harvest from it
        if (state == 'GETTING_ENERGY') {
            getEnergy(creep);
        }
        else if (state == 'RETURNING_ENERGY') {
            returnEnergy(creep);
        }
    }
};

function getEnergy(creep) {
    // execute logic of if not full, go to source then harvest
    // else, go to spawn and transfer energy
    if (creep.store.getFreeCapacity() > 0) {
        // if the creep is not at the target source, move to it
        if (creep.pos.findInRange(FIND_SOURCES, 1).length == 0) {
            creep.moveTo(Game.getObjectById(creep.memory.targetSource));
        }
        // if the creep is at the target source, harvest from it
        else {
            creep.harvest(Game.getObjectById(creep.memory.targetSource));
        }

        // if the creep is full, change its state to RETURNING_ENERGY
        if (creep.store.getFreeCapacity() == 0) {
            creep.memory.state = 'RETURNING_ENERGY';
        }
    }
}

function returnEnergy(creep) {
    // if the creep is not at the target spawn, move to it
    if (creep.pos.findInRange(FIND_MY_SPAWNS, 1).length == 0) {
        creep.moveTo(Game.spawns[creep.memory.spawner]);
    }
    // if the creep is at the target spawn, transfer energy to it
    else {
        creep.transfer(Game.spawns[creep.memory.spawner], RESOURCE_ENERGY);
    }

    // if the creep is empty, change its state to GETTING_ENERGY
    if (creep.store.getUsedCapacity() == 0) {
        creep.memory.state = 'GETTING_ENERGY';
    }
}

module.exports = roleHarvester