<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>


<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>

    
    <title>授权支付凭证退款复核转账</title>
		<%@ include file="common/meta.jsp"%>
		<%@ include file="common/scripts.jsp"%>
	<script type="text/javascript" src="<%=path%>/js/VoucherForm.js"></script>
	<script type="text/javascript" src="<%=path%>/js/util/ReportUtil.js"></script>
	<script type="text/javascript" src="<%=path%>/resources/js/share/ocxVoucher.js"></script>
  </head>
  <script type="text/javascript">
  		var controllers = [ 'pay.PayVouchers','pay.RefundVoucherTranfers', 'common.TaskLog' ];
  		var mainView = {
				xtype : 'refundVoucherTransferList'
			};
  </script>
  <body>
  </body>
</html>