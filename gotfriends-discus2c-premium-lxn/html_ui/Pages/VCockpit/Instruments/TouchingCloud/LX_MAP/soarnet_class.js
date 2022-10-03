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
        }
        
    }

    updateUserdata() {
        this.userId = this.userId == null ? SOARNET.getUserId() : this.userId ;
        SOARNET.writeUserData(
            "test", this.userId, {
                "username": this.mpUsername,
                "lat":      parseFloat(SimVar.GetSimVarValue("A:PLANE LATITUDE", "degrees latitude")),
                "long":     parseFloat(SimVar.GetSimVarValue("A:PLANE LONGITUDE", "degrees longitude")),
                "hdg":      this.instrument.vars.hdg.value,
                "alt":      this.instrument.vars.alt.value,
                "dist":     (B21_SOARING_ENGINE.task.remaining_distance_m() / 1000).toFixed(2),
                "time":     Math.floor(Date.now() / 1000)
            }
        )
    }

}

SOARNET.displayUserList = function(){
    let list = document.querySelector("#userlist");
    let userList = [];
    let now = Math.floor(Date.now() / 1000);
    list.innerHTML = "";
    
    for (user in SOARNET.eventusers) {
        if(now - parseInt(SOARNET.eventusers[user].time) < 60) {
            userList.push(SOARNET.eventusers[user]);

            if(typeof(TOPOMAP.addLayer) == "function" && user != this.userId) {
                NAVMAP.paintMultiplayers(user, SOARNET.eventusers[user]);
            }
        } else {
            SOARNET.deleteEventUser("test", user);
        }      
    }

    userList.sort((a,b) => {
      return parseInt(a.dist) - parseInt(b.dist);
    })

    userList.forEach((el) => {
      list.innerHTML += "<li>" + el.username +  " (" + el.dist + " km)</li>";
    })
  }

SOARNET.updateEventInfo = function() {
    
}
