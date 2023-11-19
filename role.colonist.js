
const roleColonist = {
    run: function (creep) {
        if (!creep.memory.targetRoom) {
            creep.memory.targetRoom = creep.room.name;
        }
        //console.log("BEGINNING");
        if (creep.room.name != creep.memory.targetRoom) {
            // using Game.map.findRoute() to get list of exits to go through to get to target room (only call this if creep.memory.movements is empty)
            //console.log("inside creep.room.name != creep.memory.targetRoom");
            if (!creep.memory.movements || creep.memory.movements.length == 0) {
                let result = Game.map.findRoute(creep.room.name, creep.memory.targetRoom);
                //console.log("result of findRoute: " + result);
                if (result != ERR_NO_PATH) {
                    creep.memory.movements = result;
                    //console.log("movements reassigned: " + result);
                }
            }
            for (let i in creep.memory.movements) {
                //console.log(i)
                //console.log(creep.memory.movements[i].room)
            }
            console.log()
            if (creep.room.name == creep.memory.movements[0].room.name) {
                // remove the first element
                creep.memory.movements.shift();
                //console.log("shifted memory to " + creep.memory.movements);
            }

            //console.log("END");

            // move to the exit of the next movement
            result = creep.moveTo(creep.pos.findClosestByRange(creep.memory.movements[0].exit));
        }
    }
};

module.exports = roleColonist;
