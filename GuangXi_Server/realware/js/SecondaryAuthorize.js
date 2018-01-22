

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/js/util/PageUtil.js"></scr' + 'ipt>');

var gridPanel1 = null;


/**
 * 界面加载
 */
Ext.require(["Ext.grid.*", "Ext.data.*"]);

Ext.onReady(function() {
	
	Ext.QuickTips.init();
	

	Ext.create('Ext.Viewport', {
		id : 'SecondaryAuthorizeFrame',
		layout : 'fit',
		items : [ Ext.create('Ext.panel.Panel', {
			tbar : [ {
				id : 'buttongroup',
				xtype : 'buttongroup',
				items : [ {
					id : 'refresh',
					text : '刷新',
					iconCls : 'refresh',
					scale : 'small',
					handler : function() {
						refreshData();
					}
				} ]
			} ],
			items : [ {
				html : 
					'<div style="color:#F00">金额配置规则:【行长>网点管理员>业务人员】</div>'
			}, gridPanel1 ]

		}) ]
	});
	
});
// ********************************************************
var columns = [
			{
				text : 'pay_upperlimit_id',
				dataIndex: 'pay_upperlimit_id',
				width : 110,
				hidden : true
			},
       	    {	text:'员工级别',
				dataIndex:'user_type_view',
				width: 190
			},	
       	    {	
				text:'现金',
				renderer:function(value){
					return Ext.util.Format.number(value,'00.00');
				},
				dataIndex:'cashpay_amount',
				width: 190,
       	    	editor:{  
       	    		xtype: 'numberfield',
       	    		allowBlank: false,
       	    		regex:/^[0-9]+(\.[0-9]{0,2})?$/
       	    }},
       	    {	text:'同行转账',
       	    	renderer:function(value){
					return Ext.util.Format.number(value,'00.00');
				},
       	    	dataIndex:'sanebank_amount',
       	    	width: 190,
   		    	editor:{
   		    		xtype: 'numberfield',
   	                allowBlank: false,
   	                regex:/^[0-9]+(\.[0-9]{0,2})?$/     
       		 }},
       	    {	text:'跨行转账',
       			renderer:function(value){
					return Ext.util.Format.number(value,'00.00');
				},
       			dataIndex:'commonpay_amount',
       			width: 190,
		    	editor:{
		    		xtype: 'numberfield',
	                allowBlank: false,
	                regex:/^[0-9]+(\.[0-9]{0,2})?$/
       		}}
       	    
       	];
       	
       	Ext.define('limit', {
       	     extend: 'Ext.data.Model',
       	     fields: [
       	         {name: 'pay_upperlimit_id'},
       	         {name: 'user_type_view'},
       	         {name: 'cashpay_amount'},
       	         {name: 'sanebank_amount'},
       	         {name: 'commonpay_amount'}
       	     ]
       	 });

       	 var myStore = Ext.create('Ext.data.Store', {
       	     model: 'limit',
       	     proxy: {
       	         type: 'ajax',
       	         url: 'loadPayUpperLimit.do',
       	         reader: {
       	             type: 'json',
       	             root: 'limits'
       	         }
       	     },
       	     autoLoad: true
       	 });

       	gridPanel1 = Ext.create('Ext.grid.Panel',{
       		selType : 'rowmodel',
       		frame : false,
       		height:800,
       		layout : 'fit',
       		store: myStore,  
       		columns:columns, //显示列  
       		plugins:[  
       		         Ext.create('Ext.grid.plugin.RowEditing',{  
       		        	 clicksToEdit: 1, //设置单击单元格编辑  
       		        	 saveBtnText : '保存',
       		        	 cancelBtnText : '取消',
       		        	 cancelEdit : function(grid) {
       		        		 var me = this;
       		        		 if (me.editing) {
       		        			 me.getEditor().cancelEdit();
       		        		 }
       		        	 },
       		        	 // 添加监听事件点击保存则将数据保存到数据库中
       		        	 listeners:{
       		        		 edit:function(e){
       		        			 var record = e.grid.getSelectionModel().getSelection()[0];
       		        			 var params = {	
       		        					pay_upperlimit_id : record.get('pay_upperlimit_id'),
       		        					cashpay_amount: record.get('cashpay_amount'),
       		        					sanebank_amount: record.get('sanebank_amount'),
       		        					commonpay_amount: record.get('commonpay_amount')
       		        			 };
       		        			 Ext.PageUtil.doRequestAjax(this,'/realware/updatePayUpperLimit.do',params);
       		        		 }
       		        	 }
       		        })
   		        	  
           ],
        addHidden : false,
       	delHidden : false,
       	topHidden : false,
       	lowHidden : false
});

// 刷新数据
function refreshData() {
	gridPanel1.getStore().loadPage(1);
} 



