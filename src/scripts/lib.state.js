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

    lib.saveInitial = function saveInitial(db) {
        Rea.state.original = JSON.stringify(db.exportData());
        db.addListener(lib.save);
        return db;

    };

    lib.save = function save() {
        if (Rea.state.loading) {
            return;
        }

        var state = JSON.stringify(Rea.lib.db.exportData());

        if (state === (Rea.state.undo.length ? Rea.state.undo[Rea.state.undo.length - 1] : Rea.state.original)) {
            return;

        }

        Rea.state.undo.push(state);
        Rea.state.redo.splice(0, Rea.state.redo.length);

        lib.setDirty(true);
        Rea.menu.undo.enabled = true;
        Rea.menu.redo.enabled = false;

    };

    lib.load = function load(state) {
        Rea.state.loading = true;

        Rea.lib.db
            .loadData(JSON.parse(state))
            .dispatch();

        Rea.state.loading = false;
    };

    lib.revert = function revert() {
        lib.load(Rea.state.original);

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

        lib.load(Rea.state.undo.length ? Rea.state.undo[Rea.state.undo.length - 1] : Rea.state.original);
        lib.setDirty(Rea.state.undo.length > 0);
        Rea.menu.undo.enabled = Rea.state.dirty;

    };

    lib.redo = function redo() {
        var state = Rea.state.redo.shift();

        if (state) {
            Rea.state.undo.push(state);

            lib.load(state);
            lib.setDirty(true);
            Rea.menu.undo.enabled = true;
            Rea.menu.redo.enabled = Rea.state.redo.length > 0;

        } else {
            Rea.menu.redo.enabled = false;

        }
    };

})(Rea.lib.state);
