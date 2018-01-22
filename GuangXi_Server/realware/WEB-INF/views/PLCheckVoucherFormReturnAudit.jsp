<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    <title>直接支付凭证初审（行号补录）退票初审</title>
    
    	<%@ include file="common/meta.jsp"%>
		<%@ include file="common/scripts.jsp"%>
	<script type="text/javascript" src="<%=path%>/js/VoucherForm.js"></script>
	</head>
 	<script type="text/javascript">
		var loadUrl = "<%=path%>/loadPayVoucher.do";
		var loadVoucherWithBankNoUrl = "<%=path%>/loadPayVoucherWithBankNo.do";
		var backUrl = "<%=path%>/auditReturnVoucher.do";
		var logUrl = "<%=path%>/loadTaskLog.do";
		var vtCode = "5201";   //直接支付凭证类型
		var account_type_right = "11";  //财政零余额
		var is_onlyreq = 0;
		var controllers = [ 'pay.PLPayVouchers','pay.CheckVouchersHunanBOC' ];
		var mainView = {
				xtype : 'checkVoucherListHunanBOC'
			};
   </script>
  <body></body>
</html>