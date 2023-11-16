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

let default_state_dict = {
    "harvester": "GETTING_ENERGY",
    "exc_harvester": "TRAVELLING_TO_SOURCE",
    "builder": "GETTING_ENERGY",
    "upgrader": "GETTING_ENERGY",
}

function sum_module_costs(module_dict) {
    total_cost = 0;

    for (let module in module_dict) {
        let count = module_dict[module];
        let cost = module_costs_dict[module];
        total_cost += count * cost;
    }

    return total_cost;
}

var roleSpawner = {
    run: function (spawner) {
        set_constants(spawner);

        //console.log(spawner.memory.all_role_names)

        // fill memory.roles dictionary with all roles and their counts
        // if the role is not in memory.roles, add it with a count of 0
        spawner.memory.roles = {};

        // reset all role maps in memory to 0
        for (let role in spawner.memory.all_role_names) {
            role = spawner.memory.all_role_names[role]
            spawner.memory.roles[role] = 0;
        }

        for (let role in spawner.memory.roles) {
            //console.log(role + " -> " + spawner.memory.roles[role])
        }

        // go through all creeps in game and add their role to the roles dictionary
        let creeps = spawner.room.find(FIND_MY_CREEPS);
        //console.log(creeps.length + " creeps in room");
        let all_roles = [];
        for (let name in creeps) {
            let creep = creeps[name];
            let role = creep.memory.role;
            all_roles.push(role);
        }



        // count up all roles and make a dict 
        for (let i = 0; i < all_roles.length; i++) {
            let role = all_roles[i];
            if (!spawner.memory.roles[role]) {
                spawner.memory.roles[role] = 0;
            }
            spawner.memory.roles[role] += 1;
        }

        // for each role if the count is less than the max, spawn another creep
        for (let role in spawner.memory.all_role_names) {
            role = spawner.memory.all_role_names[role]
            let count = spawner.memory.roles[role];
            let max = spawner.memory.max_spawns[role];

            //console.log("spawner considering role " + role)

            if (count < max) {
                //console.log("too few " + role + ", spawning one more")
                // get the module dict for that role

                // get the spare resrouces available beyond the cost of the creep and the cost of the default modules
                let spare_resources = spawner.room.energyAvailable - sum_module_costs(default_module_dict[role]);

                // by splitting the spare resources evenly between the priority modules, we can get the number of each module to add
                let priority_modules = module_priority_dict[role];

                console.log("priority modules");
                for (let i = 0; i < priority_modules.length; i++) {
                    console.log(priority_modules[i]);
                }

                // get the cost of each module by name
                let module_costs = [];
                for (let i = 0; i < priority_modules.length; i++) {
                    let current_module = priority_modules[i];
                    let cost = module_costs_dict[current_module];
                    console.log(current_module + " costs " + cost);
                    module_costs.push(cost);
                }

                // sum the costs in module_costs
                total_module_cost = 0;
                for (let i = 0; i < module_costs.length; i++) {
                    let cost = module_costs[i];
                    total_module_cost += cost;
                }

                // divide the spare resources by the total module cost to get the number of each module to add
                // also max() the value so it cannot co below 0
                amount_of_priority_modules = Math.max(Math.floor(spare_resources / total_module_cost), 0);

                console.log("spare resources: " + spare_resources);
                console.log("total module cost: " + total_module_cost);
                console.log("amount_of_priority_modules: " + amount_of_priority_modules);

                for (let c_mod in default_module_dict[role]) {
                    console.log(c_mod + " default is " + default_module_dict[role][c_mod])

                }
                module_dict = default_module_dict[role];

                for (let i = 0; i < priority_modules.length; i++) {
                    let module = priority_modules[i];
                    module_dict[module] += amount_of_priority_modules;
                    console.log("added " + amount_of_priority_modules + " to " + module + " to get " + module_dict[module])
                }

                let state = default_state_dict[role];
                spawnRole(spawner, module_dict, role, state);
                break;
            }
        }

        // Now going to look for resources and add to memory the reource to later save some meta information about it
        // get all sources in the room
        var sources = spawner.room.find(FIND_SOURCES);

        //console.log(sources);

        // if there is no memory.sources, create it
        if (!spawner.memory.sources) {
            spawner.memory.sources = {};
        }

        // for each one add an entry to memory.sources if there isnt one with that source id already
        for (let i = 0; i < sources.length; i++) {
            let source = sources[i];
            //console.log(source);
            if (!spawner.memory.sources[source.id]) {
                spawner.memory.sources[source.id] = {
                    id: source.id,
                    harvesters: []
                }
            }
        }

        // if no construction sites exist that are making extensions, make one more
        var construction_sites = spawner.room.find(FIND_CONSTRUCTION_SITES);
        var extension_construction_sites = construction_sites.filter(site => site.structureType == STRUCTURE_EXTENSION);
        if (extension_construction_sites.length <= 1) {
            createSourceConstructionSite(spawner);
            console.log("not building atm")
        }
    }
};


function set_constants(spawner) {
    // set constants for the spawner
    spawner.memory.max_spawns = {
        'harvester': 7,
        'exc_harvester': 0,
        'builder': 1,
    };
    spawner.memory.all_role_names = ['harvester', 'exc_harvester', 'builder', 'upgrader'];

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
            "WORK": 3,
            "MOVE": 3,
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

    // remove all entries that are within 2 units of the source
    open_spaces = open_spaces.filter(space => targetSource.pos.getRangeTo(space.x, space.y) >= 2)

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