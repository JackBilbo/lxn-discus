class soarnet {
    constructor(instrument) {
        this.instrument = instrument; // Reference to main instrument
        this.isActive = false
    }

    init() {
        console.log(SOARNET.eventDetails);


        document.getElementById("mpformsubmit").addEventListener("click", function(e) {
            e.preventDefault();
            if(SOARNET.checkvalue != "isActive") { 
                document.querySelector("#mp_info").innerHTML = "Sorry, system currently not available";
                return false; 
            }
            if(document.getElementById("username").value == "") {
                document.querySelector("#mp_info").innerHTML = "Please enter a username";
                return false; 
            }
            SN.mpUsername = document.getElementById("username").value;
            SN.isActive = true;
            console.log("Username entered");
        })
    }

    disconnectedCallback() {
        SOARNET.deleteEventUser("test", this.userId);
    }

    update() {
        if(!B21_SOARING_ENGINE.task_active()) { return; }

        if(this.isActive) {
            this.updateUserdata();
            SOARNET.displayUserList();

            let time_to_start = parseInt((Date.now() - Date.parse(SOARNET.eventDetails.test.start)) / 1000);  
            if (time_to_start < 0 && !B21_SOARING_ENGINE.task_started()) {
                this.instrument.vars.tasktime.value = time_to_start;
            }

        }
        
    }

    updateUserdata() {
        document.querySelector("#mp_info").innerHTML = "";
        let taskstate = "not started";
        let avg_speed = 0;
        if(B21_SOARING_ENGINE.task_started()) { taskstate = "started"; avg_speed = B21_SOARING_ENGINE.task.avg_task_speed_kts(); }
        if(B21_SOARING_ENGINE.task_finished()) { taskstate = "finished"; avg_speed = B21_SOARING_ENGINE.finish_speed_ms() / 0.51444; }

        SOARNET.userId = SOARNET.userId == "" ? SOARNET.getUserId() : SOARNET.userId ;
        SOARNET.writeUserData(
            "test", SOARNET.userId, {
                "username": this.mpUsername,
                "lat":      parseFloat(SimVar.GetSimVarValue("A:PLANE LATITUDE", "degrees latitude")),
                "long":     parseFloat(SimVar.GetSimVarValue("A:PLANE LONGITUDE", "degrees longitude")),
                "hdg":      this.instrument.vars.hdg.value,
                "alt":      this.instrument.vars.alt.value,
                "dist":     B21_SOARING_ENGINE.task.distance_m() - B21_SOARING_ENGINE.task.remaining_distance_m(),
                "avg":      avg_speed,
                "tasktime": this.instrument.vars.tasktime.value,
                "taskstate":taskstate,
                "time":     Math.floor(Date.now() / 1000)
            }
        )
    }

}

SOARNET.displayUserList = function(){
    let list = document.querySelector("#userlist tbody");
    let userList = [];
    let finisherlist = [];
    let now = Math.floor(Date.now() / 1000);
    list.innerHTML = "";
    
    for (user in SOARNET.eventusers) {
        if(now - parseInt(SOARNET.eventusers[user].time) < 6000) {
            if(SOARNET.eventusers[user].taskstate == "finished") {
                finisherlist.push(SOARNET.eventusers[user]);
            } else {
                if (SOARNET.eventusers[user].taskstate == "not started") { SOARNET.eventusers[user].dist = -1; }
                userList.push(SOARNET.eventusers[user]);
            }
            
            if(typeof(TOPOMAP.addLayer) == "function" && user != this.userId) {
                NAVMAP.paintMultiplayers(user, SOARNET.eventusers[user]);
            }
        }     
    }

    finisherlist.sort((a,b) => {
        return parseInt(a.tasktime) - parseInt(b.tasktime);
      })

    userList.sort((a,b) => {
        return parseInt(b.dist) - parseInt(a.dist);
    })

    let i = 1;

    finisherlist.forEach((el) => {
        list.innerHTML += "<tr><td class='alignright'>" + i + "</td><td class='mpusername'>" + el.username + "</td><td>" + LXN.displayValue(el.alt, "ft", "alt") + "</td><td class='alignright'>" + LXN.displayValue(el.avg, "kts", "speed") + "</td><td class='alignright'>" + LXN.displayValue(el.tasktime,"s","time_of_day") + "</td></tr>";
        i++;
    })

    userList.forEach((el) => {
      list.innerHTML += "<tr><td class='alignright'>" + (el.taskstate == "not started" ? "--" : i) + "</td><td class='mpusername'>" + el.username + "</td><td>" + LXN.displayValue(el.alt, "ft", "alt") + "</td><td class='alignright'>" + (el.taskstate == "not started" ? "-" : LXN.displayValue(el.avg, "kts", "speed")) + "</td><td class='alignright'>" + (el.taskstate == "not started" ? "0" : LXN.displayValue(el.dist, "m", "dist")) + "</td></tr>";
      i++;  
    })
  }

SOARNET.updateEventInfo = function() {
    return false;
}
