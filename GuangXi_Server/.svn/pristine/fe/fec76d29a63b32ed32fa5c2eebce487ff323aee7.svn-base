package grp.pb.branch.gxboc.web;

import java.io.PrintWriter;
import java.util.Arrays;
import java.util.List;

import grp.pt.bill.ConditionObj;
import grp.pt.bill.Paging;
import grp.pt.bill.ReturnPage;
import grp.pt.common.IMasterDataService;
import grp.pt.common.IUserService;
import grp.pt.common.model.ElementDTO;
import grp.pt.database.sql.SimpleQuery;
import grp.pt.pb.common.IBankAccountService;
import grp.pt.pb.common.IFinService;
import grp.pt.pb.common.INetworkService;
import grp.pt.pb.common.IPbUserService;
import grp.pt.pb.common.IRelationAccountService;
import grp.pt.pb.common.model.BankAccount;
import grp.pt.pb.common.model.BanknetzDTO;
import grp.pt.pb.trans.ITransService;
import grp.pt.pb.util.AccountJsonMapUtil;
import grp.pt.pb.util.ConditionObjUtils;
import grp.pt.pb.util.JsonUtil;
import grp.pt.pb.util.StaticApplication;
import grp.pt.util.BaseDAO;
import grp.pt.util.StringUtil;
import grp.pt.util.model.Session;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
/*
 * 广西个性controller
 */
@Controller
public class GxBOCController {
	
	private static Logger log = Logger.getLogger(GxBOCController.class);
	
	// 数据库基础访问类
	@Autowired
	private BaseDAO baseDAO;

	// 关联账户
	@Autowired
	private IRelationAccountService relationAccountService;

	// 银行账户
	@Autowired
	private IBankAccountService bankAccountService;

	// 网点
	@Autowired
	private INetworkService networkService;

	// 财政
	@Autowired
	private IFinService finService;

	// 银行核心接口
	@Autowired
	private ITransService transService;

	@Autowired
	private IMasterDataService masterDtService;

	@Autowired
	private IPbUserService pbUserService;
	
	@Autowired IUserService userService;

	
	/**
	 * 加载公务卡账号
	 * 
	 * @param req
	 * @param resp
	 * @return
	 */
	@RequestMapping(value = "/loadOfficialsAccount.do")
	public Object loadInnerHangingAccountOfOfficalCard(HttpServletRequest req,
			HttpServletResponse resp) {
		return this.loadCommonAccountWithBal(req, resp,
				IBankAccountService.TYPE_SALARY_ACCOUNT);
	}

	
	/**
	 * 加载信用卡账号
	 * 
	 * @param req
	 * @param resp
	 * @return
	 */
	@RequestMapping(value = "/loadInnerHangingAccountOfXinYong.do")
	public Object loadInnerHangingAccount(HttpServletRequest req,
			HttpServletResponse resp) {
		return this.loadCommonAccountWithBal(req, resp,
				IBankAccountService.TYPE_INNER_HANGING_ACCOUNT);
	}
	
