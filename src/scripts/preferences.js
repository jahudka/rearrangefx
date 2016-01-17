(function () {

    Rea.config.dataPath = window.localStorage.getItem('reaperDataPath');
    Rea.config.createBackup = JSON.parse(window.localStorage.getItem('createBackup') || 'true');
    Rea.config.checkUpdates = JSON.parse(window.localStorage.getItem('checkUpdates') || 'true');

    if (!Rea.config.dataPath) {
        if (Rea.platform.win) {
            Rea.config.dataPath = path.join(path.dirname(path.dirname(gui.App.dataPath)), 'Roaming', 'REAPER');

        } else {
            Rea.config.dataPath = path.join(path.dirname(gui.App.dataPath), 'REAPER');

        }
    }


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
        $checkUpdates.prop('checked', Rea.config.checkUpdates !== false);

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

    $preferences.on('click', 'button.confirm', function () {
        Rea.config.createBackup = $createBackup.prop('checked');
        Rea.config.checkUpdates = $checkUpdates.prop('checked');
        window.localStorage.setItem('createBackup', Rea.config.createBackup ? 'true' : 'false');
        window.localStorage.setItem('checkUpdates', Rea.config.checkUpdates ? 'true' : 'false');

        var dataPath = $dataPathField.val();

        if (dataPath !== Rea.config.dataPath) {
            Rea.api.checkChanges('continue').then(function() {
                Rea.config.dataPath = dataPath;
                window.localStorage.setItem('reaperDataPath', dataPath);
                Rea.api.init();

            });
        }
    });

})();
