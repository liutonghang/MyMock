package grp.pb.branch.web;

import grp.pb.branch.service.GuangXiService;
import grp.pt.pb.common.IBankNoService;
import grp.pt.pb.common.IPbCommonService;
import grp.pt.pb.exception.PbException;
import grp.pt.pb.payment.PayService;
import grp.pt.pb.payment.PayVoucher;
import grp.pt.pb.realpay.RealPayVoucher;
import grp.pt.pb.trans.ITransService;
import grp.pt.pb.trans.model.TransReturnDTO;
import grp.pt.pb.util.JsonUtil;
import grp.pt.pb.util.PayConstant;
import grp.pt.pb.util.PbUtil;
import grp.pt.pb.util.TradeConstant;
import grp.pt.pb.web.RootController;
import grp.pt.pb.web.VoucherController;
import grp.pt.util.StringUtil;
import grp.pt.util.model.Session;

import java.io.PrintWriter;
import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONNull;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
@SuppressWarnings("unchecked")
@Controller
public class GXABCController extends RootController{
	/***
	 * 日志
	 */
	private static Logger log = Logger.getLogger(VoucherController.class);
	
	@Autowired
	private IPbCommonService commonService;
	
	@Autowired
	private PayService payService;
	
	@Autowired
	private IBankNoService bankNoService;

	@Autowired
	private ITransService transService;
	
	@Autowired
	private GuangXiService guangXiService;

	@RequestMapping(value = "/queryTran.do")
	public Object queryTran(HttpServletRequest request,
			HttpServletResponse response){		
		
		
		PrintWriter writer = null;
		try {
			response.setContentType("text/html;charset=UTF-8");
	
			writer = response.getWriter();

			Session sc = (Session) request.getSession().getAttribute("session");
			
			List<PayVoucher> payList = (List<PayVoucher>) PbUtil.checkVoucherSyn(sc, request, commonService);
			
			String getResult = request.getParameter("queryResult");
			if(getResult.equals("succ")){
				if(payList.get(0).getManual_trans_flag()==1){
					writer.write("核心记录该笔交易成功、请掉再次转账");
				}else{
					payList.get(0).setTrade_type(TradeConstant.PAY2PAYEE);
					TransReturnDTO transLog = transService.queryTrans(sc, payList.get(0));
					if(transLog.getResStatus()!=TradeConstant.RESPONSESTATUS_SUCCESS){
						throw new Exception("核心记录该笔交易失败、请联系管理员处理");
					}else{
						writer.write("核心记录该笔交易成功、请掉再次转账");
					}
				}
			}else{
				if(payList.get(0).getManual_trans_flag()==1){
					throw new  Exception("已手动置为成功状态、请选择\"人工确认成功操作\"");
				}else{
					payList.get(0).setTrade_type(TradeConstant.PAY2PAYEE);
					TransReturnDTO transLog = transService.queryTrans(sc, payList.get(0));
					if(transLog.getResStatus()==TradeConstant.RESPONSESTATUS_SUCCESS){
						throw new Exception("核心记录该笔交易成功、请选择\"人工确认成功操作\"");
					}else if(transLog.getResStatus()==TradeConstant.RESPONSESTATUS_NOTCONFIRM){
						throw new Exception("核心记录该笔交易未明确、请联系管理员");
					}else{
						writer.write("核心记录该笔交易失败");
					}
				}
			}
			
			
		} catch (Exception ex) {
			log.error(ex.getMessage(), ex);
			response.setStatus(HttpServletResponse.SC_EXPECTATION_FAILED);
			writer.write(ex.getMessage());   
		}
		return null;
	}
	
	
	@RequestMapping(value = "/queryTranByRealPay.do")
	public Object queryRealTran(HttpServletRequest request,
			HttpServletResponse response){		
		
		
		PrintWriter writer = null;
		try {
			response.setContentType("text/html;charset=UTF-8");
	
			writer = response.getWriter();

			Session sc = (Session) request.getSession().getAttribute("session");
			//实拨界面只能每次选择一笔查询
			List<RealPayVoucher> payList = (List<RealPayVoucher>) PbUtil.checkVoucherSyn(sc, request, commonService);
			
			String getResult = request.getParameter("queryResult");
			if(getResult.equals("succ")){
				if(payList.get(0).getManual_trans_flag()==1){
					writer.write("已手动置为成功状态、请\"再次确认\"");
				}else{
					payList.get(0).setTrade_type(TradeConstant.CLEARTOPAYEE);
					TransReturnDTO transLog = transService.queryTrans(sc, payList.get(0));
					if(transLog.getResStatus()!=TradeConstant.RESPONSESTATUS_SUCCESS){
						throw new Exception("核心记录该笔交易失败、请联系管理员处理");
					}else{
						writer.write("核心记录该笔交易成功、请再次确认");
					}
				}
			}else{
				if(payList.get(0).getManual_trans_flag()==1){
					throw new  Exception("已手动置为成功状态、请选择\"人工确认成功操作\"");
				}else{
					payList.get(0).setTrade_type(TradeConstant.CLEARTOPAYEE);
					TransReturnDTO transLog = transService.queryTrans(sc, payList.get(0));
					if(transLog.getResStatus()==TradeConstant.RESPONSESTATUS_SUCCESS){
						throw new Exception("核心记录该笔交易成功、请选择\"人工确认成功操作\"");
					}else if(transLog.getResStatus()==TradeConstant.RESPONSESTATUS_NOTCONFIRM){
						throw new Exception("核心记录该笔交易未明确、请联系管理员");
					}else{
						writer.write("核心记录该笔交易失败");
					}
				}
			}
			
			
		} catch (Exception ex) {
			log.error(ex.getMessage(), ex);
			response.setStatus(HttpServletResponse.SC_EXPECTATION_FAILED);
			writer.write(ex.getMessage());   
		}
		return null;
	}
	
