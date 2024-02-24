# lxn-discus
Replacement mod for the GotFriends Discus' Nav computer

<h2>Fixes and Updates:</h2>

<p>Fixed native winch behaviour</p>

<strong>New feature: "Dynamic" calculation of STF depending on lift</strong>

<p>By default, Speed-to-fly-calculation is now corrected for current netto value. As a result, STF is lower in lift, higher in sinking air. 
Simply speaking, this leads to a higher average of lift over time by staying less time in sink areas and longer in lift areas. Thereby total time for a given distance is reduced.
You can switch that option off in the interface settings on the config page. If turned off, you are back to to simply calculating a "static" STF for polar sink in still air. Both values are available as variables to show in data fields. Waypoint arrival heights are always calculated based on the "static" STF, assuming that lift and sink will level out over some distance. Most of the adjustments and calculations for this new STF handling provided by CumulusX.</p>

<strong>New "STF" Vario Mode</strong>

<p>The mode switch to the bottom right of the vario now switches between "normal" Mode, indicating total energy and a new "STF" Mode, that indicates the deviation from calculated speed to fly. Arrow pointing up means "fly slower", down is "faster". Vario sound is also switched to STF-control. To toggle modes from your stick, simpl bind "TOGGLE VARIOMETER SWITCH" to a button. 

<strong>Removed outdated options</strong>

<p>Removed "Auto MacCready Mode" from config toggles.</p>


<h2>Installation:</h2>

Simply drop the included folder "gotfriends-discus2c-premium-lxn" into your community folder - doesn't matter, if you're using the free or premium version. No need to change anything in your existing installation. To uninstall, delete the folder and you're "back to normal". 

You may experience conflicts with other existing mods, especially livery mods. See below for possible solutions.


<h2>Keybinds</h2>

This is a really "frequently asked question" so first up:

Several functions can be operated by keybinds from joystick or throttle:

- Page left/right:    INCREASE/DECREASE AUTOPILOT REFERENCE ALTITUDE
- Page up/down:       INCREASE/DECREASE AUTOPILOT REFERENCE VS
- Waypoint next/prev: INCREASE/DECREASE TRANSPONDER (1000)
- Map Zoom:           INCREASE/DECREASE TRANSPONDER (10)
- Map Orientation:    INCREASE/DECREASE TRANSPONDER (1)
- set MacCready       INCREASE/DECREASE MACCREADY SETTING
- toggle Vario-Mode:  TOGGLE VARIOMETER SWITCH


<h1>Manual and Handling</h1>


The basic idea during development was not to build a "ready to use" instrument, but to build a tool that you can use to build the interface that fits your style of flying and give you the information you're interested in. The bad news: this is not "plug 'n play". You're not supposed to use any of the default settings, but play around and find out what combination of the partly redundant information you like.

All Information is organized in „pages“ (horizontally) and „sub-pages“ (vertically). Pages can be changed by „turning“ the rotary buttons on the bottom of the screen: left turns pages left/right, right button switches up/down (or use the keybinds mentioned above). 

Currently there are five main pages: „APT“ for navigation to the selected Airport, „WPT“ for navigating a task/flightplan, „TASK“ for the current state of the task, "Kinetic Assitant" for launching through KA and „CONFIG“ for Unit switching, ballast management and some system settings. 

<h2>APT/WPT Page</h2>

These are the two main pages, which are largely identical. The main difference is the selected navigation target: "APT" guides you to an airport, "WPT" to the current waypoint in your flight plan. Navigation works the same for both cases: the aircraft icon on the map shows your position. Three lines point away from the aircraft icon: the yellow line points to the current nav target, the blue line is your heading and the magenta line the actual ground track, including the effect of wind drift. As a simple rule of thumb, if you "put the magenta on the yellow" you fly towards your target.

If a glider task was loaded during flight setup in MSFS the "WPT" page will also show the waypoints connected by magenta lines on the map. The current leg and waypoint is highlighted in yellow. 

The name of the target is shown in the black header bar on the very top of the page. Either the Airport name and ICAO or the waypoint name. On WPT page there are also small arrow-buttons in the header bar to select next/previous waypoint.

If the option "dotted glider path" is activated in interface settings, the glider icon will leave a colored dot every few seconds on the map indicating lift (green) and sink (red) making it easier to find and stay in areas of lift.

The purple arrow shows horizontal wind direction and speed (and a numerical output below) and a green/red arrow on the right side of the screen, displaying the vertical wind component. This can be deactivated in interface options on the config-page. The same info is now displayed in the reworked digital vario.

<h3>APT Subpages</h3>

Scrolling down on the APT page shows a page with info about the currently selected airport - by default the nearest one.

