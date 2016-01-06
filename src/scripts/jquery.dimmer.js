(function($, undefined) {

    if (!$.layers) {
        throw new Error('jQuery Dimmer requires jQuery Layers to run properly!');

    }

    var defaults = {
        showSpeed : 500,
        hideSpeed : 500,

        opacity : 0.4,
        background : '#000',

        layer : null,
        scrollLock : true,
        preventDnD: false,
        mask: null,

        beforeShow : $.noop,
        afterShow : $.noop,
        beforeHide : $.noop,
        afterHide : $.noop,
        onClick : $.noop // true to autohide
    };

    var visible = false, o = {}, elm = $('<div></div>'), scrollLock = false, preventDnD = false;

    elm.css({
        position : 'absolute',
        top : 0,
        left : 0,
        width : 0,
        height : 0,
        margin : 0,
        padding : 0,
        overflow : 'visible'
    });

    elm.on('mousewheel wheel touchmove', function (evt) {
        if (scrollLock && (elm.is(evt.target) || $.contains(elm[0], evt.target))) {
            evt.preventDefault();

        }
    });

    elm.on('dragover dragend', function (evt) {
        if (preventDnD && (elm.is(evt.target) || $.contains(elm[0], evt.target))) {
            evt.preventDefault();

            if (evt.type === 'dragover') {
                evt.originalEvent.dataTransfer.dropEffect = 'none';

            }
        }
    });

    var Dimmer = {
        show : function(options) {
            o = $.extend(true, {}, defaults, options);

            if (visible) {
                return Dimmer;

            }

            if (!o.layer) {
                throw new Error('No layer specified!');

            }

            if (o.onClick === true) {
                o.onClick = function(evt) {
                    evt.preventDefault();
                    Dimmer.hide();

                };
            }

            elm.on('click.dimmer', o.onClick);

            elm.css({
                opacity: 0
            }).appendTo(o.layer);

            if (!o.mask) {
                elm.css({
                    width: $(document).width(),
                    height: $(document).height(),
                    background : o.background
                });

            } else {
                elm.css({
                    width: 0,
                    height: 0
                });

                Dimmer._createMask(elm, o.mask instanceof $ ? o.mask : $(o.mask), o.background);

            }

            scrollLock = o.scrollLock;
            preventDnD = o.preventDnD;
            visible = true;
            o.beforeShow.call(elm[0]);

            if (!o.showSpeed) {
                elm.css({
                    opacity: o.opacity
                });
                o.afterShow.call(elm[0]);

            } else {
                elm.stop(true).animate({
                    opacity: o.opacity
                }, o.showSpeed, function () {
                    o.afterShow.call(elm[0]);
                });

            }

            return Dimmer;

        },

        hide : function() {
            if (!visible) {
                return Dimmer;

            }

            scrollLock = false;
            preventDnD = false;
            visible = false;
            o.beforeHide.call(elm[0]);

            if (!o.hideSpeed) {
                elm.css({
                    opacity: 0
                });

                o.afterHide.call(elm[0]);
                elm.empty().detach().off('.dimmer');

            } else {
                elm.stop(true).animate({
                    opacity : 0
                }, o.hideSpeed, function() {
                    o.afterHide.call(elm[0]);
                    elm.empty().detach().off('.dimmer');
                });

            }

            return Dimmer;

        },

        toggleScrollLock : function (value) {
            scrollLock = value;
            return Dimmer;

        },

        setDefaults : function(d) {
            $.extend(true, defaults, d);
            return Dimmer;

        },

        _createMask: function(holder, elms, background) {
            var e, db = [], i, j, k, cd, d, n, right, edges, winWidth = $(window).width(), winScroll = { top: $(window).scrollTop(), left: $(window).scrollLeft() };

            db.push({
                offset: {
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: $(document).height()
                },
                width: 0,
                height: $(document).height()
            });

            elms.each(function() {
                e = $(this);

                if (e.css('display') === 'inline' && 'getClientRects' in this) {
                    $.each(this.getClientRects(), function () {
                        i = {
                            offset: {
                                left: this.left + winScroll.left,
                                right: this.right + winScroll.left,
                                top: this.top + winScroll.top,
                                bottom: this.bottom + winScroll.top
                            },
                            width: this.right - this.left,
                            height: this.bottom - this.top
                        };

                        db.push(i);

                    });
                } else {
                    i = {
                        offset: e.offset(),
                        width: e.outerWidth(),
                        height: e.outerHeight()
                    };

                    i.offset.right = i.offset.left + i.width;
                    i.offset.bottom = i.offset.top + i.height;

                    db.push(i);

                }
            });

            db.sort(function(a, b) {
                return a.offset.top - b.offset.top;
            });

            cd = function(x, y, w, h) {
                d = $('<div></div>');
                d.css({
                    position: 'absolute',
                    left: x,
                    top: y,
                    width: w,
                    height: h,
                    background: background
                }).appendTo(holder);
            };

            for (i = 0, n = db.length; i < n; i++) {
                e = db[i];

                // scan around
                right = [];
                edges = [];

                for (j = 0; j < n; j++) {
                    if (i === j || db[j].offset.bottom < e.offset.top || db[j].offset.top > e.offset.bottom) {
                        // exclude e, items ending before e or starting after e
                        continue;

                    }

                    if (db[j].offset.right > e.offset.right) {
                        if (db[j].offset.top >= e.offset.top && db[j].offset.top < e.offset.bottom || db[j].offset.bottom > e.offset.top && db[j].offset.bottom <= e.offset.bottom || db[j].offset.top <= e.offset.top && db[j].offset.bottom >= e.offset.bottom) {
                            right.push($.extend(true, {}, db[j]));

                        }
                    }
                }

                if (!right.length) {
                    cd (e.offset.right, e.offset.top, winWidth - e.offset.right, e.height);

                } else {
                    right.sort(function(a, b) {
                        return a.offset.left - b.offset.left;

                    });

                    for (j = 0; j < right.length; j++) {
                        if (right[j].offset.bottom <= e.offset.top || right[j].offset.top >= e.offset.bottom) {
                            right.splice(j, 1);
                            j--;
                            continue;

                        }

                        if (right[j].offset.top < e.offset.top) {
                            right[j].offset.top = e.offset.top;

                        }

                        if (right[j].offset.bottom > e.offset.bottom) {
                            right[j].offset.bottom = e.offset.bottom;

                        }

                        right[j].height = right[j].offset.bottom - right[j].offset.top;

                        for (k = j + 1; k < right.length; k++) {
                            if (right[k].offset.bottom <= right[j].offset.top || right[k].offset.top >= right[j].offset.bottom) {
                                continue;

                            } else if (right[k].offset.top >= right[j].offset.top && right[k].offset.bottom <= right[j].offset.bottom) {
                                right.splice(k, 1);
                                k--;

                            } else if (right[k].offset.top < right[j].offset.top && right[k].offset.bottom > right[j].offset.bottom) {
                                right.splice(k + 1, 0, {
                                    offset: {
                                        left: right[k].offset.left,
                                        top: right[j].offset.bottom,
                                        right: right[k].offset.right,
                                        bottom: right[k].offset.bottom
                                    },
                                    width: right[k].width,
                                    height: right[k].offset.bottom - right[j].offset.bottom
                                });

                                right[k].height = right[j].offset.top - right[k].offset.top;
                                right[k].offset.bottom = right[k].offset.top + right[k].height;

                            } else if (right[k].offset.top < right[j].offset.top && right[k].offset.bottom > right[j].offset.top) {
                                right[k].offset.bottom = right[j].offset.top;
                                right[k].height = right[k].offset.bottom - right[k].offset.top;

                            } else if (right[k].offset.bottom > right[j].offset.bottom && right[k].offset.top < right[j].offset.bottom) {
                                right[k].offset.top = right[j].offset.bottom;
                                right[k].height = right[k].offset.bottom - right[k].offset.top;

                            }
                        }

                        if (right[j].height > 0) {
                            cd (e.offset.right, right[j].offset.top, right[j].offset.left - e.offset.right, right[j].height);

                        }
                    }

                    right.sort(function(a, b) {
                        return a.offset.top - b.offset.top;

                    });

                    if (right[0].offset.top > e.offset.top) {
                        cd (e.offset.right, e.offset.top, winWidth - e.offset.right, right[0].offset.top - e.offset.top);

                    }

                    while (right.length > 1) {
                        j = right.shift();

                        if (right[0].offset.top > j.offset.bottom) {
                            cd (e.offset.right, j.offset.bottom, winWidth - e.offset.right, right[0].offset.top - j.offset.bottom);

                        }
                    }

                    if (right[0].offset.bottom < e.offset.bottom) {
                        cd (e.offset.right, right[0].offset.bottom, winWidth - e.offset.right, e.offset.bottom - right[0].offset.bottom);

                    }

                }
            }
        }
    };

    $.extend({
        dimmer : Dimmer
    });

})(jQuery);
