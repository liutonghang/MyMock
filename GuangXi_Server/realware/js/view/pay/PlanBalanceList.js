/***
 * 额度查询
 */
var comboFundType = Ext.create('Ext.data.Store', {
			fields : ['code', 'name'],
			proxy : {					
					type : 'ajax',
					url : '/realware/loadElementValue.do',
					reader : {
						type : 'json'
					}
				},
			autoload : false,
			listeners:{  
            	single: true
         }  
		});
Ext .define( 'pb.view.pay.PlanBalanceList', {
					extend : 'Ext.grid.Panel',
					alias : 'widget.planbalancelist',
					layout : 'fit',
					store : 'pay.PlanBalances',
					frame : false,
					columns : [ {
						xtype : 'rownumberer',
						width : 30,
						locked : true
					},{
						text : '预算单位名称',
						dataIndex : 'agency_name',
						width : 100
					},{
						text : '预算单位编码',
						dataIndex : 'agency_code',
						width : 100
					},{
						text : '功能科目名称',
						dataIndex : 'exp_func_name',
						width : 100
					},{
						text : '功能科目编码',
						dataIndex : 'exp_func_code',
						width : 100
					},{
						text : '资金性质名称',
						dataIndex : 'fund_type_name',
						width : 100
					},{
						text : '资金性质编码',
						dataIndex : 'fund_type_code',
						width : 100
					}/*,{
						text : '支付方式',
						dataIndex : 'pay_type_name',
						width : 100
					},{
						text : '支付方式编码',
						dataIndex : 'pay_type_code',
						width : 100
					}*/,{
						text : '年度',
						dataIndex : 'year',
						width : 100
					},{
						text : '可用额度',
						dataIndex : 'balance_amount',
						width : 100
					},{
						text : '支付金额',
						dataIndex : 'add_pay_amount',
						width : 100
					},{
						text : '全年计划总额',
						dataIndex : 'plan_amount',
						width : 100
					},{
						text : '一月份额度',
						dataIndex : 'plan_month1_amount',
						width : 100
					},{
						text : '二月份额度',
						dataIndex : 'plan_month2_amount',
						width : 100
					},{
						text : '三月份额度',
						dataIndex : 'plan_month3_amount',
						width : 100
					},{
						text : '四月份额度',
						dataIndex : 'plan_month4_amount',
						width : 100
					},{
						text : '五月份额度',
						dataIndex : 'plan_month5_amount',
						width : 100
					},{
						text : '六月份额度',
						dataIndex : 'plan_month6_amount',
						width : 100
					},{
						text : '七月份额度',
						dataIndex : 'plan_month7_amount',
						width : 100
					},{
						text : '八月份额度',
						dataIndex : 'plan_month8_amount',
						width : 100
					},{
						text : '九月份额度',
						dataIndex : 'plan_month9_amount',
						width : 100
					},{
						text : '十月份额度',
						dataIndex : 'plan_month10_amount',
						width : 100
					},{
						text : '十一月份额度',
						dataIndex : 'plan_month11_amount',
						width : 100
					},{
						text : '十二月份额度',
						dataIndex : 'plan_month12_amount',
						width : 100
					},{
						id:'admdiv_code',
						text : '行政区划',
						dataIndex : 'admdiv_code',
						width : 100
					}],
					
					selModel : Ext.create('Ext.selection.CheckboxModel',{  
						checkOnly :true 
					}), 
					features : [ {
						ftype : 'summary'
					} ],
					plugins : [ Ext.create('Ext.grid.plugin.CellEditing', {
						clicksToEdit : 1
					}) ],
					
					bbar : {
						xtype : 'pagingtoolbar',
						store : 'pay.PlanBalances',
						displayInfo : true,
						displayMsg : '显示第{0}条到{1}条记录 ，一共{2}条',
						emptyMsg : "没有记录",
						dock : 'bottom'
					},
					initComponent : function() {
						comboFundType.load({
											params : {
												admdiv_code : comboAdmdiv.data.getAt(0).get('admdiv_code'),
												ele_code : 'FUND_TYPE'
											}
								});
						var buttons = Ext.StatusUtil.getAllButtons(this.config.buttonList);
						this.dockedItems = [ {
									xtype : 'buttongroup', //按钮区
									items : buttons
								}, {
									id : 'queryPanel',
									title : '查询区',
									collapsible : true,
									layout : {
										type : 'table',
										columns : 4
									},
									bodyPadding : 5,
									items : [ {
												id : 'admdivCode',
												fieldLabel : '所属财政',
												xtype : 'combo',
												dataIndex : 'admdiv_code',
												displayField : 'admdiv_name',
												emptyText : '请选择',
												valueField : 'admdiv_code',
												operation:'and',
												editable : false,
												store : comboAdmdiv,
												value : comboAdmdiv.data.getAt(0).get('admdiv_code'),
												style : 'margin-left:5px;margin-right:5px;'
											},{
												fieldLabel : '预算单位编码',
												xtype : 'textfield',
												dataIndex : 'agency_code',
												symbol : '=',
												editable : false,
												style : 'margin-left:5px;margin-right:5px;'
											},{
												fieldLabel : '预算单位名称',
												xtype : 'textfield',
												dataIndex : 'agency_name',
												symbol : '=',
												editable : false,
												style : 'margin-left:5px;margin-right:5px;'
											},/*{	
												fieldLabel : '功能科目编码',
												xtype : 'textfield',
												dataIndex : 'exp_func_code',
												symbol : '=',
												editable : false,
												style : 'margin-left:5px;margin-right:5px;'
											},*/{
												fieldLabel : '资金性质',
												xtype : 'combo',
												dataIndex:'fund_type_code',
												displayField: 'name',
												emptyText: '请选择',
												valueField: 'code',
												editable :false,
												symbol : '=',
												queryMode : 'local',
												editable : false,
												store : comboFundType,
												style : 'margin-left:5px;margin-right:5px;',
												listeners: {
									                specialkey: function(field, e){
									                    if (e.getKey() == e.BACKSPACE
									                    		|| e.getKey() == e.DELETE) {
									                    	this.setValue("");
									                    	e.preventDefault();
									                    	e.stopPropagation();
									                    	return false;
									                    }
									                }
									            }
											}/*,{
												xtype : 'textfield',
												dataIndex:'pay_type_code',
												value:'2',
												hidden:true
											}*/]
								} ];
						this.callParent(arguments);
					}
				});