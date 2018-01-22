<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>

		<title>直接支付凭证退款录入</title>

		<%@ include file="common/meta.jsp"%>
		<%@ include file="common/scripts.jsp"%>
		<script type="text/javascript" src="<%=path%>/js/VoucherForm.js"></script>
	</head>
	<script type="text/javascript">
		var bank_id = "${session.belongOrgId}";
		var payType= 0;
		var controllers = [ 'pay.PayVouchers','pay.RefundVoucherInputs', 'common.TaskLog' ];
		var mainView = {
				xtype : 'refundVoucherInputList'
			};
   </script>
	<body>
	</body>
</html>
