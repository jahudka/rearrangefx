(function (api) {

    api.newFolder = function newFolder(smart) {
        var folder = Rea.lib.db.addFolder('', smart);

        if (smart) {
            folder.addPlugin(new Rea.lib.db.Plugin(-1, 1048576, ''));
        }

        window.requestAnimationFrame(function () {
            $('#folders > li:last-child .btn-edit').trigger('click');
        });
    };


    api.sort = function sort() {
        Rea.lib.db.sortFolders();

    };



    api.checkChanges = function checkChanges(action) {
        action || (action = 'quit');

        return new Promise(function (fulfill, reject) {
            if (!Rea.state.dirty) {
                fulfill();
                return;

            }

            var $dlg = api.openDialog('save-options');

            $dlg.find('.action').text(action);

            $dlg.on('click', 'button', function () {
                var $btn = $(this);

                if ($btn.hasClass('btn-text')) {
                    reject();

                } else {
                    if ($btn.data('save')) {
                        api.save().then(fulfill, reject);

                    } else {
                        fulfill();

                    }
                }
            });
        });
    };

    api.save = function save() {
        if (!Rea.state.dirty) {
            return Promise.resolve();

        }

        if (Rea.config.createBackup) {
            return Rea.lib.file.backup().then(Rea.lib.file.save).catch(function(err) {console.log(err);});

        } else {
            return Rea.lib.file.save();

        }
    };

    api.revert = function revert() {
        api.checkChanges('continue').then(function() {
            Rea.lib.state.revert();

        });
    };

    api.undo = function undo() {
        Rea.lib.state.undo();

    };

    api.redo = function redo() {
        Rea.lib.state.redo();

    };


    api.viewMain = function viewMain() {
        var $btnMain = $('#btn-view-main'),
            $btnAssignments = $('#btn-view-assignments'),
            $mainToolbar = $('#toolbar-main'),
            w = gui.Window.get();

        if (Rea.lib.dom.getView() === 'main') {
            return;
        }

        Rea.lib.dom.setView('main').render();

        Rea.menu.newFolder.enabled = true;
        Rea.menu.newSmartFolder.enabled = true;
        Rea.menu.sort.enabled = true;
        Rea.menu.viewAssignments.checked = false;
        Rea.menu.viewMain.checked = true;

        $btnMain.toggleClass('active', true);
        $btnAssignments.toggleClass('active', false);
        $mainToolbar.css('display', '');

        window.requestAnimationFrame(function() {
            w.resizeTo(520, 700);
            w.moveTo((screen.width - 520) / 2, (screen.height - 700) / 2);
        });
    };

    api.viewAssignments = function viewAssignments() {
        var $btnMain = $('#btn-view-main'),
            $btnAssignments = $('#btn-view-assignments'),
            $mainToolbar = $('#toolbar-main'),
            w = gui.Window.get();

        if (Rea.lib.dom.getView() === 'assignments') {
            return;
        }

        Rea.lib.dom.setView('assignments').render();

        Rea.menu.newFolder.enabled = false;
        Rea.menu.newSmartFolder.enabled = false;
        Rea.menu.sort.enabled = false;
        Rea.menu.viewMain.checked = false;
        Rea.menu.viewAssignments.checked = true;

        $btnAssignments.toggleClass('active', true);
        $btnMain.toggleClass('active', false);
        $mainToolbar.css('display', 'none');

        window.requestAnimationFrame(function () {
            w.resizeTo(840, 700);
            w.moveTo((screen.width - 840) / 2, (screen.height - 700) / 2);
        });
    };


    api.openDialog = function openDialog(id) {
        var dlg = $('#' + id + '-holder');

        if (!dlg.length || dlg.hasClass('visible')) {
            return;

        }

        dlg.trigger('dialog-open');

        dlg.addClass('visible');

        var $d = $(document);
        dlg.find('button.focus').first().trigger('focus');

        function close() {
            dlg.removeClass('visible');
            $d.off('.dlg');

        }

        dlg.on('click.dlg', function (evt) {
            if (dlg.is(evt.target) || $(evt.target).closest('button').length) {
                evt.preventDefault();
                close();

            }
        });

        $d.on('keydown.dlg', function (evt) {
            if ($.contains(dlg.get(0), evt.target) && $(evt.target).is('input, select, textarea')) {
                return;

            }

            if (evt.which === 27) {
                evt.preventDefault();
                close();

            } else if (evt.which === 13) {
                evt.preventDefault();
                dlg.find('button.confirm').trigger('click');

            }
        });

        return dlg;

    };

})(Rea.api);