Scroll down again to find the list of the 20 nearest airports around you. Click any airport to make it your current target. Click again to return to "nearest airport" mode.

<h3>WPT Subpage</h3>

Below the WPT page you find the "thermalling helper" page, displaying wind, climb and average climb for the current/last thermal (a "thermal" is detected, when circling for more than 25 seconds). The lower section displays a bar chart of all thermals in the last 40 minutes on the left and a graph of climb/sink values during the last five minutes in the right half.

The "true average climb" for the current thermal is also used to display a small "T" indicator on the digital vario.


<h3>Data Fields</h3>

„APT“ and „WPT“ feature a maximum of 16 data fields each, that can be configured in game. The „tools“ button in the upper right hand corner of the map toggles „configuration mode“. Data fields are then marked with a light blue outline. Click any data field to bring up a popup, where you can set background color, text color and Information to be displayed. A second background color can be selected to be displayed when the displayed value <= 0 (e.g. switch background to red when arrival height is negative)

Data field configurations are persistent between simulator sessions. Click „reset all“ in the configuration popup to reset all data fields to default. Configurations are also persitent with different versions of this mod, so if you used another version or install an update, your settings will be save. There is however a slight chance, that a variable name gets mixed up, so if you experience any erratic behaviour with the datafields, try "reset all" and see if that helps.

Data fields can be forced to use either metric or imperial units of measurement. Use with caution. If activated, the datafield will ignore the global unit selection. This feature gives you the option to e.g. display altitude in feet side by side with altitude in meters. If a datafield has been configured this way an "*" is shown next to the unit as a reminder. 

In standard mode the data fields are rather small and can be hard to read especially in VR. As a solution an "improved readability" mode can be activated in the "interface options". That mode shows only six data fields per page but with much larger text. Also a few other interface elements are enlarged in this mode.


<h2>TASK Page</h2>

The task management system is Ian „B21“ Lewis’ Soaring Engine from the AS33. "TASK" Page shows the status of the loaded task on top ("not started", "running", "finished") and a list of all available waypoints. When you pass a waypoint it's marked "ok" and jumps to the bottom of the list, so that the current waypoint is always on top of the list. After all waypoints are passed correctly the page shows task time, distance and average speed in the header. 

If you used the engine, slew mode or exceeded maximum speed (Vne = 152 kts True Airspeed) for more than 5 seconds, the header will turn red an include a notification.

The whole task system is ideally used with Ian's "B21 Task Planner": https://xp-soaring.github.io/tasks/b21_task_planner/index.html. Plan your flight there, download the MSFS *.pln file and load that plan when setting up your flight in MSFS. The nav computer will automatically display your plan and use it for navigation.

Detailled info on planning and flying glider tasks: https://www.youtube.com/watch?v=u7zJSu4jlPU

<h2>Kinetic Assist Launch Menu</h2>

Links to remote control functions of "Kinetic Assistant" by "Touching Cloud". Please refer to the KA manual for details.


<h2>CONFIG Page</h2>

- <b>Water Ballast System:</b> A light version of ballast loading system that can even be used in flight - which would be shameless cheating of course!
- <b>Aircraft Settings:</b> Options that are originally controlled by knobs and buttons around the display. Moved here to free up the buttons for future use.
- <b>Units of Measurement:</b> allows you to select the units of measurement to use for various categories or generally "metric" or "imperial" system. Only "metric" or "imperial" settings have an effect on other instruments in the cockpit. Detailled settings only work inside the nav computer.
- <b>Interface Options:</b> Settings for the Nav Interface: 
  - "Readability Mode" can be activated here to get some bigger readouts (and less data fields) 
  - toggle liftdot-trail on the map
  - Visual stall warning: If activated, the screen will flash red when the aircraft is close to a stall.
  - Wind Indicator: Toggles the wind arrows on the map
  - Course Pointer Arrow: displays left/right arrows on top of the map to guide you to your nav target.
  - Auto MacCready: Will update your MC setting based on the last "thermal" (i.e. last time you circled). 
  - Aviation Map Layer: Overlays airspace information on top of the topographic map, if you really want to avoid flying into control zones etc.
  - Cockpit Warnings: If active, you'll get various popup warnings on screen: gear, ballast, overspeed warnings.
  - Auto Log: Automaticalls logs flight data: time, total climb, average groundspeed and total distance can be displayed in data fields. This is only meant as informative display during flight. The mod cannot write any real logfiles.


All config settings apart from ballast are persistent between sessions. Just make sure to click "CLOSE & SAVE" after making any changes.




<h2>Speed to Fly, MacCready and why you should care</h2>

