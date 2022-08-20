require([
    //ArcGIS JS API
    "esri/config",
    "esri/Map",
    "esri/layers/GeoJSONLayer",
    "esri/views/SceneView",

    //Widgets
    "esri/widgets/Search",

    //Bootstrap
    "bootstrap/Collapse",
    "bootstrap/Dropdown",

    //Calcite Maps
    "calcite-maps/calcitemaps-v0.10",
    
    //Calcite Maps ArcGIS Support
    "calcite-maps/calcitemaps-arcgis-support-v0.10",

    "dojo/domReady!"
], function(esriConfig, Map, GeoJSONLayer, SceneView, Search, Collapse, Dropdown, CalciteMaps, CalciteMapArcGISSupport){

    esriConfig.apiKey = "AAPKb765a73f61db40b189cd2ec292a872aaUGEazH9qCAdMNXi_0IzSi0RV3jKMpqezs6gUtr8xIRhZTPMnXU8AbU5t3L-WxZFQ";

    const aptGeoJSON = "data/airports.geojson";
    const aptLayer = new GeoJSONLayer({
        url: aptGeoJSON,
        copyright: "U.S. DOT",
        minScale: 2750000,
        outFields: [
            "Fac_Name",
            "Loc_Id",
            "City",
            "County",
            "State_Name",
            "Owner_Name",
            "Responsible_Artcc_Name",
            "Responsible_Artcc_Comp_Id"
        ],
        definitionExpression: "Fac_Type = 'AIRPORT' AND Fac_Use = 'PU' AND State_Name IS NOT NULL"
    });

    const aptTemplate = {
        title: "{Fac_Name} AIRPORT - {Loc_Id}",
        content: [
            {
                type: "fields",
                fieldInfos: [
                    {
                        fieldName: "Fac_Name",
                        label: "Airport"
                    },
                    {
                        fieldName: "Loc_Id",
                        label: "Location Id"
                    },
                    {
                        fieldName: "City",
                        label: "City"
                    },
                    {
                        fieldName: "County",
                        label: "County"
                    },
                    {
                        fieldName: "State_Name",
                        label: "State"
                    },
                    {
                        fieldName: "Owner_Name",
                        label: "Owner"
                    },
                    {
                        fieldName: "Responsible_Artcc_Name",
                        label: "ARTCC Name"
                    },
                    {
                        fieldName: "Responsible_Artcc_Comp_Id",
                        label: "ARTCC Id"
                    }
                ]
            }
        ]
    };

    aptLayer.popupTemplate = aptTemplate;
    
    //Stylize the airports with ESRI Airport Icon
    let aptSymbol = {
        type: "point-3d",
        symbolLayers: [{
            type: "icon",
            size: 16,
            anchor: "bottom",
            material: {
                color: [30, 144, 255],
                transparency: 0
            },
            resource: {
                "href":"https://static.arcgis.com/arcgis/styleItems/Icons/web/resource/Pushpin1.svg"
            }
        }]
    };
    
    //Render airports with custom style
    aptLayer.renderer = {
        type: "simple",
        symbol: aptSymbol
    }

    const rnwyGeoJSON = "data/runways.geojson";
    const rnwyLayer = new GeoJSONLayer({
        url: rnwyGeoJSON,
        copyright: "U.S. DOT",
        minScale: 250000
    });

    let rnwySymbol = {
        type: "simple-line",
        color: "gray",
        width: "3px",
        style: "solid"
    };

    rnwyLayer.renderer = {
        type: "simple",
        symbol: rnwySymbol
    };

    const map = new Map({
        basemap: "arcgis-topographic",
        ground: "world-elevation",
        layers: [aptLayer, rnwyLayer]
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

    // Search - add to navbar
    var searchWidget = new Search({
        container: "searchWidgetDiv",
        view: scene,
        sources: [
            {
                layer: aptLayer,
                searchFields: ["Loc_Id", "Fac_Name"],
                displayField: "Fac_Name",
                exactMatch: false,
                outFields: ["*"],
                name: "Airports",
                placeholder: "example: MKE"
            }
        ]
    });
    CalciteMapArcGISSupport.setSearchExpandEvents(searchWidget);

    scene.when(() => {
        CalciteMapArcGISSupport.setPopupPanelSync(scene);
    });

});