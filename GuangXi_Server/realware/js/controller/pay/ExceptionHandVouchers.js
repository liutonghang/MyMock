//自助柜面异常处理事件处理类


Ext.define('pb.controller.pay.ExceptionHandVouchers',{
		extend : 'Ext.app.Controller',
		// 数据集列表：
		// pay.PayVouchers 支付凭证
		// common.PageStatus  初始化业务界面配置
		// pay.BankSetMode 银行结算方式
		stores : [ 'pay.PayVouchers','pay.BankSetMode'],

		//对象模型 pay.PayVoucher 支付凭证
		models : [ 'pay.PayVoucher' ],
		//当创建一个控件的时候需要在此引入
		requires : [ 'pb.view.pay.TransferVoucherList','pb.view.pay.PayVoucherQuery'],
		//创建后获取当前控件，应用于当前控制层
		refs : [ {
			ref : 'list',  //当前控制层引用
			selector : 'transferVoucherList' // 控件的别名
		}, {
			ref : 'query',
			selector : 'payVoucherQuery'
		} ],
		limitOfAmount : null,
		//事件的定义
		init : function() {
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
					'transferVoucherList button[id=refresh]' : {
							click : this.refreshData
							//注 : 当该方法没有参数的时候可以直接这样写
					},

					//冲销凭证
					'transferVoucherList button[id=writeoff]' : { 
							click : this.writeoffPayVoucher
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
				if('000' == status_code){
					Ext.getCmp('zpno').hide()
					Ext.getCmp('writeoff').setDisabled(false);
				}else if('001' == status_code){
					Ext.getCmp('zpno').hide()
					Ext.getCmp('writeoff').setDisabled(true);							
				}
			},
					
			/**
			 * 刷新
			 * @memberOf {TypeName} 
			 */
			refreshData : function() {
				this.getStore('pay.PayVouchers').loadPage(1);
			},
					
			/**
			 * 冲销凭证
			 * @memberOf {TypeName} 
			 * @return {TypeName} 
			 */
			writeoffPayVoucher : function() {
				var me = this;
				var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
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
				}
			}
					
});
