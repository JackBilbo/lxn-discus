let NAVMAP, NAVPANEL, CONFIGPANEL, UI;

class lxn extends NavSystemTouch {

    constructor() {
        super();

        this.TIMER_05 = 0;
        this.TIMER_1 = 0;

        this.ELECTRICAL_MASTER_BATTERY = true;

        // Temporary legacy values for Speedgauge and Hawk

        this.jbb_mccready = 0;
        this.jbb_mccready_ms = 0;
        this.jbb_avg_wind_direction = 0;
        this.jbb_avg_wind_speed = 0;   
        
        this.jbb_lift_dot_delay = 3;
        this.lift_dots = [];
        this.lift_dots_max = 40;
        this.showLiftdots = true;

       	
        this.vars = {            
            ias: { value: 10, label: "IAS", longlabel: "Indicated Airspeed", category: "speed", baseunit: "kts" },
            tas: { value: 10, label: "TAS", longlabel: "True Airspeed", category: "speed", baseunit: "kts" },
            hdg: { value: 0, label: "HDG", longlabel: "Plane Heading", category: "direction", baseunit: "deg"},
            trk: { value: 0, label: "TRK", longlabel: "GPS Groundtrack", category: "direction", baseunit: "deg"},
            gndspd: { value: 0, label: "GND SPD", longlabel: "GPS Groundspeed", category: "speed", baseunit: "kts"},
            stf: { value: 0, label: "STF", longlabel: "Speed to fly", category: "speed", baseunit: "kts" },
            sink_stf: { value: 0, label: "Sink at STF", longlabel: "Sink at Speed to fly", category: "verticalspeed", baseunit: "kts" },
            current_netto: { value: 0, label: "NETTO", longlabel: "Smoothed Netto", category: "verticalspeed", baseunit: "kts"},
            wind_direction: { value: 0, label: "Wind", longlabel: "Wind Direction", category: "direction", baseunit: "deg" },
            wind_spd: { value: 0, label: "Wind", longlabel: "Windspeed", category: "windspeed", baseunit: "kts" },
            wind_vertical: { value: 0, label: "Wind Vert.", longlabel: "Vertical Windspeed", category: "windspeed", baseunit: "kts" },
            mccready: { value: 0, label: "MC", longlabel: "McCready Value", category: "verticalspeed", baseunit: "kts"},
            alt: { value: 13542, label: "ALT", longlabel: "Altitude", category: "alt", baseunit: "ft" },
            alt_gnd: { value: 3318, label: "ALT (GND)", longlabel: "Altitude above Ground", category: "alt", baseunit: "ft" },
            oat: { value: 1, label: "OAT", longlabel: "Outside Air Temperature",category:"temperature", baseunit: "F"},
            ballast: { value: 348, label: "Ballast", longlabel: "Current Ballast",category:"weight", baseunit: "lbs"},
            ballast_pct: { value: 50, label: "Ballast %", longlabel: "Current Ballast Percent",category:"percent", baseunit: "%"},
            localtime: { value: 0, label: "Local", longlabel: "Local Time", category: "time_of_day", baseunit: "s"},
            tasktime: { value: 0, label: "Task Time", longlabel: "Task Time", category: "time_of_day", baseunit: "s"},
            sel_apt_icao: { value: "XXXX", label: "APT ICAO", longlabel: "Selected Airport ICAO", category: "plaintext", baseunit: "none" },
            sel_apt_name: { value: "NAME", label: "APT NAME", longlabel: "Selected Airport Name", category: "plaintext", baseunit: "none" },
            sel_apt_alt: { value: 0, label: "APT ALT", longlabel: "Selected Airport Altitude", category: "alt", baseunit: "ft" },
            sel_apt_bearing: { value: 0, label: "APT BRG", longlabel: "Selected Airport Bearing", category: "direction", baseunit: "deg" },
            sel_apt_dist: { value: 0, label: "APT DIST", longlabel: "Selected Airport Distance", category: "dist", baseunit: "nm" },
            sel_apt_arr_agl: { value: 0, label: "APT ARR (AGL)", longlabel: "Selected Airport Arrival (AGL)", category: "alt", baseunit: "ft" },
            sel_apt_arr_msl: { value: 0, label: "APT ARR (MSL)", longlabel: "Selected Airport Arrival (MSL)", category: "alt", baseunit: "ft" },
            sel_apt_ete: { value: 0, label: "APT ETE", longlabel: "Selected Airport Time Enroute", category: "time", baseunit: "min" },
            wp_name: { value: "", label: "WP NAME", longlabel: "Waypoint Name", category: "plaintext", baseunit: "none" },
            wp_alt: { value: 0, label: "WP ALT", longlabel: "Waypoint Altitude", category: "alt", baseunit: "ft" },
            wp_bearing: { value: 0, label: "WP BRG", longlabel: "Waypoint Bearing", category: "direction", baseunit: "deg" },
            wp_dist: { value: 0, label: "WP DIST", longlabel: "Waypoint Distance", category: "dist", baseunit: "nm" },
            wp_arr_agl: { value: 0, label: "WP ARR (AGL)", longlabel: "Waypoint Arrival (AGL)", category: "alt", baseunit: "ft" },
            wp_arr_msl: { value: 0, label: "WP ARR (MSL)", longlabel: "Waypoint Arrival (MSL)", category: "alt", baseunit: "ft" },
            wp_ete: { value: 0, label: "WP ETE", longlabel: "Waypoint Time Enroute", category: "time", baseunit: "min" },
            task_arr_agl: { value: 0, label: "TSK FIN (AGL)", longlabel: "Task Finish Altitude (AGL)", category: "alt", baseunit: "ft" },
            task_arr_msl: { value: 0, label: "TSK FIN (MSL)", longlabel: "Task Finish Altitude (MSL)", category: "alt", baseunit: "ft" }
        }
        
        this.units = {
            speed: { pref: "kts", imperial: "kts", metric: "kmh", options: ["kts","kmh","ms","mph"], label: "Speed" },
            dist: { pref: "nm", imperial: "nm", metric: "km", options: ["nm","ml","km","m"], label: "Distance" },
            alt: { pref: "ft", imperial: "ft", metric: "m", options: ["ft","m"], label: "Altitude" },
            windspeed: { pref: "kts", imperial: "kts", metric: "ms", options: ["kts","kmh","ms","fs"], label: "Windspeed" },
            verticalspeed: { pref: "kts", imperial: "kts", metric: "ms", options: ["kts","kmh","ms","fs"], label: "Vert. Speed" },
            direction: { pref: "deg", imperial: "deg", metric: "deg", options: ["deg"], label: "Direction" },
            weight: {  pref: "lbs", imperial: "lbs", metric: "kg", options: ["lbs", "kg"], label: "Weight" },
            temperature: {  pref: "F", imperial: "F", metric: "C", options: ["F", "C"], label: "Temperature" },
            time: { pref: "min", imperial: "min", metric: "min", options: ["min","sec"], label: "Time" },
            time_of_day:  { pref: "hms24", imperial: "hms12", metric: "hms24", options: ["hms12","hms24"], label: "Time of Day" },
            plaintext:  { pref: "none", imperial: "none", metric: "none", options: ["none"], label: "Plain Text" },
            percent:  { pref: "%", imperial: "%", metric: "%", options: ["%"], label: "Percentage" }
        }
        
        this.factors = {
            speed: {
                kts : 1,
                kmh : 1.852,
                mph : 1.15078,
                ms : 0.51444
            },
            dist: {
                nm : 1,
                km : 1.852,
                ml : 1.15078,
                m  : 1852
            },
            direction: {
                deg: 1
            },
            windspeed: {
                kts : 1,
                kmh : 1.852,
                mph : 1.15078,
                ms : 0.51444
            },
            verticalspeed: {
                kts : 1,
                kmh : 1.852,
                mph : 1.15078,
                ms : 0.51444
            },
            alt: {
                ft: 1,
                m: 0.3048
            },
            weight: {
                lbs: 1,
                kg: 0.453592
            },
            temperature: {
                F: 1,
                C: 0.55555555
            },
            time: {
                min: 1    
            },
            time_of_day: {
                hms24: 1,
                hms12: 1
            },
            percent: {
                "%": 1
            }
        }
		
    }

