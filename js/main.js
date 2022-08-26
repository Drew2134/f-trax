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

    //Dojo
    "dojo/domReady!"

], function(esriConfig, WebScene, GeoJSONLayer, SceneView, WebStyleSymbol, Home, Search, Collapse, Dropdown, CalciteMaps, CalciteMapArcGISSupport){

    //esri agol api key
    esriConfig.apiKey = "AAPKb765a73f61db40b189cd2ec292a872aaUGEazH9qCAdMNXi_0IzSi0RV3jKMpqezs6gUtr8xIRhZTPMnXU8AbU5t3L-WxZFQ";

    //link to airports geojson data
    const aptGeoJSON = "data/airports.geojson";

    //set aptLayer to use airports geojson
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
            "ARTCC_Id",
            "ARTCC_Name",
            "Icao_Id"
        ],
        //only show facilities that are airports, publilc, and are in the U.S.
        definitionExpression: "Fac_Type = 'AIRPORT' AND Fac_Use = 'PU' AND State_Name IS NOT NULL"
    });

    //construct popup template for airports
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
                        fieldName: "Icao_Ident",
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
                        fieldName: "ARTCC_Name",
                        label: "ARTCC Name"
                    },
                    {
                        fieldName: "ARTCC_Id",
                        label: "ARTCC Id"
                    }
                ]
            }
        ]
    };

    //set popup template on the airports layer
    aptLayer.popupTemplate = aptTemplate;
    
    //stylize the airports with ESRI Airport Icon
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
    
    //render airports with custom style
    aptLayer.renderer = {
        type: "simple",
        symbol: aptSymbol
    }

    //link to runways geojson data
    const rnwyGeoJSON = "data/runways.geojson";
    
    //set runway layer to use runway geojson
    const rnwyLayer = new GeoJSONLayer({
        id: "runways",
        url: rnwyGeoJSON,
        copyright: "U.S. DOT",
        minScale: 250000
    });

    //constuct runway symbol style
    let rnwySymbol = {
        type: "simple-line",
        color: "gray",
        width: "3px",
        style: "solid"
    };

    //set runway layer rendering to the runway symbol style
    rnwyLayer.renderer = {
        type: "simple",
        symbol: rnwySymbol
    };

    //construct a new web scene using satellite imagery and elevation layer
    //add airport and runway layers to the map
    const map = new WebScene({
        basemap: "satellite",
        ground: "world-elevation",
        layers: [aptLayer, rnwyLayer]
    });

    //construct new scene view
    const scene = new SceneView({
        //placed in viewDiv html
        container: "viewDiv",
        //use the web scene as the map
        map: map,
        //set initial view extent
        camera: {
            position: {
                x: -97,
                y: 10,
                z: 3500000
            },
            tilt: 35
        }
    });

    //allow docking of popup
    scene.popup.dockEnabled = true;

    //options for popup docking
    scene.popup.dockOptions = {
        //do not allow user to decide on docking
        buttonEnabled: false,
        //set when screen is smaller than w*h, popup will automatically dock
        //should always dock since screen sizes should never be this large
        breakpoint: {
            width: 5000,
            height: 5000
        }
    }

    //home widget - add to top-left map container
    const homeButton = new Home({
        view: scene
    });

    //add home widget to the top left ui container
    scene.ui.add(
        {
            component: homeButton,
            position: "top-left",
            //appear as the first available widget
            index: 0
        }
    );

    //search widget - add to navbar
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

    //expanding action on search widget
    //built into library from calcite-maps
    CalciteMapArcGISSupport.setSearchExpandEvents(searchWidget);

    //trigger actions for search widget after a search is completed
    searchWidget.on("search-complete", (e) => {
        //send the icao id from the selected search item to gatherURLConstructs function
        gatherURLConstructs(e.results[0].results[0].target.attributes.Icao_Id)
    });
    
    scene.on("click", (e) => {
        const opts = {
            include: aptLayer
        }
        scene.hitTest(e, opts).then((response) => {
            if(response.results.length) {
                gatherURLConstructs(response.results[0].graphic.attributes.Icao_Id)
            }
        })
    })

    function gatherURLConstructs(icao) {
        //call getWeek function to get the beginning time for the time scale
        let weekStart = getWeek();
        //get the current epoch time in seconds
        let current = Math.floor(Date.now() / 1000);
        //construct arrival and departure urls with beginning and end times
        let arrivalUrl = "https://opensky-network.org/api/flights/arrival?airport=" + icao + "&begin=" + weekStart + "&end=" + current
        let departureUrl = "https://opensky-network.org/api/flights/departure?airport=" + icao + "&begin=" + weekStart + "&end=" + current

        //call the arrival and departure functions with the constructed api urls
        callArrivals(arrivalUrl);
        callDepartures(departureUrl);

    }

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
                $("#arrivals").html(numberArrivals);
            },
            error: () => {
                $("arrivals").html("No Data");
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
                $("#departures").html(numberDepartures)
            },
            error: () => {
                $("#departures").html("No Data");
            }
        });
    };

    //function to get last 7 days
    function getWeek() {
        //current date
        date = new Date();
        //6 days ago
        var diff = date.getDate() - 6,
            //set time to 0 to max out the date range
            weekStart = new Date(date.setHours(0, 0, 0, 0));
        //set the date to 6 days ago
        weekStart.setDate(diff);
        //return epoch time of weekStart
        return Math.floor(weekStart / 1000);
    };

    function callAPI() {
        //use free username and password for api authentication
        let username = "andrew_winchell";
        let password = "ColtEverett2301!";
        let base64 = btoa(username + ":" + password);

        //send ajax GET request to the opensky network api
        $.ajax({
            url: "https://opensky-network.org/api/states/all",
            type: "GET",
            dataType: "json",
            async: false,
            //include authorization to allow for greater number of api calls per day
            headers: {
                "Authorization": "Basic " + base64
            },
            //if the call is successfull, call anonymous function with ajax json return
            success: (jsonData) => {
                //create geojson template
                var geoJson = {
                    "type": "FeatureCollection",
                    "name": "Active Flights",
                    "features": []
                };

                //loop through json items and add them in the proper format to the geojson var
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
                        "velocity": item[9],
                        "true_track": item[10],
                        "vertical_rate": item[11],
                        "category": item[16]
                    }
                    geoJson.features.push(geoJSONFeature)
                });

                //turn geojson object into JSON string
                //new blob turns json string into file-like object
                const blob = new Blob([JSON.stringify(geoJson)], {
                    type: "application/json"
                });

                //turns the blob into a useable url string
                const url = URL.createObjectURL(blob);
                
                //set large plane variable to the esri private plane symbol
                const privatePlane = new WebStyleSymbol({
                    name: "Airplane_Private",
                    styleName: "EsriRealisticTransportationStyle"
                });

                //set large plane variable to the esri small passenger plane symbol
                const smallPlane = new WebStyleSymbol({
                    name: "Airplane_Small_Passenger",
                    styleName: "EsriRealisticTransportationStyle"
                });

                //set large plane variable to the esri large passenger plane symbol
                const largePlane = new WebStyleSymbol({
                    name: "Airplane_Large_Passenger",
                    styleName: "EsriRealisticTransportationStyle"
                });

                //Stylize the flights with ESRI Airplane Web Styles
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
                        //set the direction of the plane based on the true_track rotation field
                        {
                            type: "rotation",
                            field: "true_track",
                            axis: "heading",
                            rotationType: "geographic"
                        },
                        //set the vertical tilt of the plane based on the vertical_rate field
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

                //construct the flights layer from the URL (line 299)
                const flightsLayer = new GeoJSONLayer({
                    id: "flights",
                    url: url,
                    hasZ: true,
                    //assign plane rendered symbology to layer
                    renderer: planeRenderer,
                    //only show flights originating in the US
                    definitionExpression: "origin_country = 'United States'",
                    elevationInfo: {
                        mode: "relative-to-ground"
                    },
                    copyright: "The OpenSky Network, https://opensky-network.org",
                });

                //construct a popup template for flights
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
                
                //attach flight template to the flight layer popupt action
                flightsLayer.popupTemplate = flightsTemplate;
                
                //check to see if flights layer has been loaded yet
                if(map.findLayerById("flights")){
                    //always add the flights layer to position 1 in the layer list
                    map.add(flightsLayer, 1)
                    //.5 second delay after adding flight layer to make transition appear smoother
                    //layer is quite large and takes a second to render
                    setTimeout(() => {
                        //remove the previous flights layer
                        map.remove(map.layers.items[0])
                    }, 500)
                } else {
                    map.add(flightsLayer, 0)
                };
                
            }
        });
        //continuously call function every 15 seconds making map near-real-time
        setTimeout(callAPI, 15000);
    };
    callAPI();
});