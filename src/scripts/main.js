(function () {

    Rea.api.init = function () {
        Rea.lib.dom.cleanup();
        Rea.lib.state.cleanup();
        Rea.lib.keyboard.setEnabled(true);

        Rea.dataPathCheck
            .then(Rea.lib.config.load)
            .then(Rea.lib.config.parse)
            .then(Rea.lib.state.saveInitial)
            .then(Rea.lib.dom.populateFolders)
            .then(Rea.lib.dom.populatePlugins)
            .then(Rea.lib.dom.installToggleHandler)
            .then(Rea.lib.dom.installEditHandler)
            .then(Rea.lib.dom.installRemoveHandler)
            .then(Rea.lib.dom.installReorderHandler)
            .then(Rea.lib.dom.installInsertHandler)
            .then(Rea.lib.dom.installToolbarHandler)
            .catch(function(err) {
                Rea.debug && console.error(err);

            })
        ;

    };

    gui.Window.get().on('close', function () {
        Rea.api.checkChanges().then(function() {
            this.close(true);

        }.bind(this));
    });

    Rea.debug && gui.Window.get().showDevTools();

    Rea.api.init();

    gui.Window.get().focus();

})();
