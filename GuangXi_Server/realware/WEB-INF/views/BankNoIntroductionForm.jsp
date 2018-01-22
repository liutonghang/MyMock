<%@ page language="java" pageEncoding="UTF-8"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">

<%
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>

<html>
	<head>
		<base href="<%=basePath%>">
		<title>行号导入</title>
		<!-- ExtJS -->
		<link rel="stylesheet" type="text/css" href="<%=path%>/resources/css/ext-all.css">
		<link rel="stylesheet" type="text/css" href="<%=path%>/resources/css/button.css">
		<script type="text/javascript" src="<%=path%>/resources/js/ext-all-min.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/ext-lang-zh_CN.js"></script>		
		<script type="text/javascript" src="<%=path%>/resources/js/share/menuBtnStatus.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/share/gridPanel.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/share/json2String.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/Common_Validate.js"></script>
		<script type="text/javascript" src="<%=path%>/js/view/common/BankNoIntroductionGrid.js"></script>		
		<script type="text/javascript" src="<%=path%>/resources/js/BankNoIntroductionManage.js"></script>		
	</head>
	<script type="text/javascript">
		var loadUrl="<%=path %>/loadBankNo.do";
		var addUrl="<%=path %>/addBankNo.do";
		var updateUrl="<%=path %>/updateBankNo.do";
		var getUrl="<%=path %>/getBankNo.do";
		var delUrl="<%=path %>/delBankNo.do";
		var exportUrl="<%=path %>/exportBankNo.do";
		var importUrl="<%=path %>/importBankNo.do";	 
   </script>
	<body></body>
</html>
