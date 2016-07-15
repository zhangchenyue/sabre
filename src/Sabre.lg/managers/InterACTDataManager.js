/**
 * Using InterACT webapi, not support cross-region
 */
Sabre.pack('Sabre.lg',function(S){
    'use strict'
    
    this.InterACTDataManager = S.Class({extend:this.BaseDataManager}, {
        init:function(){
            
        }
    });
});