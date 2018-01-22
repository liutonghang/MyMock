/*
 *功能：直接由Ext的grid生成Excel 
 *注意： 只支持IE 
 *参数：param1: gridId
 *      param2: sheetName  
 */
Ext.Excel = function(config){
   //Ext.Excel.superclass.constructor.call(this, config);
   Ext.apply(this,config);
};
Ext.apply(Ext.Excel.prototype,{
         extGridToExcel : function(){  
         try{  
                    if(Ext.getCmp(this.gridId)){  
                        /********************************************* grid 生成 Excel ***************************************/  
                        var oXL = new ActiveXObject("Excel.Application");  
                        var oWB = oXL.Workbooks.Add();   
                        var oSheet = oWB.ActiveSheet;   
                               
                        var grid = Ext.getCmp(this.gridId);  
                        var store = grid.getSelectionModel().getSelection();
                        var recordCount = store.length;
                        var cm= grid.columns;
                        var colCount = cm.length;
                        var temp_obj = [];
                        var temp_objName = [];
                        //去除多余的列：如序号、隐藏的、行号行号、凭证查看
                        for(var i = 1; i < colCount;i++){  
//                            if(cm.isHidden(i)){  
//                            }else{ 
                        	//var dataIndex = Ext.getCmp(cm[i].dataIndex);
                        	//alert(dataIndex );
//                        	if(dataIndex == null || dataIndex == undefined){
//                        		continue;
//                        	}else if(Ext.getCmp(cm[i].dataIndex).hidden){
//                        	
//                        	}else{  
                        	    temp_obj.push(cm[i].dataIndex);
                                temp_objName.push(i);
                         //   }  
                        }  
                        for(var i = 1; i <= temp_obj.length;i++){  
                               //oSheet.Cells(1,i).value = cm.getColumnHeader(temp_obj[i - 1]);
                              // oSheet.Cells(1,i).value = cm[temp_obj[i-1]].text;
                        	     oSheet.Cells(1,i).value = cm[temp_objName[i-1]].text;
                        }  
                          
                        for(var i = 1 ; i <= recordCount; i++){  
                              for(var j = 1; j<= temp_obj.length; j++){  
                                   //  oSheet.Cells(i+1,j).value = view.getCell(i-1,temp_obj[j-1]).innerText; 
                                   oSheet.Cells(i+1,j).value = store[i-1].get( temp_obj[j-1]);
    								if(temp_obj[j-1].indexOf("no") > 0){
    									 oSheet.Cells(i+1,j).NumberFormatLocal = '000000';
    								}else if(temp_obj[j-1].indexOf("amt") > 0 || temp_obj[j-1].indexOf("amount") > 0){
    									 oSheet.Cells(i+1,j).NumberFormatLocal = '#,##0.00;-#,##0.00';
    								}
    								//var ff=temp_obj[j-1];
    								//alert(tem_obj[j-1].endsWith("no"));
//                                   var tt=tem_obj[j-1];
//                                   alert(tt);
//								   alert(tt.indexOf("no")>-1);
//                                   if(tem_obj[j-1].indexOf("no")>-1){
//                                	   
//                                	  oSheet.Cells(i+1,j).NumberFormatLocal = '000000';
//                                   }
                             }  
                        }  
                       //var grid = Ext.getCmp(this.gridId);
                       //var store = grid.getStore();  
                       // var recordCount = store.getCount();  
                       // var view = grid.getView();  
                       // var cm = grid.getColumnModel();  
                       // var colCount = cm.getColumnCount();  
                       // var temp_obj = [];  
                       // for(var i = 0; i < colCount;i++){  
                        //    if(cm.isHidden(i)){  
                        //    }else{  
                       //         temp_obj.push(i);  
                       //     }  
                       // }  
//                        for(var i = 1; i <= 5;i++){  
//                               oSheet.Cells(1,i).value = "1";  
//                        }  
//                          
//                        for(var i = 1 ; i <= 5; i++){  
//                              for(var j = 1; j<= 5; j++){  
//                                     oSheet.Cells(i+1,j).value = "2";   
//                             }  
//                        }  
                        if(this.sheetName){  
                              oSheet.Name = this.sheetName;  
                        }
                        //var tt=oSheet.Cells.Rows;
                        
                        //tt.Next();
                       
                        //alert(tt)
                        //tt.NumberFormatLocal = '000000';
                        //.numberformatlocal = '000000';
                        oXL.UserControl = true;  
                        oXL.Visible = true;  
                    }else{  
                        Ext.Msg.alert('Error','明细数据grid没有创建成功！');  
                        return;  
                    }         
          }catch(e){  
                    if(Ext){ 
                    	oXL = null;
                    	oWB = null;   
                        oSheet = null;  
                        Ext.Msg.show({  
                            title:'提示',  
                            msg:'请设置IE的菜单\'工具\'->Internet选项->安全->自定义级别->\'对未标记为可安全执行脚本ActiveX控件初始化并执行脚本\'->选择[启用]&nbsp;&nbsp;就可以生成Excel',  
                            buttons:Ext.Msg.OK,  
                            icon:Ext.Msg.INFO  
                        });  
                    }else{  
                        alert('不支持ExtJs框架');  
                        return;  
                    }  
                }  
    }  
});
