<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    <title>短信用户信息签约</title>
    
	<%@ include file="common/meta.jsp"%>
	<%@ include file="common/scripts.jsp"%>
	<script type="text/javascript" src="<%=path%>/js/VoucherForm.js"></script>
  </head>
   <script type="text/javascript">
        var paperstore = Ext.create('Ext.data.Store', {
							fields : ['name', 'value'],
							data : [{
									"name" : "身份证",
									"value" : "1"
								}, {
									"name" : "士官证",
									"value" : "2"
								}, {
									"name" : "驾照",
									"value" : "3"
								}]
		           	     });
		var loadUrl = "<%=path%>/loadPayVoucher.do";
		var controllers = [ 'common.UserMessageController'];
		var mainView = {
				xtype : 'userMsgList'
			};
   </script>
  <body></body>
 
</html>