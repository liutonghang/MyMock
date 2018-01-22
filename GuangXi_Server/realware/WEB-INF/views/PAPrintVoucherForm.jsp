<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>
		<title>授权支付凭证打印</title>

		<%@ include file="common/meta.jsp"%>
		<%@ include file="common/scripts.jsp"%>
		<script type="text/javascript" src="<%=path%>/js/VoucherForm.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/share/ocxVoucher.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/share/menuBtnStatus.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/share/gridPanel.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/share/json2String.js"></script>
	</head>
	<script type="text/javascript">
		var loadUrl = "<%=path%>/loadPayVoucher.do";
		var account_type_right = "12";
		var serverPrint = "<%=path%>/printVoucherForDB.do";
		var logUrl = "<%=path%>/loadTaskLog.do";
		var controllers = ['pay.PayVouchers','pay.PrintVouchers', 'common.TaskLog'];
		var mainView = {
				xtype : 'printVoucherList'
			};
   </script>
	<body></body>
</html>
