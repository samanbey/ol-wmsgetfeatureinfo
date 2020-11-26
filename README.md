# ol-wmsgetfeatureinfo
WMS GetFeatureInfo tool for OpenLayers

## Usage
- Place `ol-wmsgetfeatureinfo.js` and `ol-wmsgetfeatureinfo.css` in the same folder and include the first one in your code:
```html
    <script src="ol-wmsgetfeatureinfo.js"></script>
```  
- Create a `WMSGetFeatureRequest` object. Options are given as an object literal:
```javascript
    new WMSGetFeatureInfo({
        map: map,
        layer: [wms,wms2]
    });
```
## Options
`map` - the ol.Map object to use. This is the only obligatory option.

`layer` - a layer or an array of layers to activate requests on. If not specified, all queryable layers of the map will be used.
