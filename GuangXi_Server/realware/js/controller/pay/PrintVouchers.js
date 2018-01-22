/***
 * 支付凭证打印界面事件处理器
 * @memberOf {TypeName} 
 */
Ext.define('pb.controller.pay.PrintVouchers',{
		extend : 'Ext.app.Controller',
		// 数据集列表：
		// pay.PayVouchers 支付凭证
		// pay.PayeeBankNos 收款行行号
		// common.PageStatus  初始化业务界面配置
		// pay.BankSetMode 银行结算方式
		stores : [ 'pay.PayVouchers','pay.BankSetMode'],
		//对象模型 pay.PayVoucher 支付凭证
		models : [ 'pay.PayVoucher' ],
		//当创建一个控件的时候需要在此引入
		requires : [ 'pb.view.pay.PrintVoucherList','pb.view.pay.PayVoucherQuery'],
		//创建后获取当前控件，应用于当前控制层
		refs : [ {
			ref : 'list',  //当前控制层引用
			selector : 'printVoucherList' // 控件的别名
		}, {
			ref : 'query',
			selector : 'payVoucherQuery'
		}],
		oneSelect : true,
		//事件的定义
		init : function() {
			pVouchersVar = this;
			this.control( {
					//查询区 
					'payVoucherQuery combo[id=taskState]' : {
						//状态选中
						change : function(combo, newValue, oldValue, eOpts) {
							try {
								this.selectState(combo.valueModels[0].raw.status_code);
							} catch(e) {}
						}
					},
					//////////////////////////按钮区///////////////////////////
					//刷新
					'printVoucherList button[id=refresh]' : {
							click : this.refreshData
							//注 : 当该方法没有参数的时候可以直接这样写
					},
					//打印
					'printVoucherList button[id=print]' : { 
							click : function() {
								var gridPanel = Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue());
								var records = gridPanel.getSelectionModel().getSelection();
								if (records.length == 0) {
										Ext.Msg.alert('系统提示','请至少选择一条数据！');
										return;
								}
//								var ids = [];
//								Ext.Array.each(records, function(model) {
//									ids.push(model.get('pay_voucher_id'))
//								});
								
								printVoucherAUTO(records,"pay_voucher_id",false,records[0].get("vt_code"),'/realware/printVoucherForDB.do',gridPanel);
//								var printvoucherwindow = Ext.create('pb.view.common.PrintVoucherWindow');
//								printvoucherwindow.init(records,ids, me, 'pay_voucher_id',isFlow);
//								printvoucherwindow.show();
							}
					},
					 //查看凭证   
					'printVoucherList button[id=look]' : {
							click : this.lookVoucher
					}
					////////////////////////END///////////////////////
				})
			},
			/////////////////////被调用的方法/////////////////////////
					/**
					 * 切换状态  注：新添加的状态在库里的状态相同的就直接添加的已有的判断里面不要再添加了
					 * @param {Object} status_code  状态code
					 */
					selectState : function(status_code) {
//						if ('011' == status_code) { // 未打印
//							Ext.StatusUtil.batchEnable("print");
//						} else if ('012' == status_code) { // 已打印
//							ssExt.StatusUtil.batchDisable("print");
//						}
					},
					/***
					 * 查看凭证
					 * @memberOf {TypeName} 
					 */
					lookVoucher:function(){
						var me = this;
						var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
						if(records !=null) {
							var maps = Ext.create('Ext.util.HashMap');
							maps.add('pay_voucher_code','凭证号');
							maps.add('pay_amount','金额');
							var store = Ext.create('Ext.data.Store', {
								model: me.getModel('pay.PayVoucher'),
								data : records
							});
							var lookocxwindow = Ext.create('pb.view.common.LookOCXWindow',{
									colMaps : maps,
									listStore : store,
									width : me.getList().getWidth()-30,
									height : me.getList().getHeight()-30
							});
							//加入左边点击凭证号触发显示凭证的事件（控件在创建后-在显示之前加入该事件）
							Ext.ComponentQuery.query('gridpanel', lookocxwindow)[0].on(
									'selectionchange',function(view,selected, e) {
											Ext.OCXUtil.doOCX(selected[0].get('pay_voucher_id'),selected[0].get('bill_type_id'));
									});
							Ext.OCXUtil.doOCX(records[0].get('pay_voucher_id'),records[0].get('bill_type_id'));
							lookocxwindow.show();
						}
					},
					/**
					 * 刷新
					 * @memberOf {TypeName} 
					 */
					refreshData : function() {
						this.getStore('pay.PayVouchers').loadPage(1);
					}
});
