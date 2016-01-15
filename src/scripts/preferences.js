(function () {

    Rea.config.dataPath = window.localStorage.getItem('reaperDataPath');
    Rea.config.createBackup = window.localStorage.getItem('createBackup');
    Rea.config.checkUpdates = window.localStorage.getItem('checkUpdates');

    if (!Rea.config.dataPath) {
        if (Rea.platform.win) {
            Rea.config.dataPath = path.join(path.dirname(path.dirname(gui.App.dataPath)), 'Roaming', 'REAPER');

        } else {
            Rea.config.dataPath = path.join(path.dirname(gui.App.dataPath), 'REAPER');

        }
    }

    if (Rea.config.createBackup === null) {
        Rea.config.createBackup = '1';
        window.localStorage.setItem('createBackup', '1');

    }

    if (Rea.config.checkUpdates === null) {
        Rea.config.checkUpdates = '0';
        window.localStorage.setItem('checkUpdates', '0');

    }

    Rea.config.createBackup = !!Rea.config.createBackup;
    Rea.config.checkUpdates = parseInt(Rea.config.checkUpdates);

    var $preferences = $('#preferences-holder'),
        $dataPathField = $('#preferences-dataPath'),
        $dataPathPicker = $('#preferences-pathPicker'),
        $dataPathError = $('#preferences-dataPath-error'),
        $createBackup = $('#preferences-createBackup'),
        $checkUpdates = $('#preferences-checkUpdates');


    $preferences.on('dialog-open', function () {
        $dataPathField.val(Rea.config.dataPath);
        $dataPathPicker.attr('nwworkingdir', Rea.config.dataPath);
        $createBackup.prop('checked', Rea.config.createBackup);
        $checkUpdates.prop('checked', Rea.config.checkUpdates < Number.MAX_VALUE);

    });

    Rea.dataPathCheck = new Promise(function (fulfill, reject) {
        fs.stat(Rea.config.dataPath)
            .then(function (stat) {
                if (!stat.isDirectory()) {
                    Rea.api.openDialog('preferences');
                    $dataPathError.css('display', '');
                    reject();

                } else {
                    fulfill();

                }
            }, function () {
                Rea.api.openDialog('preferences');
                $dataPathError.css('display', '');
                reject();

            });
    });

    $dataPathField.on('click', function (evt) {
        evt.preventDefault();
        $dataPathPicker.trigger('click');

    });

    $dataPathPicker.on('change', function () {
        if (this.files.length) {
            var path = this.files.item(0).path;
            $dataPathField.val(path);
            $dataPathPicker.attr('nwworkingdir', path);

            fs.stat(path)
                .then(function (stat) {
                    if (stat.isDirectory()) {
                        $dataPathError.css('display', 'none');

                    } else {
                        $dataPathError.css('display', '');

                    }
                }, function () {
                    $dataPathError.css('display', '');

                });
        }

        $dataPathPicker.val('');

    });

    $preferences.on('click', 'button', function (evt) {
        evt.preventDefault();

        var btn = $(this);

        if (btn.hasClass('btn-main')) {
            Rea.config.createBackup = $createBackup.prop('checked');
            Rea.config.checkUpdates = $checkUpdates.prop('checked') ? 0 : Number.MAX_VALUE;
            window.localStorage.setItem('createBackup', Rea.config.createBackup ? '1' : '');
            window.localStorage.setItem('checkUpdates', Rea.config.checkUpdates + '');

            var dataPath = $dataPathField.val();

            if (dataPath !== Rea.config.dataPath) {
                Rea.api.checkChanges('continue').then(function() {
                    Rea.config.dataPath = dataPath;
                    window.localStorage.setItem('reaperDataPath', dataPath);
                    Rea.api.init();

                });
            }
        }

        $preferences.removeClass('visible');

    });

})();
