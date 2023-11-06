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
        creep.memory.state = 'BUILDING_SOURCE_EXTENSIONS';

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

    // if the creep is not at the spawn, move to it
    let result = creep.withdraw(Game.spawns[creep.memory.spawner], RESOURCE_ENERGY);
    if (result == ERR_NOT_IN_RANGE) {
        let result = creep.moveTo(Game.spawns[creep.memory.spawner]);
        //console.log("creep " + creep.name + " is moving to spawn: " + result);
    }
    if (creep.store.getFreeCapacity() == 0) {
        creep.memory.state = 'BUILDING_SPAWN_EXTENSIONS';
        //console.log("creep " + creep.name + " is full");
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
            creep.memory.state = 'GETTING_ENERGY';
            //console.log("creep " + creep.name + " is out of energy");
        }
    } else {
        //console.log("creep " + creep.name + " cannot find any construction sites")
    }

}

module.exports = roleBuilder