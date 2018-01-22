package grp.pb.branch.gxboc.web;

import grp.pt.bill.ConditionObj;
import grp.pt.bill.Paging;
import grp.pt.bill.ReturnPage;
import grp.pt.database.sql.SimpleQuery;
import grp.pt.pb.checkvoucher.CheckVoucher;
import grp.pt.pb.checkvoucher.CheckVoucherMain;
import grp.pt.pb.checkvoucher.ICheckVoucherService;
import grp.pt.pb.common.IBankAccountService;
import grp.pt.pb.common.INetworkService;
import grp.pt.pb.common.IPbCommonService;
import grp.pt.pb.common.IPbConfigService;
import grp.pt.pb.common.IPbLogService;
import grp.pt.pb.report.ReportService;
import grp.pt.pb.util.BillUtils;
import grp.pt.pb.util.GenXmlData;
import grp.pt.pb.util.JsonUtil;
import grp.pt.pb.util.PayConstant;
import grp.pt.pb.util.PbUtil;
import grp.pt.pb.web.RootController;
import grp.pt.util.DatabaseUtils;
import grp.pt.util.Parameters;
import grp.pt.util.PlatformUtils;
import grp.pt.util.StringUtil;
import grp.pt.util.model.Session;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONObject;

import org.apache.commons.beanutils.PropertyUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;


/**
 * 对账controller层
 * @author liutianlong
 *
 */
@Controller
public class GxCheckVoucherController extends RootController {
	
	private static Logger log = Logger.getLogger(GxCheckVoucherController.class);
	
	@Autowired
	ICheckVoucherService checkService;
	
	@Autowired
	private IPbCommonService commonService;
	
	@Autowired
	private ReportService reportService;
	
	@Autowired
	private IPbConfigService configService;
	
	// 日志
	@Autowired
	private IPbLogService logService;
	/**
	 * 获取对账主凭证
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping (value = "/loadCheckMain.do")
	public @ResponseBody Object loadCheckMain(HttpServletRequest request) {
		//会话
		Session sc = copySession(request);
		Paging page = parsePage(request);
		//过滤条件
		ConditionObj obj = convertConditionMap(sc, request);
		
		List<CheckVoucherMain> mains = checkService.loadCheckMainByObj(sc, obj);
		
		List<String> fieldNames = parseFieldNames(request, "filedNames");
		//访问业务层获取后台数据
		ReturnPage returnPage = new ReturnPage(mains, page);;
		return buildPageResult(returnPage, fieldNames);
	} 
	
	
	@RequestMapping(value = "/ocxVoucherDZ.do")
	public Object ocxVoucherDZ(HttpServletRequest request,
			HttpServletResponse response) {
		PrintWriter writer = null;
		try {
			response.setContentType("text/html;charset=UTF-8");
			writer = response.getWriter();
			Session session = (Session) request.getSession().getAttribute("session");
			Session sc = (Session)session.clone();
			String menuId = request.getParameter( PayConstant.MENU_ID ); 
			if( StringUtil.isNotEmpty(menuId) ){
				sc.setCurrMenuId(Integer.parseInt(menuId));
			}else{
				log.error(request.getRequestURI() + "没有菜单id");
			}
			long billTypeId = Long.parseLong(request.getParameter("billTypeId"));
			long[] ids = null;
			if (request.getParameter("ids") == null) {
				ids = new long[] { Long.parseLong(request.getParameter("id")) };
			} else {
				ids = JsonUtil.getLongArray4Json(request.getParameter("ids"));
			}
			boolean flag = Boolean.valueOf(request.getParameter("flag"));
			List<?> list = (List<?>) commonService.loadBillsByIds(sc,
					billTypeId, ids);
			StringBuffer difocxNos = new StringBuffer();
			StringBuffer samocxNos = new StringBuffer();
			String vt_code = (String)PropertyUtils.getProperty(list.get(0),"vt_code");
			//按照前台显示的通知单的顺序进行打印
			for (int i=0 ; i<ids.length ; i++){
				for (Object bill : list){
					Long id = (Long) PlatformUtils.getProperty(bill,"id");
					if(id==ids[i]){
						logService.saveSystemLogInfo(sc, "查看凭证",IPbLogService.PB_LOG_BUSINESS_MANAGER,String.valueOf(id));
						
						//ztl 2016年9月21日16:04:39 显示时，如果存在对账不符的，则显示对账结果不符凭证  0对账相符1对账不符-1未对账
						if("1".equals((String)PlatformUtils.getProperty(bill,"check_result"))){
							difocxNos.append((String) PlatformUtils.getProperty(bill,"back_voucher_no")).append(",");
							vt_code = (String) PlatformUtils.getProperty(bill,"back_vt_code");
						}
						if(difocxNos.length()>1){
							if(samocxNos.length()>1){
								samocxNos.delete(0, samocxNos.length()-1);
							}
						}else{
							samocxNos.append((String) PlatformUtils.getProperty(bill,"code")).append(",");
						}
						
					}
				}				
			}
			difocxNos = difocxNos.append(samocxNos);
			difocxNos.deleteCharAt(difocxNos.length()-1);
			HashMap<String, Object> strMap = new HashMap<String, Object>();
			strMap.put("evoucherUrl", configService.getClientEvoucherUrl(sc,flag));
			strMap.put("esatmpUrl", configService.getEstampUrl(sc));
			strMap.put("certID", "123");
			strMap.put("admivCode", PropertyUtils.getProperty(list.get(0),
					"admdiv_code"));
			strMap.put("year", PropertyUtils.getProperty(list.get(0), "year"));
			strMap.put("vtCode", vt_code);
			strMap.put("vouNos", difocxNos.toString());
//			String voucherNos = "";
//			for (Object o : list) {
//				
//				
//				voucherNos += PropertyUtils.getProperty(o, "code") + ",";
//			}
//			strMap.put("vouNos", voucherNos.substring(0,
//					voucherNos.length() - 1));
			JSONObject o = JSONObject.fromObject(strMap);
			writer.write(o.toString());
		} catch (Exception e) { 
			log.error("显示OCX失败，原因：", e);
			response.setStatus(HttpServletResponse.SC_EXPECTATION_FAILED); // 设置失败标识
			writer.write("'显示OCX失败,原因:" + e.getMessage() + "'");
		}
		return null;
	}
	
	
}
