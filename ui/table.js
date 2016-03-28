/*!
 * qwp: https://github.com/steem/qwp
 *
 * Copyright (c) 2015 Steem
 * Released under the MIT license
 */
qwp.table = {
    init: function() {
        qwp.table.tmpl = qwp.ui.tmpl('table_base');
        qwp.table._fnResize = {};
    },
    create: function(container, tableName, option, data) {
        var toolbar = '', btns = option.btns || {}, rightWidth = 12, topColsLeft, topColsRight;
        qwp.table._formatHeaders(option);
        if (!option.did) option.did = 'id';
        if (!option.attr) option.attr = {};
        if (!option.txtNoRecord) option.txtNoRecord = $L('Record is empty...');
        if (!option.txtLoadingData) option.txtLoadingData = $L('Table data is loading, please wait...');
        if (btns.new) toolbar += qwp.table._createBtn(btns.new, 'New', 'btn-primary', 'plus-sign');
        if (btns.edit) toolbar += qwp.table._createBtn(btns.edit, 'Edit', 'btn-warning', 'edit');
        if (btns.del) toolbar += qwp.table._createBtn(btns.del, 'Delete', 'btn-danger', 'trash');
        if (btns.addons) {
            for (var i = 0, cnt = btns.addons.length; i < cnt; ++i) {
                toolbar += qwp.table._createBtn(btns.addons[i]);
            }
        }
        if (option.topCols) {
            topColsLeft = option.topCols.left;
            topColsRight = option.topCols.right;
        } else {
            topColsLeft = 3;
            topColsRight = 9;
        }
        $(container).html(qwp.table.tmpl.format(tableName, toolbar,
            qwp.table.createTable(tableName, option), topColsLeft, topColsRight));
        container = qwp.table.container(tableName);
        $(container).data('option', option);
        $(container + " table[qwp='table-header'] thead>tr>th:first-child>input[type='checkbox']").change(function(){
            var checked = this.checked;
            $(container + " table[qwp='data-table'] >tbody>tr[rid]>td:first-child>input[type='checkbox']").each(function(i, o){
                o.checked = checked;
            });
        });
        qwp.table._createResize(tableName);
        qwp.table.update(tableName, data);
        qwp.table.createSortFields(tableName, option);
        if (qwp.loading) {
            qwp.loading.line.create(container);
            qwp.loading.overlay.create("div[qwp='" + tableName + "-op-row']");
        }
    },
    addRows: function(tableName, data, prepend) {
        if (!data) return;
        var d = $.isArray(data) ? data : [data], h = '', container = qwp.table.container(tableName);
        if (d.length === 0) return;
        $(container + " table[qwp='data-table'] tbody > tr[rid='none']").remove();
        var option = $(container).data('option'), tbl = $(container + " table[qwp='data-table'] tbody");
        for (var i = 0, cnt = d.length; i < cnt; ++i) {
            h += qwp.table._createRow(d[i], tableName, option, i);
        }
        if (prepend) tbl.prepend(h);
        else tbl.append(h);
        qwp.ui.createUIComponents(tbl);
    },
    deleteRows: function(tableName, id) {
        if (!id) return;
        var d = $.isArray(id) ? id : [id], container = qwp.table.container(tableName);
        for (var i = 0, cnt = d.length; i < cnt; ++i) {
            $(container + " table[qwp='data-table'] tbody > tr[rid='" + d[i].toString() + "']").remove();
        }
        if ($(container + " table[qwp='data-table'] tbody > tr[rid]").length === 0) {
            var option = $(container).data('option');
            $(container + " table[qwp='data-table'] tbody").append(
                qwp.table._createNoDataRow(option.txtNoRecord, option.cols)
            );
        }
    },
    clearRows: function(tableName) {
        qwp.table.update(tableName, {total:0,data:[]});
    },
    update: function(tableName, data, page, psize, sortf, sort) {
        qwp.table.stopLoading(tableName);
        var container = qwp.table.container(tableName);
        var option = $(container).data('option'), total = 0;
        option.data = data;
        var tbl = $(container + " table[qwp='data-table'] tbody"), h = '';
        if (data && data.total) {
            total = data.total;
            for (var i = 0, cnt = data.data.length; i < cnt; ++i) {
                h += qwp.table._createRow(data.data[i], tableName, option, i);
            }
        } else {
            h = qwp.table._createNoDataRow(data ? option.txtNoRecord : option.txtLoadingData, option.cols);
        }
        tbl.html(h);
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
        qwp.table._updateTopRightHtml(tableName, option, total);
        qwp.table.updateSortField(tableName, option, sortf, sort);
        qwp.ui.createUIComponents(tbl);
        qwp.table._fnResize[tableName]();
    },
    get:function(tableName) {
        return $(qwp.table.container(tableName) + " table[qwp='data-table']");
    },
    data: function(tableName) {
        var option = $(qwp.table.container(tableName)).data('option');
        return option && option.data ? option.data : [];
    },
    th: function(tableName, field) {
        return $(qwp.table.container(tableName) + " table[qwp='table-header'] th[data-field='" + field + "']");
    },
    selectedIDs: function(tableName) {
        var ids = [];
        var sel = $(qwp.table.container(tableName) + " table[qwp='data-table'] >tbody>tr[rid]>td:first-child>input[type='checkbox']:checked");
        for (var i = 0; i < sel.length; i++) {
            ids[i] = sel[i].value;
        }
        return ids;
    },
    checkAllRows: function(tableName, chk) {
        var container = qwp.table.container(tableName);
        $(container + " table[qwp='data-table'] >tbody>tr[rid]>td:first-child>input[type='checkbox']").each(function(i,o){
            o.checked = chk;
        });
        var o = $(container + " table[qwp='table-header'] thead>tr>th:first-child>input[type='checkbox']")[0];
        o.checked = chk;
    },
    loading: function(tableName) {
        if (qwp.loading) {
            qwp.loading.line.show(qwp.table.container(tableName));
            qwp.loading.overlay.show("div[qwp='" + tableName + "-op-row']");
        }
    },
    stopLoading: function(tableName) {
        if (qwp.loading) {
            qwp.loading.line.hide(qwp.table.container(tableName));
            qwp.loading.overlay.hide("div[qwp='" + tableName + "-op-row']");
        }
    },
    resize: function(tableName) {
        var option = $(qwp.table.container(tableName)).data('option');
        var h = $(window).height(), o = $(qwp.table.container(tableName) + " table[qwp='table-header']");
        var defaultDelta = o.offset().top + o.height() + 10;
        h -= (option.heightDelta || defaultDelta);
        $(qwp.table.container(tableName) + " div[qwp='scroll']").slimscroll({height: h + 'px'});
    },
    load: function(tableName, notes, page, psize, sortf, sort, op, params) {
        qwp.table.loading(tableName);
        qwp.notice(notes.success ? notes.success : $L('Table data is loading...'));
        if (!op) op = 'list';
        qwp.get({
            quiet:true,
            url:qwp.table._createOpsURI(tableName, op, page, psize, sortf, sort, params),
            fn:function(res, data) {
                if (res.ret) {
                    qwp.removeNotice();
                    qwp.table.update(tableName, data, page, psize, sortf, sort);
                } else {
                    qwp.notice(res.msg ? res.msg : (notes.failed ? notes.failed : $L('Failed to load table data')));
                    qwp.table.stopLoading(tableName);
                }
            }
        });
    },
    // private functions, please don't use
    container: function(tableName) {
        return '#' + tableName + '_table_container';
    },
    createTable: function(tableName, option) {
        if (!option.attr.class) option.attr.class = 'table table-striped table-bordered table-hover';
        $.extend(option.attr, {
            style: {
                'margin-bottom': '0',
                'border-bottom': '0'
            },
            qwp:'table-header'
        });
        $.extend(option, {
            cols: option.header.names.length,
            colsWidth: []
        });
        var tmp = 0, sh = '';
        for (var i = 0, cnt = option.header.names.length; i < cnt; ++i) {
            tmp += option.header.names[i][2];
        }
        var html = $h.tableStart(option.attr), headRow = "", hasDetailBtn = option.getRowDetail && !option.noRowDetailBtn;
        if (option.selectable || hasDetailBtn) {
            ++option.cols;
            if (option.selectable) sh = $h.input({"name": "checkall", "value": "on", "type": 'checkbox'});
            var tdc = {'style': 'text-align:center'}, imgWidth;
            if (option.selectable && hasDetailBtn) {
                option.colsWidth.push('60px');
                imgWidth = '38px';
                sh = $h.img({width: '18px', height:'1px', 'src': 'img/spacer.gif'}) + sh;
            } else {
                option.colsWidth.push('27px');
                imgWidth = '20px';
                if (sh.length === 0) sh = $h.img({width: '1px', height:'1px', 'src': 'img/spacer.gif'});
            }
            option.imgWidth = imgWidth;
            sh = $h.div($h.img({width: imgWidth, height:'1px', 'src': 'img/spacer.gif'}),{style:{height:'1px',width:imgWidth}}) + sh;
            tdc.width = option.colsWidth[0];
            headRow += $h.th(sh, tdc);
        }
        var per = 0;
        for (i = 0, cnt = option.header.names.length - 1; i <= cnt; ++i) {
            var item = option.header.names[i];
            var tmpPer = Math.round(100 * item[2] / tmp);
            per += tmpPer;
            if (i == cnt && per < 100) tmpPer += 100 - per;
            var w = tmpPer + '%';
            option.colsWidth.push(w);
            var thAttr={width:w, 'data-field':option.header.fields[i]};
            headRow += $h.th(item[1], thAttr);
        }
        html += $h.thead($h.tr(headRow));
        html += $h.tableEnd;
        html = $h.div(html, {'class': "table-responsive"});
        delete option.attr.style['border-bottom'];
        option.attr.qwp = 'data-table';
        return html + $h.div($h.table($h.tbody(), option.attr), {'class': "table-responsive", qwp: 'scroll'});
    },
    updateSortField: function(tableName, option, sortf, sort) {
        if (!option.sort) option.sort = 'desc';
        if (!option.isSortFieldCreated) return;
        if ((!sortf || option.sortf == sortf) && (!sort || option.sort == sort)) return;
        var oldSortField;
        if (sortf) {
            oldSortField = option.sortf;
            option.sortf = sortf;
        }
        if (sort) {
            option.sort = sort;
        }
        var p, s = qwp.table.container(tableName) + " table[qwp='table-header'] th[data-field='";
        if (oldSortField != option.sortf && oldSortField) {
            p = $(s + oldSortField + "'] > i");
            p.removeClass('sort_asc');
            p.removeClass('sort_desc');
            p.attr('data-original-title', qwp.table.txtSortDesc());
            p.addClass('sort_both');
            $(s + oldSortField + "']").removeClass('th-sorted');
        }
        p = $(s + option.sortf + "'] > i");
        p.removeClass('sort_asc');
        p.removeClass('sort_desc');
        p.removeClass('sort_both');
        p.attr('data-original-title', qwp.table.txtSortDesc(sort));
        p.addClass('sort_' + sort);
        s = $(s + option.sortf + "']");
        if (!s.hasClass('th-sorted')) $(s).addClass('th-sorted');
    },
    txtSortDesc: function(dir) {
        if (!dir) return $L("Click to sort data");
        return dir == 'asc' ? $L('Click to change to descending order') : $L('Click to change to ascending order');
    },
    createSortFields: function(tableName, option) {
        option.isSortFieldCreated = true;
        var header = option.header, newUrl = qwp.uri.curUrlNoSort, s = qwp.table.container(tableName) + " table[qwp='table-header'] th[data-field='";
        if (newUrl.indexOf('?') == -1) newUrl += '?';
        for (var i = 0, cnt = header.names.length; i < cnt; ++i) {
            var item = header.names[i];
            if (!item[3]) continue;
            var p = $(s + header.fields[i] + "']");
            var dir = 0;
            if (option.sortf == item[0]) {
                dir = option.sort;
                p.addClass('th-sorted');
            } else {
                dir = 'both';
            }
            p.append($h.i('', {
                'class': "pull-right sort_" + dir,
                "data-rel": "tooltip",
                "data-original-title": qwp.table.txtSortDesc(dir)
            }));
            p.css("cursor", "pointer");
            p.click(function () {
                var newDir = 'desc', f = $(this).data("field");
                if (option.sortf == f) newDir = option.sort == "asc" ? "desc" : "asc";
                if (option.fetchData) return window[option.fetchData](0, 0, f, newDir);
                qwp.to(newUrl, {sortf:f, sort:newDir});
            });
        }
    },
    toPage: function(page, psize) {
        var url = location.href.replace(/&page=\w+/i, '');
        url = url.replace(/&pgsize=\w+/i, '');
        url = url.replace(/&page=/i, '');
        url = url.replace(/&pgsize=/i, '');
        url += "&page=" + page + "&psize=" + psize;
        location.assign(url);
    },
    txt:{
        prev:$h.i('',{class:qwp.ui.icon('chevron-left', true)}),
        next:$h.i('',{class:qwp.ui.icon('chevron-right', true)}),
        first:$h.i('',{class:qwp.ui.icon('step-backward', true)}),
        last:$h.i('',{class:qwp.ui.icon('step-forward', true)})
    },
    toggleDetail: function(rid, tableName) {
        $('#' + tableName + 'dtl_' + rid).toggleClass('hide');
        qwp.ui.toggleClass('#' + tableName + 'dtla_' + rid, qwp.ui.icon('plus-sign'), qwp.ui.icon('minus-sign'));
    },
    tag: function(i) {
        return 'qwp' + i;
    },
    leftHtml: function(tableName, html, append) {
        if (append) $("div[qwp='"+tableName+"-op-row'] div[qwp='table-top-left'] .toolbar .btn-group").append(html);
        else $("div[qwp='"+tableName+"-op-row'] div[qwp='table-top-left']").html(html);
    },
    rightHtml: function(tableName, html) {
        $("div[qwp='"+tableName+"-op-row'] div[qwp='table-top-right']").html(html);
    },
    _createRow: function(r, tableName, option, idx) {
        var h = '', td = '', header = option.header, base = ((option.getRowDetail && !option.noRowDetailBtn) || option.selectable) ? 1 : 0;
        if (option.dataConvertor) option.dataConvertor(r, tableName);
        var bgColor = false, title = false;
        if (r._bgColor) bgColor = r._bgColor;
        if (r._title) title = r._title;
        var subTd = '';
        if (option.getRowDetail && !option.noRowDetailBtn) {
            subTd += $h.a($h.i('', {
                'class': qwp.ui.icon('plus-sign', true),
                'id': tableName + 'dtla_' + r[option.did]
            }), {
                'class': 'btn btn-xs btn-info',
                'role': 'button',
                'onclick': "qwp.table.toggleDetail('" + r[option.did] + "', '" + tableName + "')"
            });
        }
        if (option.selectable) {
            subTd += $h.input({
                "value": r[option.did],
                "rid": r[option.did],
                "type": "checkbox"
            });
        }
        if (subTd) {
            var attr = {'style': 'text-align:center'};
            if (idx === 0) attr.width = option.colsWidth[0];
            td = $h.td($h.div($h.img({width: option.imgWidth, height:'1px', 'src': 'img/spacer.gif'}),{style:{height:'1px',width:option.imgWidth}}) + subTd, attr);
        }
        if (idx === 0) {
            for(var j= 0, jCnt=header.names.length; j < jCnt; ++j) {
                var f = header.names[j][0];
                td += $h.td(r[f] ? r[f] : '&nbsp;', {qwp: header.names[j][0], width: option.colsWidth[j + base]});
            }
        } else {
            for(var j= 0, jCnt=header.names.length; j < jCnt; ++j) {
                var f = header.names[j][0];
                td += $h.td(r[f] ? r[f] : '&nbsp;', {qwp: header.names[j][0]});
            }
        }
        var tdAttr = {'rid': r[option.did]};
        if (bgColor) tdAttr.style = {'background-color': bgColor};
        if (title) tdAttr.title = title;
        h+=$h.tr(td, tdAttr);
        if (option.getRowDetail) {
            var cls = option.noRowDetailBtn ? '' : 'hide';
            h += $h.tr($h.td(option.getRowDetail(r), {'colspan': option.cols}),{'id': tableName + 'dtl_'+ r[option.did],'class':cls});
            h += $h.tr($h.td('&nbsp', {'colspan': option.cols, qwp:'detail'}),{'class':'hide'});
        }
        return h;
    },
    updateSize: function(tableName) {
        var container = qwp.table.container(tableName);
        var option = $(container).data('option');
        if (option.data && option.data.total) {
            for (var i = 0; i < option.cols; ++i) {
                var suffix = "eq(" + i.toString() + ")";
                var th = $(container + " table[qwp='data-table'] tr:eq(0) td:" + suffix);
                var margin = qwp.ui.margin(th), padding = qwp.ui.padding(th), border = qwp.ui.border(th);
                var w = th.width() + margin.right + margin.left + padding.left + padding.right + border.left + border.right;
                $(container + " table[qwp='table-header'] th:" + suffix).attr('width', w + 'px');
            }
        }
        qwp.table.resize(tableName);
        qwp.table._resizeTimer[tableName] = false;
    },
    _createBtn: function(btn, txt, cls, icon) {
        var opt = {txt: $L(txt),
            class: cls,
            icon: icon};
        if (qwp.isString(btn)) {
            opt.txt = $L(btn);
        } else if (btn !== true){
            $.extend(opt, btn);
        }
        if (opt.click) {
            opt.onclick = opt.click;
            delete opt.click;
        }
        var h;
        if (opt.icon) {
            h = $h.i('', {class: opt.fullIcon ? opt.icon : qwp.ui.icon(opt.icon, true)}) + opt.txt;
            delete opt.icon;
        } else {
            h = opt.txt;
        }
        delete opt.txt;
        if (opt.tooltip) {
            $.extend(opt, {
                'data-rel': 'tooltip',
                'data-original-title': $L(opt.tooltip)
            });
            if (!opt['data-placement']) opt['data-placement'] = 'bottom';
            delete opt.tooltip;
        }
        if (!opt.class) opt.class = 'btn-info';
        opt.class += ' btn btn-sm';
        opt.role = 'button';
        return $h.a(h, opt);
    },
    _createOpsURI: function(tableName, ops, page, psize, sortf, sort, params) {
        var p = qwp.uri.createPagerParams(page, psize, sortf, sort);
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
        var option = $(qwp.table.container(tableName)).data('option');
        qwp.copyWhenEmpty(p, option, ['page', 'psize', 'sortf', 'sort']);
        return qwp.uri.createUrlWithoutSortParams(p, mp);
    },
    _formatHeaders: function(option) {
        var i = 0, cnt = option.header.names.length, qwpIdx = 1;
        if (!option.header.fields) {
            option.header.fields = [];
            for (; i < cnt; ++i) {
                if (!option.header.names[i][0]) {
                    option.header.names[i][0] = 'qwp' + qwpIdx;
                    ++qwpIdx;
                }
                option.header.fields.push(option.header.names[i][0]);
            }
        } else {
            for (; i < cnt; ++i) {
                if (!option.header.names[i][0]) {
                    option.header.names[i][0] = 'qwp' + qwpIdx;
                    ++qwpIdx;
                    option.header.fields[i] = option.header.names[i][0];
                }
            }
        }
    },
    _createNoDataRow: function(txt, cols) {
        return $h.tr($h.td(txt, {colspan:cols}), {rid: 'none'});
    },
    _updateTopRightHtml: function(tableName, option, total) {
        if (option.noPager || option.rightHtml) {
            if (option.rightHtml) $('#' + tableName + '_top_right').html(option.rightHtml);
            return;
        }
        var pagerFn = 'return ' + (option.fetchData || 'qwp.table.toPage'),
            psize = option.psize,
            curPage = option.page,
            totalPage = Math.ceil(total / psize),
            summary = $L("Pages: {0}. Total: {1}").format(totalPage, total),
            h = "",
            showCnt = 2,
            txtFirstPage = $L('First page'),
            txtLastPage = $L('Last page'),
            txtPrePage = $L('Previous page'),
            txtGoPage = $L('Go this page'),
            txtNextPage = $L('Next page'),
            txtRefreshPage = $L('Refresh current page'),
            place = option.pageToolTipPlacement ? option.pageToolTipPlacement : 'bottom';
        if (total > 0) {
            var prePage = curPage - 1, nextPage = curPage + 1;
            if (curPage > 1) {
                h += $h.li($h.a(qwp.table.txt.first, {
                    'data-rel':'tooltip','data-original-title':txtFirstPage,'data-placement':place,
                    'onclick': pagerFn+"(1," + psize + ")",
                    'style':'cursor:pointer'
                }));
                h += $h.li($h.a(qwp.table.txt.prev, {
                    'data-rel':'tooltip','data-original-title':txtPrePage,'data-placement':place,
                    'onclick': pagerFn+"(" + prePage + "," + psize + ")",
                    'style':'cursor:pointer'
                }));
            }
            var i = curPage - showCnt > 0 ? curPage - showCnt : 1;
            for (i; i < curPage; ++i) {
                h += $h.li($h.a(i, {
                    'data-rel':'tooltip','data-original-title':txtGoPage,'data-placement':place,
                    'onclick': pagerFn+"(" + i + "," + psize + ")",
                    'style':'cursor:pointer'
                }));
            }
            h += $h.li($h.a(i, {
                'data-rel':'tooltip','data-original-title':$L('Current page'),'data-placement':place
            }),{'class': 'active'});
            var ni = curPage + showCnt > totalPage ? totalPage : curPage + showCnt;
            for (i++; i <= ni; ++i) {
                h += $h.li($h.a(i, {
                    'data-rel':'tooltip','data-original-title':txtGoPage,'data-placement':place,
                    'onclick': pagerFn+"(" + i + "," + psize + ")",
                    'style':'cursor:pointer'
                }));
            }
            if (curPage < totalPage) {
                h += $h.li($h.a(qwp.table.txt.next, {
                    'data-rel':'tooltip','data-original-title':txtNextPage,'data-placement':place,
                    onclick: pagerFn+"(" + nextPage + "," + psize + ")",
                    'style':'cursor:pointer'
                }));
                h += $h.li($h.a(qwp.table.txt.last, {
                    'data-rel':'tooltip','data-original-title':txtLastPage,'data-placement':place,
                    'onclick': pagerFn+"(" + totalPage + "," + psize + ")",
                    'style':'cursor:pointer'
                }));
            }
        } else {
            i = 1;
            h += $h.li($h.a(i, {'data-rel':'tooltip','data-original-title':$L('Current page'),'data-placement':place}),{'class': 'active'});
        }
        h += $h.li($h.a($h.i('',{'class': qwp.ui.icon('refresh', true)}), {'onclick':pagerFn+"(" + curPage + "," + psize + ")",'href':'#',
            'data-rel':'tooltip','data-original-title':txtRefreshPage,'data-placement':'left'}));
        $('#' + tableName + '_top_right').html($h.div($h.nav($h.ul(h,{'class':'pagination'})),{qwp:'pager-right'}) + $h.div(summary, {qwp:'pager-left'}));
    },
    _createResize: function(tableName) {
        var resize = function(){
            if ($(qwp.table.container(tableName)).is(':hidden')) {
                setTimeout(resize, 100);
                return;
            }
            qwp.table.updateSize(tableName);
        };
        qwp.table._fnResize[tableName] = function() {
            if (!qwp.table._resizeTimer[tableName]) {
                qwp.table._resizeTimer[tableName] = setTimeout(resize, 200);
            }
        };
        qwp.ui.resize(qwp.table._fnResize[tableName]);
    },
    _resizeTimer:{}
};