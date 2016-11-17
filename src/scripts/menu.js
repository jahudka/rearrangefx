(function () {

    var mainMenu = new gui.Menu({type: 'menubar'}),
        cmdKey = Rea.platform.osx ? 'cmd' : 'ctrl';

    function separate(list) {
        list.append(new gui.MenuItem({type: 'separator'}));

    }

    Rea.menu.newFolder = new gui.MenuItem({
        type: 'normal',
        label: 'New folder',
        key: 'n',
        modifiers: cmdKey,
        click: function () {
            Rea.api.newFolder(false);

        }
    });

    Rea.menu.newSmartFolder = new gui.MenuItem({
        type: 'normal',
        label: 'New Smart folder',
        key: 'N',
        modifiers: cmdKey,
        click: function () {
            Rea.api.newFolder(true);

        }
    });

    Rea.menu.save = new gui.MenuItem({
        type: 'normal',
        label: 'Save changes',
        key: 's',
        modifiers: cmdKey,
        enabled: false,
        click: function () {
            Rea.api.save();

        }
    });

    Rea.menu.revert = new gui.MenuItem({
        type: 'normal',
        label: 'Revert changes',
        key: 'r',
        modifiers: cmdKey,
        enabled: false,
        click: function () {
            Rea.api.revert();

        }
    });

    // File menu
    var fileMenuItems = new gui.Menu();

    fileMenuItems.append(Rea.menu.newFolder);
    fileMenuItems.append(Rea.menu.newSmartFolder);
    separate(fileMenuItems);
    fileMenuItems.append(Rea.menu.save);
    fileMenuItems.append(Rea.menu.revert);

    var fileMenu = new gui.MenuItem({
        label: 'File',
        submenu: fileMenuItems
    });






    // View menu

    var viewMenuItems = new gui.Menu();

    Rea.menu.viewMain = new gui.MenuItem({
        type: 'checkbox',
        label: 'Folder sorting',
        checked: true,
        key: '1',
        modifiers: cmdKey,
        click: function () {
            Rea.api.viewMain();

        }
    });

    Rea.menu.viewAssignments = new gui.MenuItem({
        type: 'checkbox',
        label: 'Plugin assignments',
        checked: false,
        key: '2',
        modifiers: cmdKey,
        click: function () {
            Rea.api.viewAssignments();

        }
    });

    viewMenuItems.append(Rea.menu.viewMain);
    viewMenuItems.append(Rea.menu.viewAssignments);

    var viewMenu = new gui.MenuItem({
        label: 'View',
        submenu: viewMenuItems
    });




    // Preferences

    Rea.menu.preferences = new gui.MenuItem({
        type: 'normal',
        label: 'Preferences',
        key: Rea.platform.osx ? ',' : 'p',
        modifiers: cmdKey,
        click: function () {
            Rea.api.openDialog('preferences');

        }
    });


    // Undo, Redo

    Rea.menu.undo = new gui.MenuItem({
        type: 'normal',
        label: 'Undo',
        key: 'z',
        modifiers: cmdKey,
        enabled: false,
        click: function () {
            Rea.api.undo();

        }
    });

    Rea.menu.redo = new gui.MenuItem({
        type: 'normal',
        label: 'Redo',
        key: 'y',
        modifiers: cmdKey,
        enabled: false,
        click: function () {
            Rea.api.redo();

        }
    });

    // sort alphabetically

    Rea.menu.sort = new gui.MenuItem({
        type: 'normal',
        label: 'Sort folders alphabetically',
        key: 'b',
        modifiers: cmdKey,
        click: function () {
            Rea.api.sort();

        }
    });


    // main setup

    if (Rea.platform.osx) {
        mainMenu.createMacBuiltin('RearrangeFX', {
            hideWindow: true
        });

        mainMenu.items[0].submenu.insert(Rea.menu.preferences, 2);
        mainMenu.items[0].submenu.insert(new gui.MenuItem({type: 'separator'}), 3);
        mainMenu.insert(fileMenu, 1);


        Rea.menu.redo.key = 'Z';
        mainMenu.items[2].submenu.removeAt(0);
        mainMenu.items[2].submenu.removeAt(0);
        mainMenu.items[2].submenu.insert(Rea.menu.undo, 0);
        mainMenu.items[2].submenu.insert(Rea.menu.redo, 1);
        mainMenu.items[2].submenu.insert(new gui.MenuItem({type: 'separator'}), 2);
        mainMenu.items[2].submenu.insert(Rea.menu.sort, 3);

    } else {
        fileMenuItems.append(new gui.MenuItem({type: 'separator'}));
        fileMenuItems.append(Rea.menu.preferences);
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

        editMenuItems.append(Rea.menu.undo);
        editMenuItems.append(Rea.menu.redo);
        separate(editMenuItems);
        editMenuItems.append(Rea.menu.sort);
        separate(editMenuItems);

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

    }

    mainMenu.append(viewMenu);

    gui.Window.get().menu = mainMenu;

})();
