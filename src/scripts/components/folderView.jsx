(function (React, Components) {

	Components.FolderView = React.createClass({
	    getInitialState: function () {
            return {
                activeFolder: null
            };
        },

        componentWillReceiveProps: function () {
            if (this.state.activeFolder && !this.props.db.getFolder(this.state.activeFolder)) {
                this.setState({
                    activeFolder: null
                });
            }
        },

	    componentDidMount: function () {
            $(this._list)
                .on('dragstart.fw', 'li', this._handleDragStart)
                .on('click.fw', 'li', this._handleClick);

            $(document).on('keydown.fw', this._handleKey);
        },

        componentWillUnmount: function () {
            $(this._elem).off('.fw');
            $(document).off('.fw');
        },

		render: function () {
			return (
				<div id="folders-panel" className="main-panel">
					<h3 className="panel-heading">FX Folders</h3>
                    <div className="panel-content">
                        <ul id="folders" ref={function(elem) { this._list = elem; }.bind(this)}>
                            {this.props.folders.map(function (folder) {
                                return (
                                    <Components.Folder key={folder.getId()} active={folder.getId() === this.state.activeFolder} id={folder.getId()} name={folder.getName()} smart={folder.isSmart()} db={this.props.db} />
                                );
                            }.bind(this))}
                        </ul>
                        {this.state.activeFolder ? this._renderFolder() : null}
                    </div>
				</div>
			);
		},

        _renderFolder: function () {
		    var folder = this.props.db.getFolder(this.state.activeFolder);

            if (folder.isSmart()) {
                return (
                    <div id="smart-folder">
                        Filter:<br />
                        <input type="text" defaultValue={folder.getPlugins()[0].getName()} id="smart-folder-filter" onBlur={this._handleBlur} />
                    </div>
                );
            } else {
                return (
                    <ul id="plugins">
                        {folder.getPlugins().map(function (plugin) {
                            var label = Rea.lib.pluginTypes[plugin.getType()] + ': ' + plugin.getName(true);

                            return (
                                <li title={label}>{label}</li>
                            );
                        }.bind(this))}
                    </ul>
                );
            }
        },

        _handleClick: function (evt) {
		    if (evt.isDefaultPrevented() || evt.target.tagName === 'BUTTON') {
		        return;
            }

            var t = $(evt.currentTarget),
                id = t.data('id');

            if (t.hasClass('renaming')) {
                return;
            }

            if (id === this.state.activeFolder) {
                this.setState({
                    activeFolder: null
                });
            } else {
                this.setState({
                    activeFolder: id
                });
            }
        },

        _handleKey: function (evt) {
            if (evt.target.id === 'smart-folder-filter') {
                if (evt.which === 13 || evt.which === 27) {
                    evt.preventDefault();

                    if (evt.which === 27) {
                        evt.target.value = this.props.db
                            .getFolder(this.state.activeFolder)
                            .getPlugins()[0]
                            .getName();
                    }

                    evt.target.blur();

                }
            } else if (this.state.activeFolder && evt.which === 27) {
                this.setState({
                    activeFolder: null
                });
            }
        },

        _handleBlur: function (evt) {
            var plugin = this.props.db
                .getFolder(this.state.activeFolder)
                .getPlugins()[0];

            if (plugin.getName() !== evt.target.value) {
                plugin.setName(evt.target.value);
                this.props.db.dispatch();

            }
        },

        _handleDragStart: function (evt) {
            var t = $(evt.currentTarget),
                d = $(document),
                r = this._list.getBoundingClientRect(),
                s = (r.bottom - r.top) * 0.1;

            t.addClass('dragging');

            this._drag = {
                srcElem: t,
                srcIndex: t.index(),
                targetElem: null,
                targetIndex: null,
                thresholdPrev: r.top + s,
                thresholdNext: r.bottom - s,
                scrolling: false,
                scroll: null
            };

            d.on('dragend.fw', this._handleDragEnd);
            d.on('dragenter.fw', this._handleDragEnter);
            d.on('dragover.fw', this._handleDragMove);
            d.on('drop.fw', this._handleDrop);
            d.on('dragover.fw dragenter.fw dragleave.fw', this._prevent);

        },

        _handleDragEnd: function () {
            $(document).off('.fw');
            this._cleanup(true);
            this._drag = null;
        },

        _prevent: function (evt) {
            evt.preventDefault();
        },

        _cleanup: function (full) {
            full && this._drag.srcElem.removeClass('dragging');
            this._drag.targetElem && this._drag.targetElem.removeClass('drop-target drop-target-prev drop-target-next');
            this._drag.targetElem = this._drag.targetIndex = null;
        },

        _handleDragEnter: function (evt) {
            var t = $(evt.target).closest('li'),
                i = t.index();

            if (!t.length || !t.parent().is(this._list)) {
                this._cleanup();
                return;
            }

            if (i !== this._drag.targetIndex) {
                this._cleanup();

                if (i !== this._drag.srcIndex) {
                    this._drag.targetElem = t;
                    this._drag.targetIndex = i;
                    t.addClass('drop-target ' + (i < this._drag.srcIndex ? 'drop-target-prev' : 'drop-target-next'));
                }
            }
        },

        _handleDrop: function () {
            var target = this._drag.targetElem;

            if (target) {
                if (this._drag.targetIndex > this._drag.srcIndex) {
                    target = target.next();
                }

                this.props.db.moveFolder(this._drag.srcElem.data('id'), target.data('id'));

            }
        },

        _handleDragMove: function (evt) {
            if (evt.originalEvent.clientY < this._drag.thresholdPrev) {
                if (!this._drag.scrolling) {
                    this._drag.scrolling = true;
                    this._drag.scroll = window.requestAnimationFrame(this._scroll.bind(this, -1));
                }
            } else if (evt.originalEvent.clientY > this._drag.thresholdNext) {
                if (!this._drag.scrolling) {
                    this._drag.scrolling = true;
                    this._drag.scroll = window.requestAnimationFrame(this._scroll.bind(this, 1));
                }
            } else if (this._drag.scrolling) {
                window.cancelAnimationFrame(this._drag.scroll);
                this._drag.scrolling = false;
                this._drag.scroll = null;
            }
        },

        _scroll: function (dir) {
            if (dir < 0 && this._list.scrollTop > 0 || dir > 0 && this._list.scrollTop < this._list.scrollHeight - this._list.clientHeight) {
                this._list.scrollTop += dir * 2;
                this._drag.scroll = window.requestAnimationFrame(this._scroll.bind(this, dir));

            }
        }
	});

})(React, Rea.Components);
