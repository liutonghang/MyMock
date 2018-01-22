<%@ page language="java" pageEncoding="UTF-8"%>
<%
	String path = request.getContextPath();  
	String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head> 
		<base href="<%=basePath%>">
		<title>自助柜面-零余额</title>
		
		<link rel="stylesheet" type="text/css" href="<%=path%>/resources/css/ext-all.css">
		<link rel="stylesheet" type="text/css" href="<%=path%>/resources/css/button.css">
		<script type="text/javascript" src="<%=path%>/resources/js/ext-all-min.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/ext-lang-zh_CN.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/SignUserFormBOC.js"></script>
		<%--<script type="text/javascript" src="<%=path%>/resources/js/BuffetUserForSign.js"></script> --%>
		<style media=print type="text/css">  
			.noprint{visibility:hidden}  
			.noprint{display:none}
			.print{display:block}
		</style>   
	</head>
	<script type="text/javascript">
		var loadUrl = "<%=path%>/loadAutoSignAccounts.do";
	   </script> 
	<body >
		<iframe id="printiframe" name="printifame" src="<%=path%>/print.do" style="width:0px;height:0px;">
		</iframe>
		<object classid="CLSID:F1426A09-9A2B-4330-A4D1-CC89B3D132DB" codebase="<%=path %>/load/FpDevice.dll" id="fpDevObj" height=0 width=0></object>
		
	</body>
</html>
