<%
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>
<base href="<%=basePath%>">
<!-- ExtJS -->
<link rel="stylesheet" type="text/css" href="<%=path%>/resources/ext-theme-classic/ext-theme-classic-all.css">
<link rel="stylesheet" type="text/css" href="<%=path%>/resources/css/button.css">
<script type="text/javascript" src="<%=path%>/resources/js/ext-all-min.js"></script>
<script type="text/javascript" src="<%=path%>/resources/js/ext-lang-zh_CN.js"></script>
<script type="text/javascript" src="<%=path%>/js/util/StatusUtil.js"></script>
<script type="text/javascript" src="<%=path%>/js/util/PageUtil.js"></script>
<c:if test="${not empty _menu.ref_js}" >
<script type="text/javascript" src="<%=path%>/${_menu.ref_js}.js"></script>
</c:if>
<script type="text/javascript">
	var _menu = ${ifn:objToJson(_menu)};
	var comboAdmdiv =  Ext.create('Ext.data.Store', {
		fields : ['admdiv_code', 'admdiv_name'],
		data : ${admList}
	});
	//页面加载、状态切换时是否加载数据
	var initialLoad = _menu.initialload === 1;
	//是否存在状态
	var isExistStatus = _menu.statusList && _menu.statusList.length > 0;
</script>