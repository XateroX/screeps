// This file is used in my account of the online MMO Screeps

let module_mapping = {
    "WORK": WORK,
    "MOVE": MOVE,
    "CARRY": CARRY,
}

// dict of module priorities for each role
let module_priority_dict = {
    "harvester": ["WORK", "CARRY", "MOVE"],
    "builder": ["WORK", "MOVE"],
    "exc_harvester": ["WORK"],
}

let module_costs_dict = {
    "WORK": 100,
    "MOVE": 50,
    "CARRY": 50,
}

let default_module_dict = {
    "harvester": {
        "WORK": 1,
        "MOVE": 1,
        "CARRY": 1,
    },
    "exc_harvester": {
        "WORK": 1,
        "MOVE": 1,
        "CARRY": 1,
    },
    "builder": {
        "WORK": 1,
        "MOVE": 1,
        "CARRY": 1,
    },
    "upgrader": {
        "WORK": 1,
        "MOVE": 1,
        "CARRY": 1,
    }
}

let target_module_dict = {
    "harvester": {
        "WORK": 5,
        "MOVE": 2,
        "CARRY": 5,
    },
    "exc_harvester": {
        "WORK": 1,
        "MOVE": 1,
        "CARRY": 1,
    },
    "builder": {
        "WORK": 1,
        "MOVE": 1,
        "CARRY": 1,
    },
    "upgrader": {
        "WORK": 1,
        "MOVE": 1,
        "CARRY": 1,
    }
}

let default_state_dict = {
    "harvester": "GETTING_ENERGY",
    "exc_harvester": "TRAVELLING_TO_SOURCE",
    "builder": "GETTING_ENERGY",
    "upgrader": "GETTING_ENERGY",
}

var roleSpawner = {
    run: function (spawner) {
        set_constants(spawner);

        // get all sources in the room in a list in memory if memory.sources doesnt exist
        //console.log(spawner.memory.sources);
        if (!spawner.memory.sources) {
            spawner.memory.sources = {};

            // iterate through all sources and set defaulers
            let all_sources = spawner.room.find(FIND_SOURCES);
            for (let i = 0; i < all_sources.length; i++) {
                let source = all_sources[i];
                spawner.memory.sources[source.id] = {
                    "self": source,
                    "harvesters": [],
                    "spaces": -1,
                }

                // find the number of open spaces around that source
                // find the nearest open space to the source that is at least 2 units from the source
                var open_spaces = spawner.room.lookForAtArea(LOOK_TERRAIN, source.pos.y - 1, source.pos.x - 1, source.pos.y + 1, source.pos.x + 1, true);
                let terrain = new Room.Terrain(spawner.room.name)

                // remove all entries in open_spaces where terrain.get(space.x, space.y) = 1 (where it is not open)
                open_spaces = open_spaces.filter(space => terrain.get(space.x, space.y) == 0)
                spawner.memory.sources[source.id]["spaces"] = open_spaces.length;
            }
        }

        // check all creeps in the room and filter to those targeting each source
        //console.log(spawner.memory.sources);
        let room_creeps = spawner.room.find(FIND_MY_CREEPS);


        // get all creeps for each source and log them with it in memory
        for (let source_id in spawner.memory.sources) {
            let source = spawner.memory.sources[source_id];
            let source_creeps = room_creeps.filter(creep => creep.memory.targetSource == source);
            source["harvesters"] = source_creeps;
        }

        // if a source has too few harvesters, set the next spawn to be a harvester targeting that source
        for (let source_id in spawner.memory.sources) {
            let source = spawner.memory.sources[source_id];
            if (source["harvesters"].length < source["spaces"]) {
                spawner.memory.next_spawn = {
                    "role": "harvester",
                    "targetSource": source,
                }
                break;
            }
        }

        // calculate the next spawn based on the priority modules
        calculate_next_spawn(spawner);
        spawn(spawner);

        // if no construction sites exist that are making extensions, make one more
        var construction_sites = spawner.room.find(FIND_CONSTRUCTION_SITES);
        var extension_construction_sites = construction_sites.filter(site => site.structureType == STRUCTURE_EXTENSION);
        if (extension_construction_sites.length <= 1) {
            createSourceConstructionSite(spawner);
        }
    }
};

function modules_total_cost(module_dict) {
    let total_cost = 0;

    for (let module in module_dict) {
        let count = module_dict[module];
        let module_cost = module_costs_dict[module];
        total_cost += count * module_cost;
    }

    return total_cost;
}

function calculate_next_spawn(spawner) {
    // get the default for the current spawn's role
    let chosen_modules = default_module_dict[spawner.memory.next_spawn.role];

    total_default_cost = modules_total_cost(chosen_modules);

    // get available energy
    available_energy = spawner.room.energyAvailable - total_default_cost;


    // cycle and choose amount of modules based on priority up to a max
    for (module_type in module_priority_dict[spawner.memory.next_spawn.role]) {
        let module_cost = module_costs_dict[module_type];

        // if the module cost is less than the available energy, add it to the default modules
        if (module_cost <= available_energy && chosen_modules[module] < target_module_dict[spawner.memory.next_spawn.role][module_type]) {
            chosen_modules[module] += 1;
            available_energy -= module_cost;
        }
    }

    // set the modules for the next spawn
    spawner.memory.next_spawn.modules = chosen_modules;

    // set the memory for the next spawn
    spawner.memory.next_spawn.state = default_state_dict[spawner.memory.next_spawn.role];
}

