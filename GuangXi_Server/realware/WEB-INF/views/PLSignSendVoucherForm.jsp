<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>
		<title>直接支付回单签章发送</title>

		<%@ include file="common/meta.jsp"%>
		<%@ include file="common/scripts.jsp"%>
		<script type="text/javascript" src="<%=path%>/js/VoucherForm.js"></script>
	</head>
	<script type="text/javascript">
		var loadUrl = "<%=path%>/loadPayVoucher.do";
		var signPayVoucherUrl = "<%=path%>/signAndSendPayVoucher.do";
		var logUrl="<%=path%>/loadTaskLog.do";
		var account_type_right = "11";
		var hiddenVoucherStatus = true;
		var controllers = [ 'pay.PayVouchers','pay.SignSendVouchers', 'common.TaskLog' ];
		var mainView = {
				xtype : 'signSendVoucherList'
			};
		//标记为支付
		var flowType = 0;
   </script>
	<body></body>
</html>
