(function (React, Components) {

	Components.Folder = React.createClass({
		render: function () {
			return (
				<li className={this.props.active ? 'active' : ''} data-id={this.props.id} draggable={true} ref={function(elem) { this._elem = elem; }.bind(this)}>
					<i className="item-handle fa fa-reorder" />
					<span className="item-label" ref={function(elem) { this._label = $(elem); }.bind(this)}>{this.props.name}</span>
					<button className="btn btn-edit fa fa-edit" onClick={this._handleRename} />
					<button className="btn btn-remove fa fa-remove" onClick={this._handleRemove} />
				</li>
			);
		},

        _handleRename: function () {
            this._label.prop('contentEditable', true);
            this._label.on('keydown.fr keyup.fr keypress.fr', this._handleKey);
            this._label.on('blur.fr', this._handleBlur);
            this._label.trigger('focus');
        },

        _handleKey: function (evt) {
            if (evt.which === 13 || evt.which === 27) {
                evt.preventDefault();

                if (evt.type === 'keydown') {
                    if (evt.which === 27) {
                        this._label.text(this.props.name);
                    }

                    this._label.trigger('blur');
                }
            }
        },

        _handleBlur: function () {
            this._label.off('.fr');

            var t = this._label.text().trim();

            if (t !== this.props.name) {
                this.props.db.renameFolder(this.props.id, t);
            }
        },

        _handleRemove: function () {
            this.props.db.removeFolder(this.props.id);
        }
	});

})(React, Rea.Components);
