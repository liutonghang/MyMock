/***
 * controller 
 */
Ext.define('pb.controller.user.UserController', {
	extend : 'Ext.app.Controller',
	stores : [ 'user.UserStore','common.MenuStatus','common.TaskLog'],
	models : [ 'user.UserModel' ],
	views : ['user.UserGrid','user.UserButton','user.UserQuery'],
	init:function(){
		this.control({
			'userGrid' :{
				itemdblclick: console.log('111')
			}
		});
	}
});