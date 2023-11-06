// This file is used in my account of the online MMO Screeps

var roleBuilder = {
    run: function (creep) {
        let state = creep.memory.state;
        let currentConstructionSite = creep.memory.currentConstructionSite;

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
    // find most targeted source in the room (based on how many creeps have it as target_source)
    // find the nearest construction site to that source
    // move to that construction site and build it
    var creeps = creep.room.find(FIND_MY_CREEPS);
    var source_dict = {};
    for (let i = 0; i < creeps.length; i++) {
        let creep = creeps[i];
        if (creep.memory.role == 'harvester') {
            let targetSource = creep.memory.targetSource;

            source_dict[targetSource.id] += 1
        }
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
        let terrain = new Room.Terrain(creep.room.name)
        for (let i = 0; i < open_spaces.length; i++) {
            let space = open_spaces[i]
            //console.log(space.x, " ", space.y, " ", terrain.get(space.x,space.y))
        }

        // remove all entries in open_spaces where terrain.get(space.x, space.y) = 1
        open_spaces = open_spaces.filter(space => terrain.get(space.x, space.y) == 0)

        // if there are any open spaces
        if (open_spaces.length > 0) {
            // take one at random
            var random_open_space = -1
            var random_open_space = open_spaces[Math.floor(Math.random() * open_spaces.length)];

            console.log(random_open_space);

            // create a construction site at that location
            var result = creep.room.createConstructionSite(random_open_space.x, random_open_space.y, STRUCTURE_EXTENSION);
            console.log("making construction site with result: " + result + " at pos " + random_open_space.x + " " + random_open_space.y);

            // if createConstructionSite returns OK, set currentConstructionSite to that construction site
            if (result == OK) {
                creep.memory.currentConstructionSite = creep.room.lookForAt(LOOK_CONSTRUCTION_SITES, random_open_space.x, random_open_space.y)[0];
            }
        }
    }

    // go to current construction site and build an extension on it
    if (creep.memory.currentConstructionSite != undefined) {
        let result = creep.build(creep.memory.currentConstructionSite);
        console.log("creep " + creep.name + " is building construction site: " + result);
        if (result == ERR_NOT_IN_RANGE) {
            let result = creep.moveTo(creep.memory.currentConstructionSite);
            console.log("creep " + creep.name + " is moving to construction site: " + result);
        }
        else if (result == ERR_INVALID_TARGET) {
            creep.memory.currentConstructionSite = undefined;
        }
    }
}

module.exports = roleBuilder