
package grp.pb.branch.gxccb;

import grp.pt.util.StringUtil;

/**
 * 
 * @author TL
 *
 */
public class OfficalCardConfigDTO {
	/**
	 * 卡bin
	 */
	private String card_prefix;
	/**
	 * 卡号名称
	 */
	private String card_name;
	/**
	 * 卡号编码
	 */
	private String card_no;
	/**
	 * 卡号长度
	 */
	private  int card_len;
	public String getCard_prefix() {
		return card_prefix;
	}
	public void setCard_prefix(String cardPrefix) {
		card_prefix = cardPrefix;
	}
	public String getCard_name() {
		return card_name;
	}
	public void setCard_name(String cardName) {
		card_name = cardName;
	}
	public String getCard_no() {
		return card_no;
	}
	public void setCard_no(String cardNo) {
		card_no = cardNo;
	}
	public int getCard_len() {
		return card_len;
	}
	public void setCard_len(int cardLen) {
		card_len = cardLen;
	}
	/**
	 * 以卡bin开头并符合相应的长度则判定为公务卡
	 * @param cardno
	 * @return
	 */
	public boolean match(String cardno){	
		//如果卡号为空则直接返回
		if( StringUtil.isEmpty(cardno) ){
			 return false;
		}
		if(cardno.length()==card_len){
			return cardno.startsWith(card_prefix);
		}
		return false;
	}		
}
