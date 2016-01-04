var gui = require('nw.gui'),
    path = require('path'),
    fs = require('fs'),
    _ = require('lodash'),
    Promise = require('promise');

_.each(['readFile', 'writeFile', 'stat', 'access'], function (method) {
    fs[method] = Promise.denodeify(fs[method]);

});

var Rea = {
    dataPath: null,
    dataPathCheck: null,
    save: function() {},
    revert: function() {},
    newFolder: function() {},
    undo: function() {},
    redo: function() {},
    editMenuIndex: null,
    openPreferences: function() {},
    togglePlugins: function() { return true; },
    checkChanges: function() { return true; }
};

gui.Window.get().focus();
