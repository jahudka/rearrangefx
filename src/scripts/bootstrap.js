var gui = require('nw.gui'),
    path = require('path'),
    fs = require('fs'),
    _ = require('lodash'),
    Promise = require('promise');

_.each(['readFile', 'writeFile', 'stat', 'access'], function (method) {
    fs[method] = Promise.denodeify(fs[method]);

});



var Rea = (function () {
    var noop = function() {};

    return {
        platform: {
            osx: process.platform === 'darwin',
            win: process.platform === 'win32' || process.platform === 'win64'
        },

        config: {
            dataPath: null,
            createBackup: null,
            checkUpdates: null
        },

        dataPathCheck: null,

        state: {
            original: null,
            dirty: false,
            undo: [],
            redo: []
        },

        Components: {},

        lib: {
            io: {},
            db: {},
            dom: {},
            file: {},
            state: {},
            keyboard: {},
            pluginTypes: {
                0: 'DX',
                2: 'JS',
                3: 'VST',
                4: 'ReWire',
                5: 'AU',
                6: 'Others',
                1000: 'FX Chain'
            }
        },

        api: {
            save: noop,
            revert: noop,
            newFolder: noop,
            undo: noop,
            redo: noop,
            sort: noop,
            openDialog: noop,
            togglePlugins: noop,
            checkChanges: noop,
            init: noop
        },

        menu: {
            save: null,
            revert: null,
            undo: null,
            redo: null,
            togglePlugins: null
        },

        debug: _.includes(gui.App.argv, '--debug')

    };
})();
