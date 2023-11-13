// This file is used in my account of the online MMO Screeps

var roleExcHarvester = {
    run: function (creep) {
        let state = creep.memory.state;

        creep.memory.resourceTarget = Game.spawns[creep.memory.spawner];

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
        if (state == 'TRAVELLING_TO_SOURCE') {
            travelToSource(creep);
        }
        else if (state == 'MINING') {
            mineSource(creep);
        }
        else if (state == 'UNLOADING') {
            loadStorage(creep);
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
            //console.log("creep " + creep.name + " is moving to source: " + result);
        }
    }
    // if the creep is full, change its state to RETURNING_ENERGY
    else {
        creep.memory.state = 'RETURNING_ENERGY';
        //console.log("creep " + creep.name + " is full");
    }
}

function loadStorage(creep) {
    var extensions = creep.room.find(FIND_MY_STRUCTURES, {
        filter: { structureType: STRUCTURE_EXTENSION }
    });

    extensions = extensions.filter(extension => extension.store.getFreeCapacity(RESOURCE_ENERGY) > 0);

    // find all containter structures in the room
    var containers = creep.room.find(FIND_STRUCTURES, {
        filter: { structureType: STRUCTURE_CONTAINER }
    });

    if (containers.length > 0) {
        //console.log("there are containers that need energy");
        // find the nearest container
        creep.memory.resourceTarget = containers[0];
        let targetContainerDistance = creep.pos.getRangeTo(creep.memory.resourceTarget);

        for (let i = 0; i < containers.length; i++) {
            let container = containers[i];
            let containerDistance = creep.pos.getRangeTo(container);

            // if closest so far, set it as the target container
            if (containerDistance < targetContainerDistance) {
                creep.memory.resourceTarget = container;
                targetContainerDistance = containerDistance;
            }
        }
    }
    else if (extensions.length > 0) {
        //console.log("there are extensions that need energy");
        // find the nearest extension
        creep.memory.resourceTarget = extensions[0];
        let targetExtensionDistance = creep.pos.getRangeTo(creep.memory.resourceTarget);

        for (let i = 0; i < extensions.length; i++) {
            let extension = extensions[i];
            let extensionDistance = creep.pos.getRangeTo(extension);

            // if closest so far, set it as the target extension
            if (extensionDistance < targetExtensionDistance) {
                creep.memory.resourceTarget = extension;
                targetExtensionDistance = extensionDistance;
            }
        }
    }
    else {
        creep.memory.resourceTarget = Game.spawns[creep.memory.spawner];
    }

    // try to transfer energy to the target
    let result = creep.transfer(creep.memory.resourceTarget, RESOURCE_ENERGY);
    console.log("creep " + creep.name + " is transferring energy to target: " + result);

    // if the target is too far away, move to it
    if (result == ERR_NOT_IN_RANGE) {
        let result = creep.moveTo(creep.memory.resourceTarget);
        console.log("creep " + creep.name + " is moving to target: " + creep.memory.resourceTarget + "   " + result);
    }
    // if the target is full, set the state to TRAVELLING_TO_SOURCE
    else if (result == ERR_FULL) {
        creep.memory.state = 'TRAVELLING_TO_SOURCE';
        console.log("creep " + creep.name + " is travelling to source");
    }
    // if the creep is empty, also go back
    else if (creep.store[RESOURCE_ENERGY] == 0) {
        creep.memory.state = 'TRAVELLING_TO_SOURCE';
        console.log("creep " + creep.name + " is travelling to source");
    }

}

function travelToSource(creep) {
    // try to mine the source
    let result = creep.harvest(creep.memory.targetSource);
    console.log("creep " + creep.name + " is harvesting: " + result);

    // if the creep is not at the target source, move to it
    if (result == ERR_NOT_IN_RANGE) {
        let result = creep.moveTo(creep.memory.targetSource);
        console.log("creep " + creep.name + " is moving to source: " + result);
    }
    if (result == OK) {
        creep.memory.state = 'MINING';
    }
}

function mineSource(creep) {
    // try to mine the source
    let result = creep.harvest(creep.memory.targetSource);
    console.log("creep " + creep.name + " is harvesting: " + result);

    // if the creep is full, set the state to UNLOADING
    if (creep.store.getFreeCapacity() == 0) {
        creep.memory.state = 'UNLOADING';
        console.log("creep " + creep.name + " is unloading");
    }
}

module.exports = roleExcHarvester