    get templateID() {
        return "lxn";
    } // ID of <script> tag in nav.html
	
	

    connectedCallback() {
        super.connectedCallback();

        NAVMAP = new navmap(this);
        NAVPANEL = new navpanel(this); NAVPANEL.init();
        CONFIGPANEL = new configpanel(this); CONFIGPANEL.initSystemSettings();
        UI = new ui(this); UI.init();

        this.jbb_refwt = SimVar.GetSimVarValue("L:IsFES","bool") == "1" ? 944 : 812;

        this.init_speedgauge();
        this.jbb_init_calc_polar();
                
        this.KNOBS_VAR = ("0000" + SimVar.GetSimVarValue("TRANSPONDER CODE:1", "number")).slice(-4);
        this.prev_knobs_var = this.KNOBS_VAR;

        this.v80_mcvalue = SimVar.GetSimVarValue("L:BEZEL_CAL", "percent");

        B21_SOARING_ENGINE.register_callback(this, this.engine_event_callback);

        this._isConnected = true;
	}
	
    disconnectedCallback() {
        super.disconnectedCallback();
    }
	
    get isInteractive() {
        return true;
    }  

    onUpdate(_deltaTime) {
        super.onUpdate(_deltaTime);

        if (!this._isConnected) {
            return;
        }

        let LXNAV = this;
        this.vars.ias.value = SimVar.GetSimVarValue("A:AIRSPEED INDICATED", "knots");
        this.vars.tas.value = SimVar.GetSimVarValue("A:AIRSPEED TRUE", "knots");
        this.vars.hdg.value = SimVar.GetSimVarValue("A:PLANE HEADING DEGREES TRUE","degrees");
        this.vars.trk.value = SimVar.GetSimVarValue("GPS GROUND TRUE TRACK","degrees");
        this.vars.gndspd.value = SimVar.GetSimVarValue("A:GPS GROUND SPEED","knots");
        this.vars.alt.value = SimVar.GetSimVarValue("A:PLANE ALTITUDE", "feet");
        this.vars.alt_gnd.value = SimVar.GetSimVarValue("A:PLANE ALT ABOVE GROUND", "feet");
        this.vars.wind_spd.value = parseFloat(SimVar.GetSimVarValue("A:AMBIENT WIND VELOCITY", "knots"));
        this.vars.wind_direction.value = parseFloat(SimVar.GetSimVarValue("A:AMBIENT WIND DIRECTION", "degrees"));
        this.vars.wind_vertical.value = SimVar.GetSimVarValue("A:AMBIENT WIND Y", "knots");
        this.vars.current_netto.value = (this.vars.current_netto.value * 0.9) + (SimVar.GetSimVarValue("L:NETTO", "knots") * 0.1);

        /* Set Vars for B21 Functions */

        this.TIME_S = SimVar.GetSimVarValue("E:SIMULATION TIME","seconds");
        this.AIRSPEED_MS = SimVar.GetSimVarValue("A:AIRSPEED INDICATED", "meters per second");
        this.AIRSPEED_TRUE_MS = SimVar.GetSimVarValue("A:AIRSPEED TRUE", "meters per second");
        this.ALTITUDE_M = SimVar.GetSimVarValue("A:INDICATED ALTITUDE", "meters");
        this.ON_GROUND = SimVar.GetSimVarValue("SIM ON GROUND", "bool") ? true : false;
        this.TOTAL_WEIGHT_KG = SimVar.GetSimVarValue("A:TOTAL WEIGHT", "kilograms");
        this.PLANE_POSITION = this.get_position(); // returns a MSFS LatLong()
        this.WIND_DIRECTION_DEG = SimVar.GetSimVarValue("A:AMBIENT WIND DIRECTION", "degrees");
        // Get wind speed with gust filtering
        if (this.WIND_SPEED_MS==null) {
            this.WIND_SPEED_MS = SimVar.GetSimVarValue("A:AMBIENT WIND VELOCITY", "meters per second");
        }
        this.WIND_SPEED_MS = 0.99 * this.WIND_SPEED_MS  + 0.01 * SimVar.GetSimVarValue("A:AMBIENT WIND VELOCITY", "meters per second");

        B21_SOARING_ENGINE.MACCREADY_MS = this.vars.mccready.value * 0.51444;
        B21_SOARING_ENGINE.STF_SPEED_0_MS = this.vars.stf.value * 0.5144;
        B21_SOARING_ENGINE.STF_SINK_0_MS = this.vars.sink_stf.value * 0.5144;

        NAVMAP.load_map();
        
        this.jbb_update_hawk();
        this.update_speedgauge();
        
        let mastermc = SimVar.GetSimVarValue("L:BEZEL_CAL","percent")
        if(this.v80_mcvalue != mastermc) {
            this.vars.mccready.value = mastermc / 10;
            this.v80_mcvalue = mastermc;
        }

        
        if(this.TIME_S - this.TIMER_05 > 0.5) {
            /* Stuff happening twice per second  */
            this.TIMER_05 = this.TIME_S;

            this.jbb_update_stf();

            if (B21_SOARING_ENGINE.task_active()) {
                this.update_task_page();

                this.vars.wp_name.value = B21_SOARING_ENGINE.current_wp().name;
                this.vars.wp_dist.value = B21_SOARING_ENGINE.current_wp().distance_m / 1852; // convert to baseunit
                this.vars.wp_bearing.value = B21_SOARING_ENGINE.current_wp().bearing_deg;
                this.vars.wp_arr_msl.value = B21_SOARING_ENGINE.current_wp().arrival_height_msl_m / 0.3048;
                this.vars.wp_ete.value = B21_SOARING_ENGINE.current_wp().ete_s / 60;
                this.vars.wp_alt.value = B21_SOARING_ENGINE.current_wp().alt_m / 0.3048;
                this.vars.wp_arr_agl.value = (B21_SOARING_ENGINE.current_wp().arrival_height_msl_m - B21_SOARING_ENGINE.current_wp().alt_m) / 0.3048;
                this.vars.task_arr_msl.value = B21_SOARING_ENGINE.task.finish_wp().arrival_height_msl_m / 0.3048;
                this.vars.task_arr_agl.value = (B21_SOARING_ENGINE.task.finish_wp().arrival_height_msl_m - B21_SOARING_ENGINE.task.finish_wp().alt_m ) / 0.3048;
            }

            this.updateKineticAssistant();
        }

        if(this.TIME_S - this.TIMER_1 > 1) {
            /* Stuff happening every second ********************************************************* */
            this.TIMER_1 = this.TIME_S;

            this.vars.oat.value = parseFloat(SimVar.GetSimVarValue("A:AMBIENT TEMPERATURE", "fahrenheit"));
            this.vars.localtime.value = SimVar.GetSimVarValue("E:LOCAL TIME","seconds");

            this.updateLiftdots();
            
            NAVPANEL.update()
            CONFIGPANEL.update();
            
        }

        if(this.lift_dots_timer_prev == null) {
            this.lift_dots_timer_prev = this.TIME_S;
        }

        if(this.TIME_S - this.lift_dots_timer_prev > this.jbb_lift_dot_delay && this.vars.ias.value > 40 && this.showLiftdots) {
            this.lift_dots_timer_prev = this.TIME_S;
            this.addLiftdot()
        }

        /* now update all visible datacells with their selected values */
        document.querySelectorAll(".current .datacell").forEach((cell)=> {

            let currentconfigstr = cell.getAttribute("data-userconfig") != "" ? cell.getAttribute("data-userconfig") : cell.getAttribute("data-default");
            
            if(currentconfigstr != null) {
                let currentconfig = JSON.parse(currentconfigstr);
                if(currentconfig.value != "none") {

                    let forceunit = currentconfig.forceunit != null ? currentconfig.forceunit : "";

                    let displaynumber; 
                    if(LXNAV.vars[currentconfig.value].category != "plaintext") {
                        displaynumber = LXNAV.displayValue(LXNAV.vars[currentconfig.value].value, LXNAV.vars[currentconfig.value].baseunit, LXNAV.vars[currentconfig.value].category, forceunit);
                    } 
                    
                    cell.style.backgroundColor = displaynumber > 0 ? currentconfig.back + "BB" : currentconfig.backneg + "BB";
                    cell.style.color = currentconfig.text;
        
                    cell.querySelector(".label").innerHTML = LXNAV.vars[currentconfig.value].label;
                    
                    if(LXNAV.vars[currentconfig.value].category == "time_of_day") {
                        cell.classList.add("smallfont");
                    } else {
                        cell.classList.remove("smallfont");
                    }

                    if(LXNAV.vars[currentconfig.value].category != "plaintext") {
                        cell.querySelector(".number").innerHTML = displaynumber;
                        cell.querySelector(".unit").innerHTML = forceunit != "" ? LXNAV.units[LXNAV.vars[currentconfig.value].category][forceunit] + "*" : LXNAV.units[LXNAV.vars[currentconfig.value].category].pref;
                    } else {
                        cell.querySelector(".number").innerHTML = LXNAV.vars[currentconfig.value].value;
                        cell.querySelector(".unit").innerHTML = "";
                    }
                } else {
                    cell.style.backgroundColor = "transparent";
                    cell.style.color = "transparent";
                }
            }
        })
        
        /* same for any "livedata"- fields, that might be present in a currently selected panel */
        document.querySelectorAll(".current .livedata, .pageheader .livedata").forEach((field)=> {
            let requestedvalue = field.getAttribute("data-value");
            let preferredunit;
            if(field.getAttribute("showunit") == "no") {
                preferredunit = "";   
            } else {
                preferredunit = LXNAV.units[LXNAV.vars[requestedvalue].category].pref;
            }     
            
            if(LXNAV.vars[requestedvalue].category != "plaintext") {
                field.innerHTML = LXNAV.displayValue(LXNAV.vars[requestedvalue].value, LXNAV.vars[requestedvalue].baseunit, LXNAV.vars[requestedvalue].category) + preferredunit;
            }
            else {
                
                field.innerHTML = LXNAV.vars[requestedvalue].value;
            }   
     })


         /* keybindings */

        this.KNOBS_VAR = ("0000" + SimVar.GetSimVarValue("TRANSPONDER CODE:1", "number")).slice(-4); // knobs encoded in 4 digits of XPNDR
        
        if (this.prev_knobs_var[2] > this.KNOBS_VAR[2] || (this.prev_knobs_var[2] == 0 && this.KNOBS_VAR[2] == 7)) {
            this.prev_knobs_var = this.KNOBS_VAR;
            NAVMAP.zoom_out();
        }

        if (this.prev_knobs_var[2] < this.KNOBS_VAR[2] || (this.prev_knobs_var[2] == 7 && this.KNOBS_VAR[2] == 0)) {
            this.prev_knobs_var = this.KNOBS_VAR;
            NAVMAP.zoom_in();
        }

        if (this.prev_knobs_var[3] > this.KNOBS_VAR[3] || (this.prev_knobs_var[3] == 0 && this.KNOBS_VAR[3] == 7)) {
            this.prev_knobs_var = this.KNOBS_VAR;
            UI.pageLeft();
         }
 
         if (this.prev_knobs_var[3] < this.KNOBS_VAR[3] || (this.prev_knobs_var[3] == 7 && this.KNOBS_VAR[3] == 0)) {
            this.prev_knobs_var = this.KNOBS_VAR;
            UI.pageRight();
         }

         if (this.prev_knobs_var[1] > this.KNOBS_VAR[1] || (this.prev_knobs_var[1] == 0 && this.KNOBS_VAR[1] == 7)) {
            this.prev_knobs_var = this.KNOBS_VAR;
            UI.pageDown();
         }
 
         if (this.prev_knobs_var[1] < this.KNOBS_VAR[1] || (this.prev_knobs_var[1] == 7 && this.KNOBS_VAR[1] == 0)) {
            this.prev_knobs_var = this.KNOBS_VAR;
            UI.pageUp();
         }
    	           
         
	
    }