Every glider has it's very own "best glide" speed: the speed where it will glide the longest distance from any given altitude. In the Discus that is where the yellow triangle is on the speed instrument. Sounds simple, but isn't, because that is only valid for a glider without ballast and simply gliding a long distance in still air is rarely what we're looking for.

Gliders usually fly from one source of lift to the next, climb back to altitude and on to the next thermal or ridge. Very early pilots realized, that flying "best glide speed" is not the most efficient way to go. If you fly faster, you lose more altitude but reach the next updraft faster and can use the time saved to regain that lost altitude. But how much faster? This is obviously dependent on the strength of the lift you're heading for and that's what Paul MacCready and other glider pilots based the theory of "Speed to Fly" on.

Speed to Fly (STF) is calculated from a complicated formula using aircraft performance, ballast and the expected strength of the next source of climb, set by the pilot with the top right rotary button - the "MacCready" value. The higher the MC value, the higher the resulting speed to fly. The nav computer displays the STF as a numerical value under the speed tape and as a green area on the speed tape.

Calculation of all estimated arrival heights and time enroute is based on STF. This allows you to plan ahead, especially when flying different phases of a task. As you change the MC setting, you'll see the estimated arrival height and time go up and down. For example, when on final glide to your destination airport you can turn up MC until the estimated arrival is close to zero and the computer will tell you how fast you can fly. On the other hand, if you're low and slow in difficult conditions, turn MC to zero and the computer tells you the speed for best glide with current ballast and if you will make it home at all.

Of course the computer has no way of telling, if there are up or downdrafts on the way, so arrival height estimations are always... well... estimations. if the wind changes or you pass an area of lift, the estimation will constantly be updated.

There's an abundance of theories and opinions on how to use MC settings strategically. I strongly recommend diving into google and read away.


<h2>Videos with more info</h2>

Thankfully there are a whole lot of talented people out there with impressive skills in making informative videos:

IWILZ has a great walkthrough on the mod in italian (activate english subtitles, if your italian is as bad as mine): https://www.youtube.com/watch?v=Xiy44W7Pc-c (Mille grazie!)

Another great video to watch is Dave Aldrich's "Glider Setup" which also contains a detailed view on this mod: https://www.youtube.com/watch?v=Ftn-_smpZ0c&t=1537s

To learn more about task planning and flying, check out Ian Lewis' great tutorial (and all his other videos ;-)) on Youtube: https://www.youtube.com/watch?v=u7zJSu4jlPU




<h2>Conflicts with other mods</h2>

Multiple mods changing the same aircraft are prone to conflict somehow. If you run into problems the first and easiest option is to decide, which modification is more important to you and remove the conflicting one. If you absolutely want to keep both, you can try to find out which files conflict. In the case of most livery modifications the conflicting file is the file panel.cfg, that is used to modify aircraft registration. This mod also changes panel.cfg. You can try to solve the conflict by either copying panel.cfg from this mod over to you livery completely, or only copy the section [VCockpit02] from this mod's panel.cfg and paste it to the same file in you livery mod. Sounds way more complicated than it is, but try it at your own risk, of course.


<h2>Reworked Variometer</h2>

The rework is losely based on the realworld LXN V80 vario but doesn't attempt to exactly emulate its funcionality. It contains a slightly enlarged scale and needles for better readability with five indicators:

- orange: current climb/sink (TE or netto as selected by the bottom right knob)
- turquoise: current vertical wind component (RL-inspiration: https://gliding.lxnav.com/news/hawk-wind-calculation/)
- red square: 10s average climb/sink.
- small green T: total true average of the last thermal (as calculated by the thermal helper page in the LX computer). When flying in thermal conditions this marker can help with judging you MC setting: if you're leaving a thermal and this marker is below the blue MC marker, you overestimated the climb and might consider dialling MC down a bit. If it's the other way around you could go a little more aggressive.
- blue triangle: MacCready setting

The orange arc marks the range of values measured during the last ten seconds.

The center of the instrument can display four different screens:

- data fields for current and average climb plus a (VERY) tiny speedtape and STF-Marker
- horizontal wind info (HAWK-style see above)
- simple artificial horizon
- slider to adjust "current" needle smoothing (calculating average values) between 0 and 5 seconds. Allows to change the sensitivity of the vario needle in gusty conditions. Higher values will make the vario less responsive when entering lift, but filter out rapid movement from rapidly changing wind speeds. When flying in a weather preset with 0 gusts, you can safely set this to 0. When you encounter gusts (as in live weather most of the time) adjust the smoothing upward to calm down the needle.

Screens can be cycled using the top and bottom button on the right. Center button toggles between the default linear and a logarithmic scale. You can also cycle screens using alt/a alt/s on the keyboard (doesn't work in VR for some reason).

Audio output of the vario is completely unchanged.
