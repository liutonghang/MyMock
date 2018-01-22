Ext.define('pb.controller.userSignZeroNo.userSignZero',{
		extend : 'Ext.app.Controller',
		stores:['userSignZeroNo.UserSignZeroNoStore'],
		models:['userSignZeroNo.UserSignZeroNoModel'],		
		//当创建一个控件的时候需要在此引入
		requires : [ 'pb.view.userSignZeroNo.UserSignZeroNoButton','pb.view.userSignZeroNo.UserSignZeroNoQuery']

});