/*
	Version: 2.0.3.
	Discus-2c Cambridge Variometer
	Final Modifications From Brandon Yaeger (Jonx)
	Coding Derived From Ian Lewis (B21)
	Modifications Derived From Alex Marko (Touching Cloud)
*/
Include.addScript("/JS/dataStorage.js");
class cambridge_vario_class extends BaseInstrument {
    constructor() {
        super();
        this.VERSION = "v.203";
        this.version_init_done = false;
//**************//
// 'Constants'  //
//**************//
        this.MS_TO_KT = 1.94384;
        this.MS_TO_KPH = 3.6;
        this.M_TO_F = 3.28084;
        this.MS_TO_FPM = 196.85;
        this.RAD_TO_DEG = 57.295;
        this.curTime = 0.0;
        this.bNeedUpdate = false;
        this._isConnected = false;
		this.lastCheck = 0;
        this.climbValues = new Array(30);
//**************//
// 'Variables'  //
//**************//
        this.time_s = null;
        this.vertical_speed_ms = 0;
        this.airspeed_ms = 0;
        this.altitude_m = 0;
        this.netto_ms = 0;
		this.needle_value_ms = 0;		
		this.windDirection = 0;
        this.windVelocity = 0;
		this.lastWindMeasure = 0;		
		this.POWER_UP_TIME_S = 6;		
		this.initPassed = false;
        this.polar_init();
    }	
    get templateID() {
        return "cambridge_vario_script";
    }	
    connectedCallback() {
        super.connectedCallback();
        let parent = this;
    }	
    disconnectedCallback() {
        super.disconnectedCallback();
    }	
//********************************************************//
// 'Polar Initialization: Discus-2c Standard & FES (18m)' //
//********************************************************//
    polar_init() {
				//[ speed km/h, sink m/s ]//		
		this.polar = [  [  0, 9.81],
                        [ 50, 3.00],
                        [ 65, 1.90],
                        [ 75, 1.30],
                        [ 85, 0.75],
                        [ 90, 0.60],
                        [100, 0.60],
                        [125, 0.67],
                        [150, 0.87],
                        [175, 1.25],
                        [200, 1.78],
                        [225, 2.40],
                        [250, 3.10],
                        [300, 4.75]
                    ];
					
        for (let i=0;i<this.polar.length;i++) {
            this.polar[i][0] = this.polar[i][0] / this.MS_TO_KPH;
        }
    }	
    Update() {
        let x=0;
        let debug_el = document.getElementById("cambridge_vario_debug");
		debug_el.innerHTML = "";
        try { x=2;this.global_vars_update(); } catch (e) { debug_el.innerHTML += " Ex"+x+": "+e; }
        try { x=3;this.total_energy_update(); } catch (e) { debug_el.innerHTML += " Ex"+x+": "+e; }
        try { x=4;this.netto_update(); } catch (e) { debug_el.innerHTML += " Ex"+x+": "+e; }
        try { x=5;this.climb_mode_update(); } catch (e) { debug_el.innerHTML += " Ex"+x+": "+e; }
        try { x=6;this.variometer_update(); } catch (e) { debug_el.innerHTML += " Ex"+x+": "+e; }
        try { x=7;this.wind_indication_update(); } catch (e) { debug_el.innerHTML += " Ex"+x+": "+e; }		
		if (!this.initPassed) {
			try { x=8; this.total_energy_init(); } catch (e) { debug_el.innerHTML += " Ex"+x+": "+e; }
		}
    }	
    rad(x) {
          return x / this.RAD_TO_DEG;
    }	
    get_distance(p1, p2) {
        var R = 6371000;
        var dLat = this.rad(p2.lat - p1.lat);
        var dLong = this.rad(p2.lng - p1.lng);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                        Math.cos(this.rad(p1.lat)) * Math.cos(this.rad(p2.lat)) *
                            Math.sin(dLong / 2) * Math.sin(dLong / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        return d;
    }	
    get_bearing(p1, p2) {
        var a = { lat: this.rad(p1.lat), lng: this.rad(p1.lng) };
        var b = { lat: this.rad(p2.lat), lng: this.rad(p2.lng) };
        var y = Math.sin(b.lng-a.lng) * Math.cos(b.lat);
        var x = Math.cos(a.lat)*Math.sin(b.lat) -
                    Math.sin(a.lat)*Math.cos(b.lat)*Math.cos(b.lng-a.lng);
        return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
    }	
    interpolate(lookup_table, input_value) {
        const INPUT = 0;
        const RESULT = 1;
        let lookup_count = lookup_table.length;
        if (input_value < lookup_table[0][INPUT]) {
            return lookup_table[0][RESULT];
        }		
        if (input_value > lookup_table[lookup_count-1][INPUT]) {
            return lookup_table[lookup_count-1][RESULT];
        }		
        let i = 0;
        while (i < lookup_count && input_value > lookup_table[i][INPUT]) {
            i++;
        }		
        if (i == 0) {
            return lookup_table[0][RESULT];
        }		
        let value_diff = lookup_table[i][INPUT] - lookup_table[i-1][INPUT];
        let result_diff = lookup_table[i][RESULT] - lookup_table[i-1][RESULT];
        let value_ratio = (input_value - lookup_table[i-1][INPUT]) / value_diff;
        return lookup_table[i-1][RESULT] + result_diff * value_ratio;
    }	
    polar_sink(airspeed) {
        return this.interpolate(this.polar, airspeed);
    }	
//***************************************//
// 'Update 'Global' Values from SimVars' //
//***************************************//
    global_vars_update() {
        this.slew_mode = SimVar.GetSimVarValue("IS SLEW ACTIVE", "bool") ? true : false;
        this.global_vars_pause();
        this.global_vars_power();
        this.time_s = SimVar.GetSimVarValue("E:ABSOLUTE TIME", "seconds");
        this.airspeed_ms = SimVar.GetSimVarValue("A:AIRSPEED TRUE", "feet per second") / this.M_TO_F;
        this.vertical_speed_ms = SimVar.GetSimVarValue("A:VELOCITY WORLD Y", "feet per second") / this.M_TO_F;
        this.altitude_m = SimVar.GetSimVarValue("A:INDICATED ALTITUDE", "feet") / this.M_TO_F;
    }	
    global_vars_pause() {
        if (this.pause_mode_previous_speed2 == null) {
            this.pause_mode_previous_speed2 = -99;
        }		
        let speed2 = SimVar.GetSimVarValue("VELOCITY WORLD Z","feet per second")**2 +
                     SimVar.GetSimVarValue("VELOCITY WORLD X","feet per second")**2;
        let on_ground = SimVar.GetSimVarValue("SIM ON GROUND","bool") ? true : false;
        this.pause_mode = !on_ground && (speed2 == this.pause_mode_previous_speed2);
        this.pause_mode_previous_speed2 = speed2;
    }	
    global_vars_power() {
        this.power_switched = false;
	    const new_power_status = SimVar.GetSimVarValue("ELECTRICAL MASTER BATTERY", "boolean") > 0 ? true : false;
        if (typeof this.power_status === "undefined" ) {
            this.power_switched = true;
        } else if (new_power_status && !this.power_status) {
            this.power_switched = true;
        } else if (!new_power_status && this.power_status) {
            this.power_switched = true;
        }		
		SimVar.SetSimVarValue("L:VARIO_POWER_STATUS", "percent", new_power_status ? 100 : 0);		
        this.power_status = new_power_status;
    }	
// ******************************************//
// 'Set "L:TOTAL ENERGY, meters per second"' //
// ******************************************//
    total_energy_init() {
        var wind_el = document.getElementById("variometer_wind");
		for (let k = 0; k < 120; k++) {
			var mark = document.createElement("div");
			mark.style.transform = "rotate("+(k*3)+"deg)";
			wind_el.appendChild(mark);
		}		
		this.initPassed = true;
    }	
    total_energy_update() {
        this.te_ms = SimVar.GetSimVarValue("L:TOTAL ENERGY", "number");
    }	
// ***********************************//
// 'Set "L:NETTO, meters per second"' //
// ***********************************//
    netto_update() {
        if (this.slew_mode || this.pause_mode) {
            return;
        }		
        this.netto_ms = this.te_ms + this.polar_sink(this.airspeed_ms);
        this.netto_ms = Math.max(-7, Math.min(7, this.netto_ms));
        if (this.airspeed_ms < 15) {
            let effective_speed_ms = Math.max(0,this.airspeed_ms - 5);
            this.netto_ms = this.netto_ms * effective_speed_ms / 10;
        }		
//        SimVar.SetSimVarValue("L:NETTO", "meters per second", this.netto_ms);
    }	
    climb_mode_init() {
        this.climb_mode_time_s = this.time_s;
        this.climb_mode_bank_rad = 0;
        this.climb_mode = false;
    }	
    climb_mode_update() {
        if (this.climb_mode_time_s == null) {
            this.climb_mode_init();
            return;
        }
        if (this.airspeed_ms * this.MS_TO_KT < 70 && this.netto_ms > 0.3) {
            this.climb_mode = true;
            return;
        }
        this.climb_mode_bank_rad = SimVar.GetSimVarValue("A:PLANE BANK DEGREES", "radians") * 0.005 + this.climb_mode_bank_rad * 0.995;
        if (this.climb_mode_bank_rad < 0.1 && this.netto_ms < 0.5 ) {
            this.climb_mode = false;
            return;
        }
        if (this.airspeed_ms * this.MS_TO_KT > 70) {
            this.climb_mode = false;
            return;
        }
    }	
// *******************************//
// 'Initialise Values with Power' //
// *******************************//
    variometer_init() {
		var wind_el = document.getElementById("variometer_wind");
		for (let k = 0; k < wind_el.children.length; k++) {
			wind_el.children[k].style.opacity = 1;
		}		
        this.variometer_init_time_s = this.time_s;
        this.variometer_update_time_s = null;
        this.variometer_mode_var = ["LIGHT BEACON ON","boolean"];
        this.variometer_mode = "AUTO";
        this.variometer_previous_mode = "AUTO";
        this.variometer_previous_switch = SimVar.GetSimVarValue(this.variometer_mode_var[0], this.variometer_mode_var[1]);
        this.variometer_previous_climb_mode = null;
        this.variometer_average_te_ms = 0;
        this.variometer_average_netto_ms = 0;
        this.variometer_previous_average_ms = 0;
        this.variometer_mode_time_s = this.time_s;
        this.variometer_altitude_start_m = 0;
        this.querySelector(".variometer_battery_required").style.display = "block";
        this.variometer_display_number(-18.8, true, true);
    }	
    variometer_update() {
        if (this.power_switched) {
            if (this.power_status) {
                this.variometer_init();
            } else {
                this.querySelector(".variometer_battery_required").style.display = "none";
                this.variometer_tone_update(0);
                this.variometer_display_needle(0);
            }			
            return;
        }		
        if (!this.power_status) {
            return;
        }		
        if (this.time_s - this.variometer_init_time_s < this.POWER_UP_TIME_S) {
            const CYCLE_TIME_S = this.POWER_UP_TIME_S * 2 / 3;
            const POWER_UP_DELAY_S = this.POWER_UP_TIME_S - CYCLE_TIME_S;
            let t = this.time_s - this.variometer_init_time_s - POWER_UP_DELAY_S;
            if (t < 0) {
                return;
            }
            let needle_value = -10 * Math.sin(t / CYCLE_TIME_S * 2 * Math.PI);
            this.variometer_display_needle(needle_value);
            return;
        }		
        const UPDATE_S = 3;
        this.variometer_average_te_ms = 0.99 * this.variometer_average_te_ms + 0.01 * SimVar.GetSimVarValue("L:TOTAL ENERGY", "meters per second");
		if (isNaN(this.variometer_average_te_ms))
			this.variometer_average_te_ms = 0;
        this.variometer_average_netto_ms = 0.99 * this.variometer_average_netto_ms + 0.01 * this.netto_ms;
        if (this.variometer_update_time_s == null) {
            this.variometer_display_number(0, false, false);
            this.variometer_update_time_s = this.time_s;
        }		
        let vario_climb_mode = this.variometer_update_mode();
        this.needle_value_ms = 0.8 * this.needle_value_ms + 0.2 * (vario_climb_mode ? SimVar.GetSimVarValue("L:TOTAL ENERGY", "meters per second") : this.netto_ms);
		if (isNaN(this.needle_value_ms))
			this.needle_value_ms = 0;
        this.variometer_display_needle(this.needle_value_ms);
        this.variometer_tone_update(this.needle_value_ms);
        if (vario_climb_mode != this.variometer_previous_climb_mode ||
                this.variometer_mode != this.variometer_previous_mode) {
            this.variometer_mode_time_s = this.time_s;
            this.variometer_update_time_s = this.time_s;
            this.variometer_altitude_start_m = this.altitude_m;
            this.variometer_previous_climb_mode = vario_climb_mode;
            this.variometer_previous_mode = this.variometer_mode;
            this.variometer_average_netto_ms = 0;
            this.variometer_average_te_ms = 0;
            let variometer_auto_climb_el = this.querySelector("#variometer_mode_auto_climb");
            let variometer_climb_el = this.querySelector("#variometer_mode_climb");
            let variometer_cruise_el = this.querySelector("#variometer_mode_cruise");
            if (this.variometer_mode == "CRUISE") {
                variometer_auto_climb_el.style.display = "none";
                variometer_climb_el.style.display = "none";
                variometer_cruise_el.style.display = "block";
            } else if (this.variometer_mode == "CLIMB") {
                variometer_auto_climb_el.style.display = "none";
                variometer_cruise_el.style.display = "none";
                variometer_climb_el.style.display = "block";
            } else {
                variometer_cruise_el.style.display = "none";
                variometer_climb_el.style.display = "none";
                if (vario_climb_mode) {
                    variometer_auto_climb_el.style.display = "block";
                } else {
                    variometer_auto_climb_el.style.display = "none";
                }
            }
        }		
        if (this.time_s - this.variometer_update_time_s > UPDATE_S) {
            this.variometer_update_time_s = this.time_s;
            let average_ms;
            if (this.variometer_mode == "AUTO" && vario_climb_mode ) {
                let climb_duration_s = this.time_s - this.variometer_mode_time_s;
                if (climb_duration_s > 2) {
                    average_ms = (this.altitude_m - this.variometer_altitude_start_m) / climb_duration_s;
                } else {
                    return;
                }				
            } else if (this.variometer_mode == "CLIMB") {
                average_ms = this.variometer_average_te_ms;
            } else {
                average_ms = this.variometer_average_netto_ms;
            }			
            average_ms = Math.round(average_ms*10) / 10;
            let increasing = average_ms > this.variometer_previous_average_ms;
            let decreasing = average_ms < this.variometer_previous_average_ms;
            this.variometer_previous_average_ms = average_ms;
            this.variometer_display_number(average_ms * (SimVar.GetSimVarValue("L:UNITS_IMPERIAL", "bool") == 1 ? this.MS_TO_KT : 1), increasing, decreasing);
        }
    }	
//**************//
// 'VARIOTONE'  //
//**************//
    variometer_tone_update(needle_value_ms) {
		let variometer_muted = this.querySelector("#variometer_muted");
		let variometer_unmuted = this.querySelector("#variometer_unmuted");
		variometer_muted.style.display = SimVar.GetSimVarValue("L:VARIO_TONE_ACTIVE", "percent") == 20 && SimVar.GetSimVarValue("L:VARIO_POWER_STATUS", "bool") ? "block" : "none";
		variometer_unmuted.style.display = SimVar.GetSimVarValue("L:VARIO_TONE_ACTIVE", "percent") > 20 && SimVar.GetSimVarValue("L:VARIO_POWER_STATUS", "bool")  ? "block" : "none";
    }		
    variometer_update_mode() {
        let vario_switch = SimVar.GetSimVarValue("L:VARIO_MODE", "number") / 50;
        if (vario_switch == 1)
			this.variometer_mode = "AUTO";
		else if (vario_switch == 2)
            this.variometer_mode = "CLIMB";
		else 
            this.variometer_mode = "CRUISE";
        let return_climb_mode = this.climb_mode;
        if (this.variometer_mode == "CRUISE") {
            return_climb_mode = false;
        } else if (this.variometer_mode == "CLIMB") {
            return_climb_mode = true;
        }		
        return return_climb_mode;
    }	
    variometer_display_number(display_value, increasing, decreasing) {
        let averager_digits_el = this.querySelector("#variometer_averager_digits");
        let averager_decimal_el = this.querySelector("#variometer_averager_decimal");
        let averager_sign_el = this.querySelector("#variometer_averager_sign");
		if (typeof averager_digits_el !== "undefined" && typeof averager_decimal_el !== "undefined") {
            let v = Math.round(display_value * 10);
            let sign = v <= -1 ? "-" : "";
            v = Math.min(Math.abs(v),199);
            let digits =  Math.trunc(v/10);
            let decimal = v % 10;
            averager_digits_el.innerHTML = digits;
            averager_decimal_el.innerHTML = "" + decimal;
            averager_sign_el.innerHTML = sign;
        }		
        let increasing_el = this.querySelector("#variometer_average_increasing");
        if (typeof increasing_el !== "undefined") {
            increasing_el.style.display = increasing ? "block" : "none";
        }		
        let decreasing_el = this.querySelector("#variometer_average_decreasing");
        if (typeof decreasing_el !== "undefined") {
            decreasing_el.style.display = decreasing ? "block" : "none";
        }
    }	
    variometer_display_needle(needle_value) {
		SimVar.SetSimVarValue("L:VARIO_NEEDLE", "meters per second", needle_value);
        const MIN = -5;
        const MAX = 5;
        const MAX_DEGREES = 179;
		let variometer_needle_el = this.querySelector("#variometer_needle");
		if (typeof variometer_needle_el !== "undefined") {
            needle_value = Math.min(needle_value, MAX);
            needle_value = Math.max(needle_value, MIN);
			let transform = 'rotate('+(needle_value / MAX * MAX_DEGREES)+'deg)';
		    variometer_needle_el.style.transform = transform;
		}
    }	
	wind_indication_update() {
        if (this.time_s - this.variometer_init_time_s < this.POWER_UP_TIME_S) {
            return;
        }		
		var windDirection = SimVar.GetSimVarValue("A:AMBIENT WIND DIRECTION", "degrees");
		while (windDirection - this.windDirection >= 360) { windDirection -= 360; }
		while (windDirection - this.windDirection < 0) { windDirection += 360; }
		if (this.time_s - this.lastWindMeasure > 10) {
			this.windDirection = 0.9 * (this.windDirection + 360) + 0.1 * (SimVar.GetSimVarValue("A:AMBIENT WIND DIRECTION", "degrees") + 360);
			this.windVelocity = 0.9 * this.windVelocity + 0.1 * SimVar.GetSimVarValue("A:AMBIENT WIND VELOCITY", "meters per second");
			while (this.windDirection >= 360) { this.windDirection -= 360; }
			while (this.windDirection < 0) { this.windDirection += 360; }
			this.lastWindMeasure = this.time_s;
		}		
        var wind_el = document.getElementById("variometer_wind");
		var windBearing = windDirection - SimVar.GetSimVarValue("A:PLANE HEADING DEGREES TRUE", "degrees");
		while (windBearing >= 360) { windBearing -= 360; }
		while (windBearing < 0) { windBearing += 360; }
		for (let k = 0; k < wind_el.children.length; k++) {
			var dist = Math.abs(windBearing / 3 - k) / (this.windVelocity * 0.95);
			wind_el.children[k].style.opacity = dist < 1 ? Math.ceil(5 * (1 - dist)) / 5 : 0;
		}
	}
}
registerInstrument("cambridge_vario-element", cambridge_vario_class);