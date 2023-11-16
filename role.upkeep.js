// This file is used in my account of the online MMO Screeps

var roleUpkeep = {
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
        if (state == 'UPKEEP_TOWER') {
            findAndUpkeepTowers(creep, spawn);
        }
        else if (state == 'GETTING_ENERGY') {
            getEnergy(creep);
            //console.log("creep " + creep.name + " is getting energy");
        }

    }
};

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
        creep.memory.state = 'UPKEEP_TOWER';
    }
}

function findAndUpkeepTowers(creep) {
    // get all towers in the room
    var towers = creep.room.find(FIND_MY_STRUCTURES, {
        filter: { structureType: STRUCTURE_TOWER }
    });

    // filter to those with less than 500 energy
    towers = towers.filter(tower => tower.store[RESOURCE_ENERGY] < 500);

    // if there are towers that need energy
    if (towers.length > 0) {
        // find the nearest tower
        creep.memory.upkeepTarget = towers[0];
        let targetTowerDistance = creep.pos.getRangeTo(creep.memory.upkeepTarget);

        for (let i = 0; i < towers.length; i++) {
            let tower = towers[i];
            let towerDistance = creep.pos.getRangeTo(tower);

            // if closest so far, set it as the target tower
            if (towerDistance < targetTowerDistance) {
                creep.memory.upkeepTarget = tower;
                targetTowerDistance = towerDistance;
            }
        }

        // if the creep is not at the tower, move to it
        let result = creep.moveTo(creep.memory.upkeepTarget);
        //console.log("creep " + creep.name + " is moving to tower: " + result);

        // if the creep is at the tower, transfer energy
        if (result == OK) {
            result = creep.transfer(creep.memory.upkeepTarget, RESOURCE_ENERGY);
            //console.log("creep " + creep.name + " is transferring energy: " + result);
        }
    }
}


module.exports = roleUpkeep