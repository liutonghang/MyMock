package grp.pb.branch.web;

import java.io.PrintWriter;

import grp.pb.branch.service.GuangXiService;
import grp.pt.idgen.IdGen;
import grp.pt.pb.common.INetworkService;
import grp.pt.pb.common.model.BankAccount;
import grp.pt.pb.common.model.BanknetzDTO;
import grp.pt.pb.util.PbUtil;
import grp.pt.pb.util.PropertiesHander;
import grp.pt.pb.web.RootController;
import grp.pt.util.model.Session;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

@SuppressWarnings("unchecked")
@Controller
public class GXCCBController extends RootController{
	/***
	 * 日志
	 */
	private static Logger log = Logger.getLogger(GXCCBController.class);

	//网点
		@Autowired
		private INetworkService networkService;
		
		@Autowired
		private GuangXiService gXkService;
		
	/**
	 * 广西建行自定义登录<br>
	 * @author liutianlong
	 * @since 2016年7月28日
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/ccblogin.do")
	public Object queryTran(HttpServletRequest request,
			HttpServletResponse response) {
		String loginModel4GXCCB = PropertiesHander.getValue("gxccb",
				"login.model4GXCCB");
		if (request.getParameter("admin") != null
				|| "1".equals(loginModel4GXCCB)) {
			return new ModelAndView("/LoginByPassword");
		} else if ("2".equals(loginModel4GXCCB)) {// 如果是校验码登录
			return new ModelAndView("/LoginByVerifyCode");
		}

		return null;

	}
	@RequestMapping(value = "/GXaddOfficial.do")
	public Object GXaddOfficial(HttpServletRequest req,HttpServletResponse resp){
		Session sc = copySession(req);
	long bankId = sc.getBelongOrgId();
	PrintWriter writer = null;
	try {
		 writer = resp.getWriter();

		BanknetzDTO banknetzDTO = networkService.getBanknetzDTOByBankCode(sc.getBankcode());
		String bankCode = banknetzDTO.getBank_code();
		String bankName = banknetzDTO.getBank_name();
		String admdivCode = req.getParameter("admdiv_code");
		String accountType = req.getParameter("accountType");
		String accountNo = req.getParameter("accountNo");
		String accountName = req.getParameter("accountName");
		BankAccount account=  new BankAccount();
		account.setAccount_no(accountNo);
		account.setAccount_name(accountName);
		account.setAccount_type_code(accountType);
		account.setAdmdiv_code(admdivCode);
		account.setBank_code(bankCode);
		account.setBank_name(bankName);
		account.setAccount_id(IdGen.genNumId()+"");
		account.setCreate_date(PbUtil.getCurrDate());
		gXkService.saveOfficialAccount(sc, account);
		writer.write("保存成功");
	} catch (Exception e) {
		log.error("加载失败，原因：" + e.getMessage(),e);
		resp.setStatus(HttpServletResponse.SC_EXPECTATION_FAILED);  
		writer.write("加载失败,原因:" +e.getMessage());
	}
    return null;

	}
	@RequestMapping(value = "/GXeditofficialAccount.do")
	public Object GXeditofficialAccount(HttpServletRequest req,HttpServletResponse resp){
		Session sc = copySession(req);
	long bankId = sc.getBelongOrgId();
	PrintWriter writer = null;
	try {
		 writer = resp.getWriter();
		String admdivCode = req.getParameter("admdiv_code");
		String account_id = req.getParameter("account_id");
		String accountNo = req.getParameter("account_no");
		String accountName = req.getParameter("account_name");
		BankAccount account=  new BankAccount();
		account.setAccount_no(accountNo);
		account.setAccount_name(accountName);
		account.setAccount_id(account_id);
		gXkService.editOfficialAccount(sc, account);
		writer.write("修改成功");
	} catch (Exception e) {
		log.error("加载失败，原因：" + e.getMessage(),e);
		resp.setStatus(HttpServletResponse.SC_EXPECTATION_FAILED);  
		writer.write("加载失败,原因:" + e.getMessage());
	}
    return null;

	}
		
}
