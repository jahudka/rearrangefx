(function (lib) {

    lib.save = function save() {
        var data = Rea.lib.db.exportData();
        data = Rea.lib.io.formatIniData(data);
        data = ini.stringify(data);

        return fs.writeFile(path.join(Rea.config.dataPath, 'reaper-fxfolders.ini'), data)
            .then(function () {
                Rea.lib.state.setDirty(false);
            }, function (err) {
                Rea.debug && console.error(err);
            });
    };

    lib.backup = function backup() {
        return new Promise(function (fulfill, reject) {
            var rs = fs.createReadStream(path.join(Rea.config.dataPath, 'reaper-fxfolders.ini')),
                ws = fs.createWriteStream(path.join(Rea.config.dataPath, 'reaper-fxfolders.ini.bak'));

            rs.on('error', function () {
                fulfill();

            });

            ws.on('error', function () {
                reject();

            });

            ws.on('close', function () {
                fulfill();

            });

            rs.pipe(ws);

        });
    };

})(Rea.lib.file);
