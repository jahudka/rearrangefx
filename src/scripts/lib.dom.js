(function (lib) {

    var $toolbar = $('#toolbar'),
        view = 'main';

    lib.getView = function () {
        return view;
    };

    lib.setView = function (v) {
        view = v;
        ReactDOM.unmountComponentAtNode(document.getElementById('main'));
        return lib;
    };

    lib.init = function (db) {
        db.addListener(lib.render);
        lib.render();
        lib.installToolbarHandler();
    };

    lib.render = function () {
        var container = document.getElementById('main');

        if (view === 'main') {
            ReactDOM.render(
                React.createElement(Rea.Components.FolderView, {
                    folders: Rea.lib.db.getFolders(),
                    db: Rea.lib.db
                }),
                container
            );
        } else {
            ReactDOM.render(
                React.createElement(Rea.Components.GridView, {
                    folders: Rea.lib.db.getFolders(),
                    plugins: Rea.lib.db.getPluginsByType(),
                    db: Rea.lib.db
                }),
                container
            );
        }
    };

    lib.cleanup = function () {
        $toolbar.off();
        ReactDOM.unmountComponentAtNode(document.getElementById('main'));
    };

    lib.installToolbarHandler = function installToolbarHandler() {
        $toolbar.on('click', 'button', function (evt) {
            evt.preventDefault();

            var $btn = $(this);

            switch ($btn.data('action')) {
                case 'view-main':
                    Rea.api.viewMain();
                    break;

                case 'view-assignments':
                    Rea.api.viewAssignments();
                    break;

                case 'new-folder':
                    Rea.api.newFolder(!!$btn.data('smart'));
                    break;

                case 'sort':
                    Rea.api.sort();
                    break;

                case 'open-preferences':
                    Rea.api.openDialog('preferences');
                    break;
            }
        });
    };

})(Rea.lib.dom);
