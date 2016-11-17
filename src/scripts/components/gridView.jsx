(function(React, Components) {

    Components.GridView = React.createClass({
        componentDidMount: function () {
            $([this._viewport, this._folders, this._plugins])
                .on('scroll.gw', this._handleScroll);

            $(this._viewport)
                .on('mousedown.gw', 'td', this._handleDrag)
                .on('mouseenter.gw', 'td', this._updateRulers)
                .on('mouseleave.gw', this._hideRulers);

            this._scrollFrame = null;
        },

        componentWillUnmount: function () {
            $([this._viewport, this._folders, this._plugins])
                .off('.gw');

            if (this._scrollFrame !== null) {
                window.cancelAnimationFrame(this._scrollFrame);
            }
        },

        render: function () {
            return (
                <div id="assignments-panel" className="main-panel">
                    <h3 className="panel-heading">FX Assignments</h3>
                    <div id="assignments-table" className="panel-content">
                        {this._renderFolders()}
                        {this._renderPlugins()}
                        <div id="assignments-wrap" ref={function(elem) { this._viewport = elem; }.bind(this)}>
                            <table>
                                {this._renderAssignments()}
                            </table>
                        </div>
                    </div>
                    <span className="grid-ruler grid-ruler-horizontal" style={{display: 'none'}} ref={function(elem) { this._ruler_horiz = elem; }.bind(this)} />
                    <span className="grid-ruler grid-ruler-vertical" style={{display: 'none'}} ref={function(elem) { this._ruler_vert = elem; }.bind(this)} />
                </div>
            );
        },

        _renderFolders: function () {
            return (
                <ul id="assignments-folders" ref={function(elem) { this._folders = elem; }.bind(this)}>
                    {this.props.folders.map(function (folder) {
                        if (folder.isSmart()) {
                            return null;
                        }

                        return (
                            <li key={folder.getId()}><span className="label" title={folder.getName()}>{folder.getName()}</span></li>
                        );
                    })}
                </ul>
            );
        },

        _renderPlugins: function () {
            return (
                <ul id="assignments-plugins" ref={function(elem) { this._plugins = elem; }.bind(this)}>
                    {_.map(this.props.plugins, function (plugins, type) {
                        if (!plugins.length) {
                            return null;
                        }

                        return (
                            <li key={type}>
                                <span className="type-label">{Rea.lib.pluginTypes[type]}</span>
                                <ul>
                                    {plugins.map(function(plugin) {
                                        return (
                                            <li key={plugin.getId()}><span className="label" title={plugin.getName(true)}>{plugin.getName(true)}</span></li>
                                        );
                                    }.bind(this))}
                                </ul>
                            </li>
                        );
                    }.bind(this))}
                </ul>
            );
        },

        _renderAssignments: function () {
            return (
                <tbody id="assignments" ref={function(elem) { this._grid = elem; }.bind(this)}>
                    {_.map(this.props.plugins, function (plugins, type) {
                        return plugins.map(function(plugin) {
                            return (
                                <tr key={plugin.getId()}>
                                    {this.props.folders.map(function (folder) {
                                        return (
                                            <td
                                                className={folder.hasPlugin(plugin) ? 'checked' : ''} data-folder={folder.getId()} data-plugin={plugin.getId()}
                                                title={plugin.getName(true) + ' (' + Rea.lib.pluginTypes[type] + ') -> ' + folder.getName()}
                                            />
                                        );
                                    }.bind(this))}
                                </tr>
                            );
                        }.bind(this));
                    }.bind(this))}
                </tbody>
            );
        },

        _handleScroll: function (evt) {
            if (this._lock) {
                return;
            }

            this._lock = true;

            this._scrollFrame = window.requestAnimationFrame(function() {
                this._lock = false;
                this._scrollFrame = null;

                var x, y;

                if (evt.target === this._folders) {
                    x = this._folders.scrollLeft;
                    this._viewport.scrollLeft = x;

                } else if (evt.target === this._plugins) {
                    y = this._plugins.scrollTop;
                    this._viewport.scrollTop = y;

                } else {
                    x = this._viewport.scrollLeft;
                    y = this._viewport.scrollTop;

                    this._folders.scrollLeft = x;
                    this._plugins.scrollTop = y;
                }
            }.bind(this));
        },

        _handleDrag: function (mdevt) {
            mdevt.preventDefault();

            var t = $(mdevt.currentTarget),
                v = this._viewport.getBoundingClientRect(),
                r = mdevt.currentTarget.getBoundingClientRect(),
                s = r.right - r.left,
                idx_h = Math.floor((mdevt.clientX - v.left + this._viewport.scrollLeft) / s),
                idx_v = Math.floor((mdevt.clientY - v.top + this._viewport.scrollTop) / s),
                state = !t.hasClass('checked'),
                $d = $(document),
                $g = $(this._grid),
                last = {
                    items: t,
                    folders: [this.props.db.getFolder(t.attr('data-folder') - 0)],
                    plugins: [this.props.db.getPlugin(t.attr('data-plugin') - 0)]
                },
                vw = v.right - v.left,
                vh = v.bottom - v.top,
                scr_horiz_tp = v.left + vw * 0.1,
                scr_horiz_tn = v.right - vw * 0.1,
                scr_vert_tp = v.top + vh * 0.1,
                scr_vert_tn = v.bottom - vh * 0.1,
                scr_horiz_d = 0,
                scr_vert_d = 0,
                scr_frame = null,
                scrolling = false,
                last_mmevt = null,
                ended = false;

            t.toggleClass('checked', state);
            t.addClass('toggling');

            var end = function(evt) {
                evt.preventDefault();

                ended = true;

                $d.off('.gw');

                if (last) {
                    last.items.removeClass('toggling');

                    if (last.plugins.length === 1) {
                        last.plugins[0].toggleFolders(last.folders, state);
                    } else {
                        last.folders[0].togglePlugins(last.plugins, state);
                    }
                }

                this.props.db.dispatch();

            }.bind(this);

            var scroll = function () {
                if (ended) {
                    return;
                }

                var sl = this._viewport.scrollLeft,
                    st = this._viewport.scrollTop;

                this._viewport.scrollLeft = this._folders.scrollLeft = sl + scr_horiz_d * 2;
                this._viewport.scrollTop = this._plugins.scrollTop = st + scr_vert_d * 2;

                last_mmevt && checkItems(last_mmevt);

                scr_frame = window.requestAnimationFrame(scroll);

            }.bind(this);

            var checkItems = function(evt) {
                if (ended) {
                    return;
                }

                var idx_t_h = Math.floor((evt.clientX - v.left + this._viewport.scrollLeft) / s),
                    idx_t_v = Math.floor((evt.clientY - v.top + this._viewport.scrollTop) / s),
                    idx1, idx2, items, folders = [], plugins = [];

                last.items.removeClass('toggling');
                last.items.toggleClass('checked', !state);

                if (Math.abs(idx_t_h - idx_h) > Math.abs(idx_t_v - idx_v)) {
                    idx1 = Math.min(idx_t_h, idx_h);
                    idx2 = Math.max(idx_t_h, idx_h) + 1;

                    plugins.push(this.props.db.getPlugin(t.attr('data-plugin') - 0));

                    items = t.parent().children().slice(idx1, idx2).filter(function(i, elem) {
                        var folder = this.props.db.getFolder(elem.getAttribute('data-folder') - 0);

                        if (folder.hasPlugin(plugins[0]) !== state) {
                            folders.push(folder);
                            return true;
                        }

                        return false;
                    }.bind(this));

                } else {
                    idx1 = Math.min(idx_t_v, idx_v);
                    idx2 = Math.max(idx_t_v, idx_v) + 1;

                    folders.push(this.props.db.getFolder(t.attr('data-folder') - 0));

                    items = $g.children().slice(idx1, idx2).children(':nth-child(' + (idx_h + 1) + ')').filter(function (i, elem) {
                        var plugin = this.props.db.getPlugin(elem.getAttribute('data-plugin') - 0);

                        if (folders[0].hasPlugin(plugin) !== state) {
                            plugins.push(plugin);
                            return true;
                        }

                        return false;
                    }.bind(this));

                }

                items.toggleClass('checked', state);
                items.addClass('toggling');
                last.items = items;
                last.folders = folders;
                last.plugins = plugins;

            }.bind(this);

            var checkScroll = function (evt) {
                scr_horiz_d = evt.clientX < scr_horiz_tp ? -1 : (evt.clientX > scr_horiz_tn ? 1 : 0);
                scr_vert_d = evt.clientY < scr_vert_tp ? -1 : (evt.clientY > scr_vert_tn ? 1 : 0);

                if (scrolling && scr_horiz_d === 0 && scr_vert_d === 0) {
                    window.cancelAnimationFrame(scr_frame);
                    scrolling = false;
                    scr_frame = null;
                    this._lock = false;
                } else if (!scrolling && (scr_horiz_d !== 0 || scr_vert_d !== 0)) {
                    scrolling = true;
                    this._lock = true;
                    scr_frame = window.requestAnimationFrame(scroll);
                }
            }.bind(this);

            var move = function(evt) {
                if (ended) {
                    return;
                }

                last_mmevt = evt;
                checkItems(evt);
                checkScroll(evt);

            }.bind(this);

            var esc = function (evt) {
                if (evt.which === 27) {
                    evt.preventDefault();
                    ended = true;
                    $d.off('.gw');
                    last.items.removeClass('toggling');
                    last.items.toggleClass('checked', !state);
                }
            }.bind(this);

            $d.on('mousemove.gw', move);
            $d.on('mouseup.gw', end);
            $d.on('keydown.gw', esc);

        },

        _updateRulers: function (evt) {
            var rect = evt.currentTarget.getBoundingClientRect();
            this._ruler_horiz.style.display = this._ruler_vert.style.display = '';
            this._ruler_horiz.style.top = rect.top + 'px';
            this._ruler_vert.style.left = rect.left + 'px';
        },

        _hideRulers: function (evt) {
            if (evt.currentTarget === this._viewport) {
                this._ruler_horiz.style.display = this._ruler_vert.style.display = 'none';
            }
        }
    });

})(React, Rea.Components);
