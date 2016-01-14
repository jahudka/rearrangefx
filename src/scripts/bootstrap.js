var gui = require('nw.gui'),
    path = require('path'),
    fs = require('fs'),
    _ = require('lodash'),
    Promise = require('promise');

_.each(['readFile', 'writeFile', 'stat', 'access'], function (method) {
    fs[method] = Promise.denodeify(fs[method]);

});

var Rea = {
    platform: {
        osx: process.platform === 'darwin',
        win: process.platform === 'win32' || process.platform === 'win64'
    },
    dataPath: null,
    dataPathCheck: null,
    createBackup: null,
    checkUpdates: null,

    save: function() {},
    toggleSave: function(enabled) {},
    revert: function() {},
    toggleRevert: function(enabled) {},
    newFolder: function(smart) {},
    undo: function() {},
    toggleUndo: function(enabled) {},
    redo: function() {},
    toggleRedo: function(enabled) {},
    sort: function() {},
    openPreferences: function() {},
    togglePlugins: function() { return true; },
    pluginsToggled: function(state) {},
    checkChanges: function() { return true; },
    init: function() {},
    debug: _.includes(gui.App.argv, '--debug')
};

gui.Window.get().focus();
