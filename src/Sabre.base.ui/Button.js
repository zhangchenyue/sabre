/**
*@description 
*	common Button class 
*/
Sabre.pack('Sabre.ui', function(S) {
    var dom = S.dom;
    this.Button = S.Class({
        init: function(options) {
            this.elem = dom.query(options.id);
            this.activeClassName = options.activeClassName || "active";
            this.disableClassName = options.disableClassName || "disable";
        }
    });
});