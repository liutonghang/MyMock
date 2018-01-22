<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>
		<title>直接支付凭证查询</title>

		<%@ include file="common/meta.jsp"%>
		<%@ include file="common/scripts.jsp"%>
		<script type="text/javascript" src="<%=path%>/js/VoucherForm.js"></script>
	</head>
	<script type="text/javascript">
						
		var mainView = {
					xtype : 'queryVoucherList',
					shrinkWrap : 0,
					config : _menu || {},
					hiddenvoustatus : false,
					hiddenstate : false,
					hiddenstateCash : true,
					valuename :'全部',
					valuenameCash : '全部'
					};			
		var controllers = [ 'pay.PayVouchers', 'pay.QueryVouchers' ];
	</script>
	<body></body>
</html>
