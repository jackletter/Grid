(function (window, $) {
    var Grid = window.Grid = function (ele, conf) {
        var _this = this;
        var target = this.target = $("#" + ele);
        this.target_header = null;
        this.target_body = null;
        this.target_footer = null;
        this.rank = 1;
        if (target.length == 0) throw new Error("无效的容器id!");
        $.extend(this, Grid.settings, conf);
        this.init = function (res) {
            target.html("");
            target.addClass("grid");
            this._initHeader(res);
            this._initBody(res);
            this._initFooter(res);
        }
        this._initHeader = function () {
            _this.target_header = $('<div class="grid-header grid-header-scrollbar"></div>').appendTo(target);;
            var table = $('<table></table>').appendTo(_this.target_header);
            var colgroup = $('<colgroup></colgroup>').appendTo(table);
            var tmpstr = "";
            for (var i = 0; i < this.colWidths.length; i++) {
                tmpstr += '<col style="width:' + this.colWidths[i] + 'px;" />\n';
            }
            colgroup.html(tmpstr);
            var tbody = $('<tbody></tbody>').appendTo(table);
            for (var i = 0; i < this.headArr.length; i++) {
                var tr = $('<tr></tr>').appendTo(tbody);
                if (this.rowHeight) {
                    //加行高
                    tr.css("height", this.rowHeight + "px");
                }
                for (var j = 0; j < this.headArr[i].length; j++) {
                    var td = $('<th></th>').appendTo(tr);
                    if (this.headArr[i][j].colspan != undefined) {
                        td.attr("colspan", this.headArr[i][j].colspan);
                    }
                    if (this.headArr[i][j].rowspan != undefined) {
                        td.attr("rowspan", this.headArr[i][j].rowspan);
                    }
                    var div = $('<div>' + this.headArr[i][j].text + '</div>').appendTo(td);
                    //处理排序
                    if (this.headArr[i][j].order) {
                        td.addClass("grid-sort").data("data", this.headArr[i][j]);
                        td.addClass("grid-sort-" + this.headArr[i][j].order.type);
                        if (!this.headArr[i][j].order.rank) {
                            if (_this.rank == undefined) _this.rank = 1;
                            this.headArr[i][j].order.rank = --_this.rank;
                        }
                        var icon = $("<div class='sort-icon'></div>").appendTo(div).data("data", this.headArr[i][j]);
                        _this.rank = Math.min(this.headArr[i][j].order.rank, _this.rank);
                        icon.click(this._onOrder);
                    }
                }
            }
        }
        this._initBody = function (res) {
            _this.target_body = $('<div class="grid-body"></div>').appendTo(target);
            if (_this.isFixHead) {
                if (!_this.height) throw new Error("固定表格头时必须指定高度!");
                var hei = _this.height - _this.target_header.height();
                _this.target_body.css("height", hei + "px");
            }
            _this.target_body.scroll(function (e) {
                _this.target_header.scrollLeft(e.target.scrollLeft);
            });
            var table = $('<table></table>').appendTo(_this.target_body);
            var colgroup = $('<colgroup></colgroup>').appendTo(table);
            var tmpstr = "";
            for (var i = 0; i < this.colWidths.length; i++) {
                tmpstr += '<col style="width:' + this.colWidths[i] + 'px;" />\n';
            }
            colgroup.html(tmpstr);
            var tbody = $('<tbody></tbody>').appendTo(table);
            for (var i = 0; i < res.data.length; i++) {
                var item = res.data[i];
                var tr = $('<tr rowIndex="' + i + '"></tr>').appendTo(tbody);
                tr.data("rowdata", item);
                if (this.rowContentHeight) {
                    //加行高
                    tr.css("height", this.rowContentHeight + "px");
                }
                for (var j = 0; j < this.columnArr.length; j++) {
                    //遍历字段
                    var td = $('<td></td>').appendTo(tr);
                    //赋属性
                    $.extend(td, this.columnArr[j].attr);
                    //
                    var div = $('<div></div>').appendTo(td);

                    var tdconf = this.columnArr[j];
                    switch (this.columnArr[j].type) {
                        case "index": {
                            $('<span">' + (i + 1) + '</span>').appendTo(div);
                        }
                        case "lab":
                            {
                                var tdtext, titleTxt, canHide;
                                var b = true;//是否显示内容
                                if (tdconf.isHideKey != undefined) {
                                    b = !item[tdconf.isHideKey];
                                }
                                if (!b) continue;
                                if (this.isEdit && tdconf.edit) {
                                    canHide = true;
                                } else { canHide = false }
                                if (typeof (tdconf.formatter) == "function") {
                                    tdtext = tdconf.formatter(item, tdconf);
                                } else if (canHide && tdconf.edit.type == "select") {
                                    for (var h = 0; h < tdconf.edit.options.length; h++) {
                                        if (tdconf.edit.options[h].value == item[tdconf.name]) {
                                            tdtext = tdconf.edit.options[h].text;
                                            break;
                                        }
                                    }
                                } else {
                                    tdtext = item[tdconf.name];
                                }
                                if (tdconf.title) {//动态的ttitle
                                    titleTxt = item[tdconf.title];
                                }
                                if (tdconf.titleText) {//强制的title,优先级高
                                    titleTxt = tdconf.titleText;
                                }
                                //内容超过最大长度截取
                                if (tdconf.cutLen != undefined) {
                                    tdtext = tdtext || "";
                                    if (tdtext.length > tdconf.cutLen) {
                                        tdtext = (tdtext || "").substr(0, tdconf.cutLen) + "...";
                                    }
                                }
                                if (tdconf.click) {
                                    var a = $('<a href="javascript:void(0);"></a>').appendTo(div);
                                    a.html(tdtext).attr("data-name", tdconf.name).attr("data-value", item[tdconf.name]).attr("title", "titleTxt");
                                    a.click((function (tdconf, tdtext, item) {
                                        return function () {
                                            tdconf.click.apply(this, [tdtext, item]);
                                        }
                                    })(tdconf, tdtext, item));
                                    if (canHide) {
                                        a.attr("canHide", "true");
                                    }
                                } else {
                                    var span = $('<span></span>').appendTo(div);
                                    span.html(tdtext).attr("data-name", tdconf.name).attr("data-value", item[tdconf.name]).attr("title", titleTxt);
                                    if (canHide) {
                                        span.attr("canHide", "true");
                                    }
                                }
                                if (canHide) {
                                    var _type = tdconf.edit.type || "text";
                                    var input;
                                    if (_type == "text") {
                                        input = $('<input style="display:none" dataName="' + tdconf.name + '" />').appendTo(div);
                                        input.val(tdtext);
                                    } else if (_type == "select") {
                                        if (!tdconf.edit.options) throw new Error("当单元格编辑类型为下拉框时必须指定options参数!");
                                        var str = '<select style="display:none">';
                                        if (tdconf.edit.nullable) {
                                            str += '<option value="">--请选择--</option>';
                                        }
                                        for (var h = 0; h < tdconf.edit.options.length; h++) {
                                            str += '<option value="' + tdconf.edit.options[h].value + '">' + tdconf.edit.options[h].text + '</option>';
                                        }
                                        str += "</select>";
                                        input = $(str).appendTo(div);
                                        input.val(tdtext);
                                    }
                                    if (tdconf.edit.attr) {
                                        for (var m in tdconf.edit.attr) {
                                            input.attr(m, tdconf.edit.attr[m]);
                                        }
                                    }
                                    td.attr("data-edit", "true");
                                }
                                break;
                            }
                        case "img": {
                            //首先处理格式化图片地址函数
                            var srcpath = item[tdconf.src];
                            if (typeof (tdconf.formatter) == "function") {
                                srcpath = tdconf.formatter(item, tdconf);
                            } else {
                                srcpath = item[tdconf.name];
                            }
                            var titleTxt = "";//提示文本
                            if (tdconf.title) {//动态的ttitle
                                titleTxt = item[tdconf.title];
                            }
                            if (tdconf.titleText) {//强制的title,优先级高
                                titleTxt = tdconf.titleText;
                            }
                            var img = $("<img src='" + srcpath + "' />").appendTo(div);
                            img.attr("title", titleTxt);

                            if (tdconf.click) {
                                img.css("cursor", "pointer");
                                img.click((function (tdconf, srcpath, item) {
                                    return function () {
                                        tdconf.click.apply(this, [srcpath, item]);
                                    }
                                })(tdconf, srcpath, item));
                            }
                            break;
                        }
                        case "btnGroup": {
                            $(tdconf.btns).each(function (i, btnItem) {
                                //首先处理格式化函数,和格式化参数
                                var btnText = item[btnItem.name];
                                if (typeof (btnItem.formatter) == "function") {
                                    btnText = btnItem.formatter(item, btnItem);
                                } else {
                                    btnText = item[btnItem.name];
                                }
                                if (btnItem.text) {//对于按钮组中的按钮text属性优先级高于name属性
                                    btnText = btnItem.text;
                                }
                                if (i > 0) {
                                    div.append("&nbsp;&nbsp;");
                                }
                                var a = $("<a href='javascript:void(0)'></a>").html(btnText).appendTo(div);
                                a.click((function (btnItem, btnText, item) {
                                    return function () {
                                        btnItem.click.apply(this, [btnText, item]);
                                    }
                                })(btnItem, btnText, item));
                            });
                            break;
                        }
                        case "btnEdit": {
                            var a_edit = $("<a href='javascript:void(0)' btnFlag='__edit'>编辑</a>").appendTo(div);
                            div.append("&nbsp;&nbsp;");
                            var a_delete = $("<a href='javascript:void(0)' btnFlag='__delete'>删除</a>").appendTo(div);
                            var a_update = $("<a href='javascript:void(0)' btnFlag='__update'>更新</a>").hide().appendTo(div);
                            div.append("&nbsp;&nbsp;");
                            var a_cancel = $("<a href='javascript:void(0)' btnFlag='__cancel'>取消</a>").hide().appendTo(div);
                            a_edit.click(_this._editClick);
                            a_delete.click(_this._deleteClick);
                            a_update.click(_this._updateClick);
                            a_cancel.click(_this._cancelClick);
                            break;
                        }
                        case "chk": {
                            var titleTxt = "";
                            if (tdconf.title) {//动态的ttitle
                                titleTxt = item[tdconf.title];
                            }
                            if (tdconf.titleText) {//强制的title,优先级高
                                titleTxt = tdconf.titleText;
                            }
                            var chk = $("<div class='grid-checkbox' />").appendTo(div);
                            chk.attr("title", titleTxt);
                            chk.click((function (tdconf, item) {
                                return function () {
                                    $(this).toggleClass("grid-checked");
                                    if (tdconf.selectRow) {
                                        if ($(this).hasClass("grid-checked")) {
                                            $(this).parentsUntil("tbody", "tr").addClass("grid-select-row");
                                            if (tdconf.click) {
                                                tdconf.click.apply(this, [true, item]);
                                            }
                                        } else {
                                            $(this).parentsUntil("tbody", "tr").removeClass("grid-select-row");
                                            if (tdconf.click) {
                                                tdconf.click.apply(this, [false, item]);
                                            }
                                        }
                                    }
                                }
                            })(tdconf, item));
                            break;
                        }
                        case "index":
                            {
                                var ind = i + 1;
                                if (this.isPage) {
                                    var base = window.parseInt(this.pageIndex * this.pageCount);
                                    if (isNaN(base)) {
                                        console.error("算行号时出错");
                                    } else {
                                        ind += base;
                                    }
                                }
                                $("<span>" + ind + "</span>").appendTo(div);
                                break;
                            }
                    }
                }
            }
        }
        this._editClick = function () {
            var tr = $(this).parentsUntil("tbody", "tr");
            var tds = tr.children("[data-edit=true]");
            for (var i = 0; i < tds.length; i++) {
                var td = tds.eq(i);
                td.find("span[canHide=true],a[canHide=true]").hide();
                td.find("input").val(td.find("span[canHide=true],a[canHide=true]").text()).show();
                td.find("select").val(td.find("span[canHide=true],a[canHide=true]").attr("data-value")).show();
            }
            tr.find("a[btnFlag=__edit]").hide();
            tr.find("a[btnFlag=__delete]").hide();
            tr.find("a[btnFlag=__update]").show();
            tr.find("a[btnFlag=__cancel]").show();
        }
        this._deleteClick = function () {
            var tr = $(this).parentsUntil("tbody", "tr");
            var data = tr.data("rowdata");
            if (!_this.onDelete) { throw new Error("必须定义onDelete方法!"); }
            _this.onDelete(data);
        }
        this._updateClick = function () {
            if (!_this.onUpdate) { throw new Error("必须定义onUpdate方法!"); }
            var tr = $(this).parentsUntil("tbody", "tr");
            var data = tr.data("rowdata");
            var updateData = $.extend(true, {}, data);
            var tds = tr.children("[data-edit=true]");
            for (var i = 0; i < tds.length; i++) {
                var td = tds.eq(i);
                var name = td.find("span").attr("data-name");
                if (td.find("input").length > 0) {
                    updateData[name] = td.find("input").val()
                } else if (td.find("select").length > 0) {
                    updateData[name] = td.find("select").val()
                }
            }
            _this.onUpdate(updateData);
        }
        this._cancelClick = function () {
            var tr = $(this).parentsUntil("tbody", "tr");
            var tds = tr.children("[data-edit=true]");
            for (var i = 0; i < tds.length; i++) {
                var td = tds.eq(i);
                td.find("span[canHide=true],a[canHide=true]").show();
                td.find("input,select").hide();
            }
            tr.find("a[btnFlag=__edit]").show();
            tr.find("a[btnFlag=__delete]").show();
            tr.find("a[btnFlag=__update]").hide();
            tr.find("a[btnFlag=__cancel]").hide();
        }
        this._initFooter = function (res) {
            if (this.isPage && this.pageSize > 0) {
                //如果这是分页显示就初始化表格尾           
                var pageCount = this.pageCount = Math.ceil(res.count / this.pageSize);
                _this.target_footer = $('<div class="grid-footer">').appendTo(target);
                var div = $('<div />').appendTo(_this.target_footer);
                var tempstr = "<select data-page='size'>\n";
                for (var i = 0; i < this.pageSizeList.length; i++) {
                    if (this.pageSize == this.pageSizeList[i]) {
                        tempstr += "\t<option value='" + this.pageSizeList[i] + "' selected>" + this.pageSizeList[i] + "</option>";
                    } else {
                        tempstr += "\t<option value='" + this.pageSizeList[i] + "'>" + this.pageSizeList[i] + "</option>";
                    }
                }
                tempstr += "</select>";
                $(tempstr).on("change", this.onPageChange).appendTo(div);
                div.append('<span class="separator"></span>');
                if (this.pageIndex == 1) {
                    div.append('<span class="page-first page-disabled" data-page="first"></span>');
                    div.append('<span class="page-prev page-disabled" data-page="prev"></span>');
                } else {
                    $('<span class="page-first" title="首页" data-page="first"></span>').appendTo(div).click(this._onPageChange);
                    $('<span class="page-prev" title="上一页" data-page="prev"></span>').appendTo(div).click(this._onPageChange);
                }
                div.append('<span class="separator"></span><span style=" margin: 5px;">第</span>');
                var input = $('<input type="text" style="width:50px; height:25px; line-height:25px;" value="' + this.pageIndex + '" data-page="direct" />').on('change', this._onPageChange).appendTo(div);
                div.append('<span style="margin:5px;">页,共' + pageCount + '页</span>');
                div.append('<span class="separator"></span>');
                if (this.pageIndex == pageCount) {
                    div.append('<span class="page-next page-disabled" data-page="next"></span>');
                    div.append('<span class="page-last page-disabled" data-page="last"></span>');
                } else {
                    $('<span class="page-next" title="下一页" data-page="next"></span>').appendTo(div).click(this._onPageChange);
                    $('<span class="page-last" title="尾页" data-page="last"></span>').appendTo(div).click(this._onPageChange);
                }
                var currentIndex = (this.pageIndex - 1) * this.pageIndex + 1;
                div.append('<span class="separator"></span><span style="margin: 5px;">当前显示第' + (currentIndex < 0 ? 0 : currentIndex) + '条到第' + ((currentIndex + res.data.length - 1) < 0 ? 0 : (currentIndex + res.data.length - 1)) + '条数据,共' + res.count + '条</span>');
            }
        }
        this.mergeRow = function () {

        }
        this.getSelectedRows = function () {
            var trs = _this.target_body.find("tr.grid-select-row");
            var data = [];
            for (var i = 0; i < trs.length; i++)data.push(trs.eq(i).data("rowdata"));
            return {
                trs: trs,
                data: data
            };
        }
        this._onPageChange = function () {
            var page = $(this).attr("data-page");
            if (page == "next") {
                _this.pageIndex += 1;
            } else if (page == "prev") {
                _this.pageIndex -= 1;
            } else if (page == "first") {
                _this.pageIndex = 1;
            } else if (page == "last") {
                _this.pageIndex = _this.pageCount;
            } else if (page == "direct") {
                var pageIndex = parseInt($(this).val());
                if (pageIndex > 0 && pageIndex <= _this.pageCount) {
                    _this.pageIndex = pageIndex;
                } else {
                    return;
                }
            } else if (page == "size") {
                var pageSize = parseInt($(this).val());
                _this.pageIndex = 1;
                _this.pageSize = pageSize;
            }
            var orders = _this._sortOrders(_this._collectOrders());
            _this.onQuery(pageIndex, pageSize, orders);
        }
        this._onOrder = function (evt) {
            var item = $(this);
            _this._currentOrderItem = item.data("data");
            var box = $('.grid-sort-select');
            if (box.length == 0) {
                box = $('<div class="grid-sort-select" />').appendTo(document.body);
                $('<div class="grid-sort-item" data-type="asc" />').appendTo(box).html("正序").click(_this._orderClick);
                $('<div class="grid-sort-item" data-type="desc" />').appendTo(box).html("倒序").click(_this._orderClick);
                $('<div class="grid-sort-item" data-type="none" />').appendTo(box).html("取消").click(_this._orderClick);
                box.mouseleave(function () {
                    $(this).hide();
                }).click(function () {
                    $(this).hide();
                });
            }
            box.css({
                top: evt.pageY - 1,
                left: evt.pageX - 1
            }).show();
        }
        this._orderClick = function () {
            var data = _this._currentOrderItem;
            var targetType = $(this).attr("data-type");
            var srcType = data.order.type;
            if (srcType != targetType) {
                data.order.rank = --_this.rank;
                data.order.type = $(this).attr("data-type");
                _this.pageIndex = 1;
                _this.onQuery(_this.pageIndex, _this.pageSize, _this._sortOrders(_this._collectOrders()));
            }
        }
        this._collectOrders = function (arr, orders) {
            if (!arr) arr = _this.headArr;
            if (!orders) orders = [];
            for (var i = 0; i < arr.length; i++) {
                var item = arr[i];
                if (Array.isArray(item)) { orders = _this._collectOrders(item, orders) };
                if (item.order && item.order.type != "none") {
                    orders.push({
                        name: item.order.name,
                        type: item.order.type,
                        rank: item.order.rank
                    })
                }
            }
            return orders;
        }
        this._sortOrders = function (orders) {
            orders = orders.sort(function (a, b) {
                return b.rank - a.rank;
            })
            return orders;
        }
    }
    Grid.settings = {
        ele: "grid",//表格空间所在的容器的id
        isPage: true,//是否分页
        isFixHead: false,//是否固定列表头
        height: 450,
        isEdit: false,//是否可编辑
        mergeKey: "",
        headArr: [],//列表头
        columnArr: [],//字段列表
        rowHeight: 35,//列头行高
        rowContentHeight: 35,//行高
        pageSize: 10,//每页记录数
        pageSizeList: [10, 20, 30, 40, 50],//可选分页大小列表
        pageIndex: 1,//当前页索引
        onQuery: function () { throw new Error("必须自定义onQuery方法!") }
    };
})(window, jQuery)