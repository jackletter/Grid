(function (window, $) {
    var Grid = window.Grid = function (ele, conf) {
        var target = this.target = $("#" + ele);
        var target_header = this.target_header = null;
        var target_body = this.target_body = null;
        var target_footer = this.target_footer = null;
        if (target.length == 0) throw new Error("无效的容器id!");
        $.extend(this, Grid.settings, conf);
        this.getModel = function () {
            if (!!this.isPage)
                this.PageSize = 0;
            var vModel = {
                filterStr: this.filterStr,
                orderColumn: this.orderColumn,
                orderType: this.orderType,
                orderStr: this.orderStr,
                pageIndex: this.pageIndex,
                pageSize: this.pageSize
            };
            return vModel;
        }
        this.init = function (res) {
            target.html("");
            target.addClass("grid");
            this._initHeader(res);
            this._initBody(res);
            this._initFooter(res);
        },
        this._initHeader = function () {
            target_header = $('<div class="grid-header grid-header-scrollbar"></div>').appendTo(target);;
            var table = $('<table></table>').appendTo(target_header);
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
                    td.html('<div>' + this.headArr[i][j].text + '</div>');
                }
            }
        },
        this._initBody = function (res) {
            target_body = $('<div class="grid-body"></div>').appendTo(target);
            target_body.scroll(function (e) {
                target_header.scrollLeft(e.target.scrollLeft);
            });
            var table = $('<table></table>').appendTo(target_body);
            var colgroup = $('<colgroup></colgroup>').appendTo(table);
            var tmpstr = "";
            for (var i = 0; i < this.colWidths.length; i++) {
                tmpstr += '<col style="width:' + this.colWidths[i] + 'px;" />\n';
            }
            colgroup.html(tmpstr);
            var tbody = $('<tbody></tbody>').appendTo(table);
            for (var i = 0; i < res.DataList.length; i++) {
                var item = res.DataList[i];
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
                            $('<span">' + i + '</span>').appendTo(div);
                        }
                        case "lab":
                            {
                                var tdtext, titleTxt, canHide;
                                if (typeof (tdconf.formatter) == "function") {
                                    tdtext = tdconf.formatter(item, tdconf);
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
                                if (this.isEdit && tdconf.canEdit) {
                                    canHide = true;
                                }
                                if (tdconf.click) {
                                    var a = $('<a href="javascript:void(0);"></a>').appendTo(div);
                                    a.html(tdtext).attr("title", "titleTxt");
                                    a.click(function () {
                                        tdconf.click.apply(this, tdtext, item);
                                    });
                                    if (canHide) {
                                        a.attr("canHide", "true");
                                    }
                                } else {
                                    var span = $('<span"></span>').appendTo(div);
                                    span.html(tdtext).attr("title", titleTxt);
                                    if (canHide) {
                                        span.attr("canHide", "true");
                                    }
                                }
                                if (this.isEdit && tdconf.canEdit) {
                                    var input = $('<input style="display:none" dataName="' + tdconf.name + '" />').appendTo(div);
                                    input.val(tdtext);
                                }
                                break;
                            }
                        case "btn": {
                            var b = true;
                            //使用隐藏键控制按钮生成
                            if (tdconf.isHideKey != undefined) {
                                if (item[tdconf.isHideKey]) {

                                } else {
                                    b = false;
                                }
                            }
                            if (b) {
                                var tdtext, titleTxt, canHide;
                                if (typeof (tdconf.formatter) == "function") {
                                    tdtext = tdconf.formatter(item, tdconf);
                                } else {
                                    tdtext = item[tdconf.name];
                                }
                                if (tdconf.title) {//动态的ttitle
                                    titleTxt = item[tdconf.title];
                                }
                                if (tdconf.titleText) {//强制的title,优先级高
                                    titleTxt = tdconf.titleText;
                                }
                                if (tdconf.text) {//对于按钮来说text属性优先级高于name属性
                                    tdtext = td.text;//按钮文本
                                }
                                //内容超过最大长度截取
                                if (tdconf.cutLen != undefined) {
                                    tdtext = tdtext || "";
                                    if (tdtext.length > tdconf.cutLen) {
                                        tdtext = (tdtext || "").substr(0, tdconf.cutLen) + "...";
                                    }
                                }
                                var a = $("<a href='javascript:void(0)'></a>").appendTo(div);
                                a.attr("title", titleTxt);
                                a.html(tdtext);
                                a.click(function () {
                                    tdconf.click.apply(this, tdtext, item);
                                });
                                break;
                            }
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
                                img.click(function () {
                                    tdconf.click.apply(this, srcpath, item);
                                });
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
                                var a = $("<a href='javascript:void(0)'></a>").appendTo(div);
                                a.click(function () {
                                    btnItem.click.apply(this, btnText, item);
                                });
                            });
                            break;
                        }
                        case "btnEdit": {
                            var a_edit = $("<a href='javascript:void(0)' btnFlag='__edit'>编辑</a>").appendTo(div);
                            div.append("&nbsp;&nbsp;");
                            var a_delete = $("<a href='javascript:void(0)' btnFlag='__delete'>删除</a>").appendTo(div);
                            var a_update = $("<a href='javascript:void(0)' btnFlag='__update'>更新</a>").appendTo(div);
                            div.append("&nbsp;&nbsp;");
                            var a_cancel = $("<a href='javascript:void(0)' btnFlag='__cancel'>取消</a>").appendTo(div);
                            a_edit.click(function () {
                                var rowIndex = $(item).attr("rowIndex");
                                var tds = $("td[rowIndex=" + rowIndex + "]");
                                tds.find("span[canHide=true],a[canHide=true]").hide();
                                tds.find("input").show();
                                tds.find("a[btnFlag=__edit]").hide();
                                tds.find("a[btnFlag=__delete]").hide();
                                tds.find("a[btnFlag=__update]").show();
                                tds.find("a[btnFlag=__cancel]").show();
                            });
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
                            var chk = $("<input type='checkbox' />").appendTo(div);
                            chk.attr("title", titleTxt);
                            chk.click(function () {
                                if (tdconf.selectRow) {
                                    if ($(this).is(":checked")) {
                                        $(this).parentsUntil("tbody", "tr").addClass("grid-select-row");
                                        if (tdconf.click) {
                                            tdconf.click.apply(this,true,item);
                                        }
                                    } else {
                                        $(this).parentsUntil("tbody", "tr").removeClass("grid-select-row");
                                        if (tdconf.click) {
                                            tdconf.click.apply(this, false, item);
                                        }
                                    }
                                }
                            });
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
        },
        this._initFooter = function (res) {
            if (this.isPage && this.pageSize > 0) {
                //如果这是分页显示就初始化表格尾           
                var pageCount = this.pageCount = Math.ceil(res.Count / this.pageSize);
                target_footer = $('<div class="grid-footer">').appendTo(target);
                var div = $('<div />').appendTo(target_footer);
                var tempstr = "<select>\n";
                for (var i = 0; i < this.pageSizeList.length; i++) {
                    if (this.pageSize == this.pageSizeList[i]) {
                        tempstr += "\t<option value='" + this.pageSizeList[i] + "' selected>" + this.pageSizeList[i] + "</option>";
                    } else {
                        tempstr += "\t<option value='" + this.pageSizeList[i] + "'>" + this.pageSizeList[i] + "</option>";
                    }
                }
                tempstr += "</select>";
                div.html(tempstr);
                div.append('<span class="separator"></span>');
                if (this.pageIndex == 1) {
                    div.append('<span class="page-first"></span>');
                    div.append('<span class="page-prev"></span>');
                } else {
                    div.append('<span class="page-first page-disabled"></span>');
                    div.append('<span class="page-prev page-disabled"></span>');
                }
                div.append('<span class="separator"></span><span style=" margin: 5px;">第</span><input type="text" style="width:50px; height:25px; line-height:25px;" value="' + this.pageIndex + '" /><span style="margin:5px;">页,共' + pageCount + '页</span>');
                div.append('<span class="separator"></span>');
                if (this.pageIndex == pageCount) {
                    div.append('<span class="page-next"></span>');
                    div.append('<span class="page-last"></span>');
                } else {
                    div.append('<span class="page-next"></span>');
                    div.append('<span class="page-last"></span>');
                }
                var currentIndex = (this.pageIndex - 1) * this.pageIndex + 1;
                div.append('<span class="separator"></span><span style="margin: 5px;">当前显示第' + (currentIndex < 0 ? 0 : currentIndex) + '条到第' + ((currentIndex + res.DataList.length - 1) < 0 ? 0 : (currentIndex + res.DataList.length - 1)) + '条数据,共' + res.Count + '条</span>');
            }
        },
        this.mergeRow = function () {

        }
    }
    Grid.settings = {
        ele: "grid",//表格空间所在的容器的id
        isPage: true,//是否分页
        isFixHead: false,//是否固定列表头
        isEdit: false,//是否可编辑
        mergeKey: "",
        headArr: [],//列表头
        columnArr: [],//字段列表
        rowHeight: 35,//列头行高
        rowContentHeight: 35,//行高
        filterStr: "",//过滤字符串
        orderColumn: "",//排序字段,多个字段使用","分割
        orderType: "asc",//排序类型
        orderStr: "",//排序字符串
        pageSize: 10,//每页记录数
        pageSizeList: [10, 20, 30, 40, 50],//可选分页大小列表
        pageIndex: 1,//当前页索引
        initGrid: function () { throw new Error("必须定义initGrid方法"); }//初始化方法,必须自己定义
    };
})(window, jQuery)