(function (lib) {

    lib.cleanup = function cleanup() {
        Rea.state.original = null;
        Rea.state.undo = [];
        Rea.state.redo = [];
        lib.setDirty(false);

    };

    lib.setDirty = function (dirty) {
        Rea.state.dirty = dirty;
        Rea.menu.save.enabled = dirty;
        Rea.menu.revert.enabled = dirty;
        gui.Window.get().title = 'RearrangeFX' + (dirty ? '*' : '');

    };

    lib.saveInitial = function saveInitial(config) {
        Rea.state.original = JSON.stringify(config.folders);
        return config;

    };

    lib.save = function save() {
        var state = JSON.stringify(Rea.lib.dom.serializeData());

        if (state === (Rea.state.undo.length ? Rea.state.undo[Rea.state.undo.length - 1] : Rea.state.original)) {
            return;

        }

        Rea.state.undo.push(state);
        Rea.state.redo.splice(0, Rea.state.redo.length);

        lib.setDirty(true);
        Rea.menu.undo.enabled = true;
        Rea.menu.redo.enabled = false;

    };

    lib.revert = function revert() {
        Rea.dom.loadData(JSON.parse(Rea.state.original));

        Rea.state.undo.splice(0, Rea.state.undo.length);
        Rea.state.redo.splice(0, Rea.state.redo.length);

        lib.setDirty(false);
        Rea.menu.undo.enabled = false;
        Rea.menu.redo.enabled = false;

    };

    lib.undo = function undo() {
        if (Rea.state.undo.length) {
            Rea.state.redo.unshift(Rea.state.undo.pop());
            Rea.menu.redo.enabled = true;

        }

        var state = JSON.parse(Rea.state.undo.length ? Rea.state.undo[Rea.state.undo.length - 1] : Rea.state.original);

        Rea.lib.dom.loadData(state);

        lib.setDirty(Rea.state.undo.length > 0);
        Rea.menu.undo.enabled = Rea.state.dirty;

    };

    lib.redo = function redo() {
        var state = Rea.state.redo.shift();

        if (state) {
            Rea.state.undo.push(state);

            Rea.lib.dom.loadData(JSON.parse(state));

            lib.setDirty(true);
            Rea.menu.undo.enabled = true;
            Rea.menu.redo.enabled = Rea.state.redo.length > 0;

        } else {
            Rea.menu.redo.enabled = false;

        }
    };

})(Rea.lib.state);