	/**
	 * 加载账户的公共方法
	 * 
	 * @param req
	 * @param resp
	 * @param accountType
	 * @return
	 */
	public Object loadCommonAccountWithBal(HttpServletRequest req,
			HttpServletResponse resp, final String accountType) {
		resp.setContentType("text/html;charset=UTF-8");
		PrintWriter writer = null;
		HttpSession hSession = req.getSession();
		Session sc = (Session) hSession.getAttribute("session");
		// 是否为主办网点
		// boolean isHost = (Boolean) hSession.getAttribute("isHost");
		boolean isHost = false;
		Object host = hSession.getAttribute("isHost");
		if (host == null) {
			try {
				isHost = finService.countAdmdiv(sc.getBelongOrgId()) > 0 ? true
						: false;
				hSession.setAttribute("isHost", isHost);
			} catch (Exception e) {
				// TODO Auto-generated catch block
				writer.write("账户信息加载失败，原因：" + e.getMessage() + "！");
			}
		} else {
			isHost = (Boolean) host;
		}

		String jsonMap = req.getParameter("jsonMap");
		// 网点ID
		long bankId = sc.getBelongOrgId();
		if (bankId == 1 && sc.getUserCode().equals("admin")) {
			return null;
		}

		ConditionObj obj = ConditionObjUtils.getConditionObj(sc, jsonMap);

		// 网点
		BanknetzDTO banknetzDTO = networkService
				.loadBanknetzDTOByBankId(bankId);
		// 网点编码
		String bankCode = banknetzDTO.getBank_code();

		// if (IBankAccountService.TYPE_CLEAR_ACCOUNT.equals(accountType)) {
		// jsonMap = appendParamToJsonMap(jsonMap, bankCode,
		// IBankAccountService.TYPE_CLEAR_ACCOUNT);
		// } else if
		// (IBankAccountService.TYPE_INNER_HANGING_ACCOUNT.equals(accountType)
		// || IBankAccountService.TYPE_AGENCY_ZERO_ACCOUNT.equals(accountType)
		// || IBankAccountService.TYPE_MOF_ZERO_ACCOUNT.equals(accountType)) {
		// jsonMap = appendParamToJsonMap(jsonMap, isHost,
		// bankCode,accountType);
		// } else if
		// (IBankAccountService.TYPE_MOF_REALFUND_ACCOUNT.equals(accountType)) {
		// jsonMap = appendParamToJsonMap(jsonMap, bankCode,
		// IBankAccountService.TYPE_MOF_REALFUND_ACCOUNT);
		// } else
		if (StringUtil.isNotBlank(accountType)) {
			if (IBankAccountService.TYPE_AGENT_PAYEE_ACCOUNT
					.equals(accountType)) {
				if ("[{}]".equals(jsonMap)) {
					jsonMap = jsonMap.substring(0, jsonMap.length() - 2)
							+ "\"account_type_code\":[\"=\",\""
							+ IBankAccountService.TYPE_AGENT_PAYEE_ACCOUNT
							+ "\"]" + ",\"bank_code\":[\"=\",\"" + bankCode
							+ "\"]}]";
				} else {
					jsonMap = jsonMap.substring(0, jsonMap.length() - 2)
							+ ",\"account_type_code\":[\"=\",\""
							+ IBankAccountService.TYPE_AGENT_PAYEE_ACCOUNT
							+ "\"]" + ",\"bank_code\":[\"=\",\"" + bankCode
							+ "\"]}]";
				}
				jsonMap = appendParamToJsonMap(jsonMap, false,bankCode,
						IBankAccountService.TYPE_AGENT_PAYEE_ACCOUNT);
			} else {
				obj
						.and("account_type_code", SimpleQuery.EQUAL,
								accountType, "");
				// obj.and(c.getAttr_code(), "<", endDate, "");
				obj.and("bank_code", SimpleQuery.EQUAL, bankCode, "");
			}
		}

		Paging page = new Paging();
		page.setStartIndex(Integer.parseInt(req.getParameter("start")));
		page.setNowPage(Integer.parseInt(req.getParameter("page")));
		page.setNowPageNo(Integer.parseInt(req.getParameter("limit")));
		if (req.getParameter("filedNames") == null)
			return null;
		String[] fileds = JsonUtil.getStringArray4Json(req
				.getParameter("filedNames"));
		List<String> filedNames = Arrays.asList(fileds);
		page.setLoadDataCount(true);
		String jsonArray = null;
		try {
			writer = resp.getWriter();
			ReturnPage returnPage = bankAccountService.loadAccount(sc, obj,
					page);

			List<BankAccount> accountList = (List<BankAccount>) returnPage
					.getPageData();
			for (BankAccount account : accountList) {
				if (IBankAccountService.TYPE_CLEAR_ACCOUNT.equals(accountType)
						|| IBankAccountService.TYPE_MOF_REALFUND_ACCOUNT
								.equals(accountType)
						|| IBankAccountService.TYPE_AGENT_PAYEE_ACCOUNT
								.equals(accountType)) {
					// 资金性质可能没有值，预算内核预算外都是一个清算账户
					String code = account.getFund_type_code();
					if (StringUtil.isNotEmpty(code)) {
						// 加载要素值
						ElementDTO dto = StaticApplication
								.getMasterDataService().loadEleValueByCode(
										"FUND_TYPE", code,
										account.getAdmdiv_code());
						if (null != dto) {
							account.setFund_type_name(dto.getName());
						}
					}
				}
				// bal=bankAccountService.queryBal(sc,account);
				// account.setBalance(new BigDecimal(1110));
			}

			jsonArray = JsonUtil.getListViewPaging(returnPage, filedNames);

			String joStr = jsonArray.toString();
			AccountJsonMapUtil.replaceAccountJsonMap(joStr);
			if (joStr.contains("\"is_valid\":1")) {
				joStr = joStr.replaceAll("\"is_valid\":1",
						"\"is_valid\":\"有效\"");
			}
			if (joStr.contains("\"is_valid\":0")) {
				joStr = joStr.replaceAll("\"is_valid\":0",
						"\"is_valid\":\"无效\"");
			}
			System.out.println(joStr);
			resp.getWriter().write(joStr);
		} catch (Exception e) {
			log.error(e.getMessage(), e);
			resp.setStatus(HttpServletResponse.SC_EXPECTATION_FAILED);
			writer.write("账户信息加载失败，原因：" + e.getMessage() + "！");
		}

		return null;
	}
	
