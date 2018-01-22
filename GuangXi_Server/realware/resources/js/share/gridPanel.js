﻿﻿﻿﻿﻿﻿﻿﻿/*******************************************************************************
 * 
 * @param urlpath
 *            数据集路径
 * @param header
 *            列英文名和列中文名
 * @param fileds
 *            列dto字段
 * @param check
 *            是否显示checkbox
 * @param paging
 *            是否显示分页
 * @return
 */
var itemsPerPage = 25; // set the number of items you want per page

function getGrid(urlpath, header, fileds, check, paging,prefix,groupHead) {
	if( Ext.isEmpty(prefix) ){
		return  getGrid4prefix( urlpath, header, fileds, check, paging,'',groupHead)
	}else{
		return  getGrid4prefix( urlpath, header, fileds, check, paging,prefix,groupHead)
	}
	
}

function getGrid4prefix( urlpath, header, fileds, check, paging,prefix,groupHead){

	var columns = null ;
	if(Ext.isEmpty(groupHead)){
		columns = getColModel(header, fileds,prefix);
	}else {
		columns =getGroupColModel(header, fileds,prefix,groupHead); 
	}

	var store = getStore(urlpath, fileds);
	
	var pagetool = null;
	if(paging) {
		pagetool = getPageToolbar(store);
	}
	
	if (check && paging) {
		var grid = null;
		var plugins = [];
		plugins.push(Ext.create('Ext.grid.plugin.CellEditing', {  //单元格编辑
				clicksToEdit: 1
		}));
		grid = Ext.create('Ext.grid.GridPanel', {
					selType : 'checkboxmodel',
					enableKeyNav : true,
					multiSelect : true,
					frame : false,
					ignoreAddLockedColumn : true,
					viewConfig : {
						shrinkWrap : 0,
						/**
						 * hasLoadingHeight设置为true会在chrome下造成多次刷新时列错位现象
						 * 判断浏览器类型，设置hasLoadingHeight属性
						 */
						hasLoadingHeight : Ext.isIE
					},
					lockedViewConfig : {
						frame : false,
						shrinkWrap : 0,
						hasLoadingHeight : true
					},
					plugins: plugins,
					selModel : {
						mode : 'multi',
						checkOnly : true
					},
					store : store,
					features: [{
                        ftype: 'summary'
                    }],
					columns : columns,
					loadMask : {
						msg : '数据加载中,请稍等...'
					},
					bbar : pagetool
				});
	} else if (paging) {
		grid = Ext.create('Ext.grid.GridPanel', {
					frame : false,
					ignoreAddLockedColumn : true,
					viewConfig : {
						shrinkWrap : 0,
						/**
						 * hasLoadingHeight设置为true会在chrome下造成多次刷新时列错位现象
						 * 判断浏览器类型，设置hasLoadingHeight属性
						 */
						hasLoadingHeight : Ext.isIE
					},
					lockedViewConfig : {
						frame : false,
						shrinkWrap : 0,
						hasLoadingHeight : true
					},
					store : store,
					features: [{
                		ftype: 'summary'
            		}],
					columns : columns,
					enableKeyNav : true,
					pageSize : itemsPerPage,
					loadMask : {
						msg : '数据加载中,请稍等...'
					},
					bbar : pagetool
				});
	}else if (check){
		grid = Ext.create('Ext.grid.GridPanel', {
					selType : 'checkboxmodel',
					frame : false,
					ignoreAddLockedColumn : true,
					viewConfig : {
						shrinkWrap : 0,
						/**
						 * hasLoadingHeight设置为true会在chrome下造成多次刷新时列错位现象
						 * 判断浏览器类型，设置hasLoadingHeight属性
						 */
						hasLoadingHeight : false
					},
					lockedViewConfig : {
						frame : false,
						shrinkWrap : 0,
						hasLoadingHeight : true
					},
					enableKeyNav : true,
					multiSelect : true,
					selModel : {
						mode : 'multi',
						checkOnly : true
					},
					features: [{
                		ftype: 'summary'
            		}],
					store : store,
					columns : columns,
					loadMask : {
						msg : '数据加载中,请稍等...'
					}
				});
	} else {
		grid = Ext.create('Ext.grid.GridPanel', {
					frame : false,
					ignoreAddLockedColumn : true,
					viewConfig : {
						shrinkWrap : 0,
						/**
						 * hasLoadingHeight设置为true会在chrome下造成多次刷新时列错位现象
						 * 判断浏览器类型，设置hasLoadingHeight属性
						 */
						hasLoadingHeight : false
					},
					lockedViewConfig : {
						frame : false,
						shrinkWrap : 0,
						hasLoadingHeight : true
					},
					checkOnly : true,
					enableKeyNav : true,
					store : store,
					columns : columns,
					loadMask : {
						msg : '数据加载中,请稍等...'
					}
				});
	}
	
	return grid;
}
// 返回表头
function getColModel(header, fileds, prefix) {
	prefix = prefix || "";
	// 列
	var headers = header.split(",");

	// 获得列对对象
	var col = "[{xtype:'rownumberer',width:30,enableLocking : true},";

	// 默认列宽度
	var len = 110;

	// 循环列
	for (var i = 0; i < headers.length; i++) {
		// 每列
		var h = headers[i];
		// 获得每列的属性
		var hs = headers[i].split("|");
		// 中文名
		var zname = hs[0];
		// 英文名
		var ename = hs[1];
		// 宽度
		if (hs.length == 3)
			len = hs[2];
		if (ename == "do1") {
			var icon = hs[3].indexOf("look") != -1
					? "'look'"
					: hs[3].indexOf("add") != -1
							? "'add'"
							: "'look'";
			col = col
					+ "{itemId: 'myActionColumn',xtype: 'actioncolumn',text: '"
					+ zname
					+ "',id:'"+ prefix + ename +"',width: 100,items: [{tooltip:'"
					+ zname
					+ "',iconCls: "
					+ icon
					+ ",handler: function (grid, rowIndex, colIndex, node, e, record, rowEl) {"
					+ hs[3]
					+ "(grid, rowIndex, colIndex, node, e, record, rowEl);}}]}, ";
			itemsPerPage = 25;
		}
		if(ename == "href1"){
			col = col + "{text:'操作',itemId:'hrefColumn',xtype:'actiontextcolumn',width:" + len+",items: [{tooltip:'"+ zname+"',handler: function (grid, rowIndex, colIndex, node, e, record, rowEl) {" + hs[3]
					+ "(grid, rowIndex, colIndex, node, e, record, rowEl);}}]},";
		}
		if ((ename.indexOf("amount") >= 0 || ename.indexOf("amt") >= 0 || ename.indexOf("Amt") >0)
				&& fileds.in_array(ename)) {
			col = col + "{header:'" + zname + "',sortable: true,dataIndex:'"
					+ ename + "',id:'" + prefix + ename +"',width:" + len + ",align:'right',text:'"
					+ zname + "',xtype: 'numbercolumn', format:'0,0.00',summaryType: 'sum', summaryRenderer: function(value, summaryData, dataIndex) {  return value=='0.00'?'': '小计:' + Ext.util.Format.number(value,'0,00.00')  }},";
		} else if (fileds.in_array(ename)) {
			col = col + "{header:'" + zname + "',sortable: true,dataIndex:'"
					+ ename + "',id:'" + prefix + ename + "',width:" + len
					+ ",text:'" + zname + "'" + " },";
		}
		if (ename.indexOf("pay_date") > 0)
			itemsPerPage = 100;
	}
	if (col != "[") {
		col = col.substring(0, col.length - 1);
	}
	col = col + "]";
	return strToJson(col);
}