    /* Utility Function to display Data converted to User Preference */
    /* Input any numerical Value, the current Unit and the Variable category (speed, distance, etc. as defined in the units-object) */
    /* Returns the Number converted to whatever preference the User has set. */
    /* Unit abbreviation (and Batteries) not included */
    /* Unit abbreviation can be easily retrieved: units.category.pref */

    displayValue(val,baseunit,category,forceunit) {
        val = parseFloat(val); // better make sure, it's a number
        let selected_unit;

        if(forceunit && this.units[category][forceunit]) {
            selected_unit = this.units[category][forceunit];
        } else {
            selected_unit = this.units[category].pref;
        }
        let result = 0;

        if(this.factors[category][baseunit] == 1) {
            let factor = this.factors[category][selected_unit];
            result = val * factor;
        } else {
            let interim = val / this.factors[category][baseunit];
            let factor = this.factors[category][selected_unit];
            result = interim * factor;
        }

        /* We'll propably see a huge amount of special formatting exceptions here for various unit types. "+" for AGL e.g. */
        if(category == "time_of_day") {
            let time = val;
			let seconds = Math.floor(time % 60);
			let minutes = Math.floor((time / 60) % 60);
			let hours = Math.floor(Math.min(time / 3600, 99));
			result = ("0" + hours).substr(-2) + ":" + ("0" + minutes).substr(-2) + ":" + ("0" + seconds).substr(-2);
			
        }

        if(category == "temperature") {
            if(baseunit == "F" && selected_unit == "C") {
                result = (val - 32) * 5/9;
            }
            
            result = result.toFixed(1);
        }

        if(category == "alt" || category == "dist") {
            if(Math.abs(result) > 9999) {
                result = (result/1000).toFixed(1) + "k";
            } else if (Math.abs(result) < 100) {
                result = result.toFixed(1);
            } else {
                result = result.toFixed(0);
            }
        }

        if(category == "windspeed" || category == "verticalspeed") {
            result = result < 10 ? result.toFixed(1) : result.toFixed(0);
        }

        /* if no formatting has messed with our result up to this point, simply make it a whole number */
        if(typeof(result) == "number") { result = result.toFixed(0); }

        return result;
    }




