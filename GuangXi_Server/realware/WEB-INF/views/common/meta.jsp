<meta http-equiv="Cache-Control" content="no-store"/>
<meta http-equiv="Pragma" content="no-cache"/>
<meta http-equiv="Expires" content="0"/>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
<%
  //Forces caches to obtain a new copy of the page from the origin server  response.setHeader("Pragma","No-cache");
  response.setHeader("Cache-Control","no-cache");
  //Directs caches not to store the page under any circumstance
  response.setHeader("Cache-Control","no-store");
  //Causes the proxy cache to see the page as "stale"
  response.setDateHeader("Expires", 0);
  //HTTP 1.0 backward compatibility
  response.setHeader("Pragma","no-cache");
%>