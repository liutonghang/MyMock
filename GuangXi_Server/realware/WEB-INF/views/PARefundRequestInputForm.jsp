<%@ page language="java" pageEncoding="UTF-8"%>
<%
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>
		<base href="<%=basePath%>">

		<title>授权支付退款申请录入</title>

		<meta http-equiv="pragma" content="no-cache">
		<meta http-equiv="cache-control" content="no-cache">
		<meta http-equiv="expires" content="0">
		<meta http-equiv="keywords" content="keyword1,keyword2,keyword3">
		<meta http-equiv="description" content="This is my page">
		<!-- ExtJS -->
		<link rel="stylesheet" type="text/css" href="<%=path%>/resources/css/ext-all.css">
		<link rel="stylesheet" type="text/css" href="<%=path%>/resources/css/button.css">
		<script type="text/javascript" src="<%=path%>/resources/js/ext-all-min.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/ext-lang-zh_CN.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/RefundRequestInput.js"></script>
	</head>
	<script type="text/javascript">
	   	var comboAdmdiv =  Ext.create('Ext.data.Store', {
			fields : ['admdiv_code', 'admdiv_name'],
			data : ${admList}
		});
		var signRefReqUrl = "<%=path%>/signAndSendRefReqVoucher.do";
		var loadUrl = "<%=path%>/loadRefReqVoucher.do";
		var logUrl = "<%=path%>/loadTaskLog.do";
		var serverPrint = "<%=path%>/printVoucherForDB.do";
		var refReqVtcode = "2252";  //退款申请类型
		var vtCode = "8202";   //原直接支付凭证类型
		var payTypeCode = "12";
		var payType= 1;
		var account_type_right = "12";
   </script>
	<body>
	</body>
</html>