	private String appendParamToJsonMap(String jsonMap, boolean isHost,
			String bankCode, String type) {
		String str = jsonMap;
		if (null == str) {
			str = "[{}]";
		}
		if ("[{}]".equals(str)) {
			str = str.substring(0, str.length() - 2)
					+ "\"account_type_code\":[\"=\",\"" + type + "\"]}]";
		} else {
			str = str.substring(0, str.length() - 2)
					+ ",\"account_type_code\":[\"=\",\"" + type + "\"]}]";
		}
		if (!StringUtil.isTrimEmpty(bankCode)) {
			str = str.substring(0, str.length() - 2)
					+ ",\"bank_code\":[\"=\",\"" + bankCode + "\"]}]";
		}
		/*
		 * if(!isHost){ str = str.substring(0,
		 * str.length()-2)+",\"bank_code\":[\"=\",\""+bankCode+"\"]}]"; }
		 */
		return str;
	}
	

	/**
	 * 加载单位零余额账号
	 * 
	 * @param req
	 * @param resp
	 * @return
	 * @throws Exception 
	 */
	@RequestMapping(value = "/loadComBoAgencyZeroAcc.do")
	public Object loadAgencyZeroAcc(HttpServletRequest req,
			HttpServletResponse resp)  {
		resp.setContentType("text/html;charset=UTF-8");
		HttpSession hSession = req.getSession();
		Session sc = (Session) hSession.getAttribute("session");
		JSONArray jsonArray = null;
		try {
			List<BankAccount> accounts = bankAccountService
					.loadAccountByAccountTypeAndBankId(sc,
							IBankAccountService.TYPE_AGENCY_ZERO_ACCOUNT);
			JSONArray jsonString = JSONArray.fromObject(accounts);
			resp.getWriter().write(jsonString.toString());
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}
	
	@RequestMapping(value = "/gxbocResetPassword.do")
	public Object gxbocResetPassword(HttpServletRequest request,
			HttpServletResponse response) {
		PrintWriter writer = null;
		response.setCharacterEncoding("UTF-8");
		try {
			writer = response.getWriter();
			

			Session session = (Session) request.getSession().getAttribute("session");
			Session sc = (Session)session.clone();
			//校验用户是否登录
			if(sc == null){
				response.setStatus(HttpServletResponse.SC_EXPECTATION_FAILED); 
				writer.write("密码重置失败,请重新登录再次修改！");
			}
			
			String userid = request.getParameter("userid");
			
			userService.editPassword(Long.parseLong(userid), "123456" );
			writer.write("密码重置成功！");
		}catch(Exception e ){
			log.error("密码重置失败", e);
			response.setStatus(HttpServletResponse.SC_EXPECTATION_FAILED); 
			writer.write("密码重置失败,请重新登录再次修改！");
		}
		
		return null;
	}
}
