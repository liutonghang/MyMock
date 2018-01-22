<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>

    
    <title>用户角色授权</title>
    <%@ include file="common/meta.jsp"%>
	<%@ include file="common/scripts.jsp"%>
    
	<script type="text/javascript" src="<%=path%>/resources/js/RoleAuthorizationAdmin.js"></script>
	<script type="text/javascript">
		var loadUrl = "<%=path%>/loadOperator.do";
	</script>
  </head>
  <body>
  <script type="text/javascript">
  	var heights = document.body.clientHeight;
  </script>
  </body>
</html>
