<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>
		<title>单位零余额未维护的凭证</title>

		<%@ include file="common/meta.jsp"%>
		<%@ include file="common/scripts.jsp"%>
		<script type="text/javascript" src="<%=path%>/js/VoucherForm.js"></script>
	</head>
	<script type="text/javascript">
		var is_onlyreq = 0;
		var controllers = [ 'pay.PayVouchers2','pay.ForwardVouchers' ];
		var mainView = {
				xtype : 'investiVoucherList'
			};
   </script>
	<body id="body"></body>
</html>
