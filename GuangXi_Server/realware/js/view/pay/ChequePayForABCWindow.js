/***
 * 农行支票支付window
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.pay.ChequePayForABCWindow', {
	extend : 'Ext.window.Window',
	alias : 'widget.ChequePayForABCWindow', //别名
	layout : 'border',
	modal : true,
	width : 510,
	height : 380,
	title : '支票信息核对',
	Records : null,
	resizable : false, // 不可调整大小
	draggable : false, // 不可拖拽
	closeAction : 'hide',
	/**
	 * 赋值
	 */
	setValue : function(records) {
		this.Records = records;
		var selectVoucher = this.Records[0];		
        var agencyCode1 =selectVoucher.get("agency_code");
        var payeeAcctno1 = selectVoucher.get("payee_account_no");
        var payeeBankno1 = selectVoucher.get("payee_account_bank_no");
        var payBankno1 = selectVoucher.get("pay_account_no");
        var isReturn = false;
        var inputAmount = 0;//用来计算选择凭证的总金额
        //信息校验
        var vouchers =[];
        Ext.Array.each(this.Records, function(model) {
            if(agencyCode1!=model.get("agency_code")||payeeAcctno1!=model.get("payee_account_no")||payeeBankno1!=model.get("payee_account_bank_no")||payBankno1!=model.get("pay_account_no")){
                isReturn =true;
                return false;
            }
            inputAmount+=model.get("pay_amount");
            vouchers.push(model.get("pay_voucher_code"));
        });
        if(isReturn){
            Ext.Msg.alert("系统提示", "选中的凭证中信息不一致，请检查！");
            return false;
        }
		//初始化值
        Ext.getCmp("vochSeqNo").setValue(null).clearInvalid( );
        Ext.getCmp("sumAmount").setValue(null).clearInvalid( );
        Ext.getCmp("vochBatchNo").setValue(null).clearInvalid( );
        Ext.getCmp("payPwd").setValue(null).clearInvalid();
        Ext.getCmp("isCheckPayPwd").setValue(false);
        //赋值
        Ext.getCmp("agencyName").setValue( selectVoucher.get("agency_name"));
        Ext.getCmp("agencyCode").setValue( selectVoucher.get("agency_code"));
        Ext.getCmp("payeeAcctName").setValue( selectVoucher.get("payee_account_name"));
        Ext.getCmp("payeeAcctNo").setValue( selectVoucher.get("payee_account_no"));
        Ext.getCmp("payeeBankName").setValue( selectVoucher.get("payee_account_bank"));
        Ext.getCmp("payeeBankNo").setValue( selectVoucher.get("payee_account_bank_no"));
        Ext.getCmp("voucherNos").setValue( vouchers.sort());
        Ext.getCmp("sumCount").setValue(this.Records.length);
        Ext.getCmp("billIssueDate").setValue( selectVoucher.get("vou_date"));
        return true;
	},
	isValid : function(){
		 var vochtype = Ext.getCmp("vochType").getValue();
         var vochprovno = Ext.getCmp("vochProvNo").getValue();
         var vochbatchno = Ext.getCmp("vochBatchNo").getValue();
         var vochseqno = Ext.getCmp("vochSeqNo").getValue();
         var sumAmount = Ext.getCmp("sumAmount").getValue();
         var sumCount = Ext.getCmp("sumCount").getValue();
         var paypwd = null;
         var billissuedate =null;
         if(Ext.isEmpty(vochtype)||Ext.isEmpty(vochprovno)||Ext.isEmpty(vochbatchno)||Ext.isEmpty(vochseqno)||Ext.isEmpty(sumCount)||Ext.isEmpty(sumAmount)){
        	 Ext.Msg.alert("系统提示","请填写补录信息!!");
             return false;
         }
         //票据支付密码信息
         if(Ext.getCmp("isCheckPayPwd").getValue()){
            var paypwd = Ext.getCmp("payPwd").getValue();
            var billissuedate = Ext.PageUtil.Todate(Ext.getCmp("billIssueDate").getValue(),'Ymd');//日期格式转换;
            if((paypwd==''||paypwd==null)||(billissuedate==''||billissuedate==null)){
                Ext.Msg.alert("系统提示","请填写支付密码信息！");
                return;
            }
         }
         var reqIds = [];
         var reqVers = [];
         var inputAmount = 0.0;//用来计算选择凭证的总金额
         var size = this.Records.length;
         //信息校验
         Ext.Array.each(this.Records, function(model) {
             inputAmount+=model.get("pay_amount");
             reqIds.push(model.get("pay_voucher_id"));
             reqVers.push(model.get("last_ver"));
         });
         inputAmount = inputAmount.toFixed(2);
         if(inputAmount!=sumAmount){
             Ext.Msg.alert("系统提示","填写总金额与选择凭证金额不一致！");
             return false;
         }else if(size!=sumCount){
             Ext.Msg.alert("系统提示","填写凭证个数与选择凭证个数不一致！");
             return false;
         }
         
         var params = {
                 // 单据类型id
                 billTypeId : this.Records[0].get("bill_type_id"),
                 billIds : Ext.encode(reqIds),
                 last_vers : Ext.encode(reqVers),
                 vochtype:vochtype,
                 vochprovno:vochprovno,
                 vochbatchno:vochbatchno,
                 vochseqno:vochseqno,
                 sumAmount:sumAmount,
                 paypwd:paypwd,
                 billissuedate:billissuedate,
                 menu_id : Ext.PageUtil.getMenuId(),
                 sumCount:sumCount,
                 inputAmount : inputAmount,
                 enable : true
           };
         return params;
	},
	initComponent : function() {
		
		/***
         * 实际支付情况panel
         * @return {TypeName}
         */
        var verifyCenterPanel = Ext.create('Ext.panel.Panel', {
            width : 250,
            height : 140,
            region : 'north',
            title : "支票信息",
            items : [{
                layout : 'hbox',
                defaults : {
                    margins : '5 5 0 0'
                },
                border : 0,
                items : [{
                    id : 'agencyName',
                    fieldLabel : '&nbsp;预算单位名称',
                    name : 'agencyName',
                    xtype : 'textfield',
                    labelWidth : 80,
                    readOnly :true,
                    width : 250
                }, {
                    id : 'agencyCode',
                    fieldLabel : '&nbsp;预算单位编码',
                    name : 'agencyCode',
                    xtype : 'textfield',
                    labelWidth : 80,
                    readOnly :true,
                    width : 230
                }]
            },{
                layout : 'hbox',
                defaults : {
                    margins : '5 5 0 0'
                },
                border : 0,
                items : [{
                    id : 'payeeAcctName',
                    fieldLabel : '&nbsp;收款人全称',
                    name : 'payeeAcctname',
                    xtype : 'textfield',
                    labelWidth : 70,
                    readOnly :true,
                    width : 250
                }, {
                    id : 'payeeAcctNo',
                    fieldLabel : '&nbsp;收款人账号',
                    name : 'payeeAcctno',
                    xtype : 'textfield',
                    labelWidth : 70,
                    readOnly :true,
                    width : 230
                }]
            },{
                layout : 'hbox',
                defaults : {
                    margins : '5 5 0 0'
                },
                border : 0,
                items : [{
                    id : 'payeeBankName',
                    fieldLabel : '&nbsp;收款人银行',
                    name : 'payeeBankname',
                    labelWidth : 70,
                    xtype : 'textfield',
                    readOnly :true,
                    width : 250
                }, {
                    id : 'payeeBankNo',
                    fieldLabel : '&nbsp;联行行号',
                    name : 'payeeBankno',
                    xtype : 'textfield',
                    labelWidth : 70,
                    readOnly :true,
                    width : 230
                }]
            },{
                layout : 'hbox',
                defaults : {
                    margins : '5 5 0 0'
                },
                border : 0,
                items : [{
                    id : 'voucherNos',
                    fieldLabel : '&nbsp;凭证号',
                    name : 'payeeBankname',
                    labelWidth : 70,
                    xtype : 'textfield',
                    readOnly :true,
                    width : 490
                }]
            }]
        });
        
        /***
         * 补录数据panel
         * @return {TypeName}
         */
        var verifyInPanel = Ext.create(
            'Ext.panel.Panel',{
                title : "补录信息",
                region : 'north',
                height : 175,
                bodyPadding : 5,
                items : [{
                    layout : 'hbox',
                    defaults : {
                        margins : '5 5 0 0'
                    },
                    border : 0,
                    items : [{
                        id : 'vochType',
                        fieldLabel : '&nbsp;凭证种类',
                        xtype : 'textfield',
                        labelWidth : 70,
                        maxLength :5,
                        value: '00702',
                        width : 250,
                        allowBlank:false,
                        blankText:'请输入凭证种类'
                    },{
                        id : 'vochProvNo',
                        fieldLabel : '&nbsp;省市代码',
                        xtype : 'textfield',
                        labelWidth : 70,
                        maxLength :2,
                        value: '12',
                        width : 230,
                        allowBlank:false,
                        blankText:'请输入省市代码'
                    }]
                },{
                    layout : 'hbox',
                    defaults : {
                        margins : '5 5 0 0'
                    },
                    border : 0,
                    items : [{
                        id : 'vochBatchNo',
                        fieldLabel : '&nbsp;批次号',
                        xtype : 'textfield',
                        labelWidth : 70,
                        maxLength :5,
                        width : 250,
                        allowBlank:false,
                        blankText:'请输入批次号'
                    },{
                        id : 'vochSeqNo',
                        fieldLabel : '&nbsp;支票号',
                        xtype : 'textfield',
                        labelWidth : 70,
                        maxLength :20,
                        width : 230,
                        allowBlank:false,
                        blankText:'请输入支票号'
                    }]
                },{
                    layout : 'hbox',
                    defaults : {
                        margins : '5 5 0 0'
                    },
                    border : 0,
                    items : [{
                        id : 'payPwd',
                        fieldLabel : '支付密码',
                        xtype : 'textfield',
                        labelWidth : 85,
                        maxLength :16,
                        width : 250,
                        disabled:true,
                        allowBlank:false
                    },{
                        id : 'isCheckPayPwd',
                        fieldLabel: '是否输入支付密码',
                        xtype: 'checkbox',
                        labelWidth : 120,
                        width : 230,
                        checked: false,
                        handler: function() {
                           if(this.checked){
                             Ext.getCmp("payPwd").setDisabled(false);
                             Ext.getCmp("billIssueDate").show();
                           }else{
                             Ext.getCmp("payPwd").setValue("");
                             Ext.getCmp("payPwd").setDisabled(true);
                             Ext.getCmp("billIssueDate").hide();
                             Ext.getCmp("billIssueDate").setValue("");
                           }
                        }
                    }]
                },{ 
                   layout : 'hbox',
                    defaults : {
                        margins : '5 5 0 0'
                    },
                    border : 0,
                    items : [{
                        id : 'billIssueDate',
                        fieldLabel : '票据签发日期',
                        xtype : 'datefield',
                        labelWidth : 85,
                        width : 250,
                        format : 'Ymd',
                        hidden:true,
                        allowBlank:false
                     }]
                },{
                    layout : 'hbox',
                    defaults : {
                        margins : '5 5 0 0'
                    },
                    border : 0,
                    items : [{
                        id : 'sumAmount',
                        fieldLabel : '&nbsp;总金额',
                        xtype : 'numberfield',
                        labelWidth : 70,
                        minValue : 0,
                        width : 250,
                        decimalPrecision: 2,    //小数精确位数
                        allowBlank:false,
                        blankText:'总金额',
                        format:'0,0.00'
                    },{
                        id : 'sumCount',
                        fieldLabel : '&nbsp;凭证个数',
                        xtype : 'numberfield',
                        labelWidth : 70,
                        minValue : 0,
                        allowDecimals:false,//不允许小数
                        width : 230,
                        allowBlank:false,
                        blankText:'请输入凭证个数'
                    }]
                }]
            });
		
		var me = this;
	
		Ext.applyIf(me, {
			 items : [ verifyCenterPanel,verifyInPanel,
                       Ext.create('Ext.panel.Panel', {
                           region : 'south',
                           border : 0,
                           bbar : [ '->', {
                               xtype : 'buttongroup',
                               items : [
                                   {
                                       id : 'payConfrim',
                                       text : '转账核销',
                                       scale : 'small'
                                   },  {
                                       id : 'close',
                                       text : '取消',
                                       scale : 'small',
                                       handler : function() {
                                    	   me.close();
                                       }
                                   } ]
                           } ]
                       }) ]
		});
		me.callParent(arguments);
}
});
