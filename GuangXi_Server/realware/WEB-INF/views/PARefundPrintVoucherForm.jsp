<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    
    <title>授权支付凭证退款签章发送</title>
        <%@ include file="common/meta.jsp"%>
		<%@ include file="common/scripts.jsp"%>
		<script type="text/javascript" src="<%=path%>/js/VoucherForm.js"></script>
  </head>
  <script type="text/javascript">
		var loadUrl = "<%=path%>/loadPayVoucher.do";
		var logUrl = "<%=path%>/loadTaskLog.do";
		var signPayVoucherUrl = "<%=path%>/signAndSendPayVoucher.do";
		var account_type_right = "12";
		var controllers = [ 'pay.PayVouchers','pay.SignSendVouchers', 'common.TaskLog' ];
		var mainView = {
				xtype : 'signSendVoucherList'
			};
		//标记为退款
		var flowType = 1;
   </script>
  <body> </body>
</html>
