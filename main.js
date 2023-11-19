// This file is used in my account of the online MMO Screeps

var roleHarvester = require('role.harvester');
var roleExcHarvester = require('role.exc_harvester');
var roleSpawner = require('role.spawner');
var roleBuilder = require('role.builder');
var roleUpkeep = require('role.upkeep');
var roleColonist = require('role.colonist');

let creepRoleMapping = {
    'harvester': roleHarvester,
    'builder': roleBuilder,
    'exc_harvester': roleExcHarvester,
    'upkeep': roleUpkeep,
    'colonist': roleColonist
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

    for (let spawn in Game.spawns) {
        defendRoom(Game.spawns[spawn].room.name);
    }
}

function defendRoom(roomName) {
    var hostiles = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS);
    if (hostiles.length > 0) {
        var username = hostiles[0].owner.username;
        Game.notify(`User ${username} spotted in room ${roomName}`);
        var towers = Game.rooms[roomName].find(
            FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } });
        towers.forEach(tower => tower.attack(hostiles[0]));
    }
}