/**
 * 支付凭证初审，行号补录个性化
 */


document.write('<scr'
				+ 'ipt type="text/javascript" src="/realware/gx_js/GXABCBankNoWindow.js"></scr'
				+ 'ipt>');

var Custom = function(){
	return {
		
		   gxaudit : function(records) {
						checkerVouchergx(true);
					},
		   gxsubmit : function(records){
						checkerVouchergx(false);
		   }
					
	};
}();


function checkerVouchergx(isReturn){
		var ajaxBool = true;
		var bankstore = Ext.getStore('pay.BankSetMode').data.items;
		var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
		if (records == null) {
			Ext.Msg.alert("系统提示", "请选择凭证信息！");
			return;
		}
		if(records !=null) {
			var reqIds = []; // 凭证主键字符串
			var reqVers = []; // 凭证lastVer字符串
			var jsonMap = '[';
			Ext.Array.each(records, function(model) {
				// 验证是否都已补录行号
			var payeeAcctBankno = model.get('payee_account_bank_no');
			var pbSetModeCode = model.get('pb_set_mode_code');
			var pbSetModeName = null;
				Ext.Array.each(bankstore, function(model) {
					if(model.get('value')==pbSetModeCode){
						pbSetModeName = model.get('name');
					}
				});
			var payeeAcctBankName = model.get('payee_account_bank');
			var payeeAcctNo = model.get('payee_account_no');
			var cityCode = model.get('city_code');
//							var pbBusinessTypeValue = model.get('bankbusinesstype');
			//xcg 2015-8-20 12:57:14
			var pbBusinessTypeValue =  model.get('hold9');
//			if(pbBusinessTypeValue == '对公'){
//				pbBusinessTypeValue = 0;
//			}else if(pbBusinessTypeValue == '借记卡'){
//				pbBusinessTypeValue = 1;
//			}else if(pbBusinessTypeValue == '准贷记卡'){
//				pbBusinessTypeValue = 2;
//			}else if(pbBusinessTypeValue == 'ABIS内核户'){
//				pbBusinessTypeValue = 3;
//			}
			if (null == payeeAcctBankno || '' == payeeAcctBankno) {
				Ext.Msg.alert('系统提示', '凭证：' + model.get('pay_voucher_code')+ '请先补录行号再进行初审操作！');
				ajaxBool = false;
			}
			if(payeeAcctBankName.indexOf('农行') >= 0 || payeeAcctBankName.indexOf('农业银行') >= 0){
				if(payeeAcctNo.length == 15){
					if ( Ext.isEmpty(cityCode)) {
							Ext.Msg.alert('系统提示', '凭证：' +  model.get('pay_voucher_code')+ '为农行15位收款人账号，请先补录省市代码！');
							ajaxBool = false;
							return;
					}
				}else if(! Ext.isEmpty(cityCode)&&cityCode != ' '){
					Ext.Msg.alert('系统提示', '凭证：' +  model.get('pay_voucher_code')+ '不为农行15位收款人账号，请不要补录省市代码！');
					ajaxBool = false;
					return;
				}
			}/*else if(payeeAcctBankno.length != 12){
				Ext.Msg.alert('系统提示', '凭证：' + model.get('pay_voucher_code')+ '行号必须为12位！');
				ajaxBool = false;
			}*/
			reqIds.push(model.get('pay_voucher_id'));
			reqVers.push(model.get('last_ver'));
			jsonMap += '{\'id\':\'' + model.get('pay_voucher_id') + '\',\'bankNo\':\'' + 
						payeeAcctBankno+'\',\'setModeCode\':\'' +  model.get('pb_set_mode_code') +
						'\',\'add_word\':\'' + model.get('add_word') + 
						'\',\'setModeName\':\'' + pbSetModeName + '\',\'city_code\':\'' +
						model.get('city_code')+ '\',\'bankbusinesstype\':\''+ pbBusinessTypeValue + '\'},';
		});
			if (ajaxBool) {
				var params = {
					is_onlyreq : 0,
					billTypeId : records[0].get('bill_type_id'),
					billIds : Ext.encode(reqIds),
					last_vers : Ext.encode(reqVers),
					jsonMap : jsonMap.substring(0,jsonMap.length - 1) + ']',
					isCheck : isReturn
				};
				Ext.PageUtil.doRequestAjax(null,'/realware/checkVoucherGX.do',params);
			}
		}
}


var bankBusinessType = Ext.create('Ext.data.Store', {
	fields : ['name', 'value'],
	data : [ {
		"name" : "0-对公户",
		"value" : "0"
	}, {
		"name" : "1-借记卡",
		"value" : "1"
	}, {
		"name" : "2-准贷记卡",
		"value" : "2"
	}, {
		"name" : "3-ABIS内核户",
		"value" : "3"
	}]
});

