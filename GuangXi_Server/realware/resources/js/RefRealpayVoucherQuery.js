/*
 *  实拨拨款单查询
*/

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr' + 'ipt>');

/**
 * 列表
 */
var gridPanel1 = null;
// 是否走工作流
var isFlow = false;
/**
 * 数据项
 */

var fileds=["realpay_voucher_code","pay_amount","payee_account_no","payee_account_name",
	"payee_account_bank","pay_account_no","pay_account_name","pay_account_bank",
	"exp_func_name","fund_type_code","fund_type_name","pay_type_code","pay_type_name",
	"pay_summary_code","pay_summary_name","pay_date","print_num","print_date","voucher_flag"
	,"task_id","bill_type_id","realpay_voucher_id","voucher_status","voucher_status_des","vou_date", 
	"admdiv_code", "vt_code", "year"];
/**
 * 列名
 */

var header="凭证状态|voucher_status_des|140,拨款凭证编码|realpay_voucher_code|140,凭证日期|vou_date,拨款金额|pay_amount|100,收款人账号|payee_account_no|140,收款人名称|payee_account_name|140,"
	+"收款人银行|payee_account_bank|140,付款人账号|pay_account_no|140,付款人|pay_account_name|140,付款人开户银行|pay_account_bank|140,"
	+"资金性质编码|fund_type_code|140,资金性质|fund_type_name|140,支付方式编码|pay_type_name|140,支付方式|pay_type_name|140," 
	+"用途编码|pay_summary_code|140,用途名称|pay_summary_name|140,支付日期|pay_date|140,打印次数|print_num|140,打印日期|print_date|140";


//发送单
var comboVoucherStatus3 = Ext.create('Ext.data.Store',{
	fields : ['name', 'value'],
	data : [{
				"name" : "全部",
				"value" : ""
			}, {
				"name" : "银行未发送",
				"value" : "13"
			}, {
				"name" : "财政未接收",
				"value" : "0"
			}, {
				"name" : "财政接收成功",
				"value" : "1"
			}, {
				"name" : "财政接收失败",
				"value" : "2"
			}, {
				"name" : "财政签收成功",
				"value" : "3"
			}, {
				"name" : "财政签收失败",
				"value" : "4"
			}, {
				"name" : "财政已退回",
				"value" : "5"
			}]	
}); 

