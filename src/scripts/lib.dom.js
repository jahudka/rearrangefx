(function (lib) {

    $.layers.add('dimmer', 100);
    $.dimmer.setDefaults({
        layer: $.layers.get('dimmer'),
        showSpeed: 400,
        hideSpeed: 200,
        opacity: 0.6
    });


    var $d = $(document),
        $b = $(document.body),
        $toolbar = $('#toolbar'),
        $folders = $('#folders'),
        $plugins = $('#plugins'),
        $pluginLists = {
            0: $('#plugins-dx'),
            2: $('#plugins-js'),
            3: $('#plugins-vst'),
            vst3: $('#plugins-vst3'),
            4: $('#plugins-rewire'),
            5: $('#plugins-au'),
            6: $('#plugins-other'),
            1000: $('#plugins-chains')
        },
        reVst3 = /\.vst3(?:<[a-z0-9]+)?$/i,
        reVstPath = Rea.platform.win
            ? /^.+?([^\\]+?)\.[^.<]+(<[a-z0-9]+)?$/i
            : /^.+?([^\/]+?)\.[^.<]+(<[a-z0-9]+)?$/i;


    if (!Rea.platform.osx) {
        $pluginLists['5'].remove();
        delete $pluginLists['5'];
        delete Rea.lib.pluginTypes['5'];

    } else if (!Rea.platform.win) {
        $pluginLists['0'].remove();
        delete $pluginLists['0'];
        delete Rea.lib.pluginTypes['0'];

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


    lib.cleanup = function cleanup() {
        $folders.add($plugins).off();
        $folders.empty();
        $plugins.find('.list').empty();

    };


    lib.sortList = function sortList($container) {
        var items = [];

        $container.children().each(function () {
            items.push({
                name: $(this).find('> .item-panel > .item-label').text().toLowerCase(),
                elm: this
            });
        });

        items.sort(function (a, b) {
            return a.name > b.name ? 1 : (a.name < b.name ? -1 : 0);
        });

        $container.children().detach();
        $container.append(items.map(function(item) { return item.elm; }));

    };

    lib.sortMainList = function sortMainList() {
        lib.sortList($folders);

    };


    lib.populateFolders = function populateFolders(config) {
        _.each(config.folders, function (folder) {
            var $folder = lib.addFolder(folder.name, folder.smart);

            _.each(folder.plugins, function (plugin) {
                lib.addPlugin(plugin.type, plugin.id, $folder);

            });
        });

        return config;

    };

    lib.populatePlugins = function populatePlugins(config) {
        _.each(config.plugins, function (plugins, type) {
            _.each(plugins, function (id) {
                if (parseInt(type) === 3 && reVst3.test(id + '')) {
                    lib.addPlugin(type, id, $pluginLists.vst3);

                } else {
                    lib.addPlugin(type, id, $pluginLists[type]);

                }
            });
        });

        _.each($pluginLists, function ($list) {
            lib.sortList($list.children('.list'));

        });

        $plugins.find('.btn-remove').remove();

        return config;

    };

    lib.addFolder = function addFolder(name, smart) {
        var $elm = $(templates.item);

        $elm.addClass('item-main');
        $elm.find('.item-label').text(name);

        if (smart) {
            $elm.data('smart', true);

        }

        $folders.append($elm);

        return $elm;

    };

    lib.addPlugin = function addPlugin(type, id, folder, before) {
        var $elm = $(templates.item);

        $elm.data('type', type);
        $elm.data('id', id);

        if (type in Rea.lib.pluginTypes) {
            $elm.find('.btn-edit').remove();

            if (parseInt(type) === 3) {
                // remove path & extension from VST plugin label
                id = id.replace(reVstPath, '$1$2');

            }
        } else {
            $elm.find('.item-handle, .btn-remove').remove();

        }

        $elm.find('.list, .btn-toggle').remove();
        $elm.find('.item-label').text(id);

        if (folder) {
            folder.children('.list').append($elm);

        } else {
            before.before($elm);

        }
    };


    lib.serializeData = function serializeData() {
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
                        id: $elm.data('id')
                    };

                folder.plugins.push(plugin);

            });
        });

        return folders;

    };

    lib.loadData = function loadData(folders) {
        $folders.empty();

        lib.populateFolders({
            folders: folders
        });
    };



    lib.installToggleHandler = function installToggleHandler() {
        function handleToggle(evt) {
            evt.preventDefault();
            $(this).closest('.item-main').toggleClass('open');

        }

        $folders.add($plugins).on('click', '.btn-toggle', handleToggle);
        $plugins.on('click', '> .item-main > .item-panel > .item-label', handleToggle);

    };


    lib.installEditHandler = function installEditHandler() {
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
                        if (!item.hasClass('item-main')) {
                            // smart folder filter
                            item.data('id', label.text());

                        }

                        Rea.lib.state.save();

                    }
                }
            }

            label.on('keydown keyup', handleKey);
            label.one('blur', function () {
                label.off('keydown keyup', handleKey);
                label.prop('contenteditable', false);

            });

            label.prop('contenteditable', true).trigger('focus');

            var range = document.createRange(),
                sel = window.getSelection();

            range.selectNodeContents(label.get(0));
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);

        });
    };


    lib.installRemoveHandler = function installRemoveHandler() {
        $folders.on('click', '.btn-remove', function (evt) {
            evt.preventDefault();
            $(this).closest('.item').remove();
            Rea.lib.state.save();

        });
    };


    lib.installReorderHandler = function installReorderHandler() {
        $folders.on('mousedown', function (evt) {
            var t = $(evt.target),
                elm = t.closest('.item');

            if (t.is('button') || t.prop('isContentEditable') || !elm.length) {
                return;

            }

            evt.preventDefault();

            var scope = elm.closest('.list'),
                target = null,
                dragged = false;

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
                dragged = true;

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

                    Rea.lib.state.save();

                } else if (!dragged && elm.hasClass('item-main')) {
                    elm.find('> .item-panel > .btn-toggle').trigger('click');

                }
            });
        });
    };


    lib.installInsertHandler = function installInsertHandler() {
        $plugins.on('mousedown', function (evt) {
            var t = $(evt.target),
                elm = t.closest('.item'),
                target = null,
                tmr = null;

            if (t.is('button') || !elm.length || elm.hasClass('item-main')) {
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
                        lib.addPlugin(elm.data('type'), elm.data('id'), target);

                    } else {
                        lib.addPlugin(elm.data('type'), elm.data('id'), null, target);

                    }

                    target.removeClass('drag-target drag-target-prev');

                    Rea.lib.state.save();

                }
            });
        });
    };


    lib.installToolbarHandler = function installToolbarHandler() {
        $toolbar.on('click', 'button', function (evt) {
            evt.preventDefault();

            var $btn = $(this);

            switch ($btn.data('action')) {
                case 'new-folder':
                    Rea.api.newFolder(!!$btn.data('smart'));
                    break;

                case 'sort':
                    Rea.api.sort();
                    break;

                case 'toggle-plugins':
                    Rea.api.togglePlugins();
                    break;

                case 'open-preferences':
                    Rea.api.openDialog('preferences');
                    break;
            }
        });
    };

})(Rea.lib.dom);
