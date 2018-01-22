/**
 * 实拨凭证行号补录
 * lfj 2015-12-17
 * 依赖：pay.BankSetMode
 */

document.write('<scr'+ 'ipt type="text/javascript" src="/realware/js/view/pay/BankNoWindow.js"></scr'+ 'ipt>');
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/js/store/pay/PayeeBankNos.js"></scr'+ 'ipt>');

var _BankNoWin = null;

var banknoStore = Ext.create('Ext.data.Store', {
			fields : [{
						name : 'bank_name'
					}, {
						name : 'bank_no'
					}, {
						name : "match_ratio"
					}, {
						name : "like_ratio"
					}],
			autoLoad : false,
			proxy : {
				type : 'ajax',
				actionMethods : {
					read : 'POST'
				},
				url : '/realware/loadBanknos.do',
				reader : {
					type : 'json'
				}
			}
		});

var bankSetModeStore = Ext.create('Ext.data.Store', {
			fields : [{
						name : 'name'
					}, {
						name : 'value'
					}],
			proxy : {
				type : 'ajax',
				actionMethods : {
					read : 'POST'
				},
				url : 'loadbanksetmode.do',
				reader : {
					type : 'json'
				}
			},
			autoSync : false,
			autoLoad : true
		});
function addBankno(grid, rowIndex, colIndex, node, e, record, rowEl) {
	if (!_BankNoWin) {

		_BankNoWin = Ext.widget('banknowindow', {
			banknoStore : banknoStore,
			bankSetModeStore : bankSetModeStore,
			CityCodes : null,
			bankBizTypes : null,
			hiddenFuzzy : false
				//启用模糊查询
			});
		//补录行号确定按钮触发
		_BankNoWin.on('bankNoclick', function(grid) {
					var rs = grid.getSelectionModel().getSelection();
					if (rs.length == 0) {
						return;
					}
					var bankSetMode = _BankNoWin.getForm()
							.findField('banksetMode');
					_BankNoWin.curRow.set({
								'payee_account_bank_no' : rs[0].get('bank_no'),
								'payee_account_bank' : rs[0].get('bank_name'),
								'add_word' : _BankNoWin.getForm()
										.findField('bankRemarkFieldLable')
										.getValue(),
								'pb_set_mode_name' : bankSetMode.rawValue,
								'pb_set_mode_code' : bankSetMode.getValue()
							});
					_BankNoWin.hide();
				});

	}

	_BankNoWin.curRow = record;
	_BankNoWin.payeeAccountNo = _BankNoWin.curRow.get('payee_account_no');
	//判断结算方式、查询记录如果没做操作默认选中第一个选项
	var tempModeCode = _BankNoWin.curRow.get('pb_set_mode_code');
	var form = _BankNoWin.getForm();
	var field = form.findField('banksetMode');
	if (tempModeCode == null || tempModeCode == '') {
		field.setValue('1');
	} else {
		field.setValue(tempModeCode);
	}
	form.findField('ori_bankname').setValue(_BankNoWin.curRow
			.get('payee_account_bank'));
	form.findField('bankRemarkFieldLable').setValue(_BankNoWin.curRow
			.get('bankRemarkFieldLable'));
	var button = Ext.ComponentQuery.query('button[text="查询"]', _BankNoWin)[0];
	//显示窗口
	_BankNoWin.show();
	//此处使用handler.call，否则由于scope的不同，无法触发“查询”的handler事件，如fireEvent
	button.handler.call(button);

}