/**
 * 界面加载
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	Ext.Loader.setPath('Ext', 'js/util');
	Ext.require(['Ext.PageUtil']);
	gridPanel1 = getGrid(loadUrl, header, fileds, true, true);
	gridPanel1.setHeight(document.documentElement.scrollHeight - 88);
	gridPanel1.getStore().on('beforeload', function(thiz, options) {
		beforeload(Ext.getCmp("queryPanel"), options, Ext.encode(fileds));
	});
	var buttonItems=[{
		id : 'print',
		handler : function() {
			var records = gridPanel1.getSelectionModel()
					.getSelection();
			if (records.length == 0) {
				Ext.Msg.alert("系统提示", "请选中凭证信息！");
				return;
			}
			// 在未打印下，打印需走工作流
			printVoucher(records,"realpay_voucher_id",isFlow);
		}
	},{
		id : "sendAgain",
		handler : function(){
			var voucherStatus = Ext.getCmp('voucherState').getValue();
			if("8" == voucherStatus|| "2" == voucherStatus|| "6" == voucherStatus){
				sendVoucher("/realware/sendVoucher.do");
			}
			if("10" == voucherStatus || "11" == voucherStatus || "4" ==voucherStatus || "5"==voucherStatus){
				sendVoucher("/realware/sendVoucherAgain.do");
			}
		}
	}, 
	{
		
		id : 'look',
		
		handler : function() {
			lookOCX(gridPanel1.getSelectionModel().getSelection(),"realpay_voucher_id");
		}
	}, {
		
		id : 'log',
		handler : function() {
			taskLog(gridPanel1.getSelectionModel().getSelection(),"realpay_voucher_id");
		}
	}, {
		id : 'printCustom',
		handler : function() {
			var records = gridPanel1.getSelectionModel()
			.getSelection();
			if (Ext.isEmpty(records)) {
				Ext.Msg.alert("系统提示", "请选中凭证信息！");
				return;
			}
			printVoucherAUTO(records, "realpay_voucher_id", 
					false, "5207", '/realware/printVoucherForDB.do', gridPanel1);
		}
	}, {
		
		id : 'refresh',
		handler : function() {
			refreshData();
		}
	}];
	
	var queryItems=[{
		 
		title : '查询条件',
		id : 'queryPanel',
		items : gridPanel1,
		layout : {
			type : 'table',
			columns : 4
		},
		defaults : {
			margins : '3 10 0 0'
		},
		items:[{
			id : 'voucherState',
			fieldLabel : '凭证状态',
			xtype : 'combo',
			dataIndex : 'voucher_status',
			displayField : 'name',
			allowBlank : 'false',
			mode : 'local',
			emptyText : '请选择',
			valueField : 'value',
			labelWidth : 70,
			store :comboVoucherStatus3,
			Visible : false,
			value : '',
			editable : false,
			listeners : {
				'select' : selectVoucherStore
			}
		},
        {
	      id : 'admdiv',
	     fieldLabel : '所属财政',
	     xtype : 'combo',
	     dataIndex : 'admdiv_code',
	     displayField : 'admdiv_name',
	     emptyText : '请选择',
	     valueField : 'admdiv_code',
	     labelWidth : 55,
	     editable : false,
	     store : comboAdmdiv
       }, {
    	 id : 'vou_date1',
		 fieldLabel : '凭证日期',
		 labelWidth : 55,
		 xtype : 'datefield',
		 format : 'Ymd',
		 dataIndex : 'vou_date'
      },{
			dataIndex : "is_valid ",
			symbol : '=',
			value : 1,
			data_type : 'number',
			hidden : true
		}]
      },gridPanel1]
	    Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
	    	Ext.StatusUtil.initPage(Ext.getCmp("admdiv"));
	    });
	    Ext.StatusUtil.batchDisable("sendAgain");
	    Ext.getCmp("voucher_status_des").renderer = function(value){
			if(null != value){
				value = value.replace("对方", "财政");
				value = value.replace("本方", "银行");
				    if(value=="未发送"){
				    		value = "银行未发送";
				    }								
			}
			return value;
		};
});
   
  function selectVoucherStore (){
	  var voucherStatus = Ext.getCmp('voucherState').getValue();
	  if( "8" == voucherStatus || "10" == voucherStatus || "11" == voucherStatus || "2" == voucherStatus ||"4" == voucherStatus || "5" == voucherStatus || "6" == voucherStatus){
		  Ext.StatusUtil.batchEnable("sendAgain");
	  }else{
		  Ext.StatusUtil.batchDisable("sendAgain");
	  }
	  refreshData();
  }
  
  
  
  /**
   * 重新发送
   * @return
   */
	function sendVoucher(url) {
		var me = this;
		var voucherStatus = Ext.getCmp('voucherState').getValue();
		var records = gridPanel1.getSelectionModel().getSelection();
		if (records.length == 0) {
			Ext.Msg.alert("系统提示", "请选中一条凭证信息！");
			return;
		}
		var reqIds = [];
		
		Ext.Array.each(records,function(model){
				reqIds.push(model.get("realpay_voucher_id"));
		});
		
		var bill_type_id =  records[0].get("bill_type_id");
		
		var myMask = new Ext.LoadMask(Ext.getBody(), {
				msg : '后台正在处理中，请稍后....',
				removeMask : true // 完成后移除
			});
		myMask.show();
		var params = {
				billTypeId : records[0].get("bill_type_id"),
				billIds : Ext.encode(reqIds),
				menu_id :  Ext.PageUtil.getMenuId()
			};
		Ext.PageUtil.doRequestAjax(me, url, params);
	}
  
  function refreshData() {
	gridPanel1.getStore().loadPage(1);
}
  
 
