<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">

<%
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>

<html>
  <head>
    <base href="<%=basePath%>">
    
    <title>垫支户（主办行）</title>
    
		<!-- ExtJS -->
		<link rel="stylesheet" type="text/css" href="<%=path%>/resources/css/ext-all.css">
		<link rel="stylesheet" type="text/css" href="<%=path%>/resources/css/button.css">
		<script type="text/javascript" src="<%=path%>/resources/js/ext-all-min.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/ext-lang-zh_CN.js"></script>	
		<script type="text/javascript" src="<%=path%>/resources/js/ChooseAdmdivAndBank.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/AccountOfNetworkAavanceForm.js"></script>
  </head>

<body>
	<script type="text/javascript">
		var comboAdmdiv =  Ext.create('Ext.data.Store', {
				fields : ['admdiv_code', 'admdiv_name'],
				data : ${admList}
			});
		
		var comboAccountType =  Ext.create('Ext.data.Store', {
			fields : ['account_type_code', 'accont_type_name'],
			data : ${ifn:listToJson(advanceAccTypeList)}
		});
		
		//加载授权支付垫支户（主办行）
		var loadPayAdvance = "<%=path%>/loadAccreditAdvanceAccount.do";
		//保存修改后的数据
		var saveDataUrl = "<%=path%>/saveAdvanceAndAgentAccountByBankcode.do";
		//导入账户的时候的url
		var importUrl="<%=path%>/importAccreditAdvanceAccount.do";
		
   </script>
</body>
</html>