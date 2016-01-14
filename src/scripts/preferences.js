(function () {

    Rea.dataPath = window.localStorage.getItem('reaperDataPath');
    Rea.createBackup = window.localStorage.getItem('createBackup');
    Rea.checkUpdates = window.localStorage.getItem('checkUpdates');

    if (!Rea.dataPath) {
        if (Rea.platform.win) {
            Rea.dataPath = path.join(path.dirname(path.dirname(gui.App.dataPath)), 'Roaming', 'REAPER');

        } else {
            Rea.dataPath = path.join(path.dirname(gui.App.dataPath), 'REAPER');

        }
    }

    if (Rea.createBackup === null) {
        Rea.createBackup = '1';
        window.localStorage.setItem('createBackup', '1');

    }

    if (Rea.checkUpdates === null) {
        Rea.checkUpdates = '0';
        window.localStorage.setItem('checkUpdates', '0');

    }

    Rea.createBackup = !!Rea.createBackup;
    Rea.checkUpdates = parseInt(Rea.checkUpdates);

    var $preferences = $('#preferences-holder'),
        $dataPathField = $('#preferences-dataPath'),
        $dataPathPicker = $('#preferences-pathPicker'),
        $dataPathError = $('#preferences-dataPath-error'),
        $createBackup = $('#preferences-createBackup'),
        $checkUpdates = $('#preferences-checkUpdates');


    Rea.openPreferences = function () {
        if (!$preferences.hasClass('visible')) {
            $dataPathField.val(Rea.dataPath);
            $dataPathPicker.attr('nwworkingdir', Rea.dataPath);
            $createBackup.prop('checked', Rea.createBackup);
            $checkUpdates.prop('checked', Rea.checkUpdates < Number.MAX_VALUE);
            $preferences.addClass('visible');

        }
    };


    Rea.dataPathCheck = new Promise(function (fulfill, reject) {
        fs.stat(Rea.dataPath)
            .then(function (stat) {
                if (!stat.isDirectory()) {
                    $preferences.addClass('visible');
                    $dataPathError.css('display', '');
                    reject();

                } else {
                    fulfill();

                }
            }, function () {
                $preferences.addClass('visible');
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
            Rea.createBackup = $createBackup.prop('checked');
            Rea.checkUpdates = $checkUpdates.prop('checked') ? 0 : Number.MAX_VALUE;
            window.localStorage.setItem('createBackup', Rea.createBackup ? '1' : '');
            window.localStorage.setItem('checkUpdates', Rea.checkUpdates + '');

            var dataPath = $dataPathField.val();

            if (dataPath !== Rea.dataPath) {
                Rea.checkChanges('continue').then(function() {
                    Rea.dataPath = dataPath;
                    window.localStorage.setItem('reaperDataPath', dataPath);
                    Rea.init();

                });
            }
        }

        $preferences.removeClass('visible');

    });

})();
