/***
 * 日志查询界面布局
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.common.WorkDayPanel', {
	extend : 'Ext.panel.Panel',
	alias : 'widget.workDayPanel',
	width :'100%',
	hieght : '100%',
	layout : 'border',
	constructor : function(cfg) {
		cfg = cfg || {};
		var setYear = cfg.setYear; //当前年度
		var workDays = cfg.workDays; //按月获取工作日
		this.initUIComponent(setYear,workDays);
		this.callParent(arguments);
	},
	initUIComponent : function(setYear,workDays) {
		var me = this;
		var dateItems = [];
		for ( var i = 0; i< workDays.length; i++) {
			//获取非工作日
			var arrayDays = [];
			for ( var j = 1; j <= 31; j++) {
				if (workDays[i].get('day' + j) == 2) {
					arrayDays.push(j+'');
				}
			}
			//var value_ =  new Date();
			var month_ =  workDays[i].get('month').replace(/-/g,"/");
			var value_ = new Date(setYear,month_,0); 
//			value_.setUTCFullYear(setYear);
//			value_.setUTCMonth(workDays[i].get('month').replace(/-/g,"/")-1);
//IE不支持	var month = new Date((setYear + '-' + workDays[i].get('month')).replace(/-/g,"/"));
			var dateItem  = Ext.create('pb.view.common.DateItem',{
				width : 285,
				id : 'month-' + value_.getUTCMonth(),
				value : value_,
				showToday : false,
				noWorkDays : arrayDays,
				handler: function(picker, date) {
					var time = Ext.Date.format(date,'m-d').split('-');
					for ( var i = 0; i< me.workDays.length; i++) {
						if (time[0] ==  me.workDays[i].get('month')){
							var day = parseInt(time[1],10);
							if( me.workDays[i].get('day' + day) == 2 ){
								 me.workDays[i].set('day' + day,1); //原来是非工作日，现选中后为工作日
								for (var c = 0; c < picker.cells.elements.length; c++) {
            						var cell = Ext.fly(picker.cells.elements[c]);
									if (cell.dom.firstChild.dateValue == date.getTime()) {
										cell.removeCls(picker.selectedCls); //原来已选中，修改为不选中
                						break;
            						}
        						}
							}else{
								 me.workDays[i].set('day' + day,2);
							}
							break;
						}
					}
				}
			});
			dateItems.push(dateItem);
		}
		var yearData = [];
		var c_year = parseInt(Ext.Date.format(new Date(), 'Y'));
		//lfj 2015-07-28 显示 去年、今年、下年数据，其它年度数据配置暂无实际意义
		var i = c_year - 1;
		for (i; i < c_year + 2; i++) {
			yearData.push( {
				value : i
			});
		}
		me.items = [ {
			border : 0,
			region : 'center',
			height : '90%',
			extend : 'Ext.panel.Panel',
			autoScroll : true,
			bodyPadding : 5,
			renderTo : Ext.getBody(),
			items : [{
				border : 0,
				id : 'daypanel',
				disabled : true,
				xtype:'panel',
				layout : {
					type : 'table',
					columns : 4
				},
				items : dateItems
			}]
		}, {
			region : 'south',
			height : '10%',
			border : 0,
			html : '<div>&nbsp;&nbsp;1、全年365天，实际工作日为' + '**' 
			+ '天</br>&nbsp;&nbsp;2、选中且字体变粗的表示非工作日</div>'
		} ];
		me.dockedItems = [ {
			xtype : 'buttongroup',
			items : [ {
				id : 'edit',
				text : '编辑',
				iconCls : 'edit'
			}, {
				id : 'unedit',
				text : '取消编辑',
				iconCls : 'back',
				disabled : true
			}, {
				id : 'save',
				text : '保存',
				iconCls : 'save',
				disabled : true
			}, {
				id : 'import',
				text : '导入',
				iconCls : 'input'
			}, {
				id : 'export',
				text : '导出',
				iconCls : 'export'
			} ]
		},{
			title : '查询区',
			bodyPadding : 5,
			items : [{
				id : 'cbxYear',
				fieldLabel : '业务年度',
				xtype : 'combo',
				//lfj 2015-07-28 数据集yearData为整形时，
				//value须为整形，否则下拉无法选中
				value : c_year,
				displayField : 'value',
				valueField : 'value',
				editable : false,
				store : Ext.create('Ext.data.Store',{
					fields : [{ name : 'value'}],
					data : yearData
				})
			}]
		} ];
	}
})