    /* special Interface stuff like Speedtape & Hawk */

    jbb_init_calc_polar() {
        // Init polar calculation according to Helmut Reichmanns Formula
        // write a,b,c to Variables for later use in actual STF-calculation
        // polar values from Vario-Script:

        // Speed and sink in knots at Minimum Sink
         let c4 = 43;
         let d4 = -0.933;
 
         // Speed and sink in knots at best glide
         let c5 = 59;
         let d5 = -1.1857;
 
         // Speed and sink in knots at "fast speed" - around 92kts/170kmh
         let c6 = 92;
         let d6 = -2.5075;
 
         let atop = (c6-c5) * (d4-d5) + (c5-c4) * (d6-d5);
         let abottom = c4 * c4 * (c6 -c5) + c6 * c6 * (c5-c4) + c5 * c5 * (c4-c6);
         this.jbb_calcpolar_a = atop/abottom;
     
         let btop = d6 - d5 - this.jbb_calcpolar_a * (c6 * c6 - c5 * c5);
         let bbottom = c6 - c5;
     
         this.jbb_calcpolar_b  = btop/bbottom;
     
         this.jbb_calcpolar_c = d5 - this.jbb_calcpolar_a * c5 * c5 - this.jbb_calcpolar_b * c5;

    }

    jbb_update_stf()  {
        // No "Bugs" on simulated wings so far
        let bugs = document.querySelector("#buginput").value;
        let ballast = this.vars.ballast.value;
        let wf = Math.sqrt(eval(this.jbb_refwt + parseFloat(ballast)) / this.jbb_refwt);
    
        let aa = this.jbb_calcpolar_a / wf * 100 / bugs;
        let bb = this.jbb_calcpolar_b * 100 / bugs;
        let cc = this.jbb_calcpolar_c * wf * 100 / bugs;

        let mccready = this.vars.mccready.value;
        
        // temporarily shift mccready to give higher speed in netto sink and slower in climbs. Does that make sense??
        // this.jbb_smoothed_netto = (this.jbb_smoothed_netto * 0.9) + (SimVar.GetSimVarValue("L:NETTO", "meters per second").toFixed(2) * 0.1);
        // let mccready_shifted = mccready - this.vars.current_netto.value;
        // if (mccready_shifted < 0) { mccready_shifted = 0; }

        let stf = Math.sqrt((cc - mccready) /aa).toFixed(0);

        this.vars.sink_stf.value = (aa * stf * stf) + (bb * stf) + cc;
        this.vars.stf.value = stf;

        // let ias = SimVar.GetSimVarValue("A:AIRSPEED INDICATED", "knots");
        // this.jbb_current_polar_sink = (aa * ias * ias) + (bb * ias) + cc;
    }

