class configpanel {
    constructor(instrument) {
        this.instrument = instrument;

        this.settings = {
            brightness: 100,
            glareshiledLight: 0,
            ballast: 50,
            tint: false,
            cover: false,
            navlights: false
        }

        this.unitstore = SimVar.GetSimVarValue("L:UNITS_IMPERIAL","percent");
    }

    initSystemSettings() {
    
        document.querySelectorAll(".lxconfigbtn").forEach((el)=> {
            el.addEventListener("click", function(e) {
                e.stopPropagation();
                let target = this.getAttribute("aria-controls");
                document.getElementById(target).classList.add("active");
            })
        });
    
        document.querySelectorAll(".configpanel_close").forEach((el)=> {
            el.addEventListener("click", function(e) {
                document.querySelectorAll(".configpanel").forEach((el)=>{
                    el.classList.remove("active");
                })
            })
        });
            
        /* Unitswitching on systemspanel - simple buttons, while we don't have anything more sophisticated */
    
        document.getElementById("conf_units_imperial").addEventListener("click", function(e) {
            LXNAV.setUnitPrefs("imperial");
        })
    
        document.getElementById("conf_units_metric").addEventListener("click", function(e) {
            LXNAV.setUnitPrefs("metric");
        })
    
        
        
        
        document.querySelectorAll(".config_toggle .handle").forEach((el)=> {
            el.addEventListener("click", (e)=> {
                let el = e.target.parentNode;
                el.setAttribute("state", (el.getAttribute("state") == "on" ? "off" : "on"));

                if(el.getAttribute("data-var")) { SimVar.SetSimVarValue("L:CANOPY_TOGGLE","bool", !SimVar.GetSimVarValue("L:CANOPY_TOGGLE","bool")) }
            })
        })

        let brightnessrange = new rangeinput(document.querySelector("#brightnesslider"), function(val) { SimVar.SetSimVarValue("L:NAV_BRIGHTNESS", "", val); document.querySelector("#output").innerHTML = val; });
        let glareshiledrange = new rangeinput(document.querySelector("#glareshieldslider"), function(val) { SimVar.SetSimVarValue("A:LIGHT POTENTIOMETER:5", "", val); document.querySelector("#output").innerHTML = val; });
        


        this.systeminitReady = true;
    }

    update() {
        if(!this.systeminitReady) { this.initSystemSettings(); return; }

        let masterunits = SimVar.GetSimVarValue("L:UNITS_IMPERIAL","percent");
        if(this.unitstore != masterunits) {
            if(masterunits == 100) { this.setUnitPrefs("imperial") } else { this.setUnitPrefs("metric") }
            this.unitstore = masterunits;
        }

    }

    setUnitPrefs(sys) {
        // security. We currently only support imp & metric
        sys = sys == "imperial" ? "imperial" : "metric";
        document.getElementById("nav_debug").innerHTML += "Setting: " + sys;
        for(var cat in this.instrument.units) {
            this.instrument.units[cat].pref = this.instrument.units[cat][sys];
            document.getElementById("nav_debug").innerHTML += cat + ": " + this.instrument.units[cat].pref + "<br />";
        }

        SetStoredData("Discus_unitsetting", sys);
        
        if(sys == "imperial") {
            document.getElementById("conf_units_imperial").classList.add("highlighted");
            document.getElementById("conf_units_metric").classList.remove("highlighted");
            SimVar.SetSimVarValue("L:UNITS_IMPERIAL", "percent", 100);
        } else {
            document.getElementById("conf_units_metric").classList.add("highlighted");
            document.getElementById("conf_units_imperial").classList.remove("highlighted");
            SimVar.SetSimVarValue("L:UNITS_IMPERIAL", "percent", 0);
        }
        document.getElementById("nav_debug").innerHTML += "Units set to " + sys;
    }

}


class rangeinput {
    constructor(el, callback) {
        this.rangebg = el;
        this.rail = document.createElement("div");
        this.rail.setAttribute("class","rail");

        this.handle = document.createElement("div");
        this.handle.setAttribute("class", "handle");

        this.interact = document.createElement("div");
        this.interact.setAttribute("class", "interact");

        this.rail.appendChild(this.handle);
        this.rail.appendChild(this.interact);
        el.appendChild(this.rail);

        this.isActive = false;
        this.clickposition = 0;
        this.maxvalue = parseFloat(el.getAttribute("data-max"));
        this.minvalue = parseFloat(el.getAttribute("data-min"));

        this.callback = callback;

        this.outputvalue = el.getAttribute("data-value");

        this.init();
        this.setValue(this.outputvalue);
    }

    init() {
        let thisinput = this;
        thisinput.rail.addEventListener("mousedown", (e)=> {
            thisinput.handle.style.backgroundColor = "#888";
            thisinput.rangebg.style.backgroundColor = "#00d7fe"
            thisinput.clickposition = e.offsetX;
            thisinput.isActive = true;
        })

        thisinput.rail.addEventListener("mouseup", (e)=> {
            thisinput.handle.style.backgroundColor = "#ccc";
            thisinput.rangebg.style.backgroundColor = "transparent";
            thisinput.isActive = false;
        })

        thisinput.rail.addEventListener("mouseleave", (e)=> {
            thisinput.handle.style.backgroundColor = "#ccc";
            thisinput.rangebg.style.backgroundColor = "transparent";
            thisinput.isActive = false;
        })

        thisinput.rail.addEventListener("mousemove", (e) => {
            if(thisinput.isActive) {
                let pos = e.offsetX - thisinput.handle.clientWidth / 2;
                let max = thisinput.rail.clientWidth - thisinput.handle.clientWidth;
                pos = pos < 0 ? 0 : pos;
                pos = pos < max - thisinput.handle.clientWidth / 2 ? pos : max ;

                thisinput.handle.style.left = pos + "px";

                let diff = thisinput.maxvalue - thisinput.minvalue;
                let value = (( pos / max ) * diff) + thisinput.minvalue;
                thisinput.outputvalue = value;

                thisinput.callback(thisinput.outputvalue);
            }
        })
    }

    setValue(val) {
        if(val < this.minvalue || val > this.maxvalue) { return; }
        let diff = this.maxvalue - this.minvalue;
        let max = this.rail.clientWidth - this.handle.clientWidth;
        let pos = (max / diff) * (val - this.minvalue);
        this.handle.style.left = pos + "px";
    }

}
