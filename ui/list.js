qwp.list = {
    init: function() {
        qwp.list._tmpl = qwp.list._getTmpl();
    },
    create: function(container, name, option) {
        var o = $(container);
        option = option || {};
        option.container = container;
        if (option.autoResize !== false) option.autoResize = true;
        if (!option.did) option.did = 'id';
        o.append(qwp.list._tmpl.format(name, option.sortList ? qwp.ui.tmpl(option.sortList) : ''));
        qwp.ui.createUIComponents(o);
        $(qwp.list._b(name)).data('option', option);
        qwp.list.update(name, option.data, !1, !1, !1, !1);
        qwp.list._customize(name, option);
    },
    load: function(name, notes, page, psize, sortf, sort, op, params) {
        var option = $(qwp.list._b(name)).data('option');
        if (!notes) notes = option.notes;
        if (!page) page = option.page;
        if (!psize) psize = option.psize;
        if (!sortf) sortf = option.sortf;
        if (!sort) sort = option.sort;
        if (!op) op = option.op;
        if (!op) op = 'list';
        if (option.search) {
            var p = qwp.list._formData(name, option);
            if (params) {
                if (!qwp.isString(params)) params = $.param(params);
                params = p + '&' + params;
            } else {
                params = p;
            }
        }
        qwp.list._loading(name, notes.text);
        qwp.get({
            url:qwp.list._createOpsURI(name, op, page, psize, sortf, sort, params),
            quiet: true,
            fn:function(res, data) {
                if (res.ret) {
                    qwp.list.update(name, data, page, psize, sortf, sort);
                } else {
                    qwp.notice(res.msg ? res.msg : (notes.failed ? notes.failed : $L('Failed to load list data')));
                    qwp.list._stopLoading(name)
                }
            }
        });
    },
    update: function(name, data, page, psize, sortf, sort) {
        qwp.list._stopLoading(name);
        var container = qwp.list._b(name);
        var option = $(container).data('option');
        if (page) {
            option.page = page;
        } else if (!option.page) {
            if (qwp.page && qwp.page.page) option.page = qwp.page.page;
            else option.page = 1;
        }
        if (psize) {
            option.psize = psize;
        } else if (!option.psize) {
            if (qwp.page && qwp.page.psize) option.psize = qwp.page.psize;
            else option.psize = 30;
        }
        if (sortf) option.sortf = sortf;
        if (sort) option.sort = sort;
        else option.sort = 'desc';
        if (data && data.total) {
            option.total = Math.ceil(data.total / option.psize);
            qwp.list.addItems(name, data.data);
        } else {
            option.total = 1;
            if (!option.data) {
                $(container + '>a').remove();
                $(container).append('<a class="list-group-item" href="#" mtag="nitem">'+(option.preText || ($h.i('',{'class':qwp.ui.icon('info-sign', true)}) + $L('Data is not loaded')))+'</a>');
            }
        }
    },
    addItems: function(name, data, prepend) {
        if (!data) return;
        var d = $.isArray(data) ? data : [data], h = '';
        if (d.length === 0) return;
        var container = qwp.list._b(name);
        $(container + '>a[mtag=nitem]').remove();
        var option = $(container).data('option'), dataConvertor = false;
        if (option.dataConvertor) dataConvertor = qwp.fn(option.dataConvertor);
        for (var i = 0, cnt = d.length; i < cnt; ++i) {
            h += qwp.list._createItem(d[i], name, option, i, dataConvertor);
        }
        var l = $(container);
        if (prepend) o.prepend(h);
        else l.append(h);
        for (i = 0, cnt = d.length; i < cnt; ++i) {
            $(container + '>a[mtag=item][rid='+d[i][option.did]+']').data('r', d[i]);
        }
        var o = $(container + '>a[mtag=item]');
        o.click(function(e){
            if (e.target.tagName == 'INPUT') return;
            e = $(e.delegateTarget);
            var option = $(qwp.list._b(name)).data('option');
            var rid = e.attr('rid');
            if (option.selID == rid) return;
            if (option.selID) $(container + '>a[mtag=item][rid='+option.selID+']').removeClass('active');
            option.selID = rid;
            e.addClass('active');
            if (option.onSelection) qwp.fn(option.onSelection)(e.data('r'));
        });
        if (option.popover) {
            o.mouseenter(function(e) {
                if (qwp.list._timer) {
                    clearTimeout(qwp.list._timer);
                    qwp.list._timer = false;
                    $('#list-popover-' + name).remove();
                }
                var l = $(qwp.list._b(name)), option = l.data('option');
                e = $(e.delegateTarget);
                var lpos = l.offset(), w = l.width(), popt = {pos:'right'}, win = $(window),
                    r = $(container + '>a[mtag=item][rid='+ e.attr('rid') +']').data('r'),
                    pos = e.offset(), h = e.height() + qwp.ui.paddingTopBottom(e), wh = win.height(), ws = win.scrollTop();
                $.extend(popt, option.popover);
                var pheight = popt.height;
                if (pheight > wh) pheight = wh;
                $('body').append('<div id="list-popover-{0}" class="popover fade in qwp-list-popover {1}" style="display: none;width:{3}px;height:{4}px"><div class="arrow"></div><div class="popover-content"><div mtag="content">{2}</div></div></div>'.format(name, popt.pos, qwp.fn(popt.content)(r), popt.width, pheight));
                var top, left;
                top = pos.top + h/2 - pheight / 2;
                if (popt.pos == 'right') {
                    left = lpos.left + w;
                } else {
                    left = lpos.left - popt.width;
                }
                if (top + pheight > wh + ws) {
                    var delta = top + pheight - wh - ws;
                    top -= delta;
                    $('#list-popover-' + name + '>.arrow').css('top', (delta * 100 / pheight + 50) + '%');
                } else if (top < ws) {
                    var delta = ws - top;
                    top = ws;
                    $('#list-popover-' + name + '>.arrow').css('top', (50 - delta * 100 / pheight) + '%');
                }
                var pop = $('#list-popover-' + name);
                var rid = r[option.did];
                pop.mouseenter(function(){
                    if (qwp.list._timer) {
                        clearTimeout(qwp.list._timer);
                        qwp.list._timer = false;
                    }
                }).mouseleave(function(){
                    $('#list-popover-' + name).remove();
                });
                pop.css({top:top+'px',left:left+'px'}).show();
                pheight -= qwp.ui.paddingTopBottom(pop);
                pop = $('#list-popover-' + name + ' .popover-content');
                pheight -= qwp.ui.paddingTopBottom(pop);
                $('#list-popover-' + name + ' .popover-content div[mtag=content]').slimscroll({height: pheight + 'px'});
            }).mouseleave(function(e){
                e = $(e.delegateTarget);
                var r = $(container + '>a[mtag=item][rid='+ e.attr('rid') +']').data('r'), option = $(qwp.list._b(name)).data('option'), rid = r[option.did];
                qwp.list._timer = setTimeout(function(){
                    $('#list-popover-' + name).remove();
                    qwp.list._timer = false;
                }, 500);
            });
        }
        qwp.list._checkboxChange(name, d, container, option);
        qwp.ui.createUIComponents(l);
    },
    checkAll: function(name, chk) {
        var option = $(qwp.list._b(name)).data('option');
        if (!option.checkbox) return;
        $(qwp.list._b(name) + '>a>input[type=checkbox]').each(function(i, o){
            o.checked = chk;
            $(o).trigger('change',{delegateTarget:o});
        });
    },
    selectedID: function(name) {
        var option = $(qwp.list._b(name)).data('option');
        if (!option.checkbox) return [];
        var ids = [];
        $(qwp.list._b(name) + '>a>input[type=checkbox]:checked').each(function(i, o) {
            ids.push(o.value);
        });
        return ids;
    },
    activeItem: function(name) {
        var o = $(qwp.list._b(name) + '>a.active');
        return o.length > 0 ? o.attr('rid') : false;
    },
    _checkboxChange: function(name, data, container, option) {
        if (!option.checkbox) return;
        for (var i = data.length - 1; i >= 0; --i) {
            qwp.list._setCheckboxChangeEvent(name, container, data[i], option);
        }
    },
    _setCheckboxChangeEvent: function(name, container, d, option) {
        var id = d[option.did];
        $(container + '>a>input[type=checkbox][mtag=chk]').change(function(o){
            var option = $(qwp.list._b(name)).data('option'), r = $(container + '>a[mtag=item][rid='+id+']').data('r');
            o = $(o.delegateTarget);
            if (option.onChkSelection) qwp.fn(option.onChkSelection)(o.val(), o[0].checked, r);
            o = $(qwp.list._b(name) + '>a>input[type=checkbox]:checked');
            var e = $(qwp.list._h(name) + '>.qwp-list-s>input');
            if (e.length > 0) e[0].checked = o.length > 0;
        });
    },
    _createItem: function(r, name, option, i, dataConvertor) {
        var h = dataConvertor ? dataConvertor(r) : '';
        if (option.checkbox) h += $h.checkbox({value:r[option.did],mtag:'chk'});
        return $h.a(h,{'class':'list-group-item',style:{cursor:'pointer'},mtag:'item',rid:r[option.did]});
    },
    _customize: function(name, option) {
        var container = qwp.list._h(name);
        if (option.enablePager || option.search || option.sortList || option.checkbox) {
            if (!option.enablePager) {
                $(container + '>.btn-info').hide();
                $(container + '>span').hide();
                $(container + '>input').hide();
            }
            if (option.search) {
                var s = qwp.list._s(name);
                $(s).append(qwp.ui.tmpl(option.search));
                $(s + ' button[qwp=list-search-close]').click(function(){
                    $(qwp.list._s(name)).toggle(200);
                });
                $(container + '>.btn-success').click(function(){
                    var p = $(qwp.list._b(name));
                    var option = p.data('option');
                    var o = p.offset();
                    $(qwp.list._s(name)).css('width', (p.width() - 3) + 'px').css({left: (o.left+2) + 'px', top:o.top + 'px'}).toggle(200);
                });
                $(s + ' button[qwp=list-search-submit],'+s + ' a[qwp=list-search-submit]').click(function(){
                    $(qwp.list._s(name)).toggle(200);
                    qwp.list.load(name);
                });
            } else {
                $(container + '>.btn-success').hide();
            }
            if (option.sortList) {
                $(container + '>.qwp-list-s .dropdown-menu>li').click(function(e){
                    e = $(e.delegateTarget);
                    var option = $(qwp.list._b(name)).data('option'), sortf = e.data('field');
                    if (option.sortf == sortf) return;
                    if (option.sortf) $(qwp.list._h(name) + ">.qwp-list-s .dropdown-menu>li[data-field='"+option.sortf+"']").removeClass('active');
                    option.sortf = sortf;
                    $(qwp.list._h(name) + ">.qwp-list-s .dropdown-menu>li[data-field='"+sortf+"']").addClass('active');
                    qwp.list.load(name);
                });
            } else {
                $(container + '>.qwp-list-s>a').hide();
                $(container + '>.qwp-list-s>div').hide();
            }
            if (option.checkbox) {
                $(container + '>.qwp-list-s>input').change(function(e){
                    qwp.list.checkAll(name, e.delegateTarget.checked);
                });
            } else {
                $(container + '>.qwp-list-s>input').hide();
            }
            $(qwp.list._h(name)).show();
        }
        if (option.autoResize) qwp.list._createResize(name);
    },
    _loading: function(name, txt) {
        qwp.ui.overlay(true, txt, qwp.list._b(name));
    },
    _stopLoading: function(name) {
        qwp.ui.overlay(false, false, qwp.list._b(name));
    },
    _h: function(name) {
        return '#qwp-list-header-' + name;
    },
    _b: function(name) {
        return '#qwp-list-' + name;
    },
    _s: function(name) {
        return '#qwp-list-search-' + name;
    },
    _timer: false,
    _goPage: function(name, p) {
        var option = $(qwp.list._b(name)).data('option'), o = $(qwp.list._h(name) + ' input[qwp=number]'), v = parseInt(o.val());
        if (p == 'f') p = '1';
        else if (p == 'p') p = v - 1;
        else if (p == 'n') p = v + 1;
        else if (p == 'l') p = option.total;
        p = parseInt(p);
        if (p <= 0) p = 1;
        else if (p > option.total) p = option.total;
        o.val(p);
        option.page = p;
        qwp.list.load(name);
    },
    _changeOrder: function(name, o) {
        var option = $(qwp.list._b(name)).data('option'), sort = option.sort == 'desc' ? 'asc' : 'desc';
        option.sort = sort;
        o = $(o).find('>i');
        if (sort == 'desc') {
            o.removeClass('glyphicon-arrow-up');
            o.addClass('glyphicon-arrow-down');
        } else {
            o.removeClass('glyphicon-arrow-down');
            o.addClass('glyphicon-arrow-up');
        }
        qwp.list.load(name);
    },
    _formData: function(name, option) {
        return option.search ? $(qwp.list._s(name) + ' form').serialize() : false;
    },
    _getTmpl: function() {
        return '<div id="qwp-list-search-{0}" style="display: none;z-index: 1;position: absolute;"></div><div class="qwp-list-header" id="qwp-list-header-{0}" style="display:none;margin-bottom: 1px">'+
        '<a class="btn btn-info btn-xs" onclick="qwp.list._goPage(\'{0}\', \'f\')" href="#" title="'+$L('First page')+'" role="button"><i class="glyphicon glyphicon-step-backward"></i></a>'+
        '<a class="btn btn-info btn-xs" onclick="qwp.list._goPage(\'{0}\', \'p\')" href="#" title="'+$L('Previous page')+'" role="button"><i class="glyphicon glyphicon-chevron-left"></i></a>'+
        '<a class="btn btn-info btn-xs" onclick="qwp.list._goPage(\'{0}\', \'n\')" href="#" title="'+$L('Next page')+'" role="button"><i class="glyphicon glyphicon-chevron-right"></i></a>'+
        '<a class="btn btn-info btn-xs" onclick="qwp.list._goPage(\'{0}\', \'l\')" href="#" title="'+$L('Last page')+'" role="button"><i class="glyphicon glyphicon-step-forward"></i></a>'+
        '<input qwp="number" props="defaultValue=1|minValue=1|enter=qwp.list._goPage(\'{0}\', this.value)" type="text" size="2" value="1" title="'+$L('Press enter to go to the page')+'">'+
        '<a class="btn btn-success btn-xs"><i class="glyphicon glyphicon-search" title="'+$L('Click to show search options')+'"></i></a>'+
        '<span qwp="count" title="'+$L('Total page count')+'" style="margin-left: 4px">0</span><i>&nbsp;</i>'+
        '<div class="qwp-list-s">'+
        '<div class="btn-group tooltip-info" title="'+$L('Click to show sort option')+'"><a class="btn-info btn btn-xs tooltip-info dropdown-toggle" data-toggle="dropdown" role="button"><i class="glyphicon glyphicon-sort-by-attributes"></i></a><ul class="dropdown-menu">{1}</ul></div>'+
        '<a class="btn btn-info btn-xs" onclick="qwp.list._changeOrder(\'{0}\', this)" href="#" title="'+$L('Click to toggle sort order')+'" role="button"><i class="glyphicon glyphicon-arrow-down"></i></a>'+
        '<input title="'+$L('Click to select all the items')+'" type="checkbox"></div>'+
        '</div><div class="qwp-list" id="qwp-list-{0}" class="list-group"></div>';
    },
    _createOpsURI: function(name, ops, page, psize, sortf, sort, params) {
        var p = qwp.uri.createPagerParams(page, psize, sortf, sort);
        var option = $(qwp.list._b(name)).data('option');
        qwp.copyWhenEmpty(p, option, ['page', 'psize', 'sortf', 'sort']);
        var mp = false;
        if (qwp.isString(ops)) {
            p.op = ops;
        } else {
            mp = ops[1];
            p.op = ops[0];
        }
        if (params && qwp.isString(params)) {
            p = $.param(p);
            p += '&' + params;
        } else if (params) {
            $.extend(p, params);
        }
        if (option.params) {
            if (qwp.isString(p)) p += '&' + $.param(option.params);
            else $.extend(p, option.params);
        }
        return qwp.uri.createUrlWithoutSortParams(p, mp);
    },
    _updateSize: function(name) {
        var o = $(qwp.list._b(name)), pos = o.offset();
        var option = o.data('option'), c = $(option.container);
        var h = $(window).height() - pos.top - qwp.ui.paddingTopBottom(o) - qwp.ui.marginBottom(o) - qwp.ui.borderBottomWidth(c) - qwp.ui.paddingBottom(c) - 8,
            w = c.width() - qwp.ui.paddingLeftRight(c) - 1;
        if (option.heightDelta) h -= option.heightDelta;
        o.css({height:h+'px',width:w+'px'});
        o.slimscroll({height:h+'px',width:w+'px'});
        qwp.list._resizeTimer[name] = false;
    },
    _createResize: function(name) {
        var resize = function(){
            if ($(qwp.list._b(name)).is(':hidden')) {
                setTimeout(resize, 100);
                return;
            }
            qwp.list._updateSize(name);
        };
        qwp.list._fnResize[name] = function() {
            if (!qwp.list._resizeTimer[name]) {
                qwp.list._resizeTimer[name] = setTimeout(resize, 200);
            }
        };
        qwp.ui.resize(qwp.list._fnResize[name]);
        qwp.list._updateSize(name);
    },
    _resizeTimer:{},
    _fnResize:{}
};