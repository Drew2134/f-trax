require([
    //ArcGIS JS API
    "esri/config",
    "esri/Map",
    "esri/views/SceneView",

    //Bootstrap
    "bootstrap/Collapse",
    "bootstrap/Dropdown",

    //Calcite Maps
    "calcite-maps/calcitemaps-v0.10",
    
    //Calcite Maps ArcGIS Support
    "calcite-maps/calcitemaps-arcgis-support-v0.10",

    "dojo/domReady!"
], function(esriConfig, Map, SceneView, Collapse, Dropdown, CalciteMaps, CalciteMapArcGISSupport){

    esriConfig.apiKey = "AAPKb765a73f61db40b189cd2ec292a872aaUGEazH9qCAdMNXi_0IzSi0RV3jKMpqezs6gUtr8xIRhZTPMnXU8AbU5t3L-WxZFQ";
    
    const aviationStackKey = "8a4f61a109f79d1998270def600ba85c";

    $.getJSON("https://api.aviationstack.com/v1/airports?access_key=" + aviationStackKey, (jsonData) => {
        var aptsGeoJSON = {}
        aptsGeoJSON['properties'] = jsonData
        aptsGeoJSON['type'] = 'Feature';
        aptsGeoJSON['geometry'] = {
            "type": "Point",
            "coordinates": [
                jsonData['latitude'], jsonData['longitude']
            ]
        }
        console.log(aptsGeoJSON);
    });
   
    /*const aptsJSON = "http://api.aviationstack.com/v1/airports?access_key=" + aviationStackKey;
    var aptsGeoJSON = {};
    aptsGeoJSON['properties'] = aptsJSON
    aptsGeoJSON['type'] = 'Feature';
    aptsGeoJSON['geometry'] = {
        "type": "Point",
        "coordinates": [
            aptsJSON['latitude'], aptsJSON['longitude']
        ]
    }*/


    const map = new Map({
        basemap: "arcgis-topographic",
        ground: "world-elevation"
    });

    const scene = new SceneView({
        container: "viewDiv",
        map: map,
        camera: {
            position: {
                x: -97,
                y: 10,
                z: 3500000
            },
            tilt: 35
        }
    });

    scene.when(() => {
        CalciteMapArcGISSupport.setPopupPanelSync(scene);
    });

});