    init_speedgauge() {
        
        var minspeed_kph = 60;
        var stallspeed_kph = 80;
        var maneuverspeed_kph = 200;
        var maxspeed_kph = 300;

        var minspeed_kts = 30;
        var stallspeed_kts = 43;
        var maneuverspeed_kts = 108;
        var maxspeed_kts = 160;

        for(let i = minspeed_kph; i <= maxspeed_kph + 20; i+=5) {
            let t = document.createElement("span");
            let markerclass = "";

            if(i < stallspeed_kph || i >= maxspeed_kph) {  markerclass = "tick_warn";  }
            if(i > maneuverspeed_kph && i < maxspeed_kph) {  markerclass = "tick_alert"; }

            t.setAttribute("class", "tick " + markerclass);

            if((i % 10) == 0) {
                let l = document.createElement("span");
                l.classList.add("label");
                l.innerHTML = i;
                t.append(l);
            }
            this.querySelector(".speedladder.kmh").prepend(t);
        }

        for(let i = minspeed_kts; i <= maxspeed_kts + 20; i+=5) {
            let t = document.createElement("span");
            let markerclass = "";

            if(i < stallspeed_kts || i >= maxspeed_kts) {  markerclass = "tick_warn";  }
            if(i > maneuverspeed_kts && i < maxspeed_kts) {  markerclass = "tick_alert"; }
            t.setAttribute("class", "tick " + markerclass);

            if((i % 10) == 0) {
                let l = document.createElement("span");
                l.classList.add("label");
                l.innerHTML = i;
                t.append(l);
            }
            this.querySelector(".speedladder.kts").prepend(t);
        }

        
    }

    update_speedgauge() {
        if(this.slew_mode || document.querySelector(".speedgauge").style.display == "none") { return; }
        let units = SimVar.GetSimVarValue("L:UNITS_IMPERIAL", "percent") == 100;
        let IAS = SimVar.GetSimVarValue("A:AIRSPEED INDICATED", "kph");
        let speedbandoffset = -210;

        this.querySelector(".speedband").setAttribute("class", (units ? "speedband kts" : "speedband kmh"));
        this.querySelector(".currentspeed span").innerHTML = (units? IAS/1.852 : IAS).toFixed(0);

        if(IAS > 60 && IAS < 350) {
            document.querySelector(".speedladder.kmh").style.transform = "translate(0," + (speedbandoffset + (IAS - 60) * 10) +  "px)";
            document.querySelector(".speedladder.kts").style.transform = "translate(0," + (speedbandoffset + (IAS/1.852 - 30) * 10) +  "px)";

            this.querySelector(".speedladder.kmh .stfmarker").style.transform = "translate(0,-" + ((this.vars.stf.value * 1.852 - 60) * 10) +  "px)";
            this.querySelector(".speedladder.kts .stfmarker").style.transform = "translate(0,-" + ((this.vars.stf.value - 30) * 10) +  "px)";

        } else {
            document.querySelector(".speedladder.kmh").style.transform = "translate(0, " + speedbandoffset +  "px)";
            document.querySelector(".speedladder.kts").style.transform = "translate(0, " + speedbandoffset +  "px)";
        }

        
    }

    jbb_update_hawk() {
        let current_wind_direction = this.vars.wind_direction.value;
        if (this.jbb_avg_wind_direction == 0) {
            this.jbb_avg_wind_direction = current_wind_direction;
        } else {
            this.jbb_avg_wind_direction = ((0.99 * this.jbb_avg_wind_direction) + (0.01 * current_wind_direction));
        }

        let averageindicator = this.jbb_avg_wind_direction;

        if(NAVMAP.map_rotation == 1) {
            current_wind_direction = current_wind_direction - this.vars.hdg.value;
            averageindicator = averageindicator - this.vars.hdg.value;
        }
        
        let current_wind_speed = this.vars.wind_spd.value;
        this.jbb_avg_wind_speed = ((0.99 * this.jbb_avg_wind_speed) + (0.01 * current_wind_speed));

        this.querySelector("#hawk #arrow_avg").style.transform = "rotate(" + averageindicator + "deg)";
        this.querySelector("#hawk #arrow_current").style.transform = "rotate(" + current_wind_direction + "deg)";

        let wv = Math.min(600, current_wind_speed * 10 + 150);
        this.querySelector("#hawk #arrow_current").style.height = wv +"px";
        this.querySelector("#hawk #arrow_current").style.top = -wv/2 +"px";

        let wvavg = Math.min(600, this.jbb_avg_wind_speed * 10 + 150);
        this.querySelector("#hawk #arrow_avg").style.height = wvavg +"px";
        this.querySelector("#hawk #arrow_avg").style.top = -wvavg/2 +"px";
        

        // Vertical wind indication

        if(this.vars.wind_vertical.value < 0) {
            this.querySelector("#hawkbar").classList.add("negative");
        } else {
            this.querySelector("#hawkbar").classList.remove("negative");
        }

        this.querySelector("#hawkbar").style.height =  Math.abs(this.vars.wind_vertical.value * 18) + "px";
    }

    addLiftdot() {
        let position = this.get_position();
        
        let svg_el = document.getElementById("lift_dots");

        let color = this.vars.current_netto.value > 0 ? "#14852c" : "#cc0000";
        let radius = Math.max(3, Math.min(Math.abs(this.vars.current_netto.value) * 6, 15));
        var newdot = NAVMAP.svg_circle(position, radius, 1, color);
        newdot.setAttribute("fill", color);
    
        this.lift_dots.unshift({
            latlng: position,
            radius: radius,
            el: newdot
        });

        svg_el.prepend(newdot);
    }

    updateLiftdots() {
        let svg_el = document.getElementById("lift_dots");

        for(let i = 0; i < this.lift_dots.length; i++) {
            let dot = this.lift_dots[i];
            let xy = NAVMAP.LL_to_XY(dot.latlng);
            dot.el.setAttribute("cx", "" + xy.x);
            dot.el.setAttribute("cy", "" + xy.y);
            dot.el.setAttribute("r", dot.radius);
            dot.el.setAttribute("opacity", (40-i)/40);

            if(i > this.lift_dots_max) {
                svg_el.removeChild(dot.el);
                this.lift_dots.length = this.lift_dots_max;
            }
            if(!this.showLiftdots) { svg_el.removeChild(dot.el); }
        }

        // Dot Trail deactivated, clear Dot-Array
        if(!this.showLiftdots) { this.lift_dots = []; }
    }

    

