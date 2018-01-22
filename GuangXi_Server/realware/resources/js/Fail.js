/**
 * 签收失败 
XMLHeadHandler获得多条凭证原文
 */

/*******************************************************************************
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr' + 'ipt>');

// 列表
var listPanel = null;

// 签收失败信息
var fileds = ["id","voucher_no","vt_code","vou_date","agency_code","agency_name","state","remark","admdiv_code","year","create_date"];
var header = "凭证号|voucher_no|100,凭证类型|vt_code|60,凭证日期|vou_date|80,所属财政|admdiv_code|100,单位编码|agency_code|100,单位名称|agency_name|100,下载状态|state|60,年度|year|60,生成日期|create_date|120,备注|remark|400";
var comboStore = Ext.create('Ext.data.Store', {
	fields : ['name', 'value'],
	data : [{
				"name" : "全部",
				"value" : ""
			},{
				"name" : "直接支付",
				"value" : "5201"
			},{
				"name" : "授权支付",
				"value" : "8202"
			}]
});
Ext.onReady(function() {
	Ext.QuickTips.init();
	if (listPanel == null) {
		var store = getStore(loadClearUrl, fileds);
		var columns = getColModel(header, fileds);
		//凭证类型
		var column = columns[2];
		column.renderer = function(value,col) {
			var record = comboStore.findRecord('value',value);
			if(record) {
				return record.get('name');
			}
			return value;
		};
		column = columns[4];
		column.renderer = function(value,col) {
			var record = comboAdmdiv.findRecord('admdiv_code',value);
			if(record) {
				return record.get('admdiv_name');
			}
			return value;
		};
		column = columns[7];
		column.renderer = function(value,col) {
			return value ? (2 == value ? "签收失败" : "") : "";
		};
		// 根据查询条件检索数据
		var pagetool = getPageToolbar(store);
		store.on('beforeload', function(thiz, options,e) {
			var panel = Ext.ComponentQuery.query("panel[title='查询区']")[0];
			beforeload(panel, options, Ext.encode(fileds));
		});

	}
	// 按条件查询
	var buttonItems = [{
							id : 'checkInfo',// 查看原文按钮
							handler : function() {
				                 var records = listPanel.getSelectionModel().getSelection();
				                 if (records.length == 0) {
				                	 Ext.Msg.alert("系统提示", "请选择一条记录！");
				                 } else {
				                	 checkXML();
				                 }
							}
						},
					  {
					   id : 'check',// 查看数据按钮
					   handler : function() {
							refreshData();
						}
					  }];
          var queryItems = [ {
              title : "查询区",
              id : 'checkQuery',
              frame : false,
				defaults : {
					padding : '0 5 0 5'
			  },
			  layout : {
					type : 'table',
					columns : 4
			  },
			  bodyPadding : 5,
		         items : [
				    {
					id : 'admdiv',
					fieldLabel : '所属财政',
					xtype : 'combo',
					dataIndex : 'admdiv_code',
					displayField : 'admdiv_name',
					emptyText : '请选择',
					valueField : 'admdiv_code',
					labelWidth : 60,
					width : 180,
					editable : false,
					store : comboAdmdiv
				},
				{
					id : 'taskState',
					fieldLabel : '凭证类型',
					xtype : 'combo',
					dataIndex : 'vt_code',
					displayField : 'name',
					emptyText : '请选择',
					valueField : 'value',
					labelWidth : 60,
					width : 180,
					editable : false,
					store : comboStore,
					queryMode: 'local',
					symbol : '=',
					value : ""
				},
				{
					id : 'start_voucher_no',
					fieldLabel : '凭证号',
					xtype : 'textfield',
					dataIndex : 'voucher_no',
					labelWidth : 50,
					width : 180,
					symbol : '>=',
					editable : true
				},
				{
					id : 'end_voucher_no',
					fieldLabel : '至',
					xtype : 'textfield',
					dataIndex : 'voucher_no ',
					labelWidth : 30,
					width : 160,
					symbol : '<=',
					editable : true
				},
				 {
					id : 'voudate',
					fieldLabel : '凭证日期',
					xtype : 'datefield',
					dataIndex : 'vou_date',
					format : 'Ymd',
					width : 160,
					labelWidth : 60,
					data_type : 'string'
				}
				, 
				{
					id : 'startcreateDate',
					fieldLabel : '下载日期',
					xtype : 'datefield',
					dataIndex : 'create_date ',
					width : 160,
					labelWidth : 60,
					format : 'Y-m-d',
					symbol : '>=',
					data_format : 'yyyy-MM-dd',
					data_type : 'date'
				}, {
					id : 'endcreateDate',
					fieldLabel : '至',
					xtype : 'datefield',
					dataIndex : 'create_date',
					width : 180,
					labelWidth : 50,
					symbol : '<=',
					format : 'Y-m-d',
					maxValue : new Date(),
					data_format : 'yyyy-MM-dd',
					data_type : 'date'
				}
				]
	}, {
		id : 'listPanel',
		xtype : 'gridpanel',
		height : document.documentElement.scrollHeight - 115,
		frame : false,
		multiSelect : true,
		ignoreAddLockedColumn : true,
		frameHeader : false,
		viewConfig : {
			/**
			 * hasLoadingHeight设置为true会在chrome下造成多次刷新时列错位现象
			 * 判断浏览器类型，设置hasLoadingHeight属性
			 */
			shrinkWrap : 0,
			hasLoadingHeight : Ext.isIE
		},
		lockedViewConfig : {
			frame : false,
			shrinkWrap : 0,
			hasLoadingHeight : Ext.isIE
		},
		title : "查询数据列表",
		selType : 'checkboxmodel',
		selModel : {
			mode : 'SINGLE',
			checkOnly : true
		},
		store : store,
		columns : columns,
		loadMask : {
			msg : '数据加载中,请稍等...'
		},
		bbar : pagetool
	}];
	Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
		listPanel = Ext.getCmp("listPanel"); 
		var vercher_type = Ext.getCmp("vercher_type");
		Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), vercher_type);
	});
});

