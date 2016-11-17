RearrangeFX
===========

Simplyfying REAPER FX Folder management


What is RearrangeFX?
--------------------
RearrangeFX is a bare-bones tool you can use to manage your "My Folders" in the Add FX dialog in REAPER.
The main issue with the built-in tools being that they suck. No, seriously, I don't suppose everybody
tinkers around with their FX folders two to three hours every day; the tools provided in REAPER are probably
perfectly sufficient for most people. But I just SO had to be able to organize the folders using drag'n'drop
that I ended up writing my own app for it.

Wait, whaaaaat...?
------------------
Yes! You understood right. The one and only reason I started writing this app is that I cannot change the order
of my custom FX folders in REAPER via drag'n'drop.

So, whaaaaat....?
-----------------
Download, unzip, run. If you have a really weird setup (ie. REAPER data directory doesn't sit at `%appData%/REAPER`),
the app will start by showing you the Preferences pane.

The app has two main view modes: folder sorting and plugin assignment. Folder sorting just shows a list of all your
FX folders and allows you to add new folders, rename or remove existing ones and - most importantly - sort them
using drag & drop. The plugin assignment view shows a grid similar to REAPER's region / group matrix, allowing you
to swiftly assign your plugins to all the folders you want them in.

Note that the app only works with the one `.ini` file which holds the custom FX folders structure. In other words,
the app doesn't look for available plugins the way REAPER does; I haven't the faintest idea how would I go about doing
that, and besides the result probably wouldn't work well enough to justify the amount of work I'd have to put in to even
get close. As a result, you can only ever work with plugins that you already added to at least _one_ user
folder using the REAPER FX window. One easy way to work around this is that you can create a folder called "All plugins"
and just drag all of your plugins into that folder within REAPER, then you can quit REAPER and do the rest of your
adjustments using RearrangeFX.

Contributing
------------
Just a couple of basic rules I'm sure you already know:
 - fork & send pull-request
 - don't add IDE project / workspace files to git, add them to .gitignore instead
 - above all, respect .editorconfig!

You'll need a nwjs runtime (get it at http://nwjs.io) and some node modules (`cd ./src && npm install`). After that
you can use the defined Gulp tasks `jsx`, `js` and `css` to build the compiled scripts and stylesheets;
these three are actually the default tasks and you can have Gulp run them for you automatically with `gulp watch`.

Distribution packages are built using the Gulp tasks `osx32`, `osx64`, `win32` and `win64`.

Note that to build the Windows packages on a Mac or Linux system you need to have Wine installed. If you're
running OS X, head over to https://dl.winehq.org/wine-builds/macosx/i686/ and download the latest package of Wine Devel
and then run the build commands from the Wine terminal (which you get by launching the Wine Devel app).
