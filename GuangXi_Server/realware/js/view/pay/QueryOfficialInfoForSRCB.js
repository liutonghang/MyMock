/*******************************************************************************
 * 公务卡查询按钮区
 * 
 * @memberOf {TypeName}
 */
Ext.define('pb.view.pay.QueryOfficialInfoForSRCB', {
			extend : 'pb.view.pay.OffcialInfoPanel',
			alias : 'widget.queryOfficialInfoForSRCB', // 别名
			layout : 'fit',
			frame : false,
			UItitle : '公务卡信息明细列表',
			initComponent : function() {
				this.dockedItems = [{
					xtype : 'officialInfoQueryView' //查询区
				}];
				this.callParent(arguments);
			}
		});