class soarnet {
    constructor(instrument) {
        this.instrument = instrument; // Reference to main instrument
        this.isActive = false;
        this.currentEvent = "test";
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
            SOARNET.createListener(SN.currentEvent);
            SOARNET.userId = SOARNET.userId == "" ? SOARNET.getUserId(SN.currentEvent) : SOARNET.userId ;
            SN.mpUsername = document.getElementById("username").value;
            SN.isActive = true;
        })

        document.getElementById("addEventLink").addEventListener("click", function(e) {
            e.preventDefault();
            document.getElementById("addEvent").classList.toggle("on");
        })

        document.getElementById("addEvent").addEventListener("submit", function(e) {
            e.preventDefault();
            SN.currentEvent = SOARNET.createEvent({
                "title": document.getElementById("eventtitle").value,
                "start": (Date.now() + 3600000)
            })
            document.querySelector(".mp").classList.remove("notConnected");
            document.getElementById("addEvent").classList.remove("on");
        })

        document.getElementById("disconnect").addEventListener("click",function(e) {
            e.preventDefault();
            console.log("deleting user " + SOARNET.userId + " from event " + SN.currentEvent);
            SOARNET.writeUserData(SN.currentEvent, SOARNET.userId, null);
            SOARNET.detachlistener();
            SN.isActive = false;
            document.querySelector(".mp").classList.add("notConnected");
            document.querySelector("#userlist tbody").innerHTML = "";
        })

        document.getElementById("eventlist").addEventListener("click", function(e) {
            e.preventDefault();
            let el = e.target;
            SN.currentEvent = el.getAttribute("data-id");
            document.querySelector(".mp").classList.remove("notConnected");
        })

        SOARNET.updateEventInfo();
    }

    disconnectedCallback() {
        SOARNET.deleteEventUser(this.currentEvent, this.userId);
    }

    update() {
        if(!B21_SOARING_ENGINE.task_active()) { return; }

        if(this.isActive) {
             
            if(!SOARNET.isSolo) {
                this.updateUserdata();
            } else {
                document.querySelector("#mp_info").innerHTML = "Waiting for pilots to connect";
            }

            SOARNET.displayUserList();
            
            let time_to_start = parseInt((Date.now() - Date.parse(SOARNET.eventDetails[this.currentEvent].start)) / 1000);  
            if (time_to_start < 0 && !B21_SOARING_ENGINE.task_started()) {
                this.instrument.vars.tasktime.value = time_to_start;
            }
        }
    }

    updateUserdata() {
        let taskstate = "not started";
        if(B21_SOARING_ENGINE.task_started()) { taskstate = "started" }
        if(B21_SOARING_ENGINE.task_finished()) { taskstate = "finished" }

        SOARNET.writeUserData(
            this.currentEvent, SOARNET.userId, {
                "username": this.mpUsername,
                "lat":      parseFloat(SimVar.GetSimVarValue("A:PLANE LATITUDE", "degrees latitude")),
                "long":     parseFloat(SimVar.GetSimVarValue("A:PLANE LONGITUDE", "degrees longitude")),
                "hdg":      this.instrument.vars.hdg.value,
                "alt":      this.instrument.vars.alt.value,
                "dist":     B21_SOARING_ENGINE.task.distance_m() - B21_SOARING_ENGINE.task.remaining_distance_m(),
                "avg":      B21_SOARING_ENGINE.task.avg_task_speed_kts(),
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
      list.innerHTML += "<tr><td class='alignright'>" + (el.taskstate == "not started" ? "--" : i) + "</td><td class='mpusername'>" + el.username + "</td><td>" + LXN.displayValue(el.alt, "ft", "alt") + "</td><td class='alignright'>" + LXN.displayValue(el.avg, "kts", "speed") + "</td><td class='alignright'>" + (el.taskstate == "not started" ? "0" : LXN.displayValue(el.dist, "m", "dist")) + "</td></tr>";
      i++;  
    })

    SOARNET.isSolo = i == 2 ? true : false;
  }

SOARNET.updateEventInfo = function() {
    if( document.getElementById("eventlist") == null) { return; }
    let list = document.getElementById("eventlist");
    list.innerHTML = "";

    for(var event in SOARNET.eventDetails) {
        let starttime = new Date(SOARNET.eventDetails[event].start)
        list.innerHTML += '<li><h3>' + SOARNET.eventDetails[event].title + '</h3><p>Startline opens ' + starttime.getHours() + ':' + starttime.getMinutes() + '</p><a href="#" class="eventClickhandler" data-id="' + event + '"></a></li>';
    }
}