    initKineticAssistant() {
        let instrument = this;
        this.ground_crew_menu = document.getElementById("ground_crew_menu");
		this.ground_crew_winch = document.getElementById("ground_crew_winch");
		this.ground_crew_winch.onclick = function(e) {	instrument.toggleKA(50);	};
		this.ground_crew_push = document.getElementById("ground_crew_push");
		this.ground_crew_push.onclick = function(e) {	instrument.toggleKA(75);	};
		this.ground_crew_tow = document.getElementById("ground_crew_tow");
		this.ground_crew_tow.onclick = function(e) {	instrument.toggleKA(100);	};
        this.KAisInit = true;
    }

    updateKineticAssistant() {
        if(!this.KAisInit) { this.initKineticAssistant(); return; }
        this.ground_crew_winch.style.borderColor = SimVar.GetSimVarValue("A:WATER RUDDER HANDLE POSITION", "percent") == 50 ? "red" : "green";
		this.ground_crew_winch.style.color = SimVar.GetSimVarValue("A:WATER RUDDER HANDLE POSITION", "percent") == 50 ? "red" : "green";
		this.ground_crew_push.style.borderColor = SimVar.GetSimVarValue("A:WATER RUDDER HANDLE POSITION", "percent") == 75 ? "red" : "green";
		this.ground_crew_push.style.color = SimVar.GetSimVarValue("A:WATER RUDDER HANDLE POSITION", "percent") == 75 ? "red" : "green";
		this.ground_crew_tow.style.borderColor = SimVar.GetSimVarValue("A:WATER RUDDER HANDLE POSITION", "percent") == 100 ? "red" : "green";
		this.ground_crew_tow.style.color = SimVar.GetSimVarValue("A:WATER RUDDER HANDLE POSITION", "percent") == 100 ? "red" : "green";
    }

    toggleKA(value) {
		let currValue = SimVar.GetSimVarValue("A:WATER RUDDER HANDLE POSITION", "percent");
		SimVar.SetSimVarValue("A:WATER RUDDER HANDLE POSITION", "percent", currValue == value ? 0 : value);
		SimVar.SetSimVarValue("Z:MIC_POSITION", "", 0);
	}

    


// ***********************************************************************
    // ********** Sim time - stops on pause when airborn        **************
    // **  Writes   this.SIM_TIME_S       --  absolute time (s) that pauses
    // ***********************************************************************

    init_sim_time() {
        this.SIM_TIME_S = this.TIME_S;
        this.SIM_TIME_PAUSED = false;
        this.SIM_TIME_NEGATIVE = false;
        this.SIM_TIME_SLEWED = false;
        this.SIM_TIME_ENGINE = false;
        this.SIM_TIME_ALERT = false;
        this.SIM_TIME_LOCAL_OFFSET = this.TIME_S - this.LOCAL_TIME_S; // So local time is SIM_TIME - SIM_TIME_LOCAL_OFFSET
        this.sim_time_delay_s = 0;
        this.sim_time_prev_time_s = this.TIME_S;
        this.sim_time_prev_update_s = (new Date())/1000;
    }

    update_sim_time() {
        this.ex="K1";
        if (this.SIM_TIME_S==null) {
            this.init_sim_time();
            return;
        }

        let update_s = (new Date())/1000;

        this.ex="K2";
        // Detect SLEWED, TIME_NEGATIVE
        if (this.task_active() &&
            this.task_started() &&
            ! this.task_finished()) {
            this.ex="K21";
            if (this.SLEW_MODE) {
                this.SIM_TIME_SLEWED = true;
            }
            // Detect time adjust backwards
            this.ex="K22";
            if (this.TIME_S < this.sim_time_prev_time_s) {
                this.SIM_TIME_NEGATIVE = true;
            }
            this.ex="K23";
            if (this.ENGINE_RUNNING) {
                this.SIM_TIME_ENGINE = true;
            }
            this.ex="K24";
            let delay_s = update_s - this.sim_time_prev_update_s;
            if (delay_s > 5) { // Paused for more than 5 seconds
                this.ex="K241";
                this.SIM_TIME_PAUSED = true;
                this.sim_time_delay_s += delay_s;
            }
        }

        this.ex="K4";
        this.sim_time_prev_time_s = this.TIME_S;
        this.SIM_TIME_S = this.TIME_S - this.sim_time_delay_s;
        this.sim_time_prev_update_s = update_s;
        this.ex="K9";
    }




   