function set_constants(spawner) {
    // set constants for the spawner
    spawner.memory.all_role_names = ['harvester', 'exc_harvester', 'builder', 'upgrader'];
    spawner.memory.next_spawn = {};

    module_mapping = {
        "WORK": WORK,
        "MOVE": MOVE,
        "CARRY": CARRY,
    }

    // dict of module priorities for each role
    module_priority_dict = {
        "harvester": ["WORK", "CARRY", "MOVE"],
        "builder": ["WORK", "MOVE"],
        "exc_harvester": ["WORK"],
    }

    module_costs_dict = {
        "WORK": 100,
        "MOVE": 50,
        "CARRY": 50,
    }

    default_module_dict = {
        "harvester": {
            "WORK": 1,
            "MOVE": 1,
            "CARRY": 1,
        },
        "exc_harvester": {
            "WORK": 1,
            "MOVE": 1,
            "CARRY": 1,
        },
        "builder": {
            "WORK": 1,
            "MOVE": 1,
            "CARRY": 1,
        },
        "upgrader": {
            "WORK": 1,
            "MOVE": 1,
            "CARRY": 1,
        }
    }

    target_module_dict = {
        "harvester": {
            "WORK": 5,
            "MOVE": 2,
            "CARRY": 5,
        },
        "exc_harvester": {
            "WORK": 1,
            "MOVE": 1,
            "CARRY": 1,
        },
        "builder": {
            "WORK": 1,
            "MOVE": 1,
            "CARRY": 1,
        },
        "upgrader": {
            "WORK": 1,
            "MOVE": 1,
            "CARRY": 1,
        }
    }

    default_state_dict = {
        "harvester": "GETTING_ENERGY",
        "exc_harvester": "TRAVELLING_TO_SOURCE",
        "builder": "GETTING_ENERGY",
        "upgrader": "GETTING_ENERGY",
    }
}

// function to spawn a certain role creep. Args for how many work, move etc modules to have
function spawn(spawner) {
    // modules to include (multipy work_count by WORK etc)
    let modules = [];

    // for each key in the module_dict, add that many of that module to the modules array
    for (let key in spawner.memory.next_spawn.modules) {
        let module = key;
        let count = module_dict[key];
        for (let i = 0; i < count; i++) {
            modules.push(module_mapping[module]);
        }
    }

    let role = spawner.memory.next_spawn.role;
    let state = spawner.memory.next_spawn.state;
    let memory_dict = { spawner: spawner.name }

    for (let arg in spawner.memory.next_spawn) {
        memory_dict[arg] = spawner.memory.next_spawn[arg];
    }

    // log all the args being used to spawn the creep
    console.log("spawning creep with modules: " + modules);
    console.log("spawning creep with role: " + role);
    console.log("spawning creep with state: " + state);

    // get a random 8 digit number for the name of the creep
    let random_name = Math.floor(Math.random() * 100000000);

    var result = spawner.spawnCreep(modules, role + random_name, { memory: memory_dict });
    console.log("spawning creep with result: " + result);
}


function getAllCreeps(spawner) {
    // get amount of all creeps made from all roles and return the amount total
    let roles = spawner.memory.roles;
    let total = 0;
    for (let role in roles) {
        total += roles[role];
        //console.log(roles[role] + " " + role + "s");
    }
    //console.log(total + " total creeps");
    return total;
}

function createSourceConstructionSite(spawner) {
    // find most targeted source in the room (based on how many creeps have it as target_source)
    // find the nearest construction site to that source
    // move to that construction site and build it
    var creeps = spawner.room.find(FIND_MY_CREEPS);
    var source_dict = {};
    for (let i = 0; i < creeps.length; i++) {
        let creep = creeps[i];
        if (creep.memory.role == 'harvester' || creep.memory.role == 'exc_harvester') {
            let targetSource = creep.memory.targetSource;

            source_dict[targetSource.id] += 1
        }
    }

    // whichever source.id has the largest value in source_dict is the most targeted source
    // find the nearest construction site to that source
    var sources = spawner.room.find(FIND_SOURCES);
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
    var open_spaces = spawner.room.lookForAtArea(LOOK_TERRAIN, targetSource.pos.y - 4, targetSource.pos.x - 5, targetSource.pos.y + 5, targetSource.pos.x + 5, true);
    let terrain = new Room.Terrain(spawner.room.name)
    for (let i = 0; i < open_spaces.length; i++) {
        let space = open_spaces[i]
        ////console.log(space.x, " ", space.y, " ", terrain.get(space.x,space.y))
    }

    // remove all entries in open_spaces where terrain.get(space.x, space.y) = 1
    open_spaces = open_spaces.filter(space => terrain.get(space.x, space.y) == 0)

    // if there are any open spaces
    if (open_spaces.length > 0) {
        // take one at random
        var random_open_space = -1
        var random_open_space = open_spaces[Math.floor(Math.random() * open_spaces.length)];

        //console.log(random_open_space);

        // create a construction site at that location
        var result = spawner.room.createConstructionSite(random_open_space.x, random_open_space.y, STRUCTURE_EXTENSION);
        //console.log("making construction site with result: " + result + " at pos " + random_open_space.x + " " + random_open_space.y);
    }
}



module.exports = roleSpawner