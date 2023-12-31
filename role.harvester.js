// This file is used in my account of the online MMO Screeps

var roleHarvester = {
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

        // if the target source has more than 10 harvesters targetting it, set the target 
        // to a source in a different room

        // get the number of harvesters targetting the target source
        //let targetSourceName = targetSource.id;
        // let targetSourceTargetedBy = _.filter(Game.creeps, (creep) => creep.memory.targetSource == targetSourceName);

        // if (targetSourceTargetedBy.length > 10) {
        //     //console.log("target source is too busy");
        //     // find the nearest source in a different room

        //     // get the room two north from the creeps room
        //     let targetRoomName = "E53N23";

        //     // get sources in that room
        //     let targetRoom = Game.rooms[targetRoomName];
        //     let targetSources = targetRoom.find(FIND_SOURCES);

        //     if (targetSources.length > 0) {
        //         console.log("!!!!!!!!!!!!!!!!!!!found a source in a different room");
        //         creep.memory.targetSource = targetSources[0];
        //     }
        // }
        // END META -------------------------------------------------------------


        // if the creeps state is GETTING_ENERGY, move to the source and harvest from it
        if (state == 'GETTING_ENERGY') {
            getEnergy(creep);
            //console.log("creep " + creep.name + " is getting energy");
        }
        else if (state == 'RETURNING_ENERGY') {
            returnEnergy(creep);
            //console.log("creep " + creep.name + " is returning energy");
        }
        else if (state == 'GIVING_TO_RCL') {
            giveToRCL(creep);
            //console.log("creep " + creep.name + " is giving energy to the RCL");
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
        //console.log("creep " + creep.name + " is full");
    }
}

function returnEnergy(creep) {
    // check all extensions and see if any are empty
    // if any are empty, set the target to that extension
    // if none are empty, set the target to the spawn


    var extensions = creep.room.find(FIND_MY_STRUCTURES, {
        filter: { structureType: STRUCTURE_EXTENSION }
    });

    extensions = extensions.filter(extension => extension.store.getFreeCapacity(RESOURCE_ENERGY) > 0);

    if (extensions.length > 0) {
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
        // find the nearest container
        var containers = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_STORAGE)
            }
        });

        // if there are containers
        if (containers.length > 0) {
            // find the nearest container
            creep.memory.resourceTarget = containers[0];
            var currentContainerDistance = creep.pos.getRangeTo(creep.memory.resourceTarget);

            // find the nearest container
            for (let i = 0; i < containers.length; i++) {
                let container = containers[i];
                let containerDistance = creep.pos.getRangeTo(container);

                // if closest so far, set it as the target source
                if (containerDistance < currentContainerDistance) {
                    creep.memory.resourceTarget = container;
                    currentContainerDistance = containerDistance;
                }
            }
        } else {
            creep.memory.resourceTarget = Game.spawns[creep.memory.spawner];
        }
    }


    // if the creep is not at the target spawn, move to it
    let result = creep.moveTo(creep.memory.resourceTarget);
    //console.log("creep " + creep.name + " is moving to target: " + creep.memory.resourceTarget + "   " + result);


    result = creep.transfer(creep.memory.resourceTarget, RESOURCE_ENERGY);
    //console.log("creep " + creep.name + " is transferring energy: " + result);

    // if the spawner is full, set state to GIVING_TO_RCL
    if (result == ERR_FULL) {
        creep.memory.state = 'GIVING_TO_RCL';
        //console.log("creep " + creep.name + " is giving to RCL");
    }

    // if the creep is empty, change its state to GETTING_ENERGY
    if (creep.store.getUsedCapacity() == 0) {
        creep.memory.state = 'GETTING_ENERGY';
        //console.log("creep " + creep.name + " is empty");
    }
}

function giveToRCL(creep) {
    // transfer energy to it
    let result = creep.upgradeController(creep.room.controller);
    //console.log(result + " while trying to upgrade")
    if (result == ERR_NOT_IN_RANGE) {
        let result = creep.moveTo(creep.room.controller);
        //console.log("creep " + creep.name + " is moving to RCL: " + result);
    }
    if (creep.store.getUsedCapacity() == 0) {
        creep.memory.state = 'GETTING_ENERGY';
        //console.log("creep " + creep.name + " is empty");
    }
}

module.exports = roleHarvester