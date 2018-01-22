<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>
		<title>批量授权支付凭证处理</title>

		<%@ include file="common/meta.jsp"%>
		<%@ include file="common/scripts.jsp"%>
		<script type="text/javascript" src="<%=path%>/resources/js/share/backVoucher.js"></script>
		<script type="text/javascript" src="<%=path%>/js/VoucherForm.js"></script>
	</head>
	<script type="text/javascript">
			var controllers = [ 'pay.PLBatchPayVoucherRequests','pay.PLBatchPayVoucherTransfer' ];
			var mainView = {
				xtype : 'PLbatchPayVoucherTransferList'
				};
	</script>
	<body></body>
</html>