function checkXML(){
	var records = listPanel.getSelectionModel().getSelection();
	if (records.length >1) {
		Ext.Msg.alert("系统提示", "请选择一条数据！");
		refreshData();
		return;
	}
	 var _window=new Ext.Window({ 
		    id:"window",
	        title:"查询凭证原文",   
	        width:600,   
	        height:500,   
	        plain:true,
	        layout : 'fit',
	        resizable:false,
	        items: [{  
	            xtype     : 'textarea',
	            id        : 'text',
	            readOnly : true,
	            grow      : false,  
	            preventScrollbars : false   // 设置多行文本框有滚动条显示
	        }],   
	        buttons:[   
	            {text:"确定",handler:function(){_window.close();}}
	        ]   
	    });   
	    _window.show(); 
	    Ext.Ajax.request({
			url : '/realware/look.do',
			method : 'POST',
			dataType: "json",
			timeout : 180000, // 设置为3分钟
			params : {
				id :records[0].get("id")
			},
			// 提交成功的回调函数
			success : function(response,options) {
				if(!Ext.isEmpty(response.responseText)) {
					Ext.getCmp("text").setValue(formatXml(response.responseText));
				}
			}		
	    })    
}

function refreshData() {
	listPanel.getStore().loadPage(1);
}
/**
 * 格式化xml
 * lfj 2016-01-21
 */
String.prototype.removeLineEnd = function() {
    return this.replace(/(<.+?\s+?)(?:\n\s*?(.+?=".*?"))/g,'$1 $2')
}
function formatXml(text) {
    // 去掉多余的空格
    text = '\n' + text.replace(/(<\w+)(\s.*?>)/g,function($0, name, props) {
        return name + ' ' + props.replace(/\s+(\w+=)/g," $1");
    }).replace(/>\s*?</g,">\n<");

    // 把注释编码
    text = text.replace(/\n/g,'\r').replace(/<!--(.+?)-->/g,function($0, text) {
        var ret = '<!--' + escape(text) + '-->';
        return ret;
    }).replace(/\r/g,'\n');

    // 调整格式
    var rgx = /\n(<(([^\?]).+?)(?:\s|\s*?>|\s*?(\/)>)(?:.*?(?:(?:(\/)>)|(?:<(\/)\2>)))?)/mg;
    var nodeStack = [];
    var output = text.replace(rgx,
    		function($0,all,name,isBegin,isCloseFull1,isCloseFull2 ,isFull1,isFull2){
        var isClosed = (isCloseFull1 == '/') || (isCloseFull2 == '/' ) 
        	|| (isFull1 == '/') || (isFull2 == '/');
        
        var prefix = '';
        if(isBegin == '!') {
            prefix = getPrefix(nodeStack.length);
        } else {
            if(isBegin != '/') {
                prefix = getPrefix(nodeStack.length);
                if(!isClosed) {
                    nodeStack.push(name);
                }
            } else {
                nodeStack.pop();
                prefix = getPrefix(nodeStack.length);
            }
        }
            var ret =  '\n' + prefix + all;
            return ret;
    });

    var prefixSpace = -1;
    var outputText = output.substring(1);

    // 把注释还原并解码，调格式
    outputText = outputText.replace(/\n/g,'\r').replace(/(\s*)<!--(.+?)-->/g,
    		function($0, prefix,  text) {
        if(prefix.charAt(0) == '\r')
            prefix = prefix.substring(1);
        text = unescape(text).replace(/\r/g,'\n');
        var ret = '\n' + prefix + '<!--' + text.replace(/^\s*/mg, prefix ) + '-->';
        return ret;
    });

    return outputText.replace(/\s+$/g,'').replace(/\r/g,'\r\n');
}
function getPrefix(prefixIndex) {
    var span = '    ';
    var output = [];
    for(var i = 0 ; i < prefixIndex; ++i) {
        output.push(span);
    }
    return output.join('');
}