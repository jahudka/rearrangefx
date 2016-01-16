(function (api) {

    api.newFolder = function newFolder(smart) {
        var folder = Rea.lib.dom.addFolder('', smart);

        if (smart) {
            Rea.lib.dom.addPlugin(1048576, '', folder);
            folder.addClass('open');

        }

        Rea.lib.keyboard.setCursor(folder);

        folder.find('.btn-edit').first().trigger('click');

    };


    api.sort = function sort() {
        Rea.lib.dom.sortMainList();
        Rea.lib.state.save();

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
            return Rea.lib.file.backup().then(Rea.lib.file.save);

        } else {
            return Rea.lib.file.save();

        }
    };

    api.revert = function revert() {
        api.checkChanges().then(function() {
            Rea.lib.state.revert();

        });
    };

    api.undo = function undo() {
        Rea.lib.state.undo();

    };

    api.redo = function redo() {
        Rea.lib.state.redo();

    };


    api.openDialog = function openDialog(id) {
        var dlg = $('#' + id + '-holder');

        if (!dlg.length || dlg.hasClass('visible')) {
            return;

        }

        dlg.trigger('dialog-open');

        dlg.addClass('visible');
        Rea.lib.keyboard.setEnabled(false);

        var $d = $(document);
        dlg.find('button.focus').first().trigger('focus');

        function close() {
            dlg.removeClass('visible');
            $d.off('.dlg');
            Rea.lib.keyboard.setEnabled(true);

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

    api.togglePlugins = function togglePlugins() {
        var $pluginsPanel = $('#plugins-panel');
        $pluginsPanel.toggleClass('visible');
        Rea.menu.togglePlugins.checked = $pluginsPanel.hasClass('visible');

    };

})(Rea.api);
