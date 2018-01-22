/**
 * @author liHongbiao
 * @date 2015-05-12
 */
Ext.define("pb.QueryPanel",{
	extend : 'Ext.panel.Panel',
	alias : 'widget.querypanel',
	title : '',
	layout:"border",
	border:false,
	bodyBorder:false,
	gridCfg:{},
	filterCfg:{},
	tbar:[],
	constructor:function(options){
		var me =this;
		options = options||{};
		/**options={
		 * 	 tbar:[{xtype:"button",text:"BUTTON"}],
		 * 	 gridCfg:{
		 * 		title:"",
		 * 		loadUrl:"",
		 * 		fields:"",
		 * 		header:""
		 * 		store:{}
		 *      selModel:
		 * 	 },
		 *   filterCfg:{
		 *   	height:80,
		 *   	columns:4,
		 *   	items:[]
		 *   }	
		 *   filterCfg:[]
		 */
		var filterPanel = this.createFilter(options.filterCfg);
		
		Ext.apply(this.gridCfg,options.gridCfg);
		var gridPanel =  this.createGrid(this.gridCfg);
		//处理工具栏按钮
		this.tbar = options.tbar||this.tbar;
		this.dealTbar(); 
		
		Ext.apply(this,{
			items:[
			    filterPanel,
			    {	
			    	title:me.gridCfg.title,
			    	region:"center",
			    	layout:"fit",
			    	items:[gridPanel]
			    }
			],
			getFilterPanel:function(){
				return filterPanel;
			},
			getGrid:function(){
				return gridPanel;
			}
		});
		this.callParent();
	},
	validSelectOne:function(fAfter){
		var me = this;
		var recs =this.getSelections();
		if(recs.length==0){
			me.info("请选择一条相应记录");
		}else if(recs.length==1){
			if(typeof fAfter==="function"){
				fAfter.call(me,recs[0]);
			}
			return recs[0];
		}else{
			me.info("只能选择一条相应记录");
		}
		return false;
	},
	validSelects:function(fAfter){
		var me = this;
		var recs =this.getSelections(); 
		if(recs.length>0){
			if(typeof fAfter==="function"){
				fAfter.call(me,recs)
			}
			return recs;
		}else{
			me.info("请至少选择一条相应记录");
		}
		return false;
	},
	getSelections:function(){
		var recs = this.getGrid().getSelectionModel().getSelection();
		return recs;
	},
	refreshData:function(addParams){
		var store = this.getStore();
		store.loadPage(1);
	},
	getStore:function(){
		return this.getGrid().getStore();
	},
	reconfigureGrid:function(store, column){
		this.getGrid().reconfigure(store, column);
	},
	beforeDealTbar:function(tbar){},
	afterDealTbar:function(tbar){},
	dealTbar:function(){
		var me =this;
		this.beforeDealTbar(me.tbar);
		Ext.each(this.tbar,function(btn){
			if(typeof btn.handler==="function"){
				btn.listeners=btn.listeners||{};
				btn.listeners.click = {
					fn:btn.handler,
					scope:me
				}
				delete btn.handler;
			}
		});
		this.afterDealTbar(me.tbar);
	},
	createGrid:function(gridCfg){
		var loadUrl = gridCfg.loadUrl;
		var header = gridCfg.header;
		var fields = gridCfg.fields;
		var grid = getGrid(loadUrl, header, fields, true, true);
		return grid;
	},
	beforeCreateFilter:function(){
		
	},
	createFilter:function(filterCfg){
		this.filterCfg = Ext.apply({
			title:"查询区",
			layout : {
				type : 'table',
				columns : 4
			},
			columns:3,
			height:70,
			bodyPadding :8,
			region:"north"
		},this.filterCfg)
		if(Ext.isArray(filterCfg)){
			filterCfg={
				items:filterCfg
			}
		}
		Ext.apply(this.filterCfg,filterCfg);
		this.beforeCreateFilter(this.filterCfg);
		var panel = new Ext.Panel(this.filterCfg);
		return panel;
	},
	info:function(msg,delay){
		var me = this;
		var mW=250;
		var mH=100;
		var aW = me.getWidth();
		var x = (aW-mW)/2;
			x=x<0?0:x;		
		delay = delay||1500;
		new Ext.tip.ToolTip({
			//target: me.el,	
			dismissDelay :delay,
			autoShow:true,
			autoDestroy:true,
			minWidth:mW,
			maxWidth:mW,
			minHeight:mH,
			autoHide:true,
			listeners:{				
				beforehide:function(sender){
					sender.destroy();
				}
			},
			html:["<div>",
				"<p><strong>提示：</strong></p>",
				"<p>　　"+msg+"</p>",
			"</div>"].join("")
		}).animate({
			duration:200 ,
			from:{
				x:x,
				y:-1*mH
			},
			to:{
				x:x,
				y:5
			}
		});
	},
	alert:function(msg){
		Ext.Msg.alert("提示",""+msg);
	},
	getCmp:function(id){
		return this.queryById(id);
	},
	setDisabled:function(ids,isDisable){
		if(isDisable ===false){
			isDisable=false;
		}else{
			isDisable=true;
		}
		var me = this;
		var cmpIdAry= ids.split(",");
		Ext.each(cmpIdAry,function(id){
			me.getCmp(id).setDisabled(isDisable);
		});
	}
});
Ext.define("pb.QueryViewPort",{
	alias : 'widget.queryviewport',
	layout:"fit",
	extend:"Ext.Viewport",
	constructor:function(xtype,options){
		this.mainPanel = Ext.create(xtype,options); 
		this.items=[this.mainPanel];
		this.callParent();
	}
});