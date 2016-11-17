(function(lib, undefined) {

    var db,
        index,
        fid,
        pid,
        listeners = [];


    function strcasecmp(a, b) {
        a = a.getName(true);
        b = b.getName(true);

        var len = Math.min(a.length, b.length),
            ca, cb, i = 0;

        for (; i < len; i++) {
            ca = a.charAt(i).toLowerCase();
            cb = b.charAt(i).toLowerCase();

            if (ca !== cb) {
                return ca < cb ? -1 : 1;
            }
        }

        return a.length === b.length ? 0 : (a.length - b.length);

    }

    lib.loadData = function (folders) {
        db = {
            folders: [],
            plugins: []
        };

        index = {
            folders: {},
            plugins: {},
            pluginsByType: {2: {}, 3: {}, 4: {}, 5: {}, 6: {}, 1000: {}}
        };

        fid = pid = 0;

        folders.forEach(function(folder) {
            var f = new lib.Folder(++fid, folder.name, folder.smart);
            Collection.add(db.folders, index.folders, f);

            if (f.isSmart()) {
                f.addPlugin(new lib.Plugin(-1, folder.plugins[0].type, folder.plugins[0].name));
            } else {
                folder.plugins.forEach(function (plugin) {
                    var p;

                    if (plugin.name in index.pluginsByType[plugin.type]) {
                        p = db.plugins[index.plugins[index.pluginsByType[plugin.type][plugin.name]]];
                    } else {
                        p = new lib.Plugin(++pid, plugin.type, plugin.name);
                        index.pluginsByType[plugin.type][plugin.name] = p.getId();
                        Collection.add(db.plugins, index.plugins, p);
                    }

                    f.addPlugin(p);

                });
            }
        });

        return lib;

    };

    lib.dispatch = function () {
        listeners.forEach(function (listener) {
            listener.call(null, lib);
        });
    };

    lib.addListener = function (listener) {
        listeners.push(listener);
    };

    lib.removeListener = function (listener) {
        var i = listeners.indexOf(listener);

        if (i > -1) {
            listeners.splice(i, 1);
        }
    };

    lib.getFolder = function (id) {
        return db.folders[index.folders[id]];
    };

    lib.addFolder = function (name, smart, before) {
        var folder = new lib.Folder(++fid, name, smart);

        Collection.add(db.folders, index.folders, folder, before);
        lib.dispatch();

        return folder;
    };

    lib.renameFolder = function (id, name) {
        lib.getFolder(id).setName(name);
        lib.dispatch();
    };

    lib.sortFolders = function (comparator) {
        db.folders
            .sort(comparator || strcasecmp)
            .forEach(function (folder, i) {
                index.folders[folder.getId()] = i;
            });

        lib.dispatch();

    };

    lib.moveFolder = function (id, before) {
        Collection.move(db.folders, index.folders, id, before);
        lib.dispatch();
    };

    lib.removeFolder = function (id) {
        Collection.remove(db.folders, index.folders, id);
        lib.dispatch();
    };

    lib.getFolders = function () {
        return db.folders;
    };

    lib.getPlugin = function (id) {
        return db.plugins[index.plugins[id]];
    };

    lib.getPlugins = function () {
        return db.plugins;
    };

    lib.getPluginsByType = function () {
        return _.mapValues(index.pluginsByType, function(plugins) {
            plugins = _.map(plugins, function (id) {
                return db.plugins[index.plugins[id]];
            });

            plugins.sort(strcasecmp);

            return plugins;
        });
    };

    lib.exportData = function () {
        return db.folders.map(function (folder) {
            return {
                name: folder.getName(),
                smart: folder.isSmart(),
                plugins: folder.getPlugins().map(function(plugin) {
                    return {
                        type: plugin.getType(),
                        name: plugin.getName()
                    };
                })
            };
        });
    };



    var Collection = {
        has: function (index, item) {
            return (typeof item === 'number' ? item : item.getId()) in index;
        },

        get: function (collection, index, id) {
            return collection[index[id]];
        },

        add: function (collection, index, item, before) {
            if (!Collection.has(index, item)) {
                if (before) {
                    before = index[typeof before === 'number' ? before : before.getId()];
                    collection.splice(before, 0, item);

                    for (var i = before; i < collection.length; i++) {
                        index[collection[i].getId()] = i;
                    }
                } else {
                    index[item.getId()] = collection.length;
                    collection.push(item);
                }

                return true;
            }

            return false;
        },

        move: function (collection, index, item, before) {
            var ii = index[typeof item === 'number' ? item : item.getId()],
                ib, i, im;

            item = collection[ii];
            collection.splice(ii, 1);

            if (before) {
                ib = index[typeof before === 'number' ? before : before.getId()];

                if (ii < ib) {
                    ib--;
                }

                collection.splice(ib, 0, item);

                i = Math.min(ii, ib);
                im = Math.max(ii, ib);
            } else {
                i = ii;
                im = collection.length;
                collection.push(item);
            }

            for (; i <= im; i++) {
                index[collection[i].getId()] = i;
            }
        },

        remove: function (collection, index, item) {
            var id = typeof item === 'number' ? item : item.getId(),
                i = index[id];

            if (i !== undefined) {
                collection.splice(index[id], 1);
                delete index[id];

                for (; i < collection.length; i++) {
                    index[collection[i].getId()] = i;
                }

                return true;
            }

            return false;
        },

        toggle: function (collection, index, items, state) {
            var changed = [];

            items.forEach(function (item) {
                if (Collection.has(index, item) !== state) {
                    if (state) {
                        collection.push(item);
                    } else {
                        collection.splice(collection.indexOf(item), 1);
                        delete index[item.getId()];
                    }

                    changed.push(item);
                }
            });

            collection.forEach(function(item, i) {
                index[item.getId()] = i;
            });

            return changed;
        }
    };



    lib.Folder = function (id, name, smart) {
        this._ = {
            id: id,
            name: name,
            smart: smart,
            plugins: [],
            index: {}
        };
    };

    _.extend(lib.Folder.prototype, {
        getId: function () {
            return this._.id;
        },

        getName: function () {
            return this._.name;
        },

        isSmart: function () {
            return this._.smart;
        },

        getPlugins: function () {
            return this._.plugins;
        },

        hasPlugin: function (plugin) {
            return Collection.has(this._.index, plugin);
        },

        setName: function (name) {
            this._.name = name;
            return this;
        },

        addPlugin: function (plugin) {
            if (Collection.add(this._.plugins, this._.index, plugin)) {
                plugin.addFolder(this);
            }

            return this;
        },

        removePlugin: function (plugin) {
            if (Collection.remove(this._.plugins, this._.index, plugin)) {
                plugin.removeFolder(this);
            }

            return this;

        },

        togglePlugins: function (plugins, state) {
            plugins = Collection.toggle(this._.plugins, this._.index, plugins, state);

            plugins.forEach(function (plugin) {
                if (state) {
                    plugin.addFolder(this);
                } else {
                    plugin.removeFolder(this);
                }
            }.bind(this));

            return this;

        }
    });

    lib.Plugin = function (id, type, name) {
        this._ = {
            id: id,
            type: type,
            name: name,
            shortName: null,
            folders: [],
            index: {}
        };
    };

    var RE_VSTPATH = Rea.platform.win
        ? /\\([^\\]+?)(?:\.[^\/.<]+)?(?:<[a-z0-9]+)?$/
        : /\/([^\/]+?)(?:\.[^\/.<]+)?(?:<[a-z0-9]+)?$/;

    _.extend(lib.Plugin.prototype, {
        getId: function () {
            return this._.id;
        },

        getType: function () {
            return this._.type;
        },

        getName: function (short) {
            if (short && this._.type === 3) {
                if (this._.shortName === null) {
                    short = RE_VSTPATH.exec(this._.name);
                    this._.shortName = short ? short[1] : false;
                }

                if (this._.shortName) {
                    return this._.shortName;
                }
            }

            return this._.name;
        },

        getFolders: function () {
            return this._.folders;
        },

        hasFolder: function (folder) {
            return Collection.has(this._.index, folder);
        },

        setName: function (name) {
            this._.name = name;
            return this;
        },

        addFolder: function (folder) {
            if (Collection.add(this._.folders, this._.index, folder)) {
                folder.addPlugin(this);
            }

            return this;
        },

        removeFolder: function (folder) {
            if (Collection.remove(this._.folders, this._.index, folder)) {
                folder.removePlugin(this);
            }

            return this;

        },

        toggleFolders: function (folders, state) {
            folders = Collection.toggle(this._.folders, this._.index, folders, state);

            folders.forEach(function (folder) {
                if (state) {
                    folder.addPlugin(this);
                } else {
                    folder.removePlugin(this);
                }
            }.bind(this));

            return this;

        }
    });

})(Rea.lib.db);
