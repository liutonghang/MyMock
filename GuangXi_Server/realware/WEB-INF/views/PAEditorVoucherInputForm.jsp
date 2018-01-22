<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>
		<title>授权支付凭证初审（行号补录）</title>

		<%@ include file="common/meta.jsp"%>
		<%@ include file="common/scripts.jsp"%>
		<script type="text/javascript" src="<%=path%>/js/VoucherForm.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/share/json2String.js"></script>
	</head>
	<script type="text/javascript">
		var accountType = '22';
		var controllers = [ 'pay.PayVouchers','pay.EditorVouchers','common.ElementTreeInput' ];
		var mainView = {
				xtype : 'editorVoucherList'
			};
   </script>
	<body></body>
</html>
