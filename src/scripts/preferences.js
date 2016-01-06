(function () {

    Rea.dataPath = window.localStorage.getItem('reaperDataPath');
    Rea.createBackup = window.localStorage.getItem('createBackup');

    if (!Rea.dataPath) {
        Rea.dataPath = path.join(path.dirname(gui.App.dataPath), 'REAPER');

    }

    if (Rea.createBackup === null) {
        Rea.createBackup = '1';
        window.localStorage.setItem('createBackup', '1');

    }

    Rea.createBackup = !!Rea.createBackup;

    var $preferences = $('#preferences-holder'),
        $dataPathField = $('#preferences-dataPath'),
        $dataPathPicker = $('#preferences-pathPicker'),
        $dataPathError = $('#preferences-dataPath-error'),
        $createBackup = $('#preferences-createBackup');


    Rea.openPreferences = function () {
        if (!$preferences.hasClass('visible')) {
            $dataPathField.val(Rea.dataPath);
            $dataPathPicker.attr('nwworkingdir', Rea.dataPath);
            $createBackup.prop('checked', Rea.createBackup);
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
            window.localStorage.setItem('createBackup', Rea.createBackup ? '1' : '');

            if ($dataPathField.val() !== Rea.dataPath) {
                Rea.dataPath = $dataPathField.val();
                window.localStorage.setItem('reaperDataPath', Rea.dataPath);

                if (Rea.checkChanges()) {
                    Rea.init();

                }
            }
        }

        $preferences.removeClass('visible');

    });

})();
