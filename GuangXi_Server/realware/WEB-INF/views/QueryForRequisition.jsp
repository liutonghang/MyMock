<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>
	

		<title>缴库通知单查询</title>

		   <%@ include file="common/meta.jsp"%>
	       <%@ include file="common/scripts.jsp"%>
		<script type="text/javascript" src="<%=path%>/nontax/QueryForRequisition.js"></script>
	</head>
	<script type="text/javascript">
		var loadUrl = "<%=path%>/loadReceipt.do";
		var vt_code = "5671";
		
		var comboVoucherStatus = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
				"name" : "全部",
				"value" : ""
			}, {
				"name" : "银行未发送",
				"value" : "14"
			}, {
				"name" : "人行未接收",
				"value" : "0"
			}, {
				"name" : "人行接收成功",
				"value" : "1"
			}, {
				"name" : "人行接收失败",
				"value" : "2"
			}, {
				"name" : "人行签收成功",
				"value" : "3"
			}, {
				"name" : "人行签收失败",
				"value" : "4"
			}, {
				"name" : "人行已退回",
				"value" : "5"
			},{
				"name" : "已收到人行回单",
				"value" : "12"
			}]	
		});
		
   </script>
	<body></body>
</html>
