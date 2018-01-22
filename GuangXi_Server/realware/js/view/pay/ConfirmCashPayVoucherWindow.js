/***
 * 授权支付特殊指令【支取确认】窗口
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.pay.ConfirmCashPayVoucherWindow', {
	extend : 'pb.view.pay.PayVoucherPanel',
	extend : 'Ext.window.Window',
	alias : 'widget.cashpayvoucherindow',
	title : '授权支付特殊业务',
	resizable : false,
	modal : true,
	width : 510,
	layout : 'border',
	advanceConfrimButtonHidden :true, //请款确认按钮是否可见
	limitOfAmount : 0, //现金支付不需主管授权的最大金额
	bussinessType : 'PUBLIC', //特殊业务处理字段
	queryKey:'pay_voucher_code',
	queryFieldLabel:'凭证号',
	vouTypeStroe : null,
	isHiddenPwd : false, //是否隐藏支付密码与票据签发日期
	listeners:{
		beforeclose : function( panel, eOpts ){
			var mee = pb.app.getController('pay.ConfirmCashVouchers');
			mee.vouDTO = null;
		}
	},
	initComponent : function() {
		var me = this;
		Ext.applyIf(me, {
			items : [ {
				region : 'north',
				bodyPadding : 3,
				xtype : 'form',
				border : false,
				defaults : {
					labelWidth : 60,
					width : 220,
					labelAlign : 'right',
					padding : '2 2 2 2'
				},
				layout : {
					type : 'table',
					columns : 2
				},
				items : [ {
					name : 'billNo',
					attr_code:me.queryKey,
					fieldLabel : me.queryFieldLabel,
					xtype : 'textfield',
					allowBlank : false,
					blankText : "凭证号为必输项"
				},{
					name : 'oriPayAmt',
					labelWidth : 70,
					fieldLabel : '原支票金额',
					xtype : 'numberfield',
					allowBlank : false,
					blankText : "原支票金额为必输项",
					allowNegative : false, //不能为负数  
					decimalPrecision : 2 //小数精确位数
				}, {
					name : 'inCategor',
					fieldLabel : '指令类别',
					xtype : 'combo',
					dataIndex : 'value',
					displayField : 'name',
					valueField : 'value',
					editable : false,
					enable : true,
					readOnly : true,
					store : Ext.create('Ext.data.Store', {
						fields : [ 'name', 'value' ],
						data : [ {
							"name" : "现金",
							"value" : "1"
						}, {
							"name" : "现金限额",
							"value" : "2"
						}, {
							"name" : "(收款人为空)转账",
							"value" : "3"
						}, {
							"name" : "(限额)转账",
							"value" : "4"
						} ]
					})
				}, {
					id : 'queryButton',
					text : '查询',
					xtype : 'button',
					width : 80,
					margin : '-5 0 0 100',
					handler: function() {
						me.fireEvent('queryButtonclick', this.ownerCt);	
					}
				} ]
			}, {
				region : 'north',
				bodyPadding : 3,
				title : '票据信息',
				hidden : ((me.bussinessType =='Password' 
					|| me.bussinessType =='Fingerprint' ) ? false : true),
				xtype : 'form',
				defaults : {
					labelWidth : 60,
					width : 220,
					labelAlign : 'right',
					padding : '2 2 2 2'
				},
				layout : {
					type : 'table',
					columns : 2
				},
				items : [ {
					fieldLabel : '凭证批次',
					name : 'vou_batchno',
					xtype: 'textfield',
					minLength : 2,
					maxLength : 2,
					readOnly : false
				},{
          			fieldLabel : '凭证类型',
          			name : 'vou_type',
          			xtype : 'combo',
          			emptyText : '请选择',
          			displayField : 'name',
					valueField : 'value',
					editable : false,
					readOnly : false,
					store : me.vouTypeStroe,
					value : (me.vouTypeStroe && me.vouTypeStroe.data.length > 0)
							? me.vouTypeStroe
							.getAt(0)
							.get("name")
							: ""
				}, {
					fieldLabel : '支票号',
					name : 'vou_seqno',
					xtype: 'textfield',
					maxLength : 20
				},{
					fieldLabel : '省市代码',
					xtype: 'textfield',
					name : 'city_code',
					regex : /\d{2}/,
					regexText:'必须是数字且长度是2位'
				},{
					fieldLabel : '支付密码',
					name : 'vou_paypwd',
					xtype: 'textfield',
					maxLength : 16,
					hidden : me.isHiddenPwd
				},{
					fieldLabel : '签发日期',
                    xtype : 'datefield',
                    name : 'billissuedate',
                    format : 'Ymd',
					maxLength : 8,
					hidden : me.isHiddenPwd
				}]
			}, {
				region : 'west',
				title : "原支票信息",
				bodyPadding : 5,
				xtype : 'form',
				defaults : {
					labelWidth : 70,
					width : 230,
					readOnly :true,
					xtype : 'textfield'
				},
				items : [ {
					name : 'agency',
					fieldLabel : '预算单位'
				}, {
					name : 'exp_func',
					fieldLabel : '功能分类'
				}, {
					fieldLabel : '经济分类',
					name : 'exp_eco'
				}, {
					fieldLabel : '收款人全称',
					name : 'payee_account_name'
				}, {
					fieldLabel : '收款人账号',
					name : 'payee_account_no'
				}, {
					fieldLabel : '收款人银行',
					name : 'payee_account_bank'
				}, {
					fieldLabel : '金额',
					name : 'pay_amount',
					xtype: 'numberfield',
					allowNegative: false,    //不能为负数  
          			decimalPrecision: 2  //小数精确位数
          		} ]
			}, {
				region : 'center',
				title : "实际支付情况",
				bodyPadding : 5,
				xtype : 'form',
				defaults : {
					labelWidth : 70,
					width : 230
				},
				defaultType : 'textfield',
				items : [ {
					name : 'payeeAcctname',
					fieldLabel : '收款人全称'
				}, {
					name : 'payeeAcctno',
					fieldLabel : '收款人账号'
				}, {
					name : 'payeeBankname',
					fieldLabel : '收款人银行'
				}, {
					name : 'payeeBankno',
					fieldLabel : '联行行号',
					regex : /\d{0,12}/,
					regexText:'必须为数字且长度不超过12位'
				}, {
					fieldLabel : '金额',
					id : 'Amt',//便于取值Ext.getCmp()
					name : 'Amt',
					xtype: 'numberfield',
					minValue : 0,
					negativeText : '不能为负数',
					allowNegative: false,    //不能为负数  
          			decimalPrecision: 2    //小数精确位数
				}]
			}, {
				region : 'south',
				border : false,
				xtype : 'buttongroup',
				align : 'right',
				fbar : [ {
					id : 'back',
					text : '作废退回',
					scale : 'small'
				}, {
					id :'advanceConfrim',
					text : '请款确认',
					scale : 'small',
					hidden : this.advanceConfrimButtonHidden
				}, {
					id : 'payConfrim',
					text : '支付确认',
					scale : 'small',
					hidden : ((me.bussinessType =='Password' || me.bussinessType =='Fingerprint' ) ? true : false)
				}, {
					id : 'payConfrimABC',
					text : '支付确认',
					scale : 'small',
					hidden : ((me.bussinessType =='Password' || me.bussinessType =='Fingerprint' ) ? false : true)
				},{
					id : 'rengongCfrim',
					text : '人工确认支付',
					scale : 'small',
					hidden : ((me.bussinessType =='Password' || me.bussinessType =='Fingerprint' ) ? true : false)
				}, {
					text : '取消',
					scale : 'small',
					handler : function() {
						me.close();
					}
				} ]
			} ]
		});
		me.addEvents('queryButtonclick');
		this.callParent(arguments);
	},
	/***
	 * 赋值
	 * @param {Object} dto
	 * @memberOf {TypeName} 
	 * @return {TypeName} 
	 */
	setValue : function(dto) {
		//获取所有表单
		var forms = Ext.ComponentQuery.query('form',this);
		//指令类别
		var cbxInCate = forms[0].getForm().findField('inCategor');
		//补录信息
		var form1 = forms[1].getForm();
		//原支付信息
		var form2 = forms[2].getForm();
		//实际支付情况表单
		var form3 = forms[3].getForm();
		//清空，除了凭证号和金额
		if (dto == undefined) {
			for ( var i = 0; i < forms.length; i++) {
				var form = forms[i].getForm();
				form.getFields().each(function(key) {
					if (key.name != 'billNo' && key.name != 'oriPayAmt') {
						form.findField(key.name).setValue(null);
					}
				});
			}
			return;
		 //第一种情况：结算方式=现金支票 且 支付类型=1正常支付	
		}else if((dto.set_mode_name.indexOf('现金') != -1 || dto.set_mode_name.indexOf('现付') != -1) 
				&& parseInt(dto.pay_mgr_code) == 1){//重庆这边现金叫现付，001是正常支付
			form3.findField('payeeAcctname').setDisabled(false);
			form3.findField('payeeAcctno').setDisabled(false);
			form3.findField('payeeBankname').setDisabled(false);
			form3.findField('payeeBankno').setDisabled(false)
			form3.findField('Amt').setDisabled(true);
			cbxInCate.setValue('1');
		 //第二种情况：结算方式=现金支票 且 支付类型=2限额支票
		}else if((dto.set_mode_name.indexOf('现金') != -1 || dto.set_mode_name.indexOf('现付') != -1)
				&& parseInt(dto.pay_mgr_code) == 2){////重庆这边现金叫现付，002是限额支票
			form3.findField('payeeAcctname').setDisabled(false);
			form3.findField('payeeAcctno').setDisabled(false);
			form3.findField('payeeBankname').setDisabled(false);
			form3.findField('payeeBankno').setDisabled(false)
			form3.findField('Amt').setDisabled(false);
			cbxInCate.setValue('2');
		}
		//第三种情况：结算方式<>现金 且 支付类型=2限额支票
		else if((dto.set_mode_name.indexOf('现金') == -1 && dto.set_mode_name.indexOf('现付') == -1)
				&& parseInt(dto.pay_mgr_code) == 2){
			var fields = form3.getFields();
			fields.each(function(key){
				form3.findField(key.name).setDisabled(false);
			});
			cbxInCate.setValue('4');
		}else{
			dto = undefined;
			Ext.Msg.alert("系统提示", "当前查询到的数据不属于授权支付特殊业务！");
			return;
		}
		//赋值
		form2.findField('agency').setValue(dto.agency_code + dto.agency_name);
		form2.findField('exp_func').setValue(dto.exp_func_code + dto.exp_func_name);
		form2.findField('exp_eco').setValue(dto.exp_eco_code + dto.exp_eco_name);
		form2.findField('payee_account_name').setValue(dto.payee_account_name);
		form2.findField('payee_account_no').setValue(dto.payee_account_no);
		form2.findField('payee_account_bank').setValue(dto.payee_account_bank);
		form2.findField('pay_amount').setValue(dto.pay_amount);
	},
	/***
	 * 校验
	 */
	isValid : function(){
		//获取所有表单
		var forms = Ext.ComponentQuery.query('form',this);
		//指令类别
		var cbxInCate = forms[0].getForm().findField('inCategor').getValue();
		//原金额
		var oriPayAmt = forms[0].getForm().findField('oriPayAmt');
		//原支票信息
		var pay_amount = forms[2].getForm().findField('pay_amount');
		//实际支付金额
		var amt = forms[3].getForm().findField('Amt');
		//收款人帐号
		var payeeAcctno = forms[3].getForm().findField('payeeAcctno');
		if(!/^\d*$/.test(payeeAcctno.getValue())){
			Ext.Msg.alert("系统提示", "收款人账号只能为数字");
			return false;
		}
		//收款行号
		var payeeBankno = forms[3].getForm().findField('payeeBankno');
		if(!Ext.isEmpty(payeeBankno.getValue())) {
			if(!/^\d{0,12}$/.test(payeeBankno.getValue())){
				Ext.Msg.alert("系统提示", "联行行号必须为数字且长度不超过12位");
				return false;
			}
		}
		if(cbxInCate == '1'){
			amt.setValue(pay_amount.getValue());
		} else if (pay_amount.getValue() < amt.getValue() 
				|| amt.getValue() == 0 || amt.getValue() == null 
				|| amt.getValue() < 0) {
				Ext.Msg.alert("系统提示", "金额不能大于原始金额且不能小于等于0");
				return false;
		}
		if(cbxInCate == '3' || cbxInCate == '4'){
			var payeeAcctname = forms[3].getForm().findField('payeeAcctname').getValue();
			var payeeAcctno =  forms[3].getForm().findField('payeeAcctno').getValue();
			var payeeBankname = forms[3].getForm().findField('payeeBankname').getValue();
			var payeeBankno =   forms[3].getForm().findField('payeeBankno').getValue();
			if (Ext.isEmpty(payeeAcctname) || Ext.isEmpty(payeeAcctno)
							|| Ext.isEmpty(payeeBankname)
							|| Ext.isEmpty(payeeBankno)) {
					Ext.Msg.alert("系统提示", "请补录收款行信息！");
					return false;
			}
		}
		return true;
	}
});