	/***************************************************************************
	 * 初审和送审
	 * 
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/checkVoucherGX.do", method = RequestMethod.POST)
	public @ResponseBody Object checkVoucherGX(HttpServletRequest request,HttpServletResponse response) {
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
				log.error("/checkVoucherGX.do" + "没有菜单id");
			}
			//是否初审   初审：true  复审：false
			boolean  isCheck = Boolean.parseBoolean(request.getParameter("isCheck"));
			//验证数据是否已被他人修改，如果修改抛出异常，未修改返回凭证列表
			List<PayVoucher> vouList =  (List<PayVoucher>) PbUtil.checkVoucherSyn(sc, request, commonService);
			int is_onlyReq = Integer.parseInt(request.getParameter("is_onlyreq"));
			for(PayVoucher p : vouList){
				if(request.getParameter("jsonMap")!=null){
					List<HashMap<String,String>> list =JsonUtil.getList4Json(request.getParameter("jsonMap"), HashMap.class);
					for(HashMap<String,String> m : list){
						if(p.getPay_voucher_id() ==Long.parseLong(m.get("id"))){
							if(m.get("bankNo")==null||JSONNull.getInstance().equals(m.get("bankNo"))){
								throw new PbException("请补录行号！");
							}
						 	p.setPayee_account_bank_no(m.get("bankNo"));
						 	if(m.get("setModeName")==null||m.get("setModeCode")==null){
						 		throw new PbException("请补录结算方式！");
						 	}
						 	if(JSONNull.getInstance().equals(m.get("setModeCode"))||JSONNull.getInstance().equals(m.get("setModeName"))){
						 		throw new PbException("请补录结算方式！");
						 	}
						 	p.setPb_set_mode_code(m.get("setModeCode"));
						 	p.setPb_set_mode_name(m.get("setModeName"));
						 //	p.setRemark(m.get("remark"));
//						 	if(m.get("bankbussinessType")!=null && !JSONNull.getInstance().equals(m.get("bankbussinessType"))){
//						 		p.setBankbusinesstype(Integer.parseInt(m.get("bankbussinessType")));
//						 	}
						 	//收款人账户类型  xcg 2015-8-20 16:25:06
						 	if(m.get("bankbusinesstype")!=null && !JSONNull.getInstance().equals(m.get("bankbusinesstype"))){
						 		log.info("+++++++++收款人账户类型为："+m.get("bankbusinesstype")+"++++++++++++++++");
						 		if(m.get("setModeCode").equals("1")){
						 			p.setHold9(m.get("bankbusinesstype"));
						 		}else{
						 			p.setHold9("0");
						 		}
						 	}
						 	if(m.get("city_code") != null && !(m.get("city_code").getBytes().length == 0) && !JSONNull.getInstance().equals(m.get("city_code"))){
						 		p.setCity_code(m.get("city_code"));
						 	}else{
						 		p.setCity_code(null);
						 	}
						 	if(m.get("remark") != null && !JSONNull.getInstance().equals(m.get("remark"))){
						 		p.setRemark(m.get("remark"));
						 	}
						 	if(m.get("urgent_flag") != null && !JSONNull.getInstance().equals(m.get("urgent_flag"))){
						 		p.setUrgent_flag(Integer.parseInt(m.get("urgent_flag")));
						 	}

						 	if(m.get("add_word") != null && !JSONNull.getInstance().equals(m.get("add_word"))){
						 		
						 		p.setAdd_word(m.get("add_word"));
						 	}
						 	
						}
					}
				}
				if(p.getIs_onlyreq()!=is_onlyReq){
					throw new PbException("已有数据转为(非)公务卡，请重新选择初审数据！");
				}
			}
			//保存行号
			bankNoService.savePayBankNo(vouList);
			if (isCheck) {
				guangXiService.submitVoucher(sc, vouList, "初审");
				writer.write("初审成功");		
			} else {
				guangXiService.submitVoucher(sc, vouList, "送审");
				writer.write("送审成功");		
			}
			
		}catch (Exception ex) {
			log.error("审核失败，原因：" + ex.getMessage(), ex);
			response.setStatus(HttpServletResponse.SC_EXPECTATION_FAILED);
			writer.write("审核失败,原因:" + ex.getMessage());   
		}
		return null;
	}
	
}
