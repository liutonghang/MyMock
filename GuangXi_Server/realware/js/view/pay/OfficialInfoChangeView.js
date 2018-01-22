/*******************************************************************************
 * 工资信息核实核查查询区配置
 * 
 */
Ext.define('pb.view.pay.OfficialInfoChangeView', {
			extend : 'Ext.panel.Panel',
			alias : 'widget.officialInfoChangeView',
			title : '查询区',
			layout : {
				type : 'table',
				columns : 4
			},
			defaults : {
				margin : "0 5 0 5",
				labelWidth : 60
			},
			bodyPadding : 5,
			items : [{
						id : 'taskState',
						fieldLabel : '凭证状态',
						xtype : 'combo',
						displayField : 'status_name',
						emptyText : '请选择',
						dataIndex : 'task_status',
						valueField : 'status_code',
						editable : false,
						queryMode : 'local'
					}, {
						id : 'admdivCode',
						fieldLabel : '所属财政',
						xtype : 'combo',
						dataIndex : 'admdiv_code',
						displayField : 'admdiv_name',
						emptyText : '请选择',
						valueField : 'admdiv_code',
						editable : false,
						store : comboAdmdiv
					}, {
						id : 'agency_code',
						fieldLabel : '单位编码',
						xtype : 'textfield',
						symbol : '=',
						dataIndex : 'agency_code'
					},  {
						id : 'card_holder_no',
						fieldLabel : '身份证号码',
						xtype : 'textfield',
						symbol : '=',
						labelWidth : 80,
						dataIndex : 'card_holder_no'
					}]
		});