// 返回双层表头
function getGroupColModel(header, fileds,prefix,groupHead) {
	// 列
	var headers = header.split(",");

	// 获得列对对象
	var col = "[{xtype:'rownumberer',width:30,enableLocking : true}";
	
	var groupHeaders = groupHead.split(",");
	for (var j = 0; j < groupHeaders.length; j++) {
		//col = col + ",{header: 'Schedule',columns: [";
		var groupRow=groupHeaders[j].split("|");
		
		var rowBegin = parseInt(groupRow[0]);
		
		var rowNum = parseInt(groupRow[1]);
		var rowName ;
		if(groupRow.length>2){
			rowName = groupRow[2];
			col = col + ",{header: '"+rowName+"',columns: [";
		}else{
			col = col + ",{header: '</br>',columns: [";
		}
		//col = col + ",{header: '"+rowName+"',columns: [";
		var len = 110;
		
		for (var i = rowBegin; i < rowBegin+rowNum; i++) {
			// 每列
			var h = headers[i];
			// 获得每列的属性
			var hs = headers[i].split("|");
			// 中文名
			var zname = hs[0];
			// 英文名
			var ename = hs[1];
			// 宽度
			if (hs.length == 3)
				len = hs[2];
			if (ename == "do1") {
				var icon = hs[3].indexOf("look") != -1
						? "'/realware/resources/images/query.png'"
						: hs[3].indexOf("add") != -1
								? "'/realware/resources/images/add.png'"
								: "'/realware/resources/images/look.png'";
				col = col
						+ "{itemId: 'myActionColumn',xtype: 'actioncolumn',text: '"
						+ zname
						+ "',width: 100,items: [{tooltip:'"
						+ zname
						+ "',icon: "
						+ icon
						+ ",handler: function (grid, rowIndex, colIndex, node, e, record, rowEl) {"
						+ hs[3]
						+ "(grid, rowIndex, colIndex, node, e, record, rowEl);}}]}, ";
				itemsPerPage = 25;
			}
			if ((ename.indexOf("amount") > 0 || ename.indexOf("amt") > 0||ename.indexOf("Amt") >0) && fileds.in_array(ename)) {
				col = col + "{header:'" + zname + "',sortable: true,dataIndex:'"
						+ ename + "',width:" + len + ",align:'right',text:'"
						+ zname + "',xtype: 'numbercolumn', format:'0,0.00'},";
			} else if(ename=="num_isSame"||ename=="receive_allNum"){
				col = col + "{header:'" + zname + "',sortable: true,dataIndex:'"
						+ ename + "',renderer:change"+",id:'"+prefix+ename+"',width:" + len + ",text:'" + zname + "'" +
								" },";
			}else if (fileds.in_array(ename)) {
				col = col + "{header:'" + zname + "',sortable: true,dataIndex:'"
						+ ename +"',id:'"+prefix+ename+"',width:" + len + ",text:'" + zname + "'" +
								" },";
			}
			if (ename.indexOf("pay_date") > 0)
				itemsPerPage = 100;
		}
		
		if (col != "[") {
			col = col.substring(0, col.length - 1);		
		}
		col = col + "]}";
	}
	col = col + "]";
	return strToJson(col);
}
function change(value,cellmeta,record, rowIndex, columnIndex, store){
//	alert(value);
//	if(value == "NG"){
//		alert("====");
//value = "NG";
//cellmeta.css="RedFont";
//}
//return value;

	if(record.data['num_isSame']=="NG"){
		return "<span style='color:red;font-weight:bold;'>"+value+"</span>"
	}
	//chengkai 2014-10-25 13:44:37
	if(record.data['num_isSame']=="OK"){
		return "<span style='color:blue;font-weight:bold;'>"+value+"</span>"
	}
	
}
function getFiled(fields) {
	var filed = "[";
	for (var i = 0; i < fields.length; i++) {
		filed = filed + "{name: '" + fields[i] + "'},";
	}
	filed = filed.substring(0, filed.length - 1) + "]";
	return strToJson(filed);
}

