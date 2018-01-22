<%@ page language="java" pageEncoding="UTF-8"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">

<%
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>

<html>
 	<head>
		<base href="<%=basePath%>">
		<title>代理银行垫支户、划款户维护</title>
		<!-- ExtJS -->
		<link rel="stylesheet" type="text/css" href="<%=path%>/resources/css/ext-all.css">
		<link rel="stylesheet" type="text/css" href="<%=path%>/resources/css/button.css">
		<script type="text/javascript" src="<%=path%>/resources/js/ext-all-min.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/ext-lang-zh_CN.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/AccountOfAdvanceAndAgent.js"></script>
		<script type="text/javascript" src="/realware/resources/js/QueryBalance.js"></script>
	</head>
	<script type="text/javascript">
		var comboAdmdiv =  Ext.create('Ext.data.Store', {
			fields : ['admdiv_code', 'admdiv_name'],
			data : ${admList}
		});
		var loadPbParameterUrl = "<%=path%>/getAccountPbParameter.do";
		var loadDataUrl = "<%=path%>/loadAdvanceAndAgentAccount.do";
		var saveDataUrl = "<%=path%>/saveAdvanceAndAgentAccount.do";
		var account_type_code = 21;
   </script>
	<body>
	</body>
</html>
