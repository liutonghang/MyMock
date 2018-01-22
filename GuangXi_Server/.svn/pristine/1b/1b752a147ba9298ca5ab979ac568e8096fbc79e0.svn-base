<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    <base href="<%=basePath%>">
    
    <title>授权支付复核转账（广西农行）</title>
    
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
	<script type="text/javascript" src="<%=path%>/gx_js/TransferVoucherNoReqMonForGXABCByElectron2.js"></script>

  </head>
  <script type="text/javascript">
		Ext.require(["Ext.grid.*", "Ext.data.*"]);
		var specialFundsNo = ${specialFundsNo};
		var comboAdmdiv =  Ext.create('Ext.data.Store', {
			fields : ['admdiv_code', 'admdiv_name'],
			data : ${admList}
		});
		var loadUrl = "<%=path%>/loadPayVoucher.do";
		var backUrlFin = "<%=path%>/returnVoucher.do";
		var logUrl = "<%=path%>/loadTaskLog.do";
		var vtCode = "8202";   //授权支付凭证类型
		var account_type_right = "12";
		var first = false;
		
   </script>
  <body>
  </body>
</html>
