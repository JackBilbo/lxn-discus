class navmap {
    constructor(instrument) {
        this.instrument = instrument; // Reference to main instrument
    
        // Colors for B21 Soaring Engine Task Management - task will be drawn in dashed lines of these colors
        this.TASK_LINE_WIDTH = 4;
        this.TASK_LINE_DASH_SIZE = 30;
        this.TASK_LINE_CURRENT_COLOR = "#FF9D1E";     // colors just for the current leg
        this.TASK_LINE_CURRENT_COLOR_ALT = "#44273F"; // darker orange?
        this.TASK_LINE_COLOR = "#C60AC6";       // for all task legs except current
        this.TASK_LINE_COLOR_ALT = "#C60AC6";

        this.WAYPOINT_CIRCLE_COLOR = "#FF9D1E";
        this.WAYPOINT_CIRCLE_COLOR_ALT = "#44273F";
        this.WAYPOINT_CIRCLE_WIDTH = 4;

        this.RANGE_COLOR = "#FF9D1E";
        this.RANGE_COLOR_ALT = "#44273F";
        this.RANGE_DASH_SIZE = 30;
        this.RANGE_WIDTH = 4;

        this.WP_SELECTED_COLOR = "#FFFF66";
        this.WP_NON_TASK_COLOR = "#999999";

        this.map_zoom = 12;
        this.map_maxzoom = 16;
        this.map_minzoom = 8;
        this.map_rotation = "northup";
        this.taskispainted = false;
        this.mapwaypoints = [];

        this.taskgeojson = "";

        this.map_overlay_el = document.getElementById("lx_9050_map_overlay");
        this.task_svg_el = document.getElementById("lx_9050_task");
        
        TOPOMAP = "noinit";
    }

    // ***********************************************************************
    // ********** MSFS Map Initialization from B21 ****************
    // **********************************************************************

    // load_map called from Update(), only executes once
    load_map() {

        // Map will be initialised on the 10th update cycle from aircraft load
        if (this.load_map_called == null || this.load_map_called < 20) {
            this.load_map_called = this.load_map_called == null ? 1 : this.load_map_called + 1;

            document.querySelector(".loader .bar").style.width = (this.load_map_called * 5) + "%";

            if (this.load_map_called == 20) { // this is experimental code to delay the
                // Map elements

                this.smallairportIcon = L.icon({
                    iconUrl: '/Pages/VCockpit/Instruments/Shared/Map/Images/ICON_MAP_AIRPORT_NON_TOWERED_NON_SERVICED_PINK.png',
                    iconSize:     [32, 32], // size of the icon
                    shadowSize:   [0, 0], // size of the shadow
                    iconAnchor:   [16, 16], // point of the icon which will correspond to marker's location
                    shadowAnchor: [0, 0],  // the same for the shadow
                    popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
                });

                this.bigairportIcon = L.icon({
                    iconUrl: '/Pages/VCockpit/Instruments/Shared/Map/Images/ICON_MAP_AIRPORT_TOWERED_SERVICED_BLUE.png',
                    iconSize:     [32, 32], // size of the icon
                    shadowSize:   [0, 0], // size of the shadow
                    iconAnchor:   [16, 16], // point of the icon which will correspond to marker's location
                    shadowAnchor: [0, 0],  // the same for the shadow
                    popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
                });

                // init Map
                
                let lat = parseFloat(SimVar.GetSimVarValue("A:PLANE LATITUDE", "degrees latitude"));
                let long = parseFloat(SimVar.GetSimVarValue("A:PLANE LONGITUDE", "degrees longitude"));

                TOPOMAP = L.map('Map').setView([lat,long], this.map_zoom);
                
                /* https://a.tile.opentopomap.org/{z}/{x}/{y}.png */
                L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
                        maxZoom: this.map_maxzoom,
                        minZoom: this.map_minzoom,
                        subdomains:['mt0','mt1','mt2','mt3'],
                        attribution: '© OpenStreetMap'
                }).addTo(TOPOMAP);

                this.taskgeojson = L.geoJSON("", {style: function(feature) { return feature.properties; }}).addTo(TOPOMAP); 

                NAVPANEL.buildAirportList();

                this.map_instrument_loaded = true;

                let navmap = this;
                document.querySelector("#map_orientation").addEventListener("click", function() {
                    if(navmap.map_rotation == "trackup") {
                        navmap.map_rotation = "northup";
                        document.querySelector("#battery_required").setAttribute("class","map_northup");
                    } else {
                        navmap.map_rotation = "trackup";
                        document.querySelector("#battery_required").setAttribute("class","map_trackup");
                    }
            
                    navmap.set_map_rotation(navmap.map_rotation);
                });
            
                document.querySelector("#map_zoomin").addEventListener("click", function() {
                    navmap.zoom_in();
                })
            
                document.querySelector("#map_zoomout").addEventListener("click", function() {
                    navmap.zoom_out();
                })
                
            }

                
        }

        if (this.map_instrument_loaded) {
            // this.update_sim_time();
            this.update_map();

            if(this.map_rotation == "northup") {
                document.getElementById("glidericon").style.transform = "rotate(" + this.instrument.vars.hdg.value + "deg)";
                document.getElementById("Map").style.transform = "rotate(0deg) scale(3)";
            } else {
                document.getElementById("glidericon").style.transform = "rotate(0deg)";
                document.getElementById("Map").style.transform = "rotate(-" + this.instrument.vars.hdg.value + "deg) scale(3)";
            }

            if(this.instrument.vars.ias.value > 20) {
                document.getElementById("ac_trk").style.transform = "rotate(" + (this.instrument.vars.trk.value - this.instrument.vars.hdg.value) + "deg)";
            } 
            
        } 
    }

    // Update contents of the Map div, i.e. the MapInstrument, bing-map and Task overlay
    // Called from Update() only if this.map_instrument_loaded is true.
    update_map() {

        this.update_map_center();
        this.draw_courseline();

        this.ex=42;
        // Before draw_task(), we need to check SvgMap (navMap) is ready after startup
        if (B21_SOARING_ENGINE.task_active() && this.taskispainted == false) {
           this.draw_task();
           
        }
    }

    updateTaskline() {
        if(this.taskgeojson == "") { return; }
        this.taskgeojson.eachLayer(function(taskline) {
            if(taskline.feature.properties["id"] == B21_SOARING_ENGINE.task_index() ) {
                taskline.setStyle({
                    color: NAVMAP.TASK_LINE_CURRENT_COLOR,
                    stroke: NAVMAP.TASK_LINE_CURRENT_COLOR,
                    fillOpacity: 1,
                    weight: NAVMAP.TASK_LINE_WIDTH
                });
                if(NAVMAP.mapwaypoints[taskline.feature.properties["id"]]) {
                    NAVMAP.mapwaypoints[taskline.feature.properties["id"]].setStyle({
                        fillColor: NAVMAP.TASK_LINE_CURRENT_COLOR,
                        color: NAVMAP.TASK_LINE_CURRENT_COLOR,
                    })
                }
            } else {
                taskline.setStyle({
                    color: NAVMAP.TASK_LINE_COLOR,
                    stroke: NAVMAP.TASK_LINE_COLOR,
                    fillOpacity: 1,
                    weight: NAVMAP.TASK_LINE_WIDTH
                });
                if(NAVMAP.mapwaypoints[taskline.feature.properties["id"]]) {
                    NAVMAP.mapwaypoints[taskline.feature.properties["id"]].setStyle({
                        fillColor: NAVMAP.TASK_LINE_COLOR,
                        color: NAVMAP.TASK_LINE_COLOR,
                    })
                }
            }
        });
    }

    set_map_rotation(rotation) {
        switch (rotation) {
            case "northup":
                try {
                    this.map_rotation = "northup";
                } catch (e) {
                    console.log("setRotationMode NorthUp error",e);
                }
                break;

            case "trackup":
                try {
                    this.map_rotation = "trackup";
                } catch (e) {
                    console.log("setRotationMode TrackUp error",e);
                }
                break;

            default:
                this.ex = "MapRot";
                throw "Map Rotation Error";
        }

        // this.change_map_center();
    }


    zoom_in() {
        this.map_zoom = this.map_zoom < this.map_maxzoom ? this.map_zoom + 1 : this.map_maxzoom;
    }

    // Zoom map out (i.e. zoom index += 1)
    zoom_out() {
        this.map_zoom = this.map_zoom > this.map_minzoom ? this.map_zoom - 1 : this.map_minzoom;
    }


    // Return current zoom index
    get_zoom() {
        return TOPOMAP.getZoom();
    }

    update_map_center() {
        let lat = parseFloat(SimVar.GetSimVarValue("A:PLANE LATITUDE", "degrees latitude"));
        let long = parseFloat(SimVar.GetSimVarValue("A:PLANE LONGITUDE", "degrees longitude"));
        TOPOMAP.setView([lat,long], this.map_zoom);
    }

    draw_task() {
        for (let wp_index = 0; wp_index < B21_SOARING_ENGINE.task_length(); wp_index++) {

            // Draw line p1 -> p2 (solid for current leg, dashed for other legs)
            this.add_task_line(wp_index);

            
            if (wp_index == B21_SOARING_ENGINE.task.start_index && B21_SOARING_ENGINE.task_index() <= B21_SOARING_ENGINE.task.start_index) {
                this.ex="ut.4.2."+wp_index;
                // Draw start line at this WP
                this.add_start_line(wp_index);
            } else if (wp_index == B21_SOARING_ENGINE.task.finish_index) {
                this.ex="ut.4.3."+wp_index;
                this.add_finish_line(wp_index);
            } else if (wp_index > B21_SOARING_ENGINE.task.start_index && wp_index < B21_SOARING_ENGINE.task.finish_index) {
                // Draw WP radius
                this.add_wp_radius(wp_index);
            }
            

        }

        this.taskispainted = true;
    }

    // Draw distance circles around next WP (between plane position and WP)
    // Currently not used to reduce clutter
    draw_range_circles(svg_parent) {
        if (!B21_SOARING_ENGINE.task_active()) {
            return;
        }

        let wp_LL = B21_SOARING_ENGINE.current_wp().position;

        // Draw 5 range circles around current wp
        for (let i=0; i<5; i++) {
                let circle_distance_m = (i+1) * 10000; // 10 km range circles
                if (circle_distance_m > B21_SOARING_ENGINE.current_wp().distance_m) {
                    break;
                }
                let circle = this.svg_circle(wp_LL, (i+1) * 10000, 5, this.RANGE_COLOR) ;//, 30, 0) ;//this.RANGE_WIDTH, this.RANGE_COLOR, this.RANGE_DASH_SIZE, 0);
                svg_parent.appendChild(circle);
                /* circle = this.svg_circle(wp_LL, (i+1) * 10000, this.RANGE_WIDTH, this.RANGE_COLOR_ALT, this.RANGE_DASH_SIZE, this.RANGE_DASH_SIZE);
                svg_parent.appendChild(circle); */
        }
    }


    add_task_line(wp_index) {
        // Cannot add a task line for the first waypoint in the task
        if (wp_index==0) { //B21_SOARING_ENGINE.task_length()-1) {
            return;
        }

        // Don't add a task line before the start
        if (B21_SOARING_ENGINE.task.start_index != null && wp_index <= B21_SOARING_ENGINE.task.start_index) {
            return;
        }

        // Don't add task line after the finish line
        if(B21_SOARING_ENGINE.task.finish_index != null && wp_index > B21_SOARING_ENGINE.task.finish_index) {
            return;
        }

        let wp = B21_SOARING_ENGINE.task.waypoints[wp_index];
        
        // Check if we want to HIGHLIGHT this task line,
        // i.e. the line to the current waypoint (will choose color) or current WP is start and this is NEXT leg
        const current_task_line = wp_index == B21_SOARING_ENGINE.task_index() ||
                                (wp_index - 1 == B21_SOARING_ENGINE.task_index() && B21_SOARING_ENGINE.task.start_index == B21_SOARING_ENGINE.task_index()) ;

        const line_color = current_task_line ? this.TASK_LINE_CURRENT_COLOR : this.TASK_LINE_COLOR;

        var waypointline = {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [wp.position.long, wp.position.lat],
                    [B21_SOARING_ENGINE.task.waypoints[wp_index-1]["position"].long,B21_SOARING_ENGINE.task.waypoints[wp_index-1]["position"].lat]
                ]
            },
            "properties":{"id": wp_index,"weight": this.TASK_LINE_WIDTH, "color":line_color, "fillColor":line_color }
        };

        this.taskgeojson.addData(waypointline);

    }

    add_wp_radius(wp_index) {
        let wp = B21_SOARING_ENGINE.task.waypoints[wp_index];
        let wp_LL = wp.position;
        let radius_m = wp.radius_m;

        this.mapwaypoints[wp_index] = L.circle([wp.position.lat, wp.position.long], wp.radius_m, {
            color: this.TASK_LINE_COLOR,
            fillColor: this.TASK_LINE_COLOR,
            fillOpacity: 0.3
        }).addTo(TOPOMAP);
    }

    // Draw a line perpendicular to the leg to the NEXT waypoint
    add_start_line(wp_index) {
        // Cannot draw a start line on last waypoint
        if (wp_index >= B21_SOARING_ENGINE.task_length() - 1) {
            return;
        }

        let wp = B21_SOARING_ENGINE.task.waypoints[wp_index];

        var waypointline = {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [wp["leg_start_p1"].long, wp["leg_start_p1"].lat],
                    [wp["leg_start_p2"].long,wp["leg_start_p2"].lat]
                ]
            },
            "properties":{"id": wp_index,"weight": this.TASK_LINE_WIDTH, "color": this.TASK_LINE_COLOR, "fillColor": this.TASK_LINE_COLOR }
        };

        this.taskgeojson.addData(waypointline);

    }

    // Draw a line perpendicular to the leg from the PREVIOUS waypoint
    add_finish_line(wp_index) {
        // Cannot draw a finish line on the first waypoint
        if (wp_index==0) {
            return;
        }

        let wp = B21_SOARING_ENGINE.task.waypoints[wp_index];

        var waypointline = {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [wp["leg_finish_p1"].long, wp["leg_finish_p1"].lat],
                    [wp["leg_finish_p2"].long,wp["leg_finish_p2"].lat]
                ]
            },
            "properties":{"id": wp_index,"weight": this.TASK_LINE_WIDTH, "color": this.TASK_LINE_COLOR, "fillColor": this.TASK_LINE_COLOR }
        };

        this.taskgeojson.addData(waypointline);

    }

    draw_courseline() {
        let targetcoords;
        
        if(UI.pagepos_x == 0 && NAVPANEL.selectedAirport.coordinates.lat) { 
            targetcoords = [[this.instrument.PLANE_POSITION.lat, this.instrument.PLANE_POSITION.long],[NAVPANEL.selectedAirport.coordinates.lat, NAVPANEL.selectedAirport.coordinates.long]];
        } else if(UI.pagepos_x == 1) {
            targetcoords = [[this.instrument.PLANE_POSITION.lat, this.instrument.PLANE_POSITION.long],[B21_SOARING_ENGINE.current_wp().position.lat, B21_SOARING_ENGINE.current_wp().position.long]];
        } else {
            return;
        }

        if(this.courseline != null) {
            this.courseline.setLatLngs(targetcoords);
        } else {
            this.courseline = new L.Polyline(targetcoords, {
                color: this.TASK_LINE_CURRENT_COLOR,
                weight: 3,
                opacity: 1        
            }).addTo(TOPOMAP);
        }
    }

    resetMap() {
        TOPOMAP.off()
        TOPOMAP.remove();
        document.getElementById("Map").innerHTML = "";

        this.courseline = null;
        this.load_map_called = 10;
        this.map_instrument_loaded = false;
        this.taskispainted = false;


    }
}