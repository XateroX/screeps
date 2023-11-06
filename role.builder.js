// This file is used in my account of the online MMO Screeps

var roleBuilder = {
    run: function (creep) {
        let state = creep.memory.state;
        let currentConstructionSite = creep.memory.currentConstructionSite;

        // META - always check for the least-targeted source --------------------
        // check the spawn this unit comes from (memory.spawn) and see if it is full
        // if it is full, set the state to BUILDING_SPAWN_EXTENSIONS
        // if it is not full, set the state to BUILDING_SOURCE_EXTENSIONS
        var spawn = Game.spawns[creep.memory.spawn];
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

function buildSourceExtensions(creep) {
    // find most targeted source in the room (based on how many creeps have it as target_source)
    // find the nearest construction site to that source
    // move to that construction site and build it
    var creeps = creep.room.find(FIND_CREEPS);
    var source_dict = {};
    for (let i = 0; i < creeps.length; i++) {
        let creep = creeps[i];
        let targetSource = creep.memory.targetSource;

        source_dict[targetSource.id] += 1
    }

    // whichever source.id has the largest value in source_dict is the most targeted source
    // find the nearest construction site to that source
    var sources = creep.room.find(FIND_SOURCES);
    var targetSource = sources[0];

    // find the most targeted source
    for (let i = 0; i < sources.length; i++) {
        let source = sources[i];
        let source_id = source.id;
        let source_target_count = source_dict[source_id];

        if (source_target_count > source_dict[targetSource.id]) {
            targetSource = source;
        }
    }

    if (creep.memory.currentConstructionSite == undefined) {
        // find the nearest open space to the source that is at least 2 units from the source
        var open_spaces = creep.room.lookForAtArea(LOOK_TERRAIN, targetSource.pos.y - 2, targetSource.pos.x - 2, targetSource.pos.y + 2, targetSource.pos.x + 2, true);
        console.log(open_spaces);

        // if there are any open spaces
        if (open_spaces.length > 0) {
            // take one at random
            var random_open_space = open_spaces[Math.floor(Math.random() * open_spaces.length)];
            console.log(random_open_space);

            // create a construction site at that location
            var result = creep.room.createConstructionSite(random_open_space.x, random_open_space.y, STRUCTURE_EXTENSION);
            console.log("making construction site with result: " + result);
        }
    }

    // go to current construction site and build it
    var result = creep.build(creep.memory.currentConstructionSite);
    if (result == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.memory.currentConstructionSite);
    }
}

module.exports = roleHarvester