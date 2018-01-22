/***
 * 批量直接支付业务凭证列表视图
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.pay.PLBatchPayVoucherTransferList', {
	extend : 'pb.view.pay.PayVoucherPanel',
	alias : 'widget.PLbatchPayVoucherTransferList', //别名
	layout : 'border',
	frame : false,
	items : [ {
		region : 'north',
		layout : 'fit',
		id : 'batchVoucherPanel',
		height : 250,
		xtype : 'batchPayPanel',
		frame : false,
		title : '批量直接支付凭证列表'
	}, {
		region : 'center',
		id : 'batchRequestPanel',
		frame : false,
		xtype : 'gridpanel',
		title : '<div style="margin-top:-2px;">' +
			'<span style="float:left;line-height:20px;">' +
			'明细列表&nbsp;&nbsp;</span><span id="cmb_status" ' +
			'style="float:left;"></span></span><span id="is_same_bank" ' +
			'style="float:left;"></span></div>',
		enableColumnHide : false,
		enableColumnMove : false,
		collapsible : true,
		collapseDirection : 'bottom',
		columns : [
			{
				text : '行号补录',
				id:'add',
				dataIndex : 'addbankno',
				tdCls : 'addbankno',
				width : 60,
				listeners : {
						click : function(grid, cell, rowIndex, colIndex, e, record, rowEl) {
							var bankWin = this.bankWin;
							var payVoucherId = grid.getRecord(rowIndex).get('batchpay_voucher_id');
							var payeeAccountNo = grid.getRecord(rowIndex).get('payee_account_no');
							var oriBankName = grid.getRecord(rowIndex).get('payee_account_bank');
							if(!bankWin){
								bankWin = Ext.create('pb.view.pay.BankNoWindow',{
										banknoStore : Ext.create('pb.store.pay.PayeeBankNos'),
										bankSetModeStore : Ext.create('pb.store.pay.BankSetMode'),
										bankBizTypes : Ext.create('pb.store.pay.BankBizTypes')
								});
							}
							//补录行号确定按钮触发
							bankWin.on('bankNoclick', function(_grid){
								var rs = _grid.getSelectionModel().getSelection();
								if (rs.length == 0){
									return;
								}
								var bankSetMode = bankWin.getForm().findField('banksetMode');
								var bankBizTypes = bankWin.getForm().findField('bankbizType');
								bankWin.curRow.set({
										 'payee_account_bank_no' : rs[0].get('bank_no'), 
										 'add_word' : bankWin.getForm().findField('bankRemarkFieldLable').getValue(),
										 'bankbusinesstype' : bankBizTypes.getValue(),
										 'pb_set_mode_name' : bankSetMode.rawValue, 
										 'pb_set_mode_code' : bankSetMode.getValue()
										});
								var params={
									payee_account_bank_no : rs[0].get('bank_no'),
									payee_account_bank : rs[0].get('bank_name'),
									pay_voucher_id : payVoucherId,
									payee_account_no : payeeAccountNo,
									ori_pay_bank_name : oriBankName,
									set_mode_name : grid.getRecord(rowIndex).get('pb_set_mode_name'),
									set_mode_code : grid.getRecord(rowIndex).get('pb_set_mode_code'),
									mode : '批量发放'
								};
								Ext.PageUtil.doRequestAjax({grid : grid},'/realware/updatePayRequestBankNo.do', params);
								bankWin.hide();
							});
							bankWin.curRow = record;
							bankWin.payeeAccountNo = bankWin.curRow.get('payee_account_no');
							//判断银行业务类型、查询记录如果没做操作默认选中第一个选项
							var tempBankType = bankWin.curRow.get('bankbusinesstype');
							var form = bankWin.getForm();
							var field = form.findField('bankbizType');
							if (tempBankType == null || tempBankType == '') {
								field.setValue('0');
							} else {
								field.setValue(tempBankType);
							}
							//判断结算方式、查询记录如果没做操作默认选中第一个选项
							var tempModeCode = bankWin.curRow.get('pb_set_mode_code');
							var form = bankWin.getForm();
							var field = form.findField('banksetMode');
							if (tempModeCode == null || tempModeCode == '') {
								field.setValue('1');
							} else {
								field.setValue(tempModeCode);
							}
							form.findField('ori_bankname').setValue(bankWin.curRow.get('payee_account_bank'));
							form.findField('bankRemarkFieldLable').setValue(bankWin.curRow.get('bankRemarkFieldLable'));
							var button = Ext.ComponentQuery.query('button[text="查询"]', bankWin)[0];
							bankWin.show();
							//此处使用handler.call，否则由于scope的不同，无法触发“查询”的handler事件，如fireEvent
							button.handler.call(button);
						}
				}
				
			},{
			text : '收款人行号',
			dataIndex : 'payee_account_bank_no',
			align : 'center',
			width : 150
		}, {
			text : '收款人账号',
			dataIndex : 'payee_account_no',
			align : 'center',
			width : 150
		}, {
			text : '银行结算方式名称',
			dataIndex : 'pb_set_mode_name',
			align : 'center',
			width : 150
		}, {
			text : '收款人名称',
			dataIndex : 'payee_account_name',
			align : 'center',
			width : 150
		}, {
			text : '收款人银行',
			dataIndex : 'payee_account_bank',
			align : 'center',
			width : 150
		},{
			text : '同行标识',
			dataIndex : 'is_same_bank',
			align : 'center',
			width : 80,
			renderer : function(value) {
				if (value == 1 ) {
					value = "同行";
				} else if (value == 0) {
					value = "跨行";
				}else{
					value = "全部";
				}
				return value;
			},
			filter: {
                type: 'list',
                store: Ext.create('Ext.data.Store', {
	                fields: ['name', 'status'], 
	                data: [{
	                    name : '同行', 
	                    status: '1'
	                },{
	                    name : '跨行', 
	                    status: '0'
	                }]
	            })
            }
		},{
			text : '金额',
			dataIndex : 'ori_pay_amount',
			xtype : 'numbercolumn',
			format : '0,0.00',
			align : 'right',
			width : 100,
			summaryType : 'sum',
			summaryRenderer : function(value, summaryData, dataIndex) {
				return value=='0.00'?'': '小计:' + Ext.util.Format.number(value,'0,0.00');
			}
		},{
			text : '支付状态',
			dataIndex : 'trans_succ_flag',
			width : 100,
			align : 'center',
			renderer : function(value) {
				if (!value && value !== 0) {
					value = "";
				} else if (value === -1) {
					value = "已退款";
				} else {
					value = ['未交易', '交易成功', '交易失败', '未确认'][value];
				}
				return value;
			},
			filter: {
                type: 'list',
                store: Ext.create('Ext.data.Store', {
	                fields: ['name', 'status'], 
	                data: [{
	                    name : '全部', 
	                    status: ''
	                },{
	                    name : '未交易', 
	                    status: '0'
	                }, {
	                    name: '交易成功', 
	                    status: '1'
	                }, {
	                    name: '交易失败', 
	                    status: '2'
	                }, {
	                    name: '未确认', 
	                    status: '3'
	                }, {
	                    name: '已退款', 
	                    status: '-1'
	                }]
	            })
            }
		},{
			text : '失败原因',
			dataIndex : 'trans_res_msg',
			align : 'center',
			width : 160
		}],
		selModel : Ext.create('Ext.selection.CheckboxModel',{  //多选
			checkOnly :true
		}),
		store : 'pay.PLBatchPayVoucherRequests',
		cmb_status : null,
		is_same_bank : null,
		cmbStatusValue : "",
		isSameBankValue : "",
	    onStatusComboChange: function(combo, records, opts) {
			this.store.clearFilter();
			if(combo.renderTo == 'cmb_status'){
				this.cmbStatusValue = records;
				this.store.filter('trans_succ_flag', this.cmbStatusValue);
				this.store.filter('is_same_bank', this.isSameBankValue);
			}else if(combo.renderTo == 'is_same_bank'){
				this.isSameBankValue = records;
				this.store.filter('trans_succ_flag', this.cmbStatusValue);
				this.store.filter('is_same_bank', this.isSameBankValue);
			}
	    },
	    bbar : {
	    	xtype : 'PageListToolbar',
			store : 'pay.PLBatchPayVoucherRequests',
			frame : false,
			resizable : false,
			shrinkWrap : 1,
			pageSize : 25,
			displayInfo : true,
			displayMsg : '显示第{0}条到{1}条记录 ，一共{2}条',
			emptyMsg : "没有记录",
			dock : 'bottom',
			pageList : [25, 50, 100]
		},
	    listeners : {
	    	expand : function (panel) {
	    		Ext.getCmp('batchVoucherPanel').setHeight(250);
	    	},
	    	collapse : function (panel) {
	    		Ext.getCmp('batchVoucherPanel').setHeight(390);
	    	},
            afterrender : function (panel) {
            	//支付状态下拉框
                this.cmb_status = Ext.widget('combobox',{
                	renderTo : "cmb_status",
                	editable : false,
                	cls : 'float:left',
    	            queryMode : 'local',
    	            displayField : 'name', 
    	            valueField : 'status', 
    	            value : '',
    	            store: Ext.create('Ext.data.Store', {
    	                fields: ['name', 'status'], 
    	                data: [{
    	                    name : '全部', 
    	                    status: ''
    	                },{
    	                    name : '未交易', 
    	                    status: '0'
    	                }, {
    	                    name: '交易成功', 
    	                    status: '1'
    	                }, {
    	                    name: '交易失败', 
    	                    status: '2'
    	                }, {
    	                    name: '未确认', 
    	                    status: '3'
    	                }, {
    	                    name: '已退款', 
    	                    status: '-1'
    	                }]
    	            }),
    	            listeners:{
    	                scope: this, 
    	                'change' : this.onStatusComboChange
    	           }
    	        });
                this.is_same_bank = Ext.widget('combobox',{
                	renderTo : "is_same_bank",
                	editable : false,
                	cls : 'float:left',
    	            queryMode : 'local',
    	            displayField : 'name', 
    	            valueField : 'status', 
    	            value : '',
    	            store: Ext.create('Ext.data.Store', {
    	                fields: ['name', 'status'], 
    	                data: [{
    	                	name : '全部', 
    	                    status: ''
    	                },{
    	                    name : '跨行', 
    	                    status: '0'
    	                },{
    	                	name : '同行', 
    	                    status: '1'
    	                }]
    	            }),
    	            listeners:{
    	                scope: this, 
    	                'change' : this.onStatusComboChange
    	           }
    	        });
            }, 
            beforerender : function (panel) {
            	//store加载前清空支付状态
                this.store.addListener("beforeload", function(store) {
                	panel.cmb_status.setValue("");
                	var vouRecord = Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()).getSelectionModel().getSelection();
        			if(!vouRecord || vouRecord.length < 1) {
        				this.removeAll();
        				return false;
        			}
                });
            }
        }
	} ],
	
	initComponent : function() {
		this.dockedItems = [{
				xtype : 'batchPayVoucherQuery' //查询区
			} ];
		this.callParent(arguments);
	}
});
