require([
    "esri/config",
    "esri/Map",
    "esri/views/SceneView"
], function(esriConfig, Map, SceneView){

    esriConfig.apiKey = "AAPKb765a73f61db40b189cd2ec292a872aaUGEazH9qCAdMNXi_0IzSi0RV3jKMpqezs6gUtr8xIRhZTPMnXU8AbU5t3L-WxZFQ"

    const map = new Map({
        basemap: "arcgis-topographic"
    });

    const scene = new SceneView({
        map: map,
        center: [-97, 38],
        zoom: 12,
        container: "viewDiv"
    })

});