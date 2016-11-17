(function (lib) {

    lib.load = function load() {
        return fs.readFile(path.join(Rea.config.dataPath, 'reaper-fxfolders.ini'))
            .then(ini.parse, function (err) {
                Rea.debug && console.log(err);

                return {
                    Folders: {
                        NbFolders: 0
                    }
                };
            })
            .then(lib.parse);
    };

    lib.parse = function parse(data) {
        var folders = [],
            folder, plugins, f, nf, p, np;

        if (!data.Folders || !data.Folders.NbFolders) {
            return folders;
        }

        for (f = 0, nf = data.Folders.NbFolders; f < nf; f++) {
            folder = {
                name: data.Folders['Name' + f],
                smart: false,
                plugins: []
            };

            folders.push(folder);

            if (data.hasOwnProperty('Folder' + f)) {
                plugins = data['Folder' + f];

                if (plugins.Nb === 1 && !(plugins.Type0 in Rea.lib.pluginTypes)) {
                    folder.smart = true;
                    folder.plugins.push({
                        type: plugins.Type0,
                        name: plugins.Item0
                    });
                } else {
                    for (p = 0, np = plugins.Nb; p < np; p++) {
                        folder.plugins.push({
                            type: plugins['Type' + p],
                            name: plugins['Item' + p]
                        });
                    }
                }
            }
        }

        return folders;

    };


    lib.formatIniData = function formatIniData(folders) {
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
                plugins['Item' + p] = plugin.name;

            }
        }

        return ini;

    };

})(Rea.lib.io);
