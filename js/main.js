require([
    "esri/config",
    "esri/Map",
    "esri/views/SceneView"
], function(esriConfig, Map, SceneView){

    esriConfig.apiKey = "AAPKb765a73f61db40b189cd2ec292a872aaUGEazH9qCAdMNXi_0IzSi0RV3jKMpqezs6gUtr8xIRhZTPMnXU8AbU5t3L-WxZFQ"

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
                y: 38,
                z: 10000
            },
            tilt: 30
        }
    })

});