
const roleColonist = {
    run: function (creep) {
        if (!creep.memory.targetRoom || creep.memory.targetRoom == 'NONE') {
            creep.memory.targetRoom = creep.room.name;
        }

        if (creep.room.name != creep.memory.targetRoom) {
            // using Game.map.findRoute() to get list of exits to go through to get to target room (only call this if creep.memory.movements is empty)
            if (!creep.memory.movements || creep.memory.movements.length === 0) {
                creep.memory.movements = Game.map.findRoute(creep.room, creep.memory.targetRoom);
            }

            if (creep.room.name != creep.memory.movements[0].room) {
                // remove the first element
                creep.memory.movements.shift();
            }

            // move to the exit of the next movement
            let result = creep.moveTo(creep.pos.findClosestByRange(creep.memory.movements[0].exit));
        }
    }
};

module.exports = roleColonist;