var bankWin = null;

function afterCreateViewport() {
//	var store = Ext.create('pb.store.pay.bankBusiness');
	Ext.StoreManager.add("pay.bankBusiness", bankBusinessType);
	//行号补录个性化
	CustomAddbankNo();
	//显示银行业务类型的列
	CustomBankBusinessType();
}

function CustomBankBusinessType(){
	var model = pb.model.pay.PayVoucher;
	var addField = new Ext.data.Field({
			name : 'hold9',
			type : 'string'
	});
	model.getFields().push(addField);
}

function CustomAddbankNo(){
	var controller = pb.getApplication().getController("pay.CheckVouchers");
	var query = controller.getList();
	if (query) {
		
		query.un("addBankno");
		
		var addBankno = function(grid, rowIndex, colIndex, node, e,record, rowEl){
			var banknoStore = controller.getStore('pay.PayeeBankNos');
			
			if(!bankWin){
				bankWin = Ext.create('gxabc.BankNoWindow',{
					payeeAccountNo : record.get('payee_account_no'),
					banknoStore : banknoStore,
					bankSetModeFieldLabel : '转账方式',
					bankBusinessTypeStore : 'pay.bankBusiness',
					bankSetModeStore : 'pay.BankSetMode',
					hiddenCityCode : false
				});
			
				var form = bankWin.getForm();
				var bankSetMode = form.findField('banksetMode');
				var button = Ext.ComponentQuery.query('button[text="查询"]', bankWin)[0];
				Ext.getCmp("banksetModeId").on('select',function (){
					if(bankSetMode.getValue()== 1){
						form.findField('ori_bankname').setValue("中国农业银行同行");
						form.findField('cityCode').show();
						Ext.get('bankBusinessType').show();
						form.findField('bankBusinessType').setValue('0');
						button.handler.call(button);
					
					}else{
						alert("跨行转帐请注意核对联行行名行号，若与实际不符，请返回上级页面，用鼠标双击转帐记录在“收款行行号”列对应的单元格，将正确的行号输入！");
						form.findField('cityCode').hide();
						form.findField('ori_bankname').setValue(bankWin.curRow.get('payee_account_bank'));
						Ext.get('bankBusinessType').hide();
						button.handler.call(button);
					}
				});
			
				//补录行号确定按钮触发
				bankWin.on('bankNoclick', function(grid){
					var rs = grid.getSelectionModel().getSelection();
					if (rs.length == 0){
						return;
					}
					var form = bankWin.getForm();
					var bankSetMode = form.findField('banksetMode');
					var cityCode = form.findField('cityCode').getValue();
					var bankbusinesstype = bankWin.getForm().findField('bankBusinessType').getValue();

				
					bankWin.curRow.set({
						 'payee_account_bank_no' : rs[0].get('bank_no'), 
						 'pb_set_mode_name' : bankSetMode.rawValue, 
						 'pb_set_mode_code' : bankSetMode.getValue(),
						 'hold9' : bankbusinesstype,
						 'add_word' : bankWin.getForm().findField('bankRemarkFieldLable').getValue(), 
						 'city_code' : cityCode
						});
					bankWin.hide();
				});
			}
			
			bankWin.curRow = record;
			bankWin.payeeAccountNo = bankWin.curRow.get('payee_account_no');
			//判断结算方式、查询记录如果没做操作默认选中第一个选项
			var tempModeCode = bankWin.curRow.get('pb_set_mode_code');
			var tempPayeeAccountType = bankWin.curRow.get('bankbusinesstype');
			
			var form = bankWin.getForm();
			var field = form.findField('banksetMode');
			if (tempModeCode == null || tempModeCode == '' || tempModeCode=='同行' || tempModeCode=='1') {
				field.setValue('1');
			} else {
				field.setValue(tempModeCode);
			}
			form.findField('ori_bankname').setValue(bankWin.curRow.get('payee_account_bank'));
			form.findField('cityCode').setValue(record.get('city_code'));
			var button = Ext.ComponentQuery.query('button[text="查询"]', bankWin)[0];
			//显示窗口
			bankWin.show();
			if(field.getValue()==1){
				form.findField('ori_bankname').setValue("中国农业银行同行");
				form.findField('cityCode').show();
				Ext.get('bankBusinessType').show();
				form.findField('bankBusinessType').setValue(bankWin.curRow.get('hold9'));
			}else{
				alert("跨行转帐请注意核对联行行名行号，若与实际不符，请返回上级页面，用鼠标双击转帐记录在“收款行行号”列对应的单元格，将正确的行号输入！");
				form.findField('cityCode').hide();
				Ext.get('bankBusinessType').hide();
			}
			button.handler.call(button);
			return false;
		
		};
		query.on("addBankno", addBankno, controller);
	}
}
