// This file is used in my account of the online MMO Screeps

var roleSpawner = {
    run: function (spawner) {
        set_constants(spawner);

        // fill memory.roles dictionary with all roles and their counts
        // if the role is not in memory.roles, add it with a count of 0
        if (!spawner.memory.roles) {
            spawner.memory.roles = {};
        }

        // go through all creeps in game and add their role to the roles dictionary
        let creeps = Game.creeps;
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

        // if the spawner memory.max_spawns has not been reached, spawn more harvesters
        if (getAllCreeps(spawner) < spawner.memory.max_spawns) {
            spawnRole(spawner, { WORK: 1, CARRY: 1, MOVE: 1 }, 'harvester', 'GETTING_ENERGY');
        }

        // attempt to spawn a new creep and save the result (make the harvester name equal to the number of harvesters so far)
        var result = spawner.spawnCreep([WORK, CARRY, MOVE], 'Harvester' + spawner.memory.harvesters.length, { memory: { role: 'harvester', spawner: spawner.name, state: "GETTING_ENERGY" } });

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
    spawner.memory.max_spawns = 15;
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
            modules.push(module);
        }
    }

    var result = spawner.spawnCreep(modules, role + spawner.memory.roles[role].length, { memory: { role: role, spawner: spawner.name, state: state } });
}


function getAllCreeps(spawner) {
    // get amount of all creeps made from all roles and return the amount total
    //let roles = spawner.memory.roles;
    //let total = 0;
    //for (let role in roles) {
    //    total += roles[role];
    //}
}

module.exports = roleSpawner