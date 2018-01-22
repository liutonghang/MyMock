<%@ page language="java" pageEncoding="UTF-8"%>
<%
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>
		<base href="<%=basePath%>">

		<title>支付凭证对账单生成</title>

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
       <script type="text/javascript" src="<%=path%>/resources/js/ReconciliationNextForm.js"></script>
	</head>
	<script type="text/javascript">
		var comboAdmdiv =  Ext.create('Ext.data.Store', {
			fields : ['admdiv_code', 'admdiv_name'],
			data : ${admList}
		});
		
		var comboVoucherType = Ext.create('Ext.data.Store',{
		    fields : ['voucher_name','vt_code'],
		    data : [{"vt_code":"5201","voucher_name":"直接支付"},{"vt_code":"8202","voucher_name":"授权支付"}]
		});
		
		var reconciliationFlag = Ext.create('Ext.data.Store',{
		    fields : ['reconciliation_name','reconciliation_code'],
		    data : [{"reconciliation_code":"0","reconciliation_name":"未对账"},{"reconciliation_code":"1","reconciliation_name":"对账成功"},{"reconciliation_code":"2","reconciliation_name":"对账失败"}]
		});
		
		var manualTransFlag = Ext.create('Ext.data.Store',{
		    fields : ['manualTrans_name','manualTrans_code'],
		    data : [{"manualTrans_name":"全部","manualTrans_code": null}, {"manualTrans_name":"是","manualTrans_code": 1}, {"manualTrans_name":"否","manualTrans_code":0}]
		});
		
		var loadUrl = "<%=path%>/queryhisSerialno.do";
		var checkDateUrl = "<%=path%>/checkhisSerialno.do";
		var loadDateURL="<%=path%>/loadIsYesterDay.do";
		var accountType = "21";
		var is_onlyreq = 0;
   </script>
	<body>
	</body>
</html>
