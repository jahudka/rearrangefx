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
            });
    };

    lib.parse = function parse(config) {
        var folders = [],
            registry = {2: {}, 3: {}, 4: {}, 5: {}, 6: {}, 1000: {}},
            folder, plugins, f, nf, p, np, type, id;

        if (!config.Folders || !config.Folders.NbFolders) {
            return {
                folders: folders,
                plugins: _.mapValues(registry, function() { return []; })
            };
        }

        for (f = 0, nf = config.Folders.NbFolders; f < nf; f++) {
            folder = {
                name: config.Folders['Name' + f],
                plugins: []
            };

            folders.push(folder);

            if (config.hasOwnProperty('Folder' + f)) {
                plugins = config['Folder' + f];

                if (plugins.Nb === 1 && !(plugins.Type0 in Rea.lib.pluginTypes)) {
                    folder.smart = true;
                    folder.plugins.push({
                        type: plugins.Type0,
                        id: plugins.Item0
                    });

                } else {
                    for (p = 0, np = plugins.Nb; p < np; p++) {
                        type = plugins['Type' + p];
                        id = plugins['Item' + p];

                        if (!registry[type][id]) {
                            registry[type][id] = true;

                        }

                        folder.plugins.push({
                            type: type,
                            id: id
                        });
                    }
                }
            }
        }

        return {
            folders: folders,
            plugins: _.mapValues(registry, function(plugins) { return _.keys(plugins); })
        };
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
                plugins['Item' + p] = plugin.id;

            }
        }

        return ini;

    };

})(Rea.lib.config);
