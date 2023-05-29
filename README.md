# lxn-discus
Replacement mod for the GotFriends Discus' Nav computer

<h2>New Features:</h2>

Mod adapted for Discus Version 2.0.6

CHANGED KEYBINDS: some users experienced problems with binding to com frequencies. Changeing pages left/right and up/down are now bound to autopilot altitude and vertical speed settings:

- Page left/right:    INCREASE/DECREASE AUTOPILOT REFERENCE ALTITUDE
- Page up/down:       INCREASE/DECREASE AUTOPILOT REFERENCE VS

Please adjust your keybinds

Fixed a bug where conditional background colors in data fields failed for altitude values >10k 

Lots of text corrections. Thanks to Jonx!

Map loading should be stable now. No more silly loading bar.

New feature: automatic log. If activated in interface settings the log will autostart once you reach 100m AGL. You can display log distance, time, altitude climbed and average ground speed. For people like me, who like to fly around without flightplan and still like to see some statistics :-)

Some new info selectable for data fields: total energy, netto, glide ratios.

For more in depth info about setting up glider flights, planning and using this mod for navigation check out David Aldrich's excellent video:

https://www.youtube.com/watch?v=Ftn-_smpZ0c&t=1537s

- Compatible with Discus 2.0.5

- Hardware buttons in cockpit remapped:
  - top left: map zoom
  - bottom left: page right/left
  - bottom right: page up/down

No more "click and drag" for page switch

various bug fixes
  

<h2>Installation:</h2>

Simply drop the included folder "gotfriends-discus2c-premium-lxn" into your community folder. If you use the freeware version you need to change the folder name to "gotfriends-discus2c-freeware-lxn", everything else will work fine in both versions. No need to change anything in your existing installation. To uninstall, delete the folder and you're "back to normal". 

You may experience conflicts with other existing mods, especially livery mods. See below for possible solutions.

<h2>Basic Features:</h2>

All Information is organized in „pages“ (horizontally) and „sub-pages“ (vertically). Pages can be changed by „turning“ the rotary buttons on the bottom of the screen: left turns pages left/right, right button switches up/down. Alternatively you can keybind „INCREASE/DECREASE COM1 (WHOLE)“ for horizontal and „INCREASE/DECREASE COM1 (FRACT)“ for vertical scrolling.
All Information is organized in „pages“ (horizontally) and „sub-pages“ (vertically). Pages can be changed by „turning“ the rotary buttons on the bottom of the screen: left turns pages left/right, right button switches up/down. Alternatively you can keybind „INCREASE/DECREASE COM1 (WHOLE)“ for horizontal and „INCREASE/DECREASE COM1 (FRACT)“ for vertical scrolling.

Currently there are five main pages: „APT“ for navigation to the selected Airport, „WPT“ for navigating a task/flightplan, „TASK“ for the current state of the task, "Kinetic Assitant" for launching through KA and „CONFIG“ for Unit switching, ballast management and some system settings. 

„APT“ Page automatically selects the nearest Airport as target. On the first subpage there's a bit of info about that airport including runway orientation and dimensions. The second subpage features a list of close airports where you can click any airport to select it for navigation. Click the selected airport again to return to "closest airport navigation". On the map a yellow line will be drawn from your glider to the selected airport to show the direction to fly.

"WPT" is similar, except the navigation target is the current waypoint of the loaded flightplan. Using the buttons in the headerbar waypoints can be selected. The map will also show a yellow course-line from your glider to the waypoint to indicate the direction to fly. As a subpage to "WPT" you find a "thermalling help" page, displaying wind, climb and average climb for the current/last therma (a "thermal" is detected, when circling for more than 25 seconds). The lower section displays a bar chart of all thermals in the last 40 minutes on the left and a graph of climb/sink values during the last five minutes in the right half.

„APT“ and „WPT“ feature a maximum of 16 data fields each, that can be configured in game. The „tools“ button in the upper right hand corner of the map toggles „configuration mode“. Data fields are then marked with a light blue outline. Click any data field to bring up a popup, where you can set background color, text color and Information to be displayed. A second background color can be selected to be displayed when the displayed value <= 0 (e.g. switch background to red when arrival height is negative)

Data field configurations are persistent between simulator sessions. Click „reset all“ in the configuration popup to reset all data fields to default. Configurations are also persitent with different versions of this mod, so if you used another version or install an update, your settings will be save. There is however a slight chance, that a variable name gets mixed up, so if you experience any erratic behaviour with the datafields, try "reset all" and see if that helps.

Data fields can be forced to use either metric or imperial units of measurement. Use with caution. If activated, the datafield will ignore the global unit selection. This feaature gives you the option to e.g. display altitude in feet side by side with altitude in meters. If a datafield has been configured this way an "*" is shown next to the unit as a reminder. 

In standard mode the data fields are rather small and can be hard to read especially in VR. As a solution an "improved readability" mode can be activated in the "interface options". That mode shows only six data fields per page but with much larger text. Also a few other interface elements are enlarged in this mode.

The task management system is Ian „B21“ Lewis’ Soaring Engine from the AS33. Some features like calculating glide ratios could not be recreated, as they are dependent of other instruments in the AS33. Others are still on the to do list.

The wind indicator in the center of the map is loosely based on the real world LX-„Hawk“ system displaying current (blue) and average (grey) wind-arrows and a green/red column indicator for the vertical wind component.

The Config-Page gives you access to various settings:

