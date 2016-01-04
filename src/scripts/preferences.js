(function () {

    Rea.dataPath = window.localStorage.getItem('reaperDataPath');

    if (!Rea.dataPath) {
        Rea.dataPath = path.join(path.dirname(gui.App.dataPath), 'REAPER');

    }

    var $preferences = $('#preferences-holder'),
        $field = $('#preferences-dataPath'),
        $picker = $('#preferences-pathPicker'),
        $error = $('#preferences-dataPath-error');


    Rea.openPreferences = function () {
        $preferences.hasClass('visible') || $preferences.addClass('visible');

    };


    Rea.dataPathCheck = new Promise(function (fulfill, reject) {
        fs.stat(Rea.dataPath)
            .then(function (stat) {
                if (!stat.isDirectory()) {
                    $preferences.addClass('visible');
                    $error.css('display', '');
                    reject();

                } else {
                    fulfill();

                }
            }, function () {
                $preferences.addClass('visible');
                $error.css('display', '');
                reject();

            });
    });


    $field.val(Rea.dataPath);
    $picker.attr('nwworkingdir', Rea.dataPath);

    $field.on('click', function (evt) {
        evt.preventDefault();
        $picker.trigger('click');

    });

    $picker.on('change', function () {
        if (this.files.length) {
            var path = this.files.item(0).path;
            $field.val(path);
            $picker.attr('nwworkingdir', path);

            fs.stat(path)
                .then(function (stat) {
                    if (stat.isDirectory()) {
                        $error.css('display', 'none');

                    } else {
                        $error.css('display', '');

                    }
                }, function () {
                    $error.css('display', '');

                });
        }

        $picker.val('');

    });

    $preferences.on('click', 'button', function (evt) {
        evt.preventDefault();

        var btn = $(this);

        if (btn.hasClass('btn-main') && $field.val() !== Rea.dataPath) {
            window.localStorage.setItem('reaperDataPath', $field.val());

            window.setTimeout(function () {
                if (Rea.checkChanges()) {
                    document.location.reload();

                }
            }, 300);
        }

        $preferences.removeClass('visible');

    });

})();
