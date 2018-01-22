/**表格扩展类
 * @author liHongbiao
 * @date 2015-05-12
 * @example
 * Ext.create("pb.view.common.GridPanel",{
 * 		//父类的配置信息
 * 		selType:"",selModel:"",...,
 * 		store:
 * 		columns:
 * 		//扩展配置信息:dataUrl,fields用于生成store,如果配置了fields和dataUrl就不用配置stroe属性
 * 		dataUrl:"",
 * 		fields:"",
 * 		//扩展配置信息:headers用于生成表格的columns属性，如果配置了headers就不用配置columns
 * 		headers:"",
 * 		//扩展配置信息:pageCfg用于生成分页工具栏,默认没有分页栏
 * 		pageCfg:false/true/{pageSize:25,pageList : [25, 50, 100]}
 * 		//扩展配置方法：beforeCreateCol当配置headers时,配置此方法，扩展列的配置信息
 * 		beforeCreateCol:function(dataIndex,column){
 * 			if(dataIndex=="id"){
 * 				column.hidden=true;//隐藏此列
 * 			}
 * 		},
 *     //扩展配置方法：autoLoad是否自动加载数据，默认为false
 * 		autoLoadData:false
 * });
 * 
 */
Ext.define("pb.view.common.GridPanel",{
	extend:"Ext.grid.Panel",
	alias: ['widget.pbgrid'],
	title:"",
//	emptyText:"没有数据........",
	pageCfg:false,
	plugins:[],
	border:false,
	autoLoadData:false,
	selType : 'checkboxmodel',
	selModel:{
		mode : 'multi',
		checkOnly : true
	},
	features: [{
		ftype: 'summary'
	}],
	editCfg:false,
	constructor:function(cfg){
		Ext.apply(this,cfg);
		/**
		 * cfg={
		 * 	   dataUrl:""	
		 *     fields:[],
		 *     
		 *     headers:"",
		 *     store:[],
		 *     pageCfg:{
		 *     		pageSize : 25,
		 *     		pageList : [25, 50, 100],
		 *     },
		 *     selType:"rowmodel",
		 *     selModel:{
		 *     
		 *     },
		 *     editCfg:{
		 *     		type:"cellediting",
		 *     		clicksToEdit:1
		 *     }
		 * }
		 */
		this.createStore();
		this.createColModel();
		this.createPaging();
		this.createEditor(this.editCfg);
		this.callParent(arguments);
		if(this.autoLoadData){
			this.on("afterrender",function(sender){
				sender.getStore().loadPage(1);
			});
		}
	},
	createEditor:function(editCfg){
		if(!editCfg)return;
		var allEditCfg={
			"rowediting":{
				editType:"Ext.grid.plugin.RowEditing",
				clicksToEdit:2,
				saveBtnText:"保存",
				autoCancel: false,  
				cancelBtnText:"取消",
				errorsText:"提示",
				cancelEdit : function(grid) {
					if (this.editing) {
						this.getEditor().cancelEdit();
					}
				},
				errorSummary:false
			},
			cellediting:{
				editType:"Ext.grid.plugin.CellEditing",
				clicksToEdit:1
			}
		}
		if(typeof editCfg=="object"){
		}else {
			editCfg = allEditCfg[editCfg]||allEditCfg["rowediting"];
			
		}
		this.plugins.push(Ext.create(editCfg.editType,editCfg));
	},
	beforeCreateCol:function(dataIndex,column){
		
	},
	createColModel:function(){
		if(this.columns) return;
		var me  = this;
		var colAry = this.headers.split(",");
		var columns=[{xtype:'rownumberer',width:30,locked:true}];
		Ext.each(colAry,function(colStr,i){
			//colStr="列名称|dataIndex|width|xtype"
			var colCfg = colStr.split("|");
			var colXtype = colCfg[3]||"gridcolumn";
			var tempCol ={
				id:colCfg[1],
				text:colCfg[0],
				dataIndex:colCfg[1],
				width:parseInt(colCfg[2])||100,
				xtype:colXtype
			};
			if(colXtype=="numbercolumn"){
				tempCol.align="right";
				tempCol.format="0,0.00";
				tempCol.summaryType="sum";
				tempCol.summaryRenderer = function(value, summaryData, dataIndex) {  
					return value=='0.00'?'': '小计:' + Ext.util.Format.number(value,'0,0.00');
				}
			}
			if(colXtype.indexOf("actioncolumn_")==0){
			}
			me.beforeCreateCol(tempCol.dataIndex, tempCol);
			columns.push(tempCol);
		});
		this.columns = columns;
		return columns;
	},
	createStore:function(){
		if(this.store) return;
		
		var store =  new Ext.data.JsonStore({
			proxy : {
				type : 'ajax',
				url : this.dataUrl,
				actionMethods : {
					read : 'POST'
				},
				reader : {
					type : 'json',
					root : 'root',
					totalProperty : 'pageCount'
				}
			},
			remoteSort : true, // 客户端排序
			fields : this.fields,
			autoLoad : false
		});
		this.store = store;
	},
	createPaging:function(){
		if(!this.pageCfg){
			return;
		};
		var me = this;
		this.pageCfg = Ext.apply({
			store : me.store,
			frame : false,
			resizable : false,
			shrinkWrap : 1,
			displayInfo : true,
			displayMsg : '显示第{0}条到{1}条记录 ，一共{2}条',
			emptyMsg : "没有记录",
			pageSize : 25,
			pageList : [25, 50, 100],
			items:[{
				xtype:"combo",
				editable:false,
				value:25, 
				width:55,
				store:{
					fields:["value","item"],
					data:[{value:25,item:25},{value:50,item:50},{value:100,item:100}]
				},
				displayField:"item",
				valueField:"value",
				listeners:{
					change:function(sender,value){
						me.store.pageSize = value;
						me.store.loadPage(1);
					}
				}
			}]
		},this.pageCfg);
		
		var me =this;
		var pagetool = Ext.create("Ext.toolbar.Paging",this.pageCfg);
		pagetool.child('#refresh').hide(true);
		this.bbar = pagetool;
		return pagetool ; 
	},
	getHeaderAtIndex:function(index){
		return this.headerCt.getHeaderAtIndex(index);
	},
	getColById:function(id){
		if(!id)return null;
		var columns = this.headerCt.getGridColumns();
		for(var i=0;i<columns.length;i++){
			var tempCol = columns[i];
			if(tempCol.id==id||tempCol.dataIndex==id){
				return tempCol;
			}
		}
		return null;
	},
	moveCol:function(col,toIndex){
		if(typeof col==="string"){
			col = this.getColById(col);
			if(!col){
				return;
			}
		}
		var fromIndex = col.getIndex();
		if(fromIndex!=toIndex){ 
			col.up("headercontainer").moveHeader(fromIndex,toIndex);
		}
	},
	hideColumns:function(colIds){
		if(!colIds)return;
		var colIdAry = colIds.split(",");
		for(var i=0;i<colIdAry.length;i++){
			var tempColId =colIdAry[i];
			if(tempColId ){
				var tempColCmp = this.getColById(tempColId);
				if(tempColCmp ){
					tempColCmp.hide();
				}
			}
		}
	},
	showColumns:function(colIds){
		if(!colIds)return;
		var colIdAry = colIds.split(",");
		for(var i=0;i<colIdAry.length;i++){
			var tempColId =colIdAry[i];
			if(tempColId ){
				var tempColCmp = this.getColById(tempColId);
				if(tempColCmp ){
					tempColCmp.show();
				}
			}
		}
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
		var recs = this.getSelectionModel().getSelection();
		return recs;
	} 
});