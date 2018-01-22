<%
	if (session.getAttribute("userInfo") == null) {
		response.sendRedirect("/realware/login.do");
	}
%>