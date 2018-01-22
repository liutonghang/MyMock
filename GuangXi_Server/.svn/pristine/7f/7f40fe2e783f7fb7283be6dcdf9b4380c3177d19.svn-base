function afterCreateViewport() {
	var controller = pb.getApplication().getController("pay.ConfirmCashVouchers");
	var grid = Ext.ComponentQuery.query("viewport > panel")[0];
	Ext.override(pb.view.pay.ConfirmCashPayVoucherWindow, {
		listeners : {
			afterrender : function(thiz, eOpts) {
				
				var queryButton = Ext.getCmp("queryButton");
				
				var queryButtonClickCustom = function(){
					
					var me = this;
					var forms = Ext.ComponentQuery.query('form',me.getWindow());
					var form = forms[0];
					
					if(form.isValid()){
							//数据项
							var model = me.getModel('pay.PayVoucher');
							var filedNames = [];
							Ext.Array.each(model.getFields(), function(field) {
								filedNames.push(field.name);
							});
							var queryField = form.getForm().findField('billNo');
							var conditionObjs = [ {
								operation : 'and',
								attr_code : 'admdiv_code',
								relation : '=',
								value : Ext.getCmp('admdivCode').getValue(),
								type : 0
							}, {
								operation : 'and',
								attr_code : queryField.attr_code,
								relation : '=',
								value : queryField.getValue(),
								type : 0
							}, {
								operation : 'and',
								attr_code : 'pay_amount',
								relation : '=',
								value : form.getForm().findField('oriPayAmt').getValue(),
								datatype : 1,
								type : 0
							}, {
								operation : 'and',
								attr_code : 'batchreq_status',
								relation : '=',
								value : 0,
								datatype : 1,
								type : 0
							}];
							Ext.Ajax.request( {
								url: '/realware/loadCashPay.do',
								method : 'POST',
								params : {
									filedNames :  Ext.encode(filedNames),
									conditionObj :  Ext.encode(conditionObjs),
									menu_id : Ext.PageUtil.getMenuId(),
									start : 0,
									page : 1,
									limit : 1
								 },
								 success : function(response, options) {
									 var dto = Ext.decode(response.responseText);
									 if (dto.pageCount == 0) {
										Ext.Msg.alert('系统提示', '根据凭证号和金额没有查询到授权支付特殊数据,请查看是否存在或已退回！');
										return;
									 }
									 if (dto.root[0].business_type == 1) {
										Ext.Msg.alert('系统提示', '当前凭证已支取确认！');
										return;
									 }
									 me.vouDTO = dto.root[0];
									 me.getWindow().setValue(me.vouDTO);
								 },
								 failure : function(response, options) {
									 Ext.Msg.alert('系统提示', '根据凭证号和金额后台查询授权支付特殊业务失败！');
								 }
							});
						}
				};
				queryButton.handler=null;
				queryButton.on('click', queryButtonClickCustom, controller);

				var cash = Ext.getCmp("rengongCfrim");
				cash.setVisible(false);
				var confirm = Ext.getCmp("payConfrim");
				confirm.setText("请款确认");
				var btnClick = function(){
					var me = this;
					if( Ext.isEmpty(me.vouDTO) ){
						Ext.Msg.alert('系统提示', '请先选择一笔凭证！');
						return;
					}
					// 凭证主键字符串
					var reqIds = [];
					var reqVers = [];
					reqIds.push(me.vouDTO.pay_voucher_id);
					reqVers.push(me.vouDTO.last_ver);
					var params = {
							billTypeId: me.vouDTO.bill_type_id,
							billIds : Ext.encode(reqIds),
							last_vers : Ext.encode(reqVers),
							menu_id :  Ext.PageUtil.getMenuId()
					};
					Ext.PageUtil.doRequestAjax(me,'/realware/batchReqMoney.do',params,'POST',me.getWindow());
					return false;
				}
				confirm.on("click", btnClick, controller);
			}
		}
	});
}

/**
 * 个性化按钮
 */
Ext.ns("Custom");
/**
 * 支付
 */
Custom.transfer=function(grid) {
	var me = pb.app.getController(controllers[1]);
	var records = grid.getSelectionModel().getSelection();
	if(records !=null) {
		// 凭证主键字符串
		var reqIds = [];
		var reqVers = [];
		Ext.Array.each(records, function(model) {
			reqIds.push(model.get("pay_voucher_id"));
			reqVers.push(model.get("last_ver"));
		});
		var params = {
			// 单据类型id
			billTypeId : records[0].get("bill_type_id"),
			billIds : Ext.encode(reqIds),
			last_vers : Ext.encode(reqVers)
		};
		Ext.PageUtil.doRequestAjax(me,'/realware/customTransferPayVoucher.do',params);
		return false;
	}	
}

/**
 * 冲销
 */
Custom.writeoff=function(grid) {
	var me = pb.app.getController(controllers[1]);
	var records = grid.getSelectionModel().getSelection();
	if(records !=null) {
		// 凭证主键字符串
		var reqIds = [];
		var reqVers = [];
		for ( var i = 0; i < records.length; i++) {
			reqIds.push(records[i].get("pay_voucher_id"));
			reqVers.push(records[i].get("last_ver"));
		}
		var bill_type_id = records[0].get("bill_type_id");
		var params = {
			// 单据类型id
			billTypeId : bill_type_id,
			last_vers : Ext.encode(reqVers),
			billIds : Ext.encode(reqIds)
		};
		Ext.PageUtil.doRequestAjax(me,'/realware/writeoffVoucher.do',params);
		return false;
	}
}
/*
 * 请款打印
 */
Custom.print1=function(grid) {
	printImage(grid,'1');
}
/*
 * 支付打印
 */
Custom.print2=function(grid) {
	printImage(grid,'0');
}
/*
 * 冲销打印
 */
Custom.print3=function(grid) {
	printImage(grid,'22');
}

/**
 * 
 * @param grid
 * @param type 交易类型
 */
function printImage(grid,type){
	var records = grid.getSelectionModel().getSelection();
	if (records.length !=1) {
		Ext.Msg.alert("系统提示", "请选中一条凭证信息！");
		return;
	} 
	var me = pb.getApplication().getController(controllers[2]);
	var voucher_no=records[0].get("pay_voucher_id");
	var condition = "[{\"trans_type\":[\""+type+"\"], \"admdiv_code\":[\"" + Ext.getCmp("admdivCode").getValue() + "\"],\"pay_voucher_id\":[\"" + voucher_no + "\"]}]";
	//GridPrintDialog('undefined','undefined','/realware/loadReportByCode.do','/realware/loadReportData.do',"12220111",data,100);
	Ext.ReportUtil.showPrintWindow(me,'/realware/loadReportByCode.do','/realware/loadReportData.do','12220111',condition);
}