/**
 * 获取gridpanel分页栏
 */
function getPageToolbar(store, pageSize) {
	var pg = null;
	if(Ext.PageListToolbar) {
		pg = Ext.create("Ext.PageListToolbar", {
			store : store,
			frame : false,
			resizable : false,
			shrinkWrap : 1,
			pageSize : pageSize || 25,
			displayInfo : true,
			displayMsg : '显示第{0}条到{1}条记录 ，一共{2}条',
			emptyMsg : "没有记录",
			dock : 'bottom', 
			pageList : [25, 50, 100]
		});
	} else {
		pg = new Ext.PagingToolbar({
			store : store,
			displayInfo : true,
			displayMsg : '显示第{0}条到{1}条记录 ，一共{2}条',
			emptyMsg : "没有记录"
		});
	}
	
	pg.child('#refresh').hide(true);
	return pg;
}

// eval关于作用域浏览器见不一致
function strToJson(str) {
	var json = (new Function("return " + str))();
	return json;
}

function getStore(urlpath, fileds) {
	var filed = getFiled(fileds);
	var store = new Ext.data.JsonStore({
				proxy : {
					type : 'ajax',
					url : urlpath,
					actionMethods : {
						read : 'POST'
					},
					reader : {
						type : 'json',
						root : 'root',
						totalProperty : 'pageCount'
					},
					listeners : {
						exception : function(reader, response, error, eOpts) {
								var b = true;
								if (response.status != 500 && error.error != undefined) {
									if (error.error.indexOf!=undefined && error.error.indexOf("parent.window.location.href") != -1) {
											Ext.Msg.alert('系统提示', 'session失效 请重新登陆！');
											parent.window.location.href = "/realware/login.do";
											b = false;
									}
								}
								if (response.responseText != "" && b) {
									Ext.Msg.show({
										title : '错误提示',
										msg : response.responseText,
										buttons : Ext.Msg.OK,
										icon : Ext.MessageBox.ERROR
									});
								}
						}
					}
				},
				pageSize : itemsPerPage,
				remoteSort : false, // 客户端排序
				fields : filed,
				autoLoad : false
			});
	return store;
}

