/*******************************************************************************
 * 支付凭证数据集合
 */
Ext.define('pb.store.pay.PlPayRequests', {
			extend : 'Ext.data.Store',
			model : 'pb.model.pay.PayRequest',
			storeId : 's_payRequest',
			proxy : {
				type : 'ajax',
				actionMethods : {
					read : 'POST' // 指定检索数据的提交方式
				},
				url : '/realware/loadPayRequest.do',
				reader : {
					type : 'json',
					root : 'root',
					totalProperty : 'pageCount'
				}
			},
			autoLoad : false
		});