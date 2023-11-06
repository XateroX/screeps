// This file is used in my account of the online MMO Screeps

let module_mapping = {
    "WORK": WORK,
    "MOVE": MOVE,
    "CARRY": CARRY,
}

var roleSpawner = {
    run: function (spawner) {
        set_constants(spawner);

        // fill memory.roles dictionary with all roles and their counts
        // if the role is not in memory.roles, add it with a count of 0
        if (!spawner.memory.roles) {
            spawner.memory.roles = {};
        }

        // go through all creeps in game and add their role to the roles dictionary
        let creeps = spawner.room.find(FIND_MY_CREEPS);
        console.log(creeps.length + " creeps in room");
        let all_roles = [];
        for (let name in creeps) {
            let creep = creeps[name];
            let role = creep.memory.role;
            all_roles.push(role);
        }

        spawner.memory.roles = {};

        // reset all role maps in memory to 0
        for (let role in spawner.memory.all_role_names) {
            spawner.memory.roles[role] = 0;
        }

        // count up all roles and make a dict 
        for (let i = 0; i < all_roles.length; i++) {
            let role = all_roles[i];
            if (!spawner.memory.roles[role]) {
                spawner.memory.roles[role] = 0;
            }
            spawner.memory.roles[role] += 1;
        }

        // if the spawner memory.max_spawns has not been reached, spawn more harvesters
        if (getAllCreeps(spawner) < spawner.memory.max_spawns) {
            console.log("spawning another creep");
            spawnRole(spawner, { WORK: 1, CARRY: 1, MOVE: 1 }, 'builder', 'BUILDING_SOURCE_EXTENSIONS');
        }

        // Now going to look for resources and add to memory the reource to later save some meta information about it
        // get all sources in the room
        var sources = spawner.room.find(FIND_SOURCES);

        console.log(sources);

        // if there is no memory.sources, create it
        if (!spawner.memory.sources) {
            spawner.memory.sources = {};
        }

        // for each one add an entry to memory.sources if there isnt one with that source id already
        for (let i = 0; i < sources.length; i++) {
            let source = sources[i];
            console.log(source);
            if (!spawner.memory.sources[source.id]) {
                spawner.memory.sources[source.id] = {
                    id: source.id,
                    harvesters: []
                }
            }
        }
    }
};


function set_constants(spawner) {
    // set constants for the spawner
    spawner.memory.max_spawns = 25;
    spawner.memory.all_role_names = ['harvester', 'builder', 'upgrader'];
}

// function to spawn a certain role creep. Args for how many work, move etc modules to have
function spawnRole(spawner, module_dict, role, state) {
    // modules to include (multipy work_count by WORK etc)
    let modules = [];

    // for each key in the module_dict, add that many of that module to the modules array
    for (let key in module_dict) {
        let module = key;
        let count = module_dict[key];
        for (let i = 0; i < count; i++) {
            modules.push(module_mapping[module]);
        }
    }

    // log all the args being used to spawn the creep
    console.log("spawning creep with modules: " + modules);
    console.log("spawning creep with role: " + role);
    console.log("spawning creep with state: " + state);

    // get a random 8 digit number for the name of the creep
    let random_name = Math.floor(Math.random() * 100000000);

    var result = spawner.spawnCreep(modules, role + random_name, { memory: { role: role, spawner: spawner.name, state: state } });
    console.log("spawning creep with result: " + result);
}


function getAllCreeps(spawner) {
    // get amount of all creeps made from all roles and return the amount total
    let roles = spawner.memory.roles;
    let total = 0;
    for (let role in roles) {
        total += roles[role];
        console.log(roles[role] + " " + role + "s");
    }
    console.log(total + " total creeps");
    return total;
}

function createSourceConstructionSite() {
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



module.exports = roleSpawner