class v8_varioclass extends BaseInstrument {
    constructor() {
        super();
    }

    get templateID() { return "v8-vario"; }

    get isInteractive() { return false;}

    connectedCallback() {
        super.connectedCallback();

        this.root = document.getElementById("v8");

        this.units = "metric";
        this.scale = "straight";
        
        this.variomode = "total_energy";
        this.averager = 10; // number of seconds (approx.) to calculate rolling average
        this.avgvalues = []; // array to sore values for averager
        this.smoother = 0; // variable to smooth out current value
        this.windsmoother = 0; // variable to smooth out current vertical wind

        this.datafield1 = this.root.querySelector(".data1");
        this.datafield2 = this.root.querySelector(".data2");

        this.currentarrow = this.root.querySelector(".current");
        this.averagearrow = this.root.querySelector(".average");
        this.mcmarker = this.root.querySelector(".mcmarker");
        this.windarrow = this.root.querySelector(".wind");
        this.lastthermalaverage = this.root.querySelector(".lastthermalaverage");

        this.avgarc = this.root.querySelector("#arc");
        this.avgpath = this.root.querySelector("#arc path");
        this.innerRadius = this.avgarc.clientWidth / 2 - 4;

        this.aihorizon = this.root.querySelector(".horizon");
        this.aiscale = this.root.querySelector(".ai_scale");

        this.horizontalwindspeed = 0;
        this.horizontalwindspeedsmoother = 0;
        this.horizontalwindspeedaverage = [];

        this.horizontalwinddirection = 0;
        this.horizontalwinddirectionsmoother = 0;
        this.horizontalwinddirectionaverage = [];

        this.speedtape = this.root.querySelector(".speedtape");
        this.overspeed = this.root.querySelector(".overspeed");
        this.highspeed = this.root.querySelector(".highspeed");
        this.maneuver = this.root.querySelector(".maneuver");
        this.stallspeed = this.root.querySelector(".stallspeed");

        this.hawkcurrent = this.root.querySelector("#arrow_current");
        this.hawkaverage = this.root.querySelector("#arrow_avg");

        this.hawkaveragenumbers = this.root.querySelector("#hawk .numbers.avg");
        this.hawkcurrentnumbers = this.root.querySelector("#hawk .numbers.current");

        this.screens = [
            this.root.querySelector("#datafields"),
            this.root.querySelector("#hawk"),
            this.root.querySelector("#attitude"),
        ]
        this.currentScreen = 0;

        this.buildScale();
        this.buildSpeedtape();
        this.isInit = true;
    }

    Update() {
        if(!this.isInit) { return; }
        this.currentUnit = SimVar.GetSimVarValue("L:UNITS_IMPERIAL","percent") == 0 ? "metric" : "imperial";

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
            console.log("Up Button pressed");
            this.screens[this.currentScreen].style.display = "none";
            this.currentScreen = this.currentScreen > 0 ? this.currentScreen - 1 : this.screens.length - 1;
            this.screens[this.currentScreen].style.display = "block";
        };

        if(SimVar.GetSimVarValue("L:S80_ENTER_BUTTON","number") == 1) {
            SimVar.SetSimVarValue("L:S80_ENTER_BUTTON","number", 0);
            this.scale = this.scale == "straight" ? this.scale = "log" : "straight";
            this.buildScale(); 
        };

        if(SimVar.GetSimVarValue("L:S80_DOWN_BUTTON","number") == 1) {
            SimVar.SetSimVarValue("L:S80_DOWN_BUTTON","number", 0);
            console.log("Down Button pressed");
            this.screens[this.currentScreen].style.display = "none";
            this.currentScreen = this.currentScreen < this.screens.length - 1 ? this.currentScreen + 1 : 0;
            this.screens[this.currentScreen].style.display = "block";
        };

        let vm = SimVar.GetSimVarValue("L:VARIO_MODE","percent") == 0 ? "netto" : "te";
        if(this.variomode != vm) {
            this.variomode = vm;
            this.avgvalues = [0];
            this.smoother = 0;
        }

        let current_te, current_netto, currentpolarsink, verticalwind, lastthermalaverage;

