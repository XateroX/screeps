// This file is used in my account of the online MMO Screeps

var roleBuilder = {
    run: function (creep) {
        let state = creep.memory.state;

        // META - always check for the least-targeted source --------------------
        // check the spawn this unit comes from (memory.spawn) and see if it is full
        // if it is full, set the state to BUILDING_SPAWN_EXTENSIONS
        // if it is not full, set the state to BUILDING_SOURCE_EXTENSIONS
        var spawn = Game.spawns[creep.memory.spawner];
        var spawnEnergy = spawn.store.getFreeCapacity(RESOURCE_ENERGY);
        var spawnEnergyCapacity = spawn.store.getCapacity(RESOURCE_ENERGY);
        var spawnEnergyPercent = spawnEnergy / spawnEnergyCapacity;

        // if the spawn is full, set the state to BUILDING_SPAWN_EXTENSIONS
        //if (spawnEnergyPercent == 0) {
        //    creep.memory.state = 'BUILDING_SPAWN_EXTENSIONS';
        //}
        // if the spawn is not full, set the state to BUILDING_SOURCE_EXTENSIONS
        //creep.memory.state = 'BUILDING_SOURCE_EXTENSIONS';
        creep.memory.energySource = spawn;

        // END META -------------------------------------------------------------


        // based on state, execute behaviour
        if (state == 'BUILDING_SPAWN_EXTENSIONS') {
            buildSpawnExtensions(creep, spawn);
        }
        else if (state == 'BUILDING_SOURCE_EXTENSIONS') {
            buildSourceExtensions(creep);
        }
        else if (state == 'GETTING_ENERGY') {
            getEnergy(creep);
            //console.log("creep " + creep.name + " is getting energy");
        }

    }
};
function buildSpawnExtensions(creep, spawn) {

}

function getEnergy(creep) {
    // execute logic of if not full, go to spawn then withdraw energy

    // find the nearest container
    var containers = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_CONTAINER)
        }
    });

    // remove all empty containers
    containers = containers.filter((container) => container.store[RESOURCE_ENERGY] > 0);

    // if there are containers
    if (containers.length > 0) {
        // find the nearest container
        creep.memory.energySource = containers[0];
        var currentContainerDistance = creep.pos.getRangeTo(creep.memory.energySource);

        // find the nearest container
        for (let i = 0; i < containers.length; i++) {
            let container = containers[i];
            let containerDistance = creep.pos.getRangeTo(container);

            // if closest so far, set it as the target source
            if (containerDistance < currentContainerDistance) {
                creep.memory.energySource = container;
                currentContainerDistance = containerDistance;
            }
        }
    } else {
        // check all extensions and see if any are empty
        // if any are empty, set the target to that extension
        // if none are empty, set the target to the spawn
        var extensions = creep.room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_EXTENSION }
        });



        extensions = extensions.filter(extension => extension.store[RESOURCE_ENERGY] > 0);

        if (extensions.length > 0) {
            //console.log("there are extensions that need energy");
            // find the nearest extension
            creep.memory.energySource = extensions[0];
            let targetExtensionDistance = creep.pos.getRangeTo(creep.memory.energySource);

            for (let i = 0; i < extensions.length; i++) {
                let extension = extensions[i];
                let extensionDistance = creep.pos.getRangeTo(extension);

                // if closest so far, set it as the target extension
                if (extensionDistance < targetExtensionDistance) {
                    creep.memory.energySource = extension;
                    targetExtensionDistance = extensionDistance;
                }
            }

            console.log("getting energy from extensions")
        }
        else {
            creep.memory.energySource = Game.spawns[creep.memory.spawner];
        }
    }

    // if the creep is not at the spawn, move to it
    let result = creep.withdraw(creep.memory.energySource, RESOURCE_ENERGY);
    console.log("tried to withdraw with result: " + result)
    if (result == ERR_NOT_IN_RANGE) {
        let result = creep.moveTo(creep.memory.energySource);
        //console.log("creep " + creep.name + " is moving to spawn: " + result);
    }
    if (creep.store.getFreeCapacity() == 0) {
        creep.memory.state = 'BUILDING_SOURCE_EXTENSIONS';
    }
}

function buildSourceExtensions(creep) {
    // get all construction sites in the room
    var construction_sites = creep.room.find(FIND_CONSTRUCTION_SITES);

    // if there are any construction sites
    if (construction_sites.length > 0) {
        let result = creep.build(construction_sites[0])
        if (result == ERR_NOT_IN_RANGE) {
            let result = creep.moveTo(construction_sites[0]);
            //console.log("creep " + creep.name + " is moving to construction site: " + result);
        }

        // if the creep is out of energy, set its state to GETTING_ENERGY
        if (creep.store[RESOURCE_ENERGY] == 0) {
            // if the amount of energy in the room is enough to make a harvester, then you are allowed to take resources
            // from somewhere

            if (creep.room.energyAvailable >= 800) {
                creep.memory.state = 'GETTING_ENERGY';
            }
        }
    } else {
        //console.log("creep " + creep.name + " cannot find any construction sites")
    }

}


module.exports = roleBuilder