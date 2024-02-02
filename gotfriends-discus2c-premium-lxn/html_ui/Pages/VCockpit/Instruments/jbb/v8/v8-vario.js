class v8_varioclass extends BaseInstrument {
    constructor() {
        super();

        this.u = {
            "metric": {
                "verticalspeed": "meters per second",
                "speed": "kph"
            },
            "imperial": {
                "verticalspeed": "knots",
                "speed": "knots"
            }
        }
    }

    get templateID() { return "v8-vario"; }

    get isInteractive() { return true;}

    connectedCallback() {
        super.connectedCallback();

        this.root = document.getElementById("v8");

        this.units = "metric";
        this.scale = "straight";
        
        this.variomode = "te";
        this.averager = .5; // number of seconds (approx.) to calculate rolling average for needle smoothing
        this.avgvalues = []; // array to sore values for averager
        this.liftsmoother = []; // array to smooth out current value
        this.windsmoother = 0; // variable to smooth out current vertical wind

        this.datafield1 = this.root.querySelector(".data1");
        this.datafield2 = this.root.querySelector(".data2");
        this.datafield3 = this.root.querySelector(".data3");
        this.datafield4 = this.root.querySelector(".data4");

        this.currentarrow = this.root.querySelector(".current");
        this.averagearrow = this.root.querySelector(".average");
        this.mcmarker = this.root.querySelector(".mcmarker");
        this.windarrow = this.root.querySelector(".wind");
        this.lastthermalaverage = this.root.querySelector(".lastthermalaverage");

        this.avgarc = this.root.querySelector("#arc");
        this.avgpath = this.root.querySelector("#arc path");
        this.innerRadius = 224 / 2 - 4;

        this.aihorizon = this.root.querySelector(".horizon");
        this.aiscale = this.root.querySelector(".ai_scale");

        this.horizontalwindspeed = 0;
        this.horizontalwindspeedsmoother = 0;
        this.horizontalwindspeedaverage = [];

        this.horizontalwinddirection = 0;
        this.horizontalwinddirectionsmoother = 0;
        this.horizontalwinddirectionaverage = [];

        this.verticalwind = 0;
        this.verticalwindsmoother = [];

        this.speedtape = this.root.querySelector(".speedtape");
        this.overspeed = this.root.querySelector(".overspeed");
        this.highspeed = this.root.querySelector(".highspeed");
        this.maneuver = this.root.querySelector(".maneuver");
        this.stallspeed = this.root.querySelector(".stallspeed");
        this.stfmarker = this.speedtape.querySelector(".stfmarker");

        this.hawkcurrent = this.root.querySelector("#arrow_current");
        this.hawkaverage = this.root.querySelector("#arrow_avg");

        this.hawkaveragenumbers = this.root.querySelector("#hawk .numbers.avg");
        this.hawkcurrentnumbers = this.root.querySelector("#hawk .numbers.current");

        this.isBusy = false;

        this.screens = [
            this.root.querySelector("#datafields"),
            this.root.querySelector("#hawk"),
            this.root.querySelector("#attitude"),
            this.root.querySelector("#stfinfo"),
            this.root.querySelector("#smoothing")
        ]
        this.currentScreen = 0;

        this.buildScale();
        this.buildSpeedtape();
        this.isInit = true;

        document.addEventListener("keydown", (e) => {
            if(e.altKey) {
                if(e.keyCode == 65) {
                    this.pageUp();
                }

                if(e.keyCode == 83) {
                    this.pageDown();
                }
            }
        })

        let savedsmoothing = GetStoredData("Discus_variosmoothing") != "" ? parseInt(GetStoredData("Discus_variosmoothing")) : 1;  
        SimVar.SetSimVarValue("L:VARIO_SMOOTHING", "number", savedsmoothing);

        this.smoothingrange = new rangeinput(document.querySelector("#smoothingslider"), function(val) { 
            SimVar.SetSimVarValue("L:VARIO_SMOOTHING", "number", Math.round(val));
            SetStoredData("Discus_variosmoothing", val.toFixed(0)) 
        });
        
        this.smoothingrange.setValue(savedsmoothing);
        document.querySelector("#smoothing").style.display = "none";
        
        document.getElementById("vignettage").style.border = "1px solid transparent";

        this.registerKeyListeners();
    }

    pageUp() {
        this.screens[this.currentScreen].style.display = "none";
        this.currentScreen = this.currentScreen > 0 ? this.currentScreen - 1 : this.screens.length - 1;
        this.screens[this.currentScreen].style.display = "block";
    }

    pageDown() {
        this.screens[this.currentScreen].style.display = "none";
        this.currentScreen = this.currentScreen < this.screens.length - 1 ? this.currentScreen + 1 : 0;
        this.screens[this.currentScreen].style.display = "block";
    }

    showPage(p) {
        if(p<this.screens.length - 1) {
            this.currentScreen = p;
            this.screens.forEach((screen) => { screen.style.display = "none"});
            this.screens[this.currentScreen].style.display = "block";
        }
    }

    Update() {
        if(!this.isInit) { return; }
        this.currentUnit = SimVar.GetSimVarValue("L:UNITS_IMPERIAL","percent") == 100 ? "imperial" : "metric";

        if(this.units != this.currentUnit) {
            // if units to display have changed, rebuild the scale
            console.log("Units now " + this.currentUnit);
            this.units = this.currentUnit;
            this.horizontalwindspeedaverage = [];
            this.avgvalues = []
            this.root.querySelector(".currentUnit span").innerHTML = this.units == "metric" ? "m/s" : "kts";
            this.buildScale();
            this.buildSpeedtape();
        }

        if(SimVar.GetSimVarValue("L:S80_UP_BUTTON","number") == 1) {
            SimVar.SetSimVarValue("L:S80_UP_BUTTON","number", 0);
            this.pageUp();
        };

        if(SimVar.GetSimVarValue("L:S80_MODE","bool") != this.s80mode) {
            this.s80mode = SimVar.GetSimVarValue("L:S80_MODE","bool");
            this.scale = this.s80mode == "1" ? "log" : "straight";
            this.buildScale(); 
        };

        if(SimVar.GetSimVarValue("L:S80_DOWN_BUTTON","number") == 1) {
            SimVar.SetSimVarValue("L:S80_DOWN_BUTTON","number", 0);
            this.pageDown();
        };

        let vm = SimVar.GetSimVarValue("L:VARIO_MODE","percent") == 0 ? "stf" : "te";
        if(this.variomode != vm) {
            this.setVariomode(vm);
        }

        let current_te, lastthermalaverage;

        if(this.units == "metric") {
            current_te = SimVar.GetSimVarValue("L:TOTAL ENERGY", "meters per second");
            lastthermalaverage = SimVar.GetSimVarValue("L:JBB_TRU_AVG_CLIMB","meters per second");
        } else {
            current_te = SimVar.GetSimVarValue("L:TOTAL ENERGY", "knots");
            lastthermalaverage = SimVar.GetSimVarValue("L:JBB_TRU_AVG_CLIMB","knots");
        }

        let currentvalue = this.updatecurrent(current_te);
        let averagevalue = this.updateaverage(currentvalue);

        this.updateWinddata();

        if(this.variomode == "te") {
            this.currentarrow.style.transform = "rotate(" + this.calcAngle(Math.max( -this.maxScale, Math.min(this.maxScale, currentvalue))) + "deg)";
            this.averagearrow.style.transform = "rotate(" + this.calcAngle(Math.max( -this.maxScale, Math.min(this.maxScale, averagevalue))) + "deg)";
            this.lastthermalaverage.style.transform = "rotate(" + this.calcAngle(Math.max( -this.maxScale, Math.min(this.maxScale, lastthermalaverage))) + "deg)";
            this.windarrow.style.transform = "rotate(" + this.calcAngle(Math.max( -this.maxScale, Math.min(this.maxScale, this.verticalwind))) + "deg)";
            this.mcmarker.style.transform = "rotate(" + this.calcAngle( SimVar.GetSimVarValue("L:BEZEL_CAL","percent") / (this.units == "metric" ? 20 : 10) ) + "deg)";
        } else if (this.variomode == "stf") {
            let stf_error = SimVar.GetSimVarValue("A:AIRSPEED INDICATED", "knots") - SimVar.GetSimVarValue("L:JBB_STF_DYNAMIC","knots");
            
            let stf_error_disp = this.units == "metric" ? stf_error * 1.852 : stf_error;
            this.currentarrow.style.transform = "rotate(" + this.calcAngle(Math.max( -this.maxScale, Math.min(this.maxScale, stf_error_disp))) + "deg)";

            if ( Math.abs(stf_error ) < 1.5) { stf_error = 0; }
            SimVar.SetSimVarValue("L:JBB_STF_TONE", "number", stf_error * 2500 / 20);
        }
        
        if(this.currentScreen == 0) { this.updateDatafields(currentvalue,averagevalue); }
        if(this.currentScreen == 1) { this.updateHawk(); }
        if(this.currentScreen == 2) { this.updateAttitude(); }
        if(this.currentScreen == 3) { this.updateSTFdatafields(); }
    }

    toggleVariomode() {
        this.isBusy = true;
        // window.setTimeout(()=> { this.isBusy = false; }, 500);

        if(this.variomode == "stf") {
            this.setVariomode("te");
        } else {
            this.setVariomode("stf");
        }
    }

    setVariomode(vm) {
        console.log("setting Variomode " + vm);
        this.variomode = vm;
        if(vm == "stf") {
            this.root.classList.add("stfmode");
            this.showPage(3);
            this.buildScale();

            this.root.querySelector(".currentUnit span").innerHTML = this.units == "metric" ? "kmh" : "kts";
            this.root.querySelector(".currentMode span").innerHTML = "STF";
            
            SimVar.SetSimVarValue("L:VARIO_STF_MODE","number", 1);
            SimVar.SetSimVarValue("L:VARIO_MODE","number",0);
        } else {
            this.root.classList.remove("stfmode");
            this.showPage(0);
            this.avgvalues = [0];
            this.liftsmoother = [];
            this.buildScale();

            this.root.querySelector(".currentUnit span").innerHTML = this.units == "metric" ? "m/s" : "kts";
            this.root.querySelector(".currentMode span").innerHTML = "TE";

            SimVar.SetSimVarValue("L:VARIO_STF_MODE","number", 0);
            SimVar.SetSimVarValue("L:VARIO_MODE","number",100);
        }
        this.isBusy = false;
    }

    updatecurrent(currentvalue) {
        this.liftsmoother.push(parseFloat(currentvalue));

        let limit = SimVar.GetSimVarValue("L:VARIO_SMOOTHING", "number") > 0 ? SimVar.GetSimVarValue("L:VARIO_SMOOTHING", "number") : 0.2;
        
        while(this.liftsmoother.length > limit * 18) { this.liftsmoother.shift(); }

        return this.liftsmoother.reduce((a, b) => a + b, 0) / this.liftsmoother.length;
    }    

    updateaverage(currentvalue) {
        this.avgvalues.push(parseFloat(currentvalue));

        // let limit = SimVar.GetSimVarValue("L:VARIO_SMOOTHING", "number") > 0 ? SimVar.GetSimVarValue("L:VARIO_SMOOTHING", "number") : 1;
        while(this.avgvalues.length > 180) { this.avgvalues.shift() }

        let min = Math.min(...this.avgvalues);
        let max = Math.max(...this.avgvalues);
        
        let minangle = Math.max(-210, Math.min(30, this.calcAngle(min)));
        let maxangle = Math.max(-210, Math.min(30, this.calcAngle(max)));

        if(((maxangle + 360) - (minangle + 360)) > 179) {
            if(currentvalue > 0) { minangle = maxangle - 179 }
            else { maxangle = minangle + 179 }
        }

        let minX = (this.innerRadius + 4) + this.innerRadius * (Math.cos((minangle-90) * Math.PI / 180.0));
        let minY = (this.innerRadius + 4) + this.innerRadius * (Math.sin((minangle-90) * Math.PI / 180.0));
        let maxX = (this.innerRadius + 4) + this.innerRadius * (Math.cos((maxangle-90) * Math.PI / 180.0));
        let maxY = (this.innerRadius + 4) + this.innerRadius * (Math.sin((maxangle-90) * Math.PI / 180.0));

        let path = "M " + minX + " " + minY + " A " + this.innerRadius + " " + this.innerRadius + " 0 0 1 " + maxX + " " + maxY

        this.avgpath.setAttribute("d",path);

        return this.avgvalues.reduce((a, b) => a + b, 0) / this.avgvalues.length;
    }

    buildScale() {
        let step;
        if(this.variomode == "stf") {
            this.maxScale = this.units == "metric" ? 25 : 25;
            step = this.units == "metric" ? 5 : 5;
        } else {
            this.maxScale = this.units == "metric" ? 5 : 10;
            step = this.units == "metric" ? 0.5 : 1;
        }
        

        this.root.querySelector(".scale").innerHTML = "";

        if(this.maxScale == 10) { this.root.querySelector(".scale").classList.add("imperial"); } else { this.root.querySelector(".scale").classList.remove("imperial"); }
        if(this.scale == "log") { this.root.querySelector(".scale").classList.add("log"); } else { this.root.querySelector(".scale").classList.remove("log"); }

        for(let i = -this.maxScale; i <= this.maxScale; i = i + step) {
            let angle = this.calcAngle(i);
            let tickclass = "";
            if(i%1 != 0) { tickclass = "halftick" }
            if(i%2 == 0) { tickclass += "even" }

            this.root.querySelector(".scale").innerHTML += '<div class="arrow tick ' + tickclass + '" style="transform: rotate(' + angle + 'deg)"><span class="number" style="transform: rotate(' + (angle * -1) + 'deg)">' + Math.abs(i) + '</span></div>';
        }

        this.root.querySelector(".ai_scale").innerHTML = "";
        for(let i = -20; i <= 20; i = i + 2.5) {
            let tickclass = "";
            
            if(i%5) { tickclass = "medium" }
            if(i%10 == 0 || i == 0) { tickclass = "hasnumber" }

            this.root.querySelector(".ai_scale").innerHTML += '<div class="ai_tick ' + tickclass + '" style="transform: translate(0, ' + i * -5 + 'px)"><span class="ai_number">' + (tickclass == "hasnumber" ? i : "") + '</span><span class="ai_number">' + (tickclass == "hasnumber" ? i : "") + '</span></div>';
        }

        this.root.querySelector(".ai_scale").innerHTML += '<div class="arrow leftbank"></div><div class="arrow centerbank"></div><div class="arrow rightbank"></div>'
    }

    calcAngle(val) {
        let angle;
        if (this.scale != "log") {
            angle = (120 / this.maxScale) * val;
        } else {
            angle = 120 * Math.log(Math.abs(val) + 1) / Math.log(this.maxScale + 1); 
            angle = val < 0 ? angle * -1 : angle;
        }        

        return angle - 90;
    }

    updateWinddata() {
        this.horizontalwindspeed = this.horizontalwindspeed * 0.9 + SimVar.GetSimVarValue("A:AMBIENT WIND VELOCITY", this.u[this.units].verticalspeed) * 0.1;
        this.horizontalwindspeedaverage.push(this.horizontalwindspeed);
        if(this.horizontalwindspeedaverage.length > this.averager * 18) { this.horizontalwindspeedaverage.shift() }

        this.horizontalwinddirection = SimVar.GetSimVarValue("A:AMBIENT WIND DIRECTION", "degrees");
        this.horizontalwinddirectionaverage.push(this.horizontalwinddirection);
        if(this.horizontalwinddirectionaverage.length > this.averager * 180) { this.horizontalwinddirectionaverage.shift() } // 10 sec average on wind direction

        this.verticalwindsmoother.push(SimVar.GetSimVarValue("A:AMBIENT WIND Y", this.u[this.units].verticalspeed) + SimVar.GetSimVarValue("L:JBB_CURRENT_POLAR_SINK", this.u[this.units].verticalspeed));
        if(this.verticalwindsmoother.length > 20) { this.verticalwindsmoother.shift() }
        this.verticalwind = this.verticalwindsmoother.reduce((a, b) => a + b, 0) / this.verticalwindsmoother.length;
    }

    updateHawk() {
        let hdg = SimVar.GetSimVarValue("A:PLANE HEADING DEGREES TRUE","degrees");

        let avgwinddirection = this.meanAngleDeg(this.horizontalwinddirectionaverage);
        avgwinddirection = avgwinddirection < 0 ? 360 + avgwinddirection : avgwinddirection;
        let avgwindspeed = this.horizontalwindspeedaverage.reduce((a, b) => a + b, 0) / this.horizontalwindspeedaverage.length;
    
        let vector = Math.min(185, this.horizontalwindspeed * 5 + 60);
        this.hawkcurrent.style.transform = "translate(0, " + -vector/2 + "px) rotate(" + (this.horizontalwinddirection - hdg) + "deg)";
        this.hawkcurrent.style.height = vector + "px";

        let avgvector = Math.min(185, avgwindspeed * 5 + 60);
        this.hawkaverage.style.transform = "translate(0, " + -avgvector/2 + "px) rotate(" + ( avgwinddirection - hdg) + "deg)";
        this.hawkaverage.style.height = avgvector + "px";

        this.hawkcurrentnumbers.innerHTML = ("000" + this.horizontalwinddirection.toFixed(0)).substr(-3) + " / " + this.horizontalwindspeed.toFixed(0);        
        this.hawkaveragenumbers.innerHTML = ("000" + avgwinddirection.toFixed(0)).substr(-3) + " / " + avgwindspeed.toFixed(0);        
    }

    updateAttitude() {
        let bank = SimVar.GetSimVarValue("A:PLANE BANK DEGREES", "degrees");
        let pitch = SimVar.GetSimVarValue("A:PLANE PITCH DEGREES", "degrees");

        this.aiscale.style.transform = "rotate(" + bank + "deg)";
        this.aihorizon.style.transform = "rotate(" + bank + "deg) translate(0, " + (-pitch * 5) + "px)";
    }

    updateDatafields(current, avg) {
        let cprefix = current >= 0 ? "+" : "";
        this.datafield1.querySelector(".label").innerHTML = this.variomode == "te" ? "TE" : "NETTO";
        this.datafield1.querySelector(".number").innerHTML = cprefix + current.toFixed(1)
        this.datafield1.querySelector(".unit").innerHTML = this.units == "metric" ? "ms" : "kts";

        let prefix = avg >= 0 ? "+" : "";
        this.datafield2.querySelector(".label").innerHTML = "AVG";
        this.datafield2.querySelector(".number").innerHTML = prefix + avg.toFixed(1);
        this.datafield2.querySelector(".unit").innerHTML = this.units == "metric" ? "ms" : "kts";
    
        this.updateSpeedtape();
    }

    updateSTFdatafields() {
        this.datafield3.querySelector(".number").innerHTML = this.units == "metric" ? Math.round(SimVar.GetSimVarValue("L:JBB_STF_DYNAMIC","kph")) : Math.round(SimVar.GetSimVarValue("L:JBB_STF_DYNAMIC","knots"));
        this.datafield3.querySelector(".unit").innerHTML = this.units == "metric" ? "kmh" : "kts";

        this.datafield4.querySelector(".number").innerHTML = SimVar.GetSimVarValue("L:BEZEL_CAL","percent") / (this.units == "metric" ? 20 : 10);
        this.datafield4.querySelector(".unit").innerHTML = this.units == "metric" ? "ms" : "kts";
    }

    updateSpeedtape() {
        let stf = this.units == "metric" ? SimVar.GetSimVarValue("L:JBB_STF_DYNAMIC","kph") : SimVar.GetSimVarValue("L:JBB_STF_DYNAMIC","knots");
        let ias = this.units == "metric" ? SimVar.GetSimVarValue("A:AIRSPEED INDICATED", "kph") : SimVar.GetSimVarValue("A:AIRSPEED INDICATED", "knots");

        if(ias > 30) {
            this.speedtape.style.transform = "translate(0, " + (ias * this.speedtapestep - 250 ) + "px)";
            this.root.querySelector(".currentspeed").innerHTML = ("000" + ias.toFixed(0)).substr(-3);

            let stfmarkerpos;
            if(ias > (parseInt(stf) + 20)) {
                stfmarkerpos = (ias - 20) * this.speedtapestep - 9;
                this.stfmarker.setAttribute("class", "stfmarker over");
            } else if(ias < (parseInt(stf) - 20)) {
                stfmarkerpos = (ias + 20) * this.speedtapestep - 9;
                this.stfmarker.setAttribute("class", "stfmarker under");
            } else {
                this.stfmarker.setAttribute("class", "stfmarker");
                stfmarkerpos = (stf * this.speedtapestep) - 9;
            }

            this.stfmarker.style.bottom = stfmarkerpos + "px";
        }
    }

    buildSpeedtape() {
        
        let speeds = {
            metric: {
                minspeed : 60,
                stallspeed : 80,
                maneuverspeed : 190,
                maxspeed : 280,
                maxvalue : 350,
                tapeheight: 1000
            },
            imperial: {
                minspeed : 30,
                stallspeed : 43,
                maneuverspeed : 108,
                maxspeed : 160,
                maxvalue: 220,
                tapeheight: 700
            }
        }

        this.speedtape.style.height = speeds[this.units].tapeheight;
        
        this.speedtapestep = speeds[this.units].tapeheight / speeds[this.units].maxvalue;

        this.overspeed.style.height = (speeds[this.units].maxvalue - speeds[this.units].maxspeed) * this.speedtapestep + "px";
        this.overspeed.style.bottom = (speeds[this.units].maxspeed * this.speedtapestep) + "px"; 
        this.highspeed.style.height = (speeds[this.units].maxspeed - speeds[this.units].maneuverspeed) * this.speedtapestep + "px";
        this.highspeed.style.bottom = (speeds[this.units].maneuverspeed * this.speedtapestep) + "px";
        this.maneuver.style.height = (speeds[this.units].maneuverspeed - speeds[this.units].stallspeed) * this.speedtapestep + "px";
        this.maneuver.style.bottom = (speeds[this.units].stallspeed * this.speedtapestep) + "px";
        this.stallspeed.style.height = speeds[this.units].stallspeed * this.speedtapestep + "px";
        this.stallspeed.style.bottom = "0px";

        this.speedtape.querySelector(".speedlabels").innerHTML = "";
        for( let i = speeds[this.units].minspeed; i < speeds[this.units].maxvalue; i = i + 20 ) {
            this.speedtape.querySelector(".speedlabels").innerHTML += '<span style="bottom: ' + ((i * this.speedtapestep) - 9) + 'px">' + i + '</span>';
        } 

    }

    sum(a) {
        var s = 0;
        for (var i = 0; i < a.length; i++) s += a[i];
        return s;
    } 
    
    degToRad(a) {
        return Math.PI / 180 * a;
    }
    
    meanAngleDeg(a) {
        return 180 / Math.PI * Math.atan2(
            this.sum(a.map(this.degToRad).map(Math.sin)) / a.length,
            this.sum(a.map(this.degToRad).map(Math.cos)) / a.length
        );
    }

    registerKeyListeners() {
        this.keyListener = RegisterViewListener('JS_LISTENER_KEYEVENT', () => {
            Coherent.call('INTERCEPT_KEY_EVENT', 'TOGGLE_VARIOMETER_SWITCH', 1);
            this.keyListener.on('keyIntercepted', (key, value1, value0, value2)=>{
                switch (key) {
                    case 'TOGGLE_VARIOMETER_SWITCH': if(!this.isBusy) { this.toggleVariomode() }; break;
                }
            });
        });

    }
}