        if(this.units == "metric") {
            current_te = SimVar.GetSimVarValue("L:TOTAL ENERGY", "meters per second");
            current_netto = SimVar.GetSimVarValue("L:NETTO","meters per second");
            currentpolarsink = SimVar.GetSimVarValue("L:JBB_CURRENT_POLAR_SINK","meters per second");
            verticalwind = SimVar.GetSimVarValue("A:AMBIENT WIND Y", "meters per second");
            lastthermalaverage = SimVar.GetSimVarValue("L:JBB_TRU_AVG_CLIMB","meters per second");
        } else {
            current_te = SimVar.GetSimVarValue("L:TOTAL ENERGY", "knots");
            current_netto = SimVar.GetSimVarValue("L:NETTO","knots");
            currentpolarsink = SimVar.GetSimVarValue("L:JBB_CURRENT_POLAR_SINK", "knots");
            verticalwind = SimVar.GetSimVarValue("A:AMBIENT WIND Y", "knots");
            lastthermalaverage = SimVar.GetSimVarValue("L:JBB_TRU_AVG_CLIMB","knots");
        }

        let currentvalue = this.updatecurrent(this.variomode == "te" ? current_te : current_netto);
        let averagevalue = this.updateaverage(currentvalue);

        this.updateWinddata();
        this.windsmoother = this.windsmoother * 0.8 + verticalwind * 0.2;
        // now move some arrows around
        this.currentarrow.style.transform = "rotate(" + this.calcAngle(Math.max( -this.maxScale, Math.min(this.maxScale, currentvalue))) + "deg)";
        this.averagearrow.style.transform = "rotate(" + this.calcAngle(Math.max( -this.maxScale, Math.min(this.maxScale, averagevalue))) + "deg)";
        this.lastthermalaverage.style.transform = "rotate(" + this.calcAngle(Math.max( -this.maxScale, Math.min(this.maxScale, lastthermalaverage))) + "deg)";
        this.windarrow.style.transform = "rotate(" + this.calcAngle(Math.max( -this.maxScale, Math.min(this.maxScale, this.windsmoother))) + "deg)";
        this.mcmarker.style.transform = "rotate(" + this.calcAngle( SimVar.GetSimVarValue("L:BEZEL_CAL","percent") / (this.units == "metric" ? 20 : 10) ) + "deg)";

