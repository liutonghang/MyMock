<%@ page language="java" pageEncoding="UTF-8"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">

<%
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>

<html>
	<head>
		<base href="<%=basePath%>">
		<title>非税收款账户维护</title>
		<!-- ExtJS -->
		<link rel="stylesheet" type="text/css" href="<%=path%>/resources/css/ext-all.css">
		<link rel="stylesheet" type="text/css" href="<%=path%>/resources/css/button.css">
		<script type="text/javascript" src="<%=path%>/resources/js/ext-all-min.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/ext-lang-zh_CN.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/ux/TreePicker.js"></script>
		
		<script type="text/javascript" src="<%=path%>/resources/js/share/menuBtnStatus.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/share/gridPanel.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/share/json2String.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/share/EleTreePicker.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/Common_Validate.js"></script>
		<script type="text/javascript" src="<%=path%>/js/view/common/AccountGrid.js"></script>
		
		<script type="text/javascript" src="<%=path%>/resources/js/ZeroAccountManage.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/QueryBalance.js"></script>
		
	</head>
	<script type="text/javascript">
		var comboAdmdiv =  Ext.create('Ext.data.Store', {
			fields : ['admdiv_code', 'admdiv_name'],
			data : ${admList}
		});
		var accountTypes = ["56"];   //银行代收账户
		var accountType = 56;
		var hidColumns = ['fund_type_code', 'pay_type_code', 'agency_code', 
		                  'agency_name', 'is_samebank','is_pbc', 
		                  'bank_code','bank_no'];
		
   </script>
	<body></body>
</html>
