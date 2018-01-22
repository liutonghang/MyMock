<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    
    <title>清算账户维护界面(省分行)</title>
    
	<%@ include file="common/meta.jsp"%>
	<%@ include file="common/scripts.jsp"%>
	<script type="text/javascript" src="<%=path%>/resources/js/ChooseAdmdivAndBank.js"></script>
	<script type="text/javascript" src="<%=path%>/resources/js/Common_Validate.js"></script>
	<script type="text/javascript" src="<%=path%>/resources/js/AccountOfAdmRealProvince.js"></script>
	<script type="text/javascript" src="<%=path%>/resources/js/Account_Del.js"></script>
	<script type="text/javascript" src="/realware/js/util/StatusUtil.js"></script>
<script type="text/javascript" src="/realware/js/util/PageUtil.js"></script>
	
	
  </head>
  
  <body>
    <script type="text/javascript">
	var comboAdmdiv =  Ext.create('Ext.data.Store', {
			fields : ['admdiv_code', 'admdiv_name'],
			data : ${admList}
		});
	var heights = document.body.clientHeight;
   </script>
  </body>
</html>
