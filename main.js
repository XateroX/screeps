// This file is used in my account of the online MMO Screeps

var roleHarvester = require('role.harvester');
var roleSpawner = require('role.spawner');
var roleBuilder = require('role.builder');

let creepRoleMapping = {
    'harvester': roleHarvester
}

module.exports.loop = function () {
    // set all spawners to use the roleSpawner module
    for (var name in Game.spawns) {
        roleSpawner.run(Game.spawns[name]);
    }

    // set all creeps to use the role they are assigned
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        creepRoleMapping[creep.memory.role].run(creep);
    }
}