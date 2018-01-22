/**
 *  主面板 panel
 */
Ext.define('pb.view.common.UserMessageList', {
	extend : 'Ext.panel.Panel',
	alias : 'widget.userMsgList',
	layout : {
		type : 'fit',
		align : 'center'
	},
	shrinkWrap : 0,
	frame : false,
	initComponent : function() {
		var buttons = Ext.StatusUtil.getAllButtons(this.config.buttonList);
		this.dockedItems = [ {
			xtype : 'buttongroup', //按钮区
			items : buttons
		}, {
			title : '查询区',
			collapsible : true,
			layout : {
				type : 'table',
				columns : 3
			},
			id :'queryPanel',
			bodyPadding : 5,
			items : [ {
				id : 'taskState',
				fieldLabel : '数据状态',
				xtype : 'combo',
				displayField : 'status_name',
				dataIndex : 'task_status',
				emptyText : '请选择',
				valueField : 'status_code',
				labelWidth : 70,
				editable : false,
				queryMode : 'local',
				style : 'margin-left:5px;margin-right:5px;'
			}, {
				id : 'txtAcctCode',
				dataIndex : 'account_code',
				fieldLabel : '单位零余额账号',
				xtype : 'textfield'
			} ]
		} ].concat(this.dockedItems);
		this.callParent(arguments);
	},
	getCols : function() {
		var cols = [ {
			xtype : 'rownumberer',
			width : 30,
			locked : true
		}, {
			text : 'sign_id',
			width : 130,
			dataIndex : 'sign_id',
			hidden : true
		}, {
			text : '单位编码',
			width : 130,
			dataIndex : 'agency_code'
		}, {
			text : '单位名称',
			width : 130,
			dataIndex : 'agency_name'
		}, {
			text : '组织机构代码',
			width : 130,
			dataIndex : 'org_code'
		}, {
			text : '单位零余额账号',
			width : 130,
			dataIndex : 'account_code'
		}, {
			text : '用户代码',
			width : 130,
			dataIndex : 'user_login_code'
		}, {
			text : '用户名称',
			width : 130,
			dataIndex : 'user_name'
		}, {
			text : '证件类型',
			width : 130,
			dataIndex : 'document_type',
			renderer : function(value) {
				if (value == 1) {
					return '身份证';
				} else if (value == 2) {
					return '士官证';
				} else {
					return '驾照';
				}
			}
		}, {
			text : '证件号码',
			width : 130,
			dataIndex : 'paper_no'
		}, {
			text : '手机号码',
			width : 130,
			dataIndex : 'phone_no'
		}, {
			text : '联系地址 ',
			width : 130,
			dataIndex : 'address'
		}, {
			text : '电子邮箱地址',
			width : 130,
			dataIndex : 'e_mail'
		}, {
			text : '备注',
			width : 130,
			dataIndex : 'remark'
		} ];
		return cols;

	}
});