- Water Ballast System: A light version of ballast loading system that can even be used in flight - which would be shameless cheating of course!
- Aircraft Settings: Options that are originally controlled by knobs and buttons around the display. Moved here to free up the buttons for future use.
- Units of Measurement: allows you to select the units of measurement to use for various categories or generally "metric" or "imperial" system. Only "metric" or "imperial" settings have an effect on other instruments in the cockpit. Detailled settings only work inside the nav computer.
- Interface Options: Settings for the Nav Interface: 
  - "Readability Mode" can be activated here to get some bigger readouts (and less data fields) 
  - toggle liftdot-trail on the map
  - Visual stall warning. If activated, the screen will flash red when the aircraft is close to a stall.
  - Toggle cockpit warnings for gear, ballast and overspeed
  - Toggle aviation specific info on the map (can be slow to load and clutter the map)
  - Enable or disable automatic logging. If enabled logged time, distance, average speed and altitude climbed can be displayed in data fields. Log starts autoamtically at 100m AGL and stops on touchdown

All config settings apart from ballast are persistent between sessions. Just make sure to click "close" after making any changes.

All config settings apart from bugs and ballast are persistent between sessions. Just make sure to click "close" after making any changes.



<h2>Some more Details</h2>

The map view features a lot of information to help you optimize your flight:

- There are three thin lines pointing away from your glider:
  - the blue line is simply your plane's heading
  - the pink/magenta line is your gps ground track, the direction, your plane is travelling over the terrain. The stronger a crosswind, the more this will deviate from your heading.
  - the yellow line points to your current nav target. Depending on which page you are, this is the selected airport or the current waypoint. So as a rule of thumb: "put the pink on the yellow" and you're going where you are supposed to go ;-)
  
- Your loaded flightplan is diplayed as the current "task" in broader pink/magenta lines, circles and semi circles.
  - the active "leg" of the task is displayed in black/yellow stripes leading from the last waypoiont to the current one.
  - Semi circles indicate the start and finish lines of the task, where the task timer will start and stop automatically.
  - Small pink circles mark the turnpoints of the task. Entering the circle around the current waypoint will trigger the "waypoint ok" message and automatically switch to the next wp. But take a good look on the task page, if there are "Min/Max" values for the waypoint for altitude restrictions (usually for start and/or finish waypoints)
  
To make all this soaring task magic work, the flightplan needs to provide more information than usually present in MSFS generated flightplans. Easiest way to achieve that is to use B21's task planner to plan your flights: https://xp-soaring.github.io/tasks/b21_task_planner/index.html

Calculation of estimated arrival height and time enroute is based on the suggested speed to fly (indicated as STF under the speed tape instrument), which is in turn influenced by MacCready setting and carried ballast. In short: the more ballast and the higher MacCready, the higher the calculated speed to fly. The more your actual speed deviates from the calculated speed to fly, the less accurate your arrival height estimations will be. You can also turn that around: on final glide you can turn the MacCready value up and see the estimated arrival height go down (due to more sink at higher speeds) until you get a safe altitude estimation. Now your computer tells you the maximum speed to fly, that still gets you to finish safely.


<h2>Videos with more info</h2>

Thankfully there are a whole lot of talented people out there with iompressive skills in making informative videos:

IWILZ has a great walkthrough on the mod in italian (activate english subtitles, if your italian is as bad as mine): https://www.youtube.com/watch?v=Xiy44W7Pc-c (Mille grazie!)

Another great video to watch is Dave Aldrich's "Glider Setup" which also contains a detailed view on this mod: https://www.youtube.com/watch?v=Ftn-_smpZ0c&t=1537s

To learn more about task planning and flying, check out Ian Lewis' great tutorial (and all his other videos ;-)) on Youtube: https://www.youtube.com/watch?v=u7zJSu4jlPU



<h2>Keybinds</h2>

Several functions can be operated by keybinds from joystick or throttle:

- Page left/right:    INCREASE/DECREASE AUTOPILOT REFERENCE ALTITUDE
- Page up/down:       INCREASE/DECREASE AUTOPILOT REFERENCE VS
- Waypoint next/prev: INCREASE/DECREASE TRANSPONDER (1000)
- Map Zoom:           INCREASE/DECREASE TRANSPONDER (10)
- Map Orientation:    INCREASE/DECREASE TRANSPONDER (1)


<h2>Conflicts with other mods</h2>

Multiple mods changing the same aircraft are prone to conflict somehow. If you run into problems the first and easiest option is to decide, which modification is more important to you and remove the conflicting one. If you absolutely want to keep both, you can try to find out which files conflict. In the case of most livery modifications the conflicting file is the file panel.cfg, that is used to modify aircraft registration. This mod also changes panel.cfg. You can try to solve the conflict by either copying panel.cfg from this mod over to you livery completely, or only copy the section [VCockpit02] from this mod's panel.cfg and paste it to the same file in you livery mod. Sounds way more complicated than it is, but try it at your own risk, of course.

<h2>Developer Info:</h2>

If you have a basic understanding of what HTML, Javascript and CSS are, jump into the code and try your hand on it. There is no black magic involved :-)

The front end is intended to be easily extensible with new features. New pages and sub-pages can be added by simply copy/pasting the respective HTML-Structures.

All variables that are displayed in the frontend are stored in the „this.vars“-object in the file tc-dsic2c-nav.js. This object contains the value itself as well as unit- and label-information and makes the variable user-selectable in the in game configuration popup. To add a new readout to your panel all you have to do is add a line to the „this.vars“-object with your own variable name and label/unit information. When you start the next flight, you can simply assign your variable value to a data field of your choice and if the variable value is manipulated somewhere in the javascript, the cockpit readout will be updated automatically.

If you need a variable displayed somewhere outside of the data fields, you can do so directly in the html using the attributes class=“livedata“ data-value=„VARIABLE“.

Units: All variables are kept in a „base unit“, which is (currently) „imperial“ units. When displayed in a data field or as „livedata“ in the html the value is converted to the user preferred unit. So if you like to display a distance you should store nautical miles in the variable and conversion will be automatic.
