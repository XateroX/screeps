// This file is used in my account of the online MMO Screeps

var roleSpawner = {
    run: function (spawner) {
        // get all creeps which are harvestors that this spawner has spawned
        spawner.memory.harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester' && creep.memory.spawner == spawner.name);

        // attempt to spawn a new creep and save the result (make the harvester name equal to the number of harvesters so far)
        var result = spawner.spawnCreep([WORK, CARRY, MOVE], 'Harvester' + spawner.memory.harvesters.length, { memory: { role: 'harvester', spawner: spawner.name, state: "GETTING_ENERGY" } });
    }
};

module.exports = roleSpawner