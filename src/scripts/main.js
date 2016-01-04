(function () {


    $.layers.add('dimmer', 100);
    $.dimmer.setDefaults({
        layer: $.layers.get('dimmer')
    });


    var $d = $(document),
        $b = $(document.body),
        $folders = $('#folders'),
        $plugins = $('#plugins'),
        $pluginLists = {
            2: $('#plugins-js'),
            3: $('#plugins-vst'),
            5: $('#plugins-au')
        };

    var pluginTypes = {
            2: 'JS',
            3: 'VST',
            5: 'AU'
        };

    var originalState = null,
        dirty = false,
        undo = [],
        redo = [];


    if (process.platform !== 'darwin') {
        $pluginLists['5'].remove();
        delete $pluginLists['5'];
        delete pluginTypes['5'];

    }


    var templates = {
        item: (
            '<li class="item">' +
                '<div class="item-panel">' +
                    '<i class="item-handle fa fa-reorder"></i>' +
                    '<span class="item-label"></span>' +
                    '<button class="btn btn-edit fa fa-edit"></button>' +
                    '<button class="btn btn-remove fa fa-remove"></button>' +
                    '<button class="btn btn-toggle fa fa-caret-right"></button>' +
                '</div>' +
                '<ul class="list list-sub"></ul>' +
            '</li>'
        )
    };


    function loadConfig() {
        return fs.readFile(path.join(Rea.dataPath, 'reaper-fxfolders.ini'))
            .then(ini.parse, function () {
                return {
                    Folders: {
                        NbFolders: 0
                    }
                };
            });
    }

    function parseConfig(config) {
        var folders = [],
            registry = {2: {}, 3: {}, 5: {}},
            folder, plugins, f, nf, p, np, type, id;

        if (!config.Folders || !config.Folders.NbFolders) {
            return {
                folders: folders,
                plugins: _.mapValues(registry, function() { return []; })
            };
        }

        for (f = 0, nf = config.Folders.NbFolders; f < nf; f++) {
            folder = {
                name: config.Folders['Name' + f],
                plugins: []
            };

            folders.push(folder);

            if (config.hasOwnProperty('Folder' + f)) {
                plugins = config['Folder' + f];

                if (plugins.Nb === 1 && !(plugins.Type0 in pluginTypes)) {
                    folder.smart = true;
                    folder.plugins.push({
                        type: plugins.Type0,
                        id: plugins.Item0
                    });

                } else {
                    for (p = 0, np = plugins.Nb; p < np; p++) {
                        type = plugins['Type' + p];
                        id = plugins['Item' + p];

                        if (!registry[type][id]) {
                            registry[type][id] = true;

                        }

                        folder.plugins.push({
                            type: type,
                            id: id
                        });
                    }
                }
            }
        }

        return {
            folders: folders,
            plugins: _.mapValues(registry, function(plugins) { return _.keys(plugins).sort(); })
        };
    }

    function populateFolders(config) {
        _.each(config.folders, function (folder) {
            var $folder = addFolder(folder.name, folder.smart);

            _.each(folder.plugins, function (plugin) {
                addPlugin(plugin.type, plugin.id, $folder);

            });
        });

        return config;

    }

    function populatePlugins(config) {
        _.each(config.plugins, function (plugins, type) {
            _.each(plugins, function (id) {
                addPlugin(type, id, $pluginLists[type]);

            });
        });

        $plugins.find('.btn-remove').remove();

        return config;

    }

    function addFolder(name, smart) {
        var $elm = $(templates.item);

        $elm.addClass('item-main');
        $elm.find('.item-label').text(name);

        if (smart) {
            $elm.data('smart', true);

        }

        $folders.append($elm);

        return $elm;

    }

    function addPlugin(type, id, folder, before) {
        var $elm = $(templates.item);

        $elm.data('type', type);

        $elm.find('.list, .btn-toggle').remove();
        $elm.find('.item-label').text(id);

        if (type in pluginTypes) {
            $elm.find('.btn-edit').remove();

        } else {
            $elm.find('.btn-remove').remove();

        }

        if (folder) {
            folder.children('.list').append($elm);

        } else {
            before.before($elm);

        }
    }



    function installToggleHandler() {
        $folders.add($plugins).on('click', '.btn-toggle', function (evt) {
            evt.preventDefault();
            $(this).closest('.item-main').toggleClass('open');

        });
    }

    function installEditHandler() {
        $folders.on('click', '.btn-edit', function (evt) {
            evt.preventDefault();

            var item = $(this).closest('.item'),
                label = item.find('> .item-panel > .item-label'),
                orig = label.text();

            function handleKey(evt) {
                if (evt.which === 13 || evt.which === 27) {
                    evt.preventDefault();
                    label.trigger('blur');

                    if (evt.which === 27) {
                        label.text(orig);

                    } else {
                        saveState();

                    }
                }
            }

            label.on('keydown keyup', handleKey);
            label.one('blur', function () {
                label.off('keydown keyup', handleKey);
                label.prop('contenteditable', false);

            });

            label.prop('contenteditable', true).trigger('focus');

        });
    }

    function installRemoveHandler() {
        $folders.on('click', '.btn-remove', function (evt) {
            evt.preventDefault();
            $(this).closest('.item').remove();
            saveState();

        });
    }


    function installReorderHandler() {
        $folders.on('mousedown', function (evt) {
            var t = $(evt.target);

            if (t.is('button, [contenteditable]')) {
                return;

            }

            evt.preventDefault();

            var elm = t.closest('.item'),
                scope = elm.closest('.list'),
                target = null;

            elm.addClass('dragging');
            $b.addClass('dragging');
            $.dimmer.show({
                mask: scope
            });

            function handleEnter() {
                if (elm.is(this)) {
                    return;

                }

                target = $(this);

                if (target.index() < elm.index()) {
                    target.addClass('drag-target drag-target-prev');

                } else {
                    target.addClass('drag-target drag-target-next');

                }
            }

            function handleLeave() {
                if (target) {
                    target.removeClass('drag-target drag-target-prev drag-target-next');
                    target = null;

                }
            }

            scope.on('mouseenter', '> .item', handleEnter);
            scope.on('mouseleave', '> .item', handleLeave);

            $d.one('mouseup', function (evt) {
                evt.preventDefault();

                elm.removeClass('dragging');
                $b.removeClass('dragging');
                $.dimmer.hide();
                scope.off('mouseenter', '> .item', handleEnter);
                scope.off('mouseleave', '> .item', handleLeave);

                if (target) {
                    if (target.hasClass('drag-target-prev')) {
                        target.before(elm);

                    } else {
                        target.after(elm);

                    }

                    target.removeClass('drag-target drag-target-prev drag-target-next');

                    saveState();

                }
            });
        });
    }


    function installInsertHandler() {
        $plugins.on('mousedown', function (evt) {
            var t = $(evt.target),
                elm = t.closest('.item'),
                target = null,
                tmr = null;

            if (t.is('button, [contenteditable]') || elm.hasClass('item-main')) {
                return;

            }

            evt.preventDefault();

            elm.addClass('dragging');
            $b.addClass('dragging');
            $.dimmer.show({
                mask: $folders.add(elm)
            });

            function handleEnter() {
                if (target) {
                    target.removeClass('drag-target');

                }

                target = $(this);
                target.addClass('drag-target');

                if (target.hasClass('item-main')) {
                    if (!target.hasClass('open')) {
                        tmr = window.setTimeout(function () {
                            tmr = null;
                            target.addClass('open');

                        }, 1000);
                    }
                } else {
                    target.addClass('drag-target-prev');

                }
            }

            function handleLeave() {
                if (tmr) {
                    window.clearTimeout(tmr);

                }

                target.removeClass('drag-target drag-target-prev');

                if (!target.hasClass('item-main')) {
                    target = target.closest('.item-main');
                    target.addClass('drag-target');

                } else {
                    target = tmr = null;

                }
            }

            $folders.on('mouseenter', '.item', handleEnter);
            $folders.on('mouseleave', '.item', handleLeave);

            $d.one('mouseup', function (evt) {
                evt.preventDefault();

                elm.removeClass('dragging');
                $b.removeClass('dragging');
                $.dimmer.hide();
                $folders.off('mouseenter', '.item', handleEnter);
                $folders.off('mouseleave', '.item', handleLeave);

                if (target) {
                    if (target.hasClass('item-main')) {
                        addPlugin(elm.data('type'), elm.find('.item-label').text(), target);

                    } else {
                        addPlugin(elm.data('type'), elm.find('.item-label').text(), null, target);

                    }

                    target.removeClass('drag-target drag-target-prev');

                    saveState();

                }
            });
        });
    }



    function serializeData() {
        var folders = [];

        $folders.children().each(function () {
            var $elm = $(this),
                folder = {
                    name: $elm.find('> .item-panel > .item-label').text(),
                    plugins: []
                };

            folders.push(folder);

            if ($elm.data('smart')) {
                folder.smart = true;

            }

            $elm.find('> .list-sub > .item').each(function () {
                var $elm = $(this),
                    plugin = {
                        type: $elm.data('type'),
                        id: $elm.find('> .item-panel > .item-label').text()
                    };

                folder.plugins.push(plugin);

            });
        });

        return folders;

    }


    function formatIniData(folders) {
        var ini = {
            Folders: {
                NbFolders: folders.length
            }
        };

        var folder, plugins, plugin,
            f, nf, p, np;

        for (f = 0, nf = folders.length; f < nf; f++) {
            folder = folders[f];

            ini.Folders['Name' + f] = folder.name;
            ini.Folders['Id' + f] = f;
            plugins = ini['Folder' + f] = {
                Nb: folder.plugins.length
            };

            for (p = 0, np = folder.plugins.length; p < np; p++) {
                plugin = folder.plugins[p];

                plugins['Type' + p] = plugin.type;
                plugins['Item' + p] = plugin.id;

            }
        }

        return ini;

    }


    function saveInitialState(config) {
        originalState = JSON.stringify(config.folders);
        return config;

    }

    function saveState() {
        var state = JSON.stringify(serializeData());

        if (state === (undo.length ? undo[undo.length - 1] : originalState)) {
            return;

        }

        dirty = true;
        undo.push(state);
        redo.splice(0, redo.length);
        gui.Window.get().menu.items[Rea.editMenuIndex].submenu.items[0].enabled = true;
        gui.Window.get().menu.items[Rea.editMenuIndex].submenu.items[1].enabled = false;

    }



    function installFileHandlers() {
        Rea.save = function () {
            if (!dirty) {
                return;

            }

            var data = serializeData();
            data = formatIniData(data);
            data = ini.stringify(data);

            fs.writeFile(path.join(Rea.dataPath, 'reaper-fxfolders.ini'), data)
                .then(function () {
                    dirty = false;

                }, function () {
                    // ??
                });

        };

        Rea.revert = function () {
            if (Rea.checkChanges()) {
                $folders.empty();

                populateFolders({
                    folders: JSON.parse(originalState)
                });

                undo.splice(0, undo.length);
                redo.splice(0, redo.length);
                dirty = false;
                gui.Window.get().menu.items[Rea.editMenuIndex].submenu.items[0].enabled = false;
                gui.Window.get().menu.items[Rea.editMenuIndex].submenu.items[1].enabled = false;

            }
        };

        Rea.newFolder = function () {
            addFolder('').find('.btn-edit').trigger('click');

        };

        Rea.checkChanges = function () {
            return !dirty || window.confirm('Are you sure you want to continue? Any unsaved changes will be lost.');

        };

        gui.Window.get().on('close', function () {
            if (Rea.checkChanges()) {
                this.close(true);

            }
        });
    }


    function installHistoryHandlers() {
        Rea.undo = function () {
            if (undo.length) {
                redo.unshift(undo.pop());
                gui.Window.get().menu.items[Rea.editMenuIndex].submenu.items[1].enabled = true;

            }

            var state = JSON.parse(undo.length ? undo[undo.length - 1] : originalState);

            $folders.empty();

            populateFolders({
                folders: state
            });

            if (!undo.length) {
                dirty = false;

            }

            return undo.length > 0;

        };

        Rea.redo = function () {
            var state = redo.shift();

            if (state) {
                undo.push(state);
                gui.Window.get().menu.items[Rea.editMenuIndex].submenu.items[0].enabled = true;

                $folders.empty();

                populateFolders({
                    folders: JSON.parse(state)
                });

                return redo.length > 0;

            }

            return false;

        };
    }


    function installViewHandlers() {
        Rea.togglePlugins = function () {
            $plugins.toggleClass('visible');
            return $plugins.hasClass('visible');

        };
    }



    Rea.dataPathCheck
        .then(loadConfig)
        .then(parseConfig)
        .then(saveInitialState)
        .then(populateFolders)
        .then(populatePlugins)
        .then(installToggleHandler)
        .then(installEditHandler)
        .then(installRemoveHandler)
        .then(installReorderHandler)
        .then(installInsertHandler)
        .then(installHistoryHandlers)
        .then(installFileHandlers)
        .then(installViewHandlers)
        ;

})();
