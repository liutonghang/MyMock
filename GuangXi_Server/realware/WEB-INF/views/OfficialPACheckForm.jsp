<%@ page language="java" pageEncoding="utf-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    <title>公务卡初审（授权行号补录）</title>
	 <%@ include file="common/meta.jsp"%>
	 <%@ include file="common/scripts.jsp"%>
	<script type="text/javascript" src="<%=path%>/resources/js/OfficialCheck.js"></script>
  </head>
  
  <body>
    <script type="text/javascript">
		var comboAdmdiv =  Ext.create('Ext.data.Store', {
			fields : ['admdiv_code', 'admdiv_name'],
			data : ${admList}
		});
		var loadUrl = "<%=path%>/loadPayVoucher.do";
		var backUrl = "<%=path%>/returnVoucher.do";
		var logUrl = "<%=path%>/loadTaskLog.do";
		var account_type_right = "12";
		var is_onlyreq = 1 ;
		var vtCode = "8202";
   </script>
  </body>
</html>
