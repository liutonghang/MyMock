/***
 * 工作日处理器
 * @memberOf {TypeName} 
 */
Ext.define('pb.controller.common.WorkDay', {
	extend : 'Ext.app.Controller',
	stores : [ 'common.WorkDays' ],
	models : [ 'common.WorkDay' ],
	requires : [ 'pb.view.common.WorkDayPanel', 'pb.view.common.DateItem' ],
	//创建后获取当前控件，应用于当前控制层
	refs : [ {
		ref : 'list', //当前控制层引用
		selector : 'workDayPanel' // 控件的别名
	} ],
	//事件的定义
	init : function() {
		this.control( {
			'workDayPanel combo[id=cbxYear]':{
				select : function() {
					this.refreshData();
				}
			},
			'workDayPanel button[id=edit]' : {
				click : function() {
					Ext.getCmp('edit').disable();
					Ext.getCmp('unedit').enable();
					Ext.getCmp('save').enable();
					Ext.getCmp('daypanel').enable();
				}
			},
			'workDayPanel button[id=unedit]' : {
				click : function() {
					refreshPage();
					Ext.getCmp('edit').enable();
					Ext.getCmp('unedit').disable();
					Ext.getCmp('save').disable();
					Ext.getCmp('daypanel').disable();
				}
			},
			'workDayPanel button[id=save]' : {
				click : this.saveWorkDay
			},
			'workDayPanel button[id=import]' : {
				click : this.importWorkDays
			},
			'workDayPanel button[id=export]' : {
				click : this.exportWorkDays
			}
		})
	},
	saveWorkDay : function(){
		var me = this;
		var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true
		});
		myMask.show();
		var params = {
			workDays : Ext.encode(me.setWorksDay(me.getList().workDays)),
			year : Ext.getCmp('cbxYear').getValue()
		};
		Ext.Ajax.request( {
			url : '/realware/saveWorkDays.do',
			method : 'POST',
			timeout : 180000, // 设置为3分钟
			params : params,
			success : function(response, options) {
				Ext.PageUtil.succAjax(response, myMask);
				me.refreshData();
				refreshPage();
				Ext.getCmp('edit').enable();
				Ext.getCmp('unedit').disable();
				Ext.getCmp('save').disable();
				Ext.getCmp('daypanel').disable();
			},
			failure : function(response, options) {
				Ext.PageUtil.failAjax(response, myMask);
			}
		});
	},
	importWorkDays: function(){
		var me = this;
		var importwindow = Ext.create('pb.view.common.ImportFileWindow',{
			width : 400
		});
		importwindow.init('/realware/importWorkDays.do',me,'xls|xlsx',true);
		importwindow.show();
	},
	exportWorkDays: function(){
		var me = this;
		var yearValue = Ext.getCmp('cbxYear').getValue();
		var body = Ext.getBody(),
		    frame = body.createChild({
		        tag:'iframe',
		        cls:'x-hidden',
		        id:'hiddenform-iframe',
		        name:'hiddenform-iframe'
		    }),
		    form = body.createChild({
		        tag:'form',
		        cls:'x-hidden',
		        id:'hiddenform-form',
		        action: '/realware/exportWorkDay.do',
		        method : 'post',
		        target : Ext.isIE ? 'hiddenform-iframe' : '_blank'
		    });
		    
			var _el = form.createChild({
				tag:'input',
				type:'text',
				cls:'x-hidden',
				name: 'year',
				value: yearValue
			});

		    form.dom.submit();
		    form.remove();
		    frame.remove();
	},
	/**
	 * 刷新
	 * @memberOf {TypeName} 
	 */
	refreshData : function() {
		var me = this;
		var yearValue = Ext.getCmp('cbxYear').getValue();
		me.getStore('common.WorkDays').load({
			scope: this,
			params : {
					year :  yearValue
				},
    		callback: function(records, operation, success) {
				if(success){
					for ( var i = 0; i<records.length; i++) {
						//获取非工作日
						var arrayDays = [];
						for ( var j = 1; j <= 31; j++) {
							if (records[i].get('day' + j) == 2) {
								arrayDays.push(j + '');
							}
						}
//						var value_ =  new Date();
//						value_.setUTCFullYear(yearValue);
//						value_.setUTCMonth(records[i].get('month').replace(/-/g,"/")-1);
						
						var month_ =  records[i].get('month').replace(/-/g,"/");
						var value_ = new Date(yearValue,month_,0); 
						var monthItem = Ext.getCmp('month-' + value_.getUTCMonth());
						monthItem.noWorkDays = arrayDays;
						monthItem.setValue(value_);
					}
					me.getList().workDays = records;
				}
			}
		});
	},
//	setWorksDay : function(totalDays) {
//		var total = [] ;
//		var days = 0 ; //每月累加天数
//		var useDay = 0; //已算天数
//		for ( var j = 1; j <= 12; j++) {
//			var model = totalDays[j - 1];
//			var month = model.get('month');
//			for ( var i = 1; i <= 31; i++) {
//				if (model.get('day' + i) != 0) {
//					if (model.get('day' + i) == 1) { //工作日
//						if(parseInt(month)==1){
//							total.push(i);
//						}else{
//							total.push(i + useDay);
//						}
//					}
//					days = days + 1;
//				}
//			}
//			useDay = days;
//		}
//		return total;
//	},
	setWorksDay : function(workDays) {
		var date = [];
		var yearValue = Ext.getCmp('cbxYear').getValue();
		Ext.Array.each(workDays,function(model){
			var month = model.get('month');
			for ( var i = 1; i <= 31; i++) {
				if (model.get('day' + i) ==1 ) { //工作日
					var dd = month + ((i+''.toString()).length==1?'0'+i:i);
					date.push(dd);
				}
			}
		});
		return date;
	}
});
