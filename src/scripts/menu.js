(function () {

    var mainMenu = new gui.Menu({type: 'menubar'});

    var cmdKey = Rea.platform.osx ? 'cmd' : 'ctrl';



    // File menu
    var fileMenuItems = new gui.Menu();





    var save = new gui.MenuItem({
        type: 'normal',
        label: 'Save changes',
        key: 's',
        modifiers: cmdKey,
        enabled: false,
        click: function () {
            Rea.save();

        }
    });

    Rea.toggleSave = function (enabled) {
        save.enabled = enabled;

    };

    fileMenuItems.append(save);




    var revert = new gui.MenuItem({
        type: 'normal',
        label: 'Revert changes',
        key: 'r',
        modifiers: cmdKey,
        enabled: false,
        click: function () {
            Rea.revert();

        }
    });

    Rea.toggleRevert = function (enabled) {
        revert.enabled = enabled;

    };

    fileMenuItems.append(revert);





    fileMenuItems.append(new gui.MenuItem({type: 'separator'}));





    fileMenuItems.append(new gui.MenuItem({
        type: 'normal',
        label: 'New folder',
        key: 'n',
        modifiers: cmdKey,
        click: function () {
            Rea.newFolder(false);

        }
    }));

    fileMenuItems.append(new gui.MenuItem({
        type: 'normal',
        label: 'New Smart folder',
        key: 'N',
        modifiers: cmdKey,
        click: function () {
            Rea.newFolder(true);

        }
    }));

    var fileMenu = new gui.MenuItem({
        label: 'File',
        submenu: fileMenuItems
    });






    // View menu

    var viewMenuItems = new gui.Menu();

    viewMenuItems.append(new gui.MenuItem({
        type: 'checkbox',
        label: 'Show plugins',
        checked: true,
        key: 'g',
        modifiers: cmdKey,
        click: function () {
            this.checked = Rea.togglePlugins();

        }
    }));

    var viewMenu = new gui.MenuItem({
        label: 'View',
        submenu: viewMenuItems
    });




    // Preferences

    var preferences = new gui.MenuItem({
        type: 'normal',
        label: 'Preferences',
        key: Rea.platform.osx ? ',' : 'p',
        modifiers: cmdKey,
        click: function () {
            Rea.openPreferences();

        }
    });




    // Undo, Redo

    var undo = new gui.MenuItem({
        type: 'normal',
        label: 'Undo',
        key: 'z',
        modifiers: cmdKey,
        enabled: false,
        click: function () {
            this.enabled = Rea.undo();

        }
    });

    Rea.toggleUndo = function(enabled) {
        undo.enabled = enabled;

    };

    var redo = new gui.MenuItem({
        type: 'normal',
        label: 'Redo',
        key: 'y',
        modifiers: cmdKey,
        enabled: false,
        click: function () {
            this.enabled = Rea.redo();

        }
    });

    Rea.toggleRedo = function (enabled) {
        redo.enabled = enabled;

    };

    // main setup

    if (Rea.platform.osx) {
        mainMenu.createMacBuiltin('RearrangeFX', {
            hideWindow: true
        });

        mainMenu.items[0].submenu.insert(preferences, 2);
        mainMenu.items[0].submenu.insert(new gui.MenuItem({type: 'separator'}), 3);
        mainMenu.insert(fileMenu, 1);


        redo.key = 'Z';
        mainMenu.items[2].submenu.removeAt(0);
        mainMenu.items[2].submenu.removeAt(0);
        mainMenu.items[2].submenu.insert(undo, 0);
        mainMenu.items[2].submenu.insert(redo, 1);

        Rea.editMenuIndex = 2;

    } else {
        fileMenuItems.append(new gui.MenuItem({type: 'separator'}));
        fileMenuItems.append(preferences);
        fileMenuItems.append(new gui.MenuItem({type: 'separator'}));

        fileMenuItems.append(new gui.MenuItem({
            type: 'normal',
            label: 'Quit',
            key: 'F4',
            modifiers: 'alt',
            click: function () {
                gui.Window.get().close();

            }
        }));

        mainMenu.append(fileMenu);



        // edit menu

        var editMenuItems = new gui.Menu();

        editMenuItems.append(undo);
        editMenuItems.append(redo);

        editMenuItems.append(new gui.MenuItem({type: 'separator'}));

        editMenuItems.append(new gui.MenuItem({
            type: 'normal',
            label: 'Cut',
            key: 'x',
            modifiers: 'ctrl',
            click: function () {
                document.execCommand('cut');

            }
        }));

        editMenuItems.append(new gui.MenuItem({
            type: 'normal',
            label: 'Copy',
            key: 'c',
            modifiers: 'ctrl',
            click: function () {
                document.execCommand('copy');

            }
        }));

        editMenuItems.append(new gui.MenuItem({
            type: 'normal',
            label: 'Paste',
            key: 'v',
            modifiers: 'ctrl',
            click: function () {
                document.execCommand('paste');

            }
        }));

        mainMenu.append(new gui.MenuItem({
            label: 'Edit',
            submenu: editMenuItems
        }));

        Rea.editMenuIndex = 1;

    }

    mainMenu.append(viewMenu);

    gui.Window.get().menu = mainMenu;

})();