        if(this.currentScreen == 0) { this.updateDatafields(currentvalue,averagevalue); }
        if(this.currentScreen == 1) { this.updateHawk(); }
        if(this.currentScreen == 2) { this.updateAttitude(); }
    }

    updatecurrent(currentvalue) {
        this.smoother = currentvalue * 0.01 + this.smoother * 0.99;
        return this.smoother;
    }

    updateaverage(currentvalue) {
        this.avgvalues.push(parseFloat(currentvalue));
        if(this.avgvalues.length > this.averager * 18) { this.avgvalues.shift() }

        let min = Math.min(...this.avgvalues);
        let max = Math.max(...this.avgvalues);
        
        let minangle = Math.max(-210, Math.min(30, this.calcAngle(min)));
        let maxangle = Math.max(-210, Math.min(30, this.calcAngle(max)));

        let minX = (this.innerRadius + 4) + this.innerRadius * (Math.cos((minangle-90) * Math.PI / 180.0));
        let minY = (this.innerRadius + 4) + this.innerRadius * (Math.sin((minangle-90) * Math.PI / 180.0));
        let maxX = (this.innerRadius + 4) + this.innerRadius * (Math.cos((maxangle-90) * Math.PI / 180.0));
        let maxY = (this.innerRadius + 4) + this.innerRadius * (Math.sin((maxangle-90) * Math.PI / 180.0));

        let path = "M " + minX + " " + minY + " A " + this.innerRadius + " " + this.innerRadius + " 0 0 1 " + maxX + " " + maxY

        this.avgpath.setAttribute("d",path);

        return this.avgvalues.reduce((a, b) => a + b, 0) / this.avgvalues.length;
    }

    buildScale() {
        this.maxScale = this.units == "metric" ? 5 : 10;
        let step = this.units == "metric" ? 0.5 : 1

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
        this.horizontalwindspeed = this.horizontalwindspeed * 0.9 + SimVar.GetSimVarValue("A:AMBIENT WIND VELOCITY", "meters per second") * 0.1;
        this.horizontalwindspeedaverage.push(this.horizontalwindspeed);
        if(this.horizontalwindspeedaverage.length > this.averager * 18) { this.horizontalwindspeedaverage.shift() }

        this.horizontalwinddirection = SimVar.GetSimVarValue("A:AMBIENT WIND DIRECTION", "degrees");
        this.horizontalwinddirectionaverage.push(this.horizontalwinddirection);
        if(this.horizontalwinddirectionaverage.length > this.averager * 18) { this.horizontalwinddirectionaverage.shift() }
    }

    updateHawk() {
        let hdg = SimVar.GetSimVarValue("A:PLANE HEADING DEGREES TRUE","degrees");
        let avgwinddirection = this.horizontalwinddirectionaverage.reduce((a, b) => a + b, 0) / this.horizontalwinddirectionaverage.length;
        let avgwindspeed = this.horizontalwindspeedaverage.reduce((a, b) => a + b, 0) / this.horizontalwindspeedaverage.length;
    
        let vector = Math.min(250, this.horizontalwindspeed * 5 + 60);
        this.hawkcurrent.style.transform = "translate(0, " + -vector/2 + "px) rotate(" + (this.horizontalwinddirection - hdg) + "deg)";
        this.hawkcurrent.style.height = vector + "px";

        let avgvector = Math.min(250, avgwindspeed * 5 + 60);
        this.hawkaverage.style.transform = "translate(0, " + -avgvector/2 + "px) rotate(" + ( avgwinddirection - hdg) + "deg)";
        this.hawkaverage.style.height = avgvector + "px";

        this.hawkcurrentnumbers.innerHTML = this.horizontalwinddirection.toFixed(0) + " / " + (this.units == "metric" ? this.horizontalwindspeed.toFixed(1) : (this.horizontalwindspeed * 1.94384).toFixed(0));        
        this.hawkaveragenumbers.innerHTML = avgwinddirection.toFixed(0) + " / " + (this.units == "metric" ? avgwindspeed.toFixed(1) : (avgwindspeed * 1.94384).toFixed(0) );        
    }

    updateAttitude() {
        let bank = SimVar.GetSimVarValue("A:PLANE BANK DEGREES", "degrees");
        let pitch = SimVar.GetSimVarValue("A:PLANE PITCH DEGREES", "degrees");

        this.aiscale.style.transform = "rotate(" + bank + "deg)";
        this.aihorizon.style.transform = "rotate(" + bank + "deg) translate(0, " + (-pitch * 5) + "px)";
    }

    updateDatafields(current, avg) {
        let curr = this.units == "metric" ? current : current * 1.9438;
        let cprefix = curr >= 0 ? "+" : "";
        this.datafield1.querySelector(".label").innerHTML = this.variomode == "te" ? "TE" : "NETTO";
        this.datafield1.querySelector(".number").innerHTML = cprefix + curr.toFixed(1)
        this.datafield1.querySelector(".unit").innerHTML = this.units == "metric" ? "ms" : "kts";

        let avgclimb = this.units == "metric" ? avg : avg * 1.9438;
        let prefix = avgclimb >= 0 ? "+" : "";
        this.datafield2.querySelector(".label").innerHTML = "AVG";
        this.datafield2.querySelector(".number").innerHTML = prefix + avgclimb.toFixed(1);
        this.datafield2.querySelector(".unit").innerHTML = this.units == "metric" ? "ms" : "kts";
    
        this.updateSpeedtape();
    }

    updateSpeedtape() {
        let stf = this.units == "metric" ? SimVar.GetSimVarValue("L:JBB_STF","kph") : SimVar.GetSimVarValue("L:JBB_STF","knots");
        let ias = this.units == "metric" ? SimVar.GetSimVarValue("A:AIRSPEED INDICATED", "kph") : SimVar.GetSimVarValue("A:AIRSPEED INDICATED", "knots");

        if(ias > 30) {
            this.speedtape.style.transform = "translate(0, " + (ias * this.speedtapestep - 250 ) + "px)";
            this.root.querySelector(".currentspeed").innerHTML = ("000" + ias.toFixed(0)).substr(-3);
            this.speedtape.querySelector(".stfmarker").style.bottom = ((stf * this.speedtapestep) - 9) + "px";
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
                tapeheight: 2000
            },
            imperial: {
                minspeed : 30,
                stallspeed : 43,
                maneuverspeed : 108,
                maxspeed : 160,
                maxvalue: 220,
                tapeheight: 1400
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
        for( let i = speeds[this.units].minspeed; i < speeds[this.units].maxvalue; i = i + 10 ) {
            this.speedtape.querySelector(".speedlabels").innerHTML += '<span style="bottom: ' + ((i * this.speedtapestep) - 9) + 'px">' + i + '</span>';
        } 

    }
}


registerInstrument("v8-vario-element", v8_varioclass);