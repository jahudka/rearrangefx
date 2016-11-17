(function () {

    Rea.api.init = function () {
        Rea.lib.dom.cleanup();
        Rea.lib.state.cleanup();

        Rea.dataPathCheck
            .then(Rea.lib.io.load)
            .then(Rea.lib.db.loadData)
            .then(Rea.lib.state.saveInitial)
            .then(Rea.lib.dom.init)
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
