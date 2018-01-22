/**
 * 自助柜面 -controller
 */
Ext.define('pb.controller.userSignZeroNo.UserSignZeroNo',{
	extend:'Ext.app.Controller',
	stores:['userSignZeroNo.UserSignZeroNoStore', 'common.PageStatus' ,'common.MenuStatus' ],
 	models:['userSignZeroNo.UserSignZeroNoModel'],
 	requires:['view.userSignZeroNo.UserSignZeroNoButton','pb.view.userSignZeroNo.UserSignZeroNoQuery'],
	refs:[{
		ref:'query',
		selector:'userSignZeroNoQuery'
	}],
	onSelect :true,
	init: function(){
		this.control({
			//界面
			  'viewport':{
			 	render:   this.onPageRender
			  } ,
			// 状态选择
			'userSignZeroNoQuery combo[id=taskState]' :{
				select : function(combo,records,eOpts){
					if(this.oneSelect){
						this.oneSelect = false;
					}else{
						Ext.PageUtil.selectGridPanel(records[0].get('status_id'),this.getList());
					}
					this.selectState(records[0].get('status_code'));
				}
			},
			// 新增
			'userSignZeroNoButton button[id=addZero]' :{
			//	click: 
				click : this.addzero

	
			},
			// 生效
			'userSignZeroNoButton button[id=effButton]' :{
			//	click:
			},
			// 注销
			'userSignZeroNoButton button[id=logOff]' :{
			//	click:
			},
			// 重置密码
			'userSignZeroNoButton button[id=resetPass]' :{
			//	click:
			},
			// 打印
			'userSignZeroNoButton button[id=printButton]' :{
			//	click:
			},
			// 刷新
			'userSignZeroNoButton button[id=refreshButton]' :{
				click: this.refreshData
			} 
		});
	},
 
	/**
	 * 状态选择 
	 */
	selectState:function(status_code){
		if('001' == status_code){
			alert('未生效');
		}
		if('002' == status_code){
			alert('已生效');
		}
		if('003' == status_code){
			alert('已注销');
		}
		this.getStore('userSignZeroNo.UserSignZeroNoStore').loadPage(1);
	},
	/**
	 * 刷新
	 */
	refreshData : function(){
		this.getStore('userSignZeroNo.UserSignZeroNoStore').loadPage(1);
	},
	
	/**
	 * 绘制界面
	 */
	onPageRender : function() {
		
		var panel = Ext.ComponentQuery.query('viewport > panel')[0];
		var pageStore = this.getStore('common.PageStatus');
		
		//加载当前菜单的配置信息
		if (pageStore.getCount() > 0) {
			//1、获取当前页面的状态集合和按钮集合
			var statusList = pageStore.getAt(0).raw.statusList;
			var btnList = pageStore.getAt(0).raw.buttonList;
			
			alert('绘制界面 '+pageStore.getCount()+'状态集合'+statusList.length+'按钮集合'+btnList.length);
			
			//2、按钮区划过滤并设置
			if (btnList.length > 0) {
				var buttons = [];
				Ext.Array.findBy(btnList, function(b) {  
						buttons.push(b);	  
				});
				
				Ext.Array.findBy(buttons, function(b) {
					Ext.getCmp(b.button_id).setVisible(b.visible == 1 ? true : false);
					Ext.getCmp(b.button_id).setText(b.button_name); 
				});
			}
		}
	 
		 
	},
	addzero :function(){
		
	}
	
});