    update_task_page() {
        if(!this.taskpage_built) { this.build_taskpage(); return; }
        if(!B21_SOARING_ENGINE.task_finished()) {
            document.querySelector(".task-state .task-timer").innerHTML = this.displayValue(B21_SOARING_ENGINE.task_time_s(),"s","time_of_day");
            this.vars.tasktime.value = B21_SOARING_ENGINE.task_time_s();
        } else {
            document.querySelector(".task-state .task-timer").innerHTML = this.displayValue(B21_SOARING_ENGINE.task.finish_time_s - B21_SOARING_ENGINE.task.start_time_s,"s","time_of_day");
            document.querySelector(".task-state .taskaverage .number").innerHTML = this.displayValue(B21_SOARING_ENGINE.finish_speed_ms(),"ms","speed");
            document.querySelector(".task-state .taskaverage .unit").innerHTML = this.units.speed.pref;
            
            this.vars.tasktime.value = B21_SOARING_ENGINE.task.finish_time_s - B21_SOARING_ENGINE.task.start_time_s;
            
            /*
            let completion_time = B21_SOARING_ENGINE.finish_time_s - this.task.start_time_s
            document.querySelector(".task-state .timer .number").innerHTML = this.displayValue(completion_time,"s","time_of_day");
            
            */
        }

        /* Cheat-Warnings */
            if (this.SIM_TIME_PAUSED || this.SIM_TIME_SLEWED || this.SIM_TIME_NEGATIVE || this.SIM_TIME_ENGINE) {
            let alert_msg = this.SIM_TIME_PAUSED ? "+PAUSED " : "";
            alert_msg += this.SIM_TIME_SLEWED ? "+SLEWED " : "";
            alert_msg += this.SIM_TIME_NEGATIVE ? "+TIME_SLIDE " : "";
            alert_msg += this.SIM_TIME_ENGINE ? "+MOTOR" : "";
		
	     document.querySelector(".task-alerts").innerHTML = alert_msg;
	     document.querySelector(".task-alerts").style.display = "block";    
        }
        

        document.querySelector(".task-state .distance .number").innerHTML = this.displayValue(B21_SOARING_ENGINE.task.distance_m(),"m","dist");
        document.querySelector(".task-state .distance .unit").innerHTML = this.units.dist.pref;
        document.querySelector(".task-state .arrivalheight .number").innerHTML = this.displayValue(B21_SOARING_ENGINE.task.finish_wp().arrival_height_msl_m,"m","alt"); 
        document.querySelector(".task-state .arrivalheight .unit").innerHTML = this.units.alt.pref;

        if(B21_SOARING_ENGINE.task_started()) {
            document.getElementById("tasklist").setAttribute("class","task_running hasScrollbars");
        } 
        
        if (B21_SOARING_ENGINE.task_finished()) {
            document.getElementById("tasklist").setAttribute("class","task_finished hasScrollbars");
        }

        for (let wp_index=0; wp_index<B21_SOARING_ENGINE.task_length(); wp_index++) {
            let wp_el = document.getElementById("wp_" + wp_index);
            let wp = B21_SOARING_ENGINE.task.waypoints[wp_index];

            if (wp_index == B21_SOARING_ENGINE.task_index()) {
                wp_el.classList.add("iscurrentwp")
            } else {
                wp_el.classList.remove("iscurrentwp")
            }

            if(wp_index >= B21_SOARING_ENGINE.task.start_index && wp_index <= B21_SOARING_ENGINE.task.finish_index) {
                if (wp.leg_is_completed) {
                    wp_el.classList.add("wp-ok");
                    document.getElementById("tasklist").appendChild(wp_el);
                }
            
                wp_el.querySelector(".wp-name").innerHTML = wp.name + " (" + this.displayValue(wp.alt_m, "m", "alt") + this.units.alt.pref + ")"; 
                wp_el.querySelector(".bearing .number").innerHTML = wp.leg_bearing_deg.toFixed(0);
                wp_el.querySelector(".dist .number").innerHTML = this.displayValue(wp.leg_distance_m, "m", "dist");
                wp_el.querySelector(".dist .unit").innerHTML = this.units.dist.pref;
                wp_el.querySelector(".ete .number").innerHTML = (wp.ete_s / 60).toFixed(0);
                wp_el.querySelector(".ete .unit").innerHTML = "min";
                wp_el.querySelector(".wind .number").innerHTML = this.displayValue(wp.tailwind_ms, "ms", "windspeed");
                wp_el.querySelector(".wind .unit").innerHTML = this.units.windspeed.pref;
                wp_el.querySelector(".arr-msl .number").innerHTML = this.displayValue(wp.arrival_height_msl_m, "m", "alt");
                wp_el.querySelector(".arr-msl .unit").innerHTML = this.units.alt.pref;
		wp_el.querySelector(".arr-agl .number").innerHTML = this.displayValue(wp.arrival_height_msl_m - wp.alt_m, "m", "alt");
                wp_el.querySelector(".arr-agl .unit").innerHTML = this.units.alt.pref;    

		if( wp.arrival_height_msl_m - wp.alt_m < 0 ) { wp_el.querySelector(".arr-agl").classList.add("alert") } else { wp_el.querySelector(".arr-agl").classList.remove("alert")}   
		    
                if(wp.min_alt_m != null) {
                    wp_el.querySelector(".wp-min").innerHTML = "Min: " + this.displayValue(wp.min_alt_m, "m", "alt") +  this.units.alt.pref;
                    
		    if( wp.arrival_height_msl_m < wp.min_alt_m ) { 
			wp_el.querySelector(".arr-msl").classList.add("alert");
		    	wp_el.querySelector(".wp-min").classList.add("alert");
		    } else { 
			wp_el.querySelector(".arr-msl").classList.remove("alert")}	
			wp_el.querySelector(".wp-min").classList.remove("alert");
			}
	         }
		
		if(wp.max_alt_m != null) {
                    wp_el.querySelector(".wp-max").innerHTML = "Max: " + this.displayValue(wp.max_alt_m, "m", "alt") +  this.units.alt.pref;
                    
		    if( wp.arrival_height_msl_m > wp.max_alt_m ) { 
			wp_el.querySelector(".arr-msl").classList.add("alert");
		    	wp_el.querySelector(".wp-max").classList.add("alert");
		    } else { 
			wp_el.querySelector(".arr-msl").classList.remove("alert")}	
			wp_el.querySelector(".wp-max").classList.remove("alert");
			}
	          }
				    
		
		} 
            } else {
                wp_el.style.display = "none";
            }  
        }       
    }

    build_taskpage() {
        let template = document.getElementById("wp-template");
        let templateContent = template.innerHTML;
        let check = 1;
        
        for (let wp_index=0; wp_index<B21_SOARING_ENGINE.task_length(); wp_index++) {
            let wp_el = template.cloneNode();
            wp_el.innerHTML = templateContent;
            wp_el.setAttribute("id","wp_" + wp_index);
		
		wp_el.querySelector(".wp-link").addEventlistener("click", (e)=> {
			e.target.parentNode.classList.toggle("expanded");
		})
		
            document.getElementById("tasklist").appendChild(wp_el);
            check++;
        }
        console.log("Task page built. Number of WP: " + check);
        this.taskpage_built = true;
    }

    popalert(headline,text,dur,col) {
        let d = dur != null ? dur : 5;
        let c = col != null ? col : "#ff0000";
        let pop = document.getElementById("alert");
        pop.querySelector("h2").innerHTML = headline;
        pop.querySelector("p").innerHTML = text;
        pop.style.backgroundColor = c;

        pop.style.display = "block";
        window.setTimeout(function() { pop.style.display = "none"; }, d * 1000);
        
    }

    get_position() {
        return new LatLong(SimVar.GetSimVarValue("A:PLANE LATITUDE", "degrees latitude"),
            SimVar.GetSimVarValue("A:PLANE LONGITUDE", "degrees longitude"));
    }

    task_active() {
        return false;
    }



    /****************************************************************************************/

    // Task Management by B21 Soaring Engine  //


    engine_event_callback(event_name, args) {
        console.log("lx9050 engine event "+event_name, args);
        let WP = args["wp"];

        switch (event_name) {
            case "TASK_WP_CHANGE":
                // this.update_task_page(); // { wp }
                break;

            case "TASK_WP_COMPLETED":
                this.message_task_wp_completed(WP); // { wp }
                break;

            case "TASK_WP_NOT_COMPLETED":
                this.message_task_wp_not_completed(WP); // { wp }
                break;

            case "TASK_START":
                this.message_task_start(WP, args["start_local_time_s"], args["start_alt_m"]); // { wp, start_local_time_s, start_alt_m }
                break;

            case "TASK_START_TOO_LOW":
                this.message_task_start_too_low(WP); // { wp }
                break;

            case "TASK_START_TOO_HIGH":
                this.message_task_start_too_high(WP); // { wp }
                break;

            case "TASK_FINISH":
                this.message_task_finish(WP, args["finish_speed_ms"], args["completion_time_s"]); // { wp }
                break;

            case "TASK_FINISH_TOO_LOW":
                this.message_task_finish_too_low(WP); // { wp }
                break;

            case "TASK_FINISH_TOO_HIGH":
                this.message_task_finish_too_high(WP); // { wp }
                break;

            default:
                console.log("engine event unrecognized "+event_name, args);

        }
    }


    // ***********************************************************************************
    // *************** B21 Popup Messages                          *******************
    // ***********************************************************************************
    //  this.message_task_wp_completed(WP);
    //  this.message_task_wp_not_completed(WP);
    //  this.message_task_start(WP, start_local_time_s, start_alt_m);
    //  this.message_task_start_too_low(WP);
    //  this.message_task_start_too_high(WP);
    //  this.message_task_finish(WP, finish_speed_ms, completion_time_s);
    //  this.message_task_finish_too_low(WP);
    //  this.message_task_finish_too_high(WP);

    engine_task_wp_change(args) {

    }

    // Start the task
    message_task_start(wp, start_local_time_s, start_alt_m) {
        // Display "TASK START" message
        let hl = "TASK STARTED ";
        let t = this.displayValue(parseInt(start_local_time_s),"s","time_of_day")+"<br/>";
        t += wp.name+"<br/>";
        t += this.displayValue(start_alt_m,"m","alt") + this.units.alt.pref;
        // this.task_message(msg_str, 5); // Display start message for 5 seconds
        this.popalert(hl,t,5,"#26783c");
    }

    message_task_start_too_low(wp) {
        // Display started too low message
        let hl = "BAD START";
        let msg_str = "<br/>" + this.displayValue(this.vars.alt.value,"feet","alt") + this.units.alt.pref;
        msg_str += "<br/>&gt;&gt;&nbsp;TOO LOW&nbsp;&lt;&lt;";
        msg_str += "<br/>MIN HEIGHT: " + this.displayValue(wp.min_alt_m,"m","alt") + this.units.alt.pref;
        // this.task_message(msg_str, 6, true); // Display start message for 5 seconds
        this.popalert(hl,msg_str,5,"#ff0000");
    }

    message_task_start_too_high(wp) {
        // Display started too low message
        let hl = "BAD START";
        let msg_str = "<br/>" + this.displayValue(this.vars.alt.value,"feet","alt") + this.units.alt.pref;
        msg_str += "<br/>&gt;&gt;&nbsp;TOO HIGH&nbsp;&lt;&lt;";
        msg_str += "<br/>MAX HEIGHT: " + this.displayValue(wp.max_alt_m,"m","alt") + this.units.alt.pref;
        // this.task_message(msg_str, 6, true); // Display start message for 5 seconds
        this.popalert(hl,msg_str,5,"#ff0000");
    }

    message_task_wp_completed(wp) {
        // this.task_message(wp.name+" OK",2);
        this.popalert(wp.name+" OK","",3,"#26783c");
    }

    message_task_wp_not_completed(wp) {
        // this.task_message(wp.name+"<br/>NOT TASK",3,true);
        this.popalert(wp.name+" NOT TASK","",3,"#ff0000");
    }

    message_task_finish(wp, finish_speed_ms, completion_time_s) {
        // Display "TASK COMPLETED" message
        let hl = "TASK COMPLETED ";
        let msg_str = this.displayValue(finish_speed_ms,"ms","speed")  + this.units.speed.pref; + "<br/>";
        msg_str += this.displayValue(this.vars.localtime.value,"s","time_of_day")+"<br/>";
        msg_str += wp.name+"<br/>";
        msg_str += "SEE TASK PAGE.";
        // this.task_message(msg_str, 10); // Display start message for 3 seconds
        this.popalert(hl,msg_str,5,"#26783c");
    }

    message_task_finish_too_low(wp) {
        // Display finished too low message
        let hl = "BAD FINISH";
        let msg_str = this.displayValue(this.vars.alt.value,"feet","alt") + this.units.alt.pref;
        msg_str += "<br/>&gt;&gt;&nbsp;TOO LOW&nbsp;&lt;&lt;";
        msg_str += "<br/>MIN HEIGHT: " + this.displayValue(wp.min_alt_m,"m","alt") + this.units.alt.pref;
        // this.task_message(msg_str, 6, true); // Display start message for 5 seconds
        this.popalert(hl,msg_str,5,"#ff0000");
    }

    message_task_finish_too_high(wp) {
        // Display started too low message
        let hl = "BAD FINISH";
        let msg_str = this.displayValue(this.vars.alt.value,"feet","alt") + this.units.speed.pref;
        msg_str += "<br/>&gt;&gt;&nbsp;TOO HIGH&nbsp;&lt;&lt;";
        msg_str += "<br/>MAX HEIGHT: " + this.displayValue(wp.max_alt_m,"m","alt") + this.units.alt.pref;
        // this.task_message(msg_str, 6, true); // Display start message for 5 seconds
        this.popalert(hl,msg_str,5,"#ff0000");
    }


}



    







registerInstrument("lxn-nav", lxn);

