package grp.pb.branch.beibuwan.web;

import java.io.PrintWriter;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import grp.pt.pb.common.IPbCommonService;
import grp.pt.pb.exception.PbException;
import grp.pt.pb.payment.PayService;
import grp.pt.pb.payment.PayVoucher;
import grp.pt.pb.util.JsonUtil;
import grp.pt.pb.util.PbParameters;
import grp.pt.pb.web.RootController;
import grp.pt.util.StringUtil;
import grp.pt.util.model.Session;

@Controller
public class CustomTransferCashController extends RootController{
	
	private static Logger log = Logger.getLogger(CustomTransferCashController.class);
	
	@Autowired
	private IPbCommonService commonService;
	
	@Autowired
	private PayService payService;
	
	/**
	 * 现金支付
	 * @param request
	 * @param response
	 * @param objList
	 * @return
	 */
	@RequestMapping(value = "/customTransferPayVoucher.do")
	public Object customTransferPayVoucher(HttpServletRequest request,
			HttpServletResponse response) {
		PrintWriter writer = null;
		try {
			writer = response.getWriter();
			Session sc = copySession(request);
			long [] ids = JsonUtil.getLongArray4Json( request.getParameter("billIds"));
			if(ids.length>1&&PbParameters.getIntParameter("pb.trans.singleTrans")==1){
				response.setStatus(HttpServletResponse.SC_EXPECTATION_FAILED);
				writer.write("每次只能选择一笔凭证进行支付！");
				return null;
			}
			
//			//验证数据是否已被他人修改，如果修改抛出异常，未修改返回凭证列表
			List<PayVoucher> payVoucherList = (List<PayVoucher>) checkVoucherSyn(request,commonService);
			String strIsOnlyReq = request.getParameter("is_onlyreq");
			if(StringUtil.isNotEmpty(strIsOnlyReq)){
				int is_onlyReq=Integer.parseInt( strIsOnlyReq );
				for (PayVoucher e : payVoucherList) {
					if(e.getIs_onlyreq()!=is_onlyReq){
						throw new PbException("已有数据转为(非)公务卡，请重新选择支付数据！");
					}
				}		
			}
			
			//支付的时候进行额度控制1.记账2.强制记账
			payService.acceptCommonSignPayVoucherNotFlow(sc, payVoucherList,0, true);		
			writer.write("支付转账成功");
		} catch (Exception ex) {
			log.error("支付转账失败，原因：" + ex.getMessage(), ex);
			response.setStatus(HttpServletResponse.SC_EXPECTATION_FAILED);
			writer.write("支付转账失败,原因:" + ex.getMessage());   
		}
		return null;
	}
}
