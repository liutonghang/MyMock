<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    <title>工资卡变更回单查询</title>
    <%@ include file="common/meta.jsp"%>
	<%@ include file="common/scripts.jsp"%>
	<script type="text/javascript" src="<%=path%>/js/VoucherForm.js"></script>

  </head>
   <script type="text/javascript">
   		// 用户所在区县和财政信息
   		/*var regionAdmdiv = ${userAdmdivCodeMap};*/
   		// 当前页面查询视图别名
   		//var queryViewAliasName = "prCardChangeSendView";
   		// 当前页面查询视图包路径
   		//var queryViewClassPath="pb.view.pay.PrCardChangeSendView";
   		// 当前jsp名称
   		//var jspName = "OffiCardChangeSend";
   		var controllers = [ 'pay.PrCardChangeSendController' ];
		var mainView = {
				xtype : 'prCardChangeSendList'
			};
   </script>
  <body></body>
 
</html>