registerInstrument("v8-vario-element", v8_varioclass);

class rangeinput {
    constructor(el, callback) {
        this.rangebg = el;
        this.id = el.getAttribute("id");
        
        this.marker = document.createElement("div");
        this.marker.setAttribute("class","marker");
        el.appendChild(this.marker);
        
        this.rail = document.createElement("div");
        this.rail.setAttribute("class","rail");

        this.label = document.createElement("div");
        this.label.setAttribute("class","label");

        this.handle = document.createElement("div");
        this.handle.setAttribute("class", "handle");

        this.interact = document.createElement("div");
        this.interact.setAttribute("class", "interact");

        this.rail.appendChild(this.label);
        this.rail.appendChild(this.handle);
        this.rail.appendChild(this.interact);
        el.appendChild(this.rail);

        this.isActive = false;
        this.clickposition = 0;
        this.maxvalue = parseFloat(el.getAttribute("data-max"));
        this.minvalue = parseFloat(el.getAttribute("data-min"));

        this.callback = callback;

        this.initvalue = parseFloat(el.getAttribute("data-value"));
        this.outputvalue = this.initvalue;

        this.init();
        
    }

    init() {
        let thisinput = this;
        thisinput.rail.addEventListener("mousedown", (e)=> {
            thisinput.handle.style.backgroundColor = "#888";
            thisinput.clickposition = e.offsetX;
            thisinput.isActive = true;
        })

        thisinput.rail.addEventListener("mouseup", (e)=> {
            thisinput.handle.style.backgroundColor = "#ccc";
            thisinput.isActive = false;
        })

        thisinput.rail.addEventListener("mouseleave", (e)=> {
            thisinput.handle.style.backgroundColor = "#ccc";
            thisinput.isActive = false;
        })

        thisinput.rail.addEventListener("mousemove", (e) => {
            if(thisinput.isActive) {
                let pos = e.offsetX - thisinput.handle.clientWidth / 2;
                let max = thisinput.rail.clientWidth - thisinput.handle.clientWidth;
                pos = pos < 0 ? 0 : pos;
                pos = pos < max - thisinput.handle.clientWidth / 2 ? pos : max ;

                thisinput.marker.style.width = (pos + thisinput.handle.clientWidth / 2)  + "px";
                thisinput.handle.style.left = pos + "px";

                let diff = thisinput.maxvalue - thisinput.minvalue;
                let value = (( pos / max ) * diff) + thisinput.minvalue;
                thisinput.outputvalue = value;
                thisinput.addLabel();

                thisinput.callback(thisinput.outputvalue);
            }
        })
        
        this.setValue(this.initvalue);
    }

    setValue(val) {
        if(val < this.minvalue || val > this.maxvalue) { return; }
        let diff = this.maxvalue - this.minvalue;
        // let max = this.rail.clientWidth - this.handle.clientWidth;
        let max = 159 - 39;
        let pos = (max / diff) * (val - this.minvalue);
        this.handle.style.left = pos + "px";
        this.marker.style.width = (pos + 39 / 2)  + "px";
        this.outputvalue = val;
        this.addLabel();
    }

    getValue() { return this.outputvalue; }

    addLabel() {
        let labelvalue = this.maxvalue == 1 ? (this.outputvalue * 100).toFixed(0) : this.outputvalue.toFixed(0);
        this.label.innerText = labelvalue;
        if(parseInt(this.handle.style.left) < 100) {
            this.label.classList.add("placeright");
        } else {
            this.label.classList.remove("placeright"); 
        }
    }
}