/*******************************************************************************
 * 判断数组包是否包含某个元素
 * 
 * @param {}
 *            e
 * @return {}
 */
Array.prototype.in_array = function(e) {
	for (i = 0; i < this.length && this[i] != e; i++);
	return !(i == this.length);
}


/***
 *  操作列，显示text
 */
Ext.define('actiontextcolumn', {
    extend: 'Ext.grid.column.Action',
    alias: ['widget.actiontextcolumn'],
    constructor: function(config) {
        var me = this,
            cfg = Ext.apply({}, config),
            items = cfg.items || [me],
            l = items.length,
            i,
            item;
        delete cfg.items;
        me.callParent([cfg]);
        me.items = items;
        me.renderer = function(v, meta) {
            v = Ext.isFunction(cfg.renderer) ? cfg.renderer.apply(this, arguments)||'' : '';
            meta.tdCls += ' ' + Ext.baseCSSPrefix + 'action-col-cell';
            for (i = 0; i < l; i++) {
                item = items[i];
                item.disable = Ext.Function.bind(me.disableAction, me, [i]);
                item.enable = Ext.Function.bind(me.enableAction, me, [i]);
                v += '<a href="javascript:void(0);"' + 
                    ' class="' + Ext.baseCSSPrefix + 'action-col-icon ' + Ext.baseCSSPrefix + 'action-col-' + String(i) + ' ' + (item.disabled ? Ext.baseCSSPrefix + 'item-disabled' : ' ') + (item.cls || '') +
                    ' ' + (Ext.isFunction(item.getClass) ? item.getClass.apply(item.scope||me.scope||me, arguments) : (me.iconCls || '')) + '"' +
                    ((item.tooltip) ? ' data-qtip="' + item.tooltip + '"' : '') + '>' + (item.tooltip) + '</a>'; //|| me.text) + '</a>';
            }
            return v;
        };
    }
});

String.prototype.trim = function(){     
	//用正则表达式将前后空格用空字符串替代。     
	return this.replace(/(^\s*)|(\s*$)/g,"");     
}
