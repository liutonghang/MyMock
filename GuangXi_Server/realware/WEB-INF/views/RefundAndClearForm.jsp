<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">

<%
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>

<html>
	<head>
		<base href="<%=basePath%>">
		<title>垫款退款清算</title>
		<!-- ExtJS -->
		<link rel="stylesheet" type="text/css" href="<%=path%>/resources/css/ext-all.css">
		<link rel="stylesheet" type="text/css" href="<%=path%>/resources/css/button.css">
		<script type="text/javascript" src="<%=path%>/resources/js/ext-all-min.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/ext-lang-zh_CN.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/recommend.js"></script>
		<script type="text/javascript" src="<%=path%>/js/util/PageUtil.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/QueryPanel.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/AdvanceAndClearForm.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/RefundAndClearForm.js"></script>
	</head>
	<script type="text/javascript">
		var comboAdmdiv =  Ext.create('Ext.data.Store', {
			fields : ['admdiv_code', 'admdiv_name'],
			data : ${admList}
		});
		
		var comboAccountType =  Ext.create('Ext.data.Store', {
			fields : ['account_type_code', 'accont_type_name'],
			data : ${ifn:listToJson(advanceAccTypeList)}
		});	
				
		var loadUrl = "<%=path%>/loadClearPayVoucher.do"; 
		
		Ext.onReady(function(){
			Ext.create("pb.QueryViewPort","pb.RefundAndClearForm",{
				comboAdmdiv:comboAdmdiv,
				gridCfg:{
					loadUrl:loadUrl
				}
			}) ;		
		});
   </script>
	<body></body>
</html>
