(function (lib) {

    var $d = $(document),
        $b = $(document.body),
        activePanel = 'folders',
        panels = {
            folders: $('#folders'),
            plugins: $('#plugins')
        },
        lastCursor = {
            folders: null,
            plugins: null
        },
        cursor = null,
        enabled = false;


    function getSelection() {
        var items = panels[activePanel].find('.selected');
        return items.length ? items : (cursor || $());

    }


    function setCursor(elm) {
        if (cursor) {
            cursor.removeClass('cursor');
            lastCursor[activePanel] = cursor = null;

        }

        if (elm && elm.length) {
            lastCursor[activePanel] = cursor = elm;
            cursor.addClass('cursor');
            cursor.get(0).scrollIntoViewIfNeeded();

        }
    }


    function switchPanel() {
        activePanel = activePanel === 'folders' ? 'plugins' : 'folders';
        setCursor(lastCursor[activePanel] || panels[activePanel].children().first());

    }


    function moveCursorUp() {
        var elm, elm2;

        if (cursor) {
            if (cursor.is(':first-child')) {
                if (cursor.hasClass('item-main')) {
                    elm = cursor.parent().children().last();
                    elm2 = elm.find('> .list > .item:last');

                    setCursor(elm.hasClass('open') && elm2.length ? elm2 : elm);

                } else {
                    setCursor(cursor.closest('.item-main'));

                }
            } else {
                elm = cursor.prev();

                if (cursor.hasClass('item-main') && elm.hasClass('open') && (elm2 = elm.find('> .list > .item:last')).length) {
                    setCursor(elm2);

                } else {
                    setCursor(elm);

                }
            }
        } else {
            setCursor(panels[activePanel].children().last());

        }
    }

    function moveCursorDown() {
        var elm;

        if (cursor) {
            if (cursor.hasClass('item-main')) {
                if (cursor.hasClass('open') && (elm = cursor.find('> .list > .item:first')).length) {
                    setCursor(elm);

                } else if (!cursor.is(':last-child')) {
                    setCursor(cursor.next());

                } else {
                    setCursor(cursor.parent().children().first());

                }
            } else {
                if (!cursor.is(':last-child')) {
                    setCursor(cursor.next());

                } else if ((elm = cursor.closest('.item-main').next()).length) {
                    setCursor(elm);

                } else {
                    setCursor(panels[activePanel].children().first());

                }
            }
        } else {
            setCursor(panels[activePanel].children().first());

        }
    }


    function moveSelectionUp() {
        var items = getSelection(),
            before;

        if (items.not('.item-main').length) {
            return;

        }

        before = items.first().prev();

        if (before.length) {
            before.before(items);
            Rea.lib.state.save();

        }
    }


    function moveSelectionDown() {
        var items = getSelection(),
            after;

        if (items.not('.item-main').length) {
            return;

        }

        after = items.last().next();

        if (after.length) {
            after.after(items);
            Rea.lib.state.save();

        }
    }


    function toggleSelected() {
        if (cursor) {
            cursor.toggleClass('selected');

        }
    }

    function unselectAll() {
        panels[activePanel].find('.selected').removeClass('selected');

    }

    function toggleOpen() {
        if (cursor && cursor.hasClass('item-main')) {
            cursor.toggleClass('open');

        }
    }

    function edit() {
        if (cursor) {
            cursor.find('> .item-panel > .btn-edit').trigger('click');

        }
    }

    function removeSelected() {
        if (activePanel !== 'folders') return;

        var items = getSelection();

        if (items.length) {
            if (items.is(cursor)) {
                var elms;

                if ((elms = cursor.nextAll(':not(.selected)')).length) {
                    setCursor(elms.first());

                } else if ((elms = cursor.prevAll(':not(.selected)')).length) {
                    setCursor(elms.first());

                } else if (!cursor.hasClass('item-main')) {
                    setCursor(cursor.closest('.item-main'));

                } else {
                    setCursor(null);

                }
            } else {
                setCursor(null);

            }

            items.not('.item-main').remove();
            items.filter('.item-main').remove();
            Rea.lib.state.save();

        }
    }

    function insertSelected() {
        if (activePanel !== 'plugins') return;

        var target = panels.folders.find('.selected'),
            items = getSelection();

        if (target.length === 0) {
            target = lastCursor.folders;

            if (!target.hasClass('item-main')) {
                target = target.closest('.item-main');

            }
        }

        if (target.length === 1 && target.hasClass('item-main') && items.length) {
            var children = items.filter('.item-main').find('> .list > .item');
            items = items.not('.item-main').add(children);

            items.each(function () {
                var t = $(this);
                Rea.lib.dom.addPlugin(t.data('type'), t.data('id'), target);

            });

            Rea.lib.state.save();

        }
    }


    $d.on('keydown', function (evt) {
        if (!enabled) return;

        switch (evt.which) {
            case 8: // backspace
            case 46: // delete
                removeSelected();
                break;

            case 9: // TAB
                switchPanel();
                break;

            case 13: // enter
                toggleOpen();
                break;

            case 27: // escape
                unselectAll();
                break;

            case 32: // space
                toggleSelected();
                break;

            case 37: // arrow left
                if (activePanel !== 'folders') {
                    switchPanel();

                }
                break;

            case 38: // arrow up
                if (evt.shiftKey && activePanel === 'folders') {
                    moveSelectionUp();

                } else {
                    moveCursorUp();

                }
                break;

            case 39: // arrow right
                if (activePanel !== 'plugins') {
                    switchPanel();

                }
                break;

            case 40: // arrow down
                if (evt.shiftKey && activePanel === 'folders') {
                    moveSelectionDown();

                } else {
                    moveCursorDown();

                }
                break;

            case 116: // F5
                insertSelected();
                break;

            case 117: // F6
                edit();
                break;

            default:
                return;
        }

        evt.preventDefault();

    });

    lib.setEnabled = function setEnabled(value) {
        enabled = value;
        $b.toggleClass('keyboard-enabled', value);

    };

    lib.setCursor = function (elm) {
        if (!$.contains(panels[activePanel].get(0), elm.get(0))) {
            switchPanel();

        }

        setCursor(elm);

    };

})(Rea.lib.keyboard);
