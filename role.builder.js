// This file is used in my account of the online MMO Screeps

var roleBuilder = {
    run: function (creep) {
        let state = creep.memory.state;
        let currentConstructionSite = creep.memory.currentConstructionSite;
        if (currentConstructionSite == undefined) {
            creep.memory.currentConstructionSite = undefined;
        }

        // META - always check for the least-targeted source --------------------
        // check the spawn this unit comes from (memory.spawn) and see if it is full
        // if it is full, set the state to BUILDING_SPAWN_EXTENSIONS
        // if it is not full, set the state to BUILDING_SOURCE_EXTENSIONS
        var spawn = Game.spawns[creep.memory.spawner];
        var spawnEnergy = spawn.store.getFreeCapacity(RESOURCE_ENERGY);
        var spawnEnergyCapacity = spawn.store.getCapacity(RESOURCE_ENERGY);
        var spawnEnergyPercent = spawnEnergy / spawnEnergyCapacity;

        // if the spawn is full, set the state to BUILDING_SPAWN_EXTENSIONS
        if (spawnEnergyPercent == 0) {
            creep.memory.state = 'BUILDING_SPAWN_EXTENSIONS';
        }
        // if the spawn is not full, set the state to BUILDING_SOURCE_EXTENSIONS
        else {
            creep.memory.state = 'BUILDING_SOURCE_EXTENSIONS';
        }
        // END META -------------------------------------------------------------


        // based on state, execute behaviour
        if (state == 'BUILDING_SPAWN_EXTENSIONS') {
            buildSpawnExtensions(creep, spawn);
        }
        else if (state == 'BUILDING_SOURCE_EXTENSIONS') {
            buildSourceExtensions(creep);
        }

    }
};
function buildSpawnExtensions(creep, spawn) {

}

function buildSourceExtensions(creep) {
    // get all construction sites in the room
    var construction_sites = creep.room.find(FIND_CONSTRUCTION_SITES);

    // if there are any construction sites
    if (construction_sites.length > 0) {
        let result = creep.build(construction_sites[0])
        if (result == ERR_NOT_IN_RANGE) {
            let result = creep.moveTo(construction_sites[0]);
            console.log("creep " + creep.name + " is moving to construction site: " + result);
        }
    }

}

module.exports = roleBuilder