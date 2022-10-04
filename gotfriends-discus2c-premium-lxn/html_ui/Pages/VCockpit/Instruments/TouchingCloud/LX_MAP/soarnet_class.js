class soarnet {
    constructor(instrument) {
        this.instrument = instrument; // Reference to main instrument
        this.isActive = false
    }

    init() {
        console.log(SOARNET.eventDetails);


        document.getElementById("mpformsubmit").addEventListener("click", function(e) {
            e.preventDefault();
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
        }
        
    }

    updateUserdata() {
        SOARNET.userId = SOARNET.userId == "" ? SOARNET.getUserId() : SOARNET.userId ;
        SOARNET.writeUserData(
            "test", SOARNET.userId, {
                "username": this.mpUsername,
                "lat":      parseFloat(SimVar.GetSimVarValue("A:PLANE LATITUDE", "degrees latitude")),
                "long":     parseFloat(SimVar.GetSimVarValue("A:PLANE LONGITUDE", "degrees longitude")),
                "hdg":      this.instrument.vars.hdg.value,
                "alt":      this.instrument.vars.alt.value,
                "dist":     B21_SOARING_ENGINE.task.remaining_distance_m(),
                "time":     Math.floor(Date.now() / 1000)
            }
        )
    }

}

SOARNET.displayUserList = function(){
    let list = document.querySelector("#userlist tbody");
    let userList = [];
    let now = Math.floor(Date.now() / 1000);
    list.innerHTML = "";
    
    for (user in SOARNET.eventusers) {
        if(now - parseInt(SOARNET.eventusers[user].time) < 6000) {
            userList.push(SOARNET.eventusers[user]);
            if(typeof(TOPOMAP.addLayer) == "function" && user != this.userId) {
                NAVMAP.paintMultiplayers(user, SOARNET.eventusers[user]);
            }
        } else {
            
        }      
    }

    userList.sort((a,b) => {
      return parseInt(a.dist) - parseInt(b.dist);
    })

    userList.forEach((el, idx) => {
      list.innerHTML += "<tr><td class='alignright'>" + (idx+1) + "</td><td class='mpusername'>" + el.username + "</td><td>" + LXN.displayValue(el.alt, "ft", "alt") + LXN.units.alt.pref + "</td><td class='alignright'>" + LXN.displayValue(el.dist, "m", "dist") + LXN.units.dist.pref + "</td></tr>";
    })
  }

SOARNET.updateEventInfo = function() {
    
}
