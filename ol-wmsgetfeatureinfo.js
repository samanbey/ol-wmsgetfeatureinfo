/**
 * ol-wmsgetfeatureinfo.js
 *
 * class WMSGetFeatureInfo
 * Displays feature info for a WMS layer (with ImageWMS or TileWMS source)
 * 
 * param: option <object>
 * 
 * obligatory option:
 *      - map: map object
 * other options:
 *      - layer: wms layer object or an array of them. 
 *               if not specified, all queryable wms layers of the map will be queried
 * 
 * MIT License
 * Copyright (c) 2020 Gede Mátyás
 * 
 */
 
WMSGetFeatureInfo=function(options) {            
    var opts=options||{};
    var this_=this;
    
    var DP = new DOMParser();

    // merge options
    for (var i in opts)
        this[i]=opts[i];
    
    if (!Array.isArray(this.layer))
        this.layer=[this.layer];
    
    // load css
    var se=document.createElement('style');
    se.innerHTML='@import url(ol-wmsgetfeatureinfo.css?'+Math.random()+');';
    document.body.appendChild(se);

    // create the message box div and its content div
    var mb=document.createElement('div');
    mb.className='ol-wmsgetfeatureinfo';
    
    var mdiv=document.createElement('div');
    this.mdiv=mdiv;
    this.div=mb;
    
    // create the OK button
    var ok=document.createElement('input');
    ok.type="button";
    ok.value="✖";
    ok.className='ol-wmsgetfeatureinfo-button';
    ok.onclick=function() {
        this_.div.style.display='none';
    }
    mb.appendChild(ok);
    mb.appendChild(mdiv);
    
    // create overlay
    var o=new ol.Overlay({
        element: mb,
        offset: [10,0],
        positioning: 'bottom-left'
    });
    this.ovl=o;
    this.map.addOverlay(o);
    
    // click event handler 
    function getInfo(e) {
        var i=0;
        var text='';
        var ll=this_.layer;
        // if no layers were specified, find all WMS layers
        if (!ll[0]) {
            var la=this_.map.getLayers().getArray()
            ll=[];
            for (var l in la)
                if (la[l].getVisible()&&la[l].getSource&&la[l].getSource().getFeatureInfoUrl)
                    ll.push(la[l]);  
        }
        if (ll.length==0) {
            console.warn('WMSGetFeatureInfo: No queryable layers');
            return;
        }
        fetchNext();
        function fetchNext() {
            var l=ll[i];
            var s=l.getSource();
            if (s.getFeatureInfoUrl) {
                var url=s.getFeatureInfoUrl(e.coordinate, map.getView().getResolution(), map.getView().getProjection(), {
                    query_layers: s.getParams().layers,
                    info_format: 'text/html'
                });            
                fetch(url).then(function(r){ return r.text(); }).then(function(t) {
                    if (t) {
                        text+=t;
                    }
                    i++;
                    if (i<ll.length)
                        fetchNext();
                    else {
                        if (text!='') {
                            let doc = DP.parseFromString(text,'text/html');
                            let b=doc.body;
                            this_.mdiv.innerHTML='';
                            this_.mdiv.appendChild(b);
                            // scripts added by setting innerHTML are not executed. Workaround here for dynamic charts
                            let sc=b.getElementsByTagName('script');
                            let i=0;
                            function sLoad() {
                                if (i<sc.length) {
                                    let s=document.createElement('script');
                                    s.onload=sLoad;
                                    if (sc[i].src!="")
                                        s.src=sc[i].src;
                                    s.innerHTML=sc[i].innerHTML;
                                    i++;
                                    document.body.appendChild(s);                                    
                                }
                            }
                            sLoad();
                            this_.div.style.display='';
                            this_.ovl.setPosition(e.coordinate);
                        }
                        else {
                            console.info('WMSGetFeatureInfo: No feature info at position ('+e.coordinate+')');
                            this_.ovl.setPosition(null);
                        }
                    }
                });
            }
        }
    }
    
    this.enable=function() {
        map.on('click',getInfo);
    }
    
    this.disable=function() {
        map.un('click',getInfo);
    }
    
    // activate
    this.enable();    
}
