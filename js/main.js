require([
    //ArcGIS JS API
    "esri/config",
    "esri/Map",
    "esri/layers/GeoJSONLayer",
    "esri/views/SceneView",

    //Bootstrap
    "bootstrap/Collapse",
    "bootstrap/Dropdown",

    //Calcite Maps
    "calcite-maps/calcitemaps-v0.10",
    
    //Calcite Maps ArcGIS Support
    "calcite-maps/calcitemaps-arcgis-support-v0.10",

    "dojo/domReady!"
], function(esriConfig, Map, GeoJSONLayer, SceneView, Collapse, Dropdown, CalciteMaps, CalciteMapArcGISSupport){

    esriConfig.apiKey = "AAPKb765a73f61db40b189cd2ec292a872aaUGEazH9qCAdMNXi_0IzSi0RV3jKMpqezs6gUtr8xIRhZTPMnXU8AbU5t3L-WxZFQ";

    const aptsGeoJSON = "data/airports.geojson";
    const aptsLayer = new GeoJSONLayer({
        url: aptsGeoJSON,
        copyright: "U.S. DOT",
        definitionExpression: "Fac_Type = 'AIRPORT' AND Fac_Use = 'PU'"
    }); 
    
    //Stylize the airports with ESRI Airport Icon
    let aptSymbol = {
        type: "web-style",
        styleName: "EsriIconsStyle"
    };
    aptsLayer.renderer = {
        type: "simple",
        symbol: aptSymbol
    }

    const rnwyGeoJSON = "data/runways.geojson";
    const rnwyLayer = new GeoJSONLayer({
        url: rnwyGeoJSON,
        copyright: "U.S. DOT"
    });

    const map = new Map({
        basemap: "arcgis-topographic",
        ground: "world-elevation",
        layers: [aptsLayer, rnwyLayer]
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