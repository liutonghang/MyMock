<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<%
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    <base href="<%=basePath%>">
    
    <title>用户维护界面</title>
    
	<meta http-equiv="pragma" content="no-cache">
	<meta http-equiv="cache-control" content="no-cache">
	<meta http-equiv="expires" content="0">    
	<meta http-equiv="keywords" content="keyword1,keyword2,keyword3">
	<meta http-equiv="description" content="This is my page">
	
	<link rel="stylesheet" type="text/css" href="<%=path%>/resources/css/ext-all.css">
	<link rel="stylesheet" type="text/css" href="<%=path%>/resources/css/button.css">
	<script type="text/javascript" src="<%=path%>/resources/js/ext-all-min.js"></script>
	<script type="text/javascript" src="<%=path%>/resources/js/ext-lang-zh_CN.js"></script>
	<script type="text/javascript" src="<%=path%>/resources/js/ChooseAdmdivAndBank.js"></script>
	<script type="text/javascript" src="<%=path%>/resources/js/Common_Validate.js"></script>
	<script type="text/javascript" src="<%=path%>/resources/js/AgentSponsor.js"></script>
	<script type="text/javascript" src="<%=path%>/resources/js/QueryBalance.js"></script>
	
  </head>
  
  <body>
    <script type="text/javascript">
	var comboAdmdiv =  Ext.create('Ext.data.Store', {
			fields : ['admdiv_code', 'admdiv_name','admdiv_code_name','manager_bank_code','manager_bank_name','manager_bank_id'],
			data : ${admList}
		});
	var loadUrl = "<%=path%>/loadAgentAccountSenior.do";
	var comboFundType = Ext.create('Ext.data.Store', {
			fields : ['code', 'name'],
			proxy : {					
					type : 'ajax',
					url : '/realware/loadElementValue.do',
					reader : {
						type : 'json'
					}
				},
			autoload : false,
			listeners:{  
            	single: true
         }  
		});
		var comboAccountType =  Ext.create('Ext.data.Store', {
			fields : ['account_type_code', 'accont_type_name'],
			data : ${ifn:listToJson(agentAccTypeList)}
		});
   </script>
  </body>
</html>