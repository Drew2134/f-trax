require([
    //ArcGIS JS API
    "esri/config",
    "esri/WebScene",
    "esri/layers/GeoJSONLayer",
    "esri/views/SceneView",
    "esri/symbols/WebStyleSymbol",

    //Widgets
    "esri/widgets/Home",
    "esri/widgets/Search",

    //Bootstrap
    "bootstrap/Collapse",
    "bootstrap/Dropdown",

    //Calcite Maps
    "calcite-maps/calcitemaps-v0.10",
    
    //Calcite Maps ArcGIS Support
    "calcite-maps/calcitemaps-arcgis-support-v0.10",

    "dojo/domReady!"
], function(esriConfig, WebScene, GeoJSONLayer, SceneView, WebStyleSymbol, Home, Search, Collapse, Dropdown, CalciteMaps, CalciteMapArcGISSupport){

    esriConfig.apiKey = "AAPKb765a73f61db40b189cd2ec292a872aaUGEazH9qCAdMNXi_0IzSi0RV3jKMpqezs6gUtr8xIRhZTPMnXU8AbU5t3L-WxZFQ";

    const aptGeoJSON = "data/airports.geojson";
    const aptLayer = new GeoJSONLayer({
        id: "airports",
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
                        fieldName: "Icao_Identifier",
                        label: "Icao Identifier"
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
        id: "runways",
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

    const map = new WebScene({
        basemap: "satellite",
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

    //Home Widget - add to top-left map container
    const homeButton = new Home({
        view: scene
    });
    scene.ui.add(
        {
            component: homeButton,
            position: "top-left",
            index: 0
        }
    );


    //Search Widget - add to navbar
    const searchWidget = new Search({
        container: "searchWidgetDiv",
        view: scene,
        includeDefaultSources: false,
        sources: [
            {
                layer: aptLayer,
                searchFields: ["Loc_Id", "Fac_Name"],
                displayField: "Fac_Name",
                exactMatch: false,
                outFields: ["*"],
                name: "Airports",
                placeholder: "example: MKE",
                zoomScale: 250000
            }
        ]
    });
    CalciteMapArcGISSupport.setSearchExpandEvents(searchWidget);

    searchWidget.on("search-complete", (e) => {
        let icao = e.results[0].results[0].target.attributes.Icao_Identifier;
        let weekStart = getMonday();
        let current = Math.floor(Date.now() / 1000);
        let arrivalUrl = "https://opensky-network.org/api/flights/arrival?airport=" + icao + "&begin=" + weekStart + "&end=" + current
        let departureUrl = "https://opensky-network.org/api/flights/departure?airport=" + icao + "&begin=" + weekStart + "&end=" + current

        callArrivals(arrivalUrl);

        callDepartures(departureUrl);

    });

    function callArrivals(url) {
        let username = "andrew_winchell";
        let password = "ColtEverett2301!";
        let base64 = btoa(username + ":" + password);

        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            async: false,
            headers: {
                "Authorization": "Basic " + base64
            },
            success: (jsonData) => {
                let numberArrivals = jsonData.length;
                $("#arrivals").html("Arrivals\n" + numberArrivals)
            }
        });
    };

    function callDepartures(url) {
        let username = "andrew_winchell";
        let password = "ColtEverett2301!";
        let base64 = btoa(username + ":" + password);

        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            async: false,
            headers: {
                "Authorization": "Basic " + base64
            },
            success: (jsonData) => {
                let numberDepartures = jsonData.length;
                $("#departures").html("Departures\n" + numberDepartures)
            }
        });
    };

    //Function to get start of the week
    //Assuming start of flight week is Monday
    function getMonday() {
        date = new Date();
        var day = date.getDay(),
            diff = date.getDate() - day + (day == 0 ? -6:1);
        return Math.floor(new Date(date.setDate(diff)).getTime() / 1000);
    };

    function callAPI() {
        let username = "andrew_winchell";
        let password = "ColtEverett2301!";
        let base64 = btoa(username + ":" + password);

        $.ajax({
            url: "https://opensky-network.org/api/states/all",
            type: "GET",
            dataType: "json",
            async: false,
            headers: {
                "Authorization": "Basic " + base64
            },
            success: (jsonData) => {
                var geoJson = {
                    "type": "FeatureCollection",
                    "name": "Active Flights",
                    "features": []
                };

                jsonData.states.forEach((item) => {
                    let geoJSONFeature = {}
                    geoJSONFeature["type"] = "Feature"
                    geoJSONFeature["geometry"] = {
                        "type": "Point",
                        "coordinates": [item[5], item[6], item[7]]
                    }
                    geoJSONFeature["properties"] = {
                        "icao": item[0],
                        "callsign": item[1],
                        "origin_country": item[2],
                        "longitude": item[5],
                        "latitude": item[6],
                        "baro_altitude": item[7],
                        "on_ground": item[8],
                        "velocity": item[9],
                        "true_track": item[10],
                        "vertical_rate": item[11],
                        "category": item[16]
                    }
                    geoJson.features.push(geoJSONFeature)
                });

                const blob = new Blob([JSON.stringify(geoJson)], {
                    type: "application/json"
                });

                const url = URL.createObjectURL(blob);
                
                const privatePlane = new WebStyleSymbol({
                    name: "Airplane_Private",
                    styleName: "EsriRealisticTransportationStyle"
                });

                const smallPlane = new WebStyleSymbol({
                    name: "Airplane_Small_Passenger",
                    styleName: "EsriRealisticTransportationStyle"
                });

                const largePlane = new WebStyleSymbol({
                    name: "Airplane_Large_Passenger",
                    styleName: "EsriRealisticTransportationStyle"
                });

                //Stylize the airports with ESRI Airport Icon
                const planeRenderer = {
                    type: "unique-value",
                    field: "category",
                    defaultSymbol: smallPlane,
                    uniqueValueInfos: [
                        {
                            value: 2,
                            symbol: privatePlane
                        },
                        {
                            value: 3,
                            symbol: smallPlane
                        },
                        {
                            value: 4,
                            symbol: largePlane
                        }
                    ],
                    visualVariables: [
                        {
                            type: "rotation",
                            field: "true_track",
                            axis: "heading",
                            rotationType: "geographic"
                        },
                        {
                            type: "rotation",
                            field: "vertical_rate",
                            axis: "tilt"
                        },
                        {
                            type: "size",
                            valueExpression: "$view.scale",
                            stops: [
                                {size: 50, value:   2500000},
                                {size: 5000, value: 5000000}
                            ],
                            axis: "height"
                        }
                    ]
                };

                const flightsLayer = new GeoJSONLayer({
                    id: "flights",
                    url: url,
                    hasZ: true,
                    renderer: planeRenderer,
                    elevationInfo: {
                        mode: "relative-to-ground"
                    },
                    copyright: "The OpenSky Network, https://opensky-network.org",
                });

                const flightsTemplate = {
                    title: "Flight {callsign}",
                    content: [
                        {
                            type: "fields",
                            fieldInfos: [
                                {
                                    fieldName: "icao",
                                    label: "ICAO ID"
                                },
                                {
                                    fieldName: "callsign",
                                    label: "Callsign"
                                },
                                {
                                    fieldName: "origin_country",
                                    label: "Country of Origin"
                                },
                                {
                                    fieldName: "longitude",
                                    label: "Longitude"
                                },
                                {
                                    fieldName: "latitude",
                                    label: "Latitude"
                                },
                                {
                                    fieldName: "velocity",
                                    label: "Velocity (m/s)"
                                },
                                {
                                    fieldName: "vertical_rate",
                                    label: "Vertical Rate"
                                },
                                {
                                    fieldName: "baro_altitude",
                                    label: "Altitude (m)"
                                },
                                {
                                    fieldName: "true_track",
                                    label: "Heading"
                                },
                                {
                                    fieldName: "category",
                                    label: "Aircraft Category"
                                }
                            ]
                        }
                    ]
                };
            
                flightsLayer.popupTemplate = flightsTemplate;
                
                if(map.findLayerById("flights")){
                    console.log(map.layers, map.layers[0])
                    map.add(flightsLayer, 1)
                    map.remove(map.layers[0]);
                } else {
                    map.add(flightsLayer, 0)
                };
                
            }
        });
        setTimeout(callAPI, 12000);
    };
    callAPI();
});