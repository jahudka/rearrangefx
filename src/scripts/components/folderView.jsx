(function (React, Components) {

	Components.FolderView = React.createClass({
	    componentDidMount: function () {
            $(this._list).on('dragstart.fw', 'li', this._handleDragStart);
        },

        componentWillUnmount: function () {
            $(this._list).off('.fw');
        },

		render: function () {
			return (
				<div id="folders-panel" className="main-panel">
					<h3 className="panel-heading">FX Folders</h3>
					<ul id="folders" className="panel-content folder-list" ref={function(elem) { this._list = elem; }.bind(this)}>
						{this.props.folders.map(function (folder) {
							return (
								<Components.Folder key={folder.getId()} id={folder.getId()} name={folder.getName()} smart={folder.isSmart()} db={this.props.db} />
							);
						}.bind(this))}
					</ul>
				</div>
			);
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
