var map;

const icons = {
    "ram":        [["0CF25610DF30C07F57F7AF9058F4636B15A2A7D7", 66267],
                   ["1CBB0445780D0A4AE1A20C7CEF27EB792E35331D", 455544]
                  ],
    "catapult":   [["0F68450F2D9AAE580294070426EFD7AF66F1CE71", 63047],
                   ["D0043C7BC34324B0600726CF97A66AAAE3BBFBD1", 455543]
                  ],
    "arrowcart":  [["02052733FF693927AC44EEBCAAFF4B5AB0E974AD", 63046],
                   ["630DB452D15F1820D3D8E5F32839F2ECCF6CF0ED", 455541]
                  ],
    "ballista":   [["27E67AB70677EB0DB834A4D4244CBE65FA1F1DC7", 62862],
                   ["1274B2AE9C3641AB1807FA4534D808DF7558FA1D", 455542]]
    
}

function getIcon(key, tier = 0) {
    if(!(key in icons) || tier < 0 || tier > 2) {
        return "";
    }
    const [hash,id] = icons[key][tier];
    return `https://render.guildwars2.com/file/${hash}/${id}.png`
}

function unproject(coord) {
    return map.unproject(coord, map.getMaxZoom());
}

function onMapClick(e) {
    console.log("You clicked the map at " + map.project(e.latlng));
}

var acIcon = L.icon({
    iconUrl: getIcon("arrowcart"),
    //shadowUrl: 'leaf-shadow.png',

    iconSize:     [40, 40], // size of the icon
    //shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [0, 0], // point of the icon which will correspond to marker's location
    //shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

$(() => {
    "use strict";
    
    let southWest, northEast;
    
    map = L.map("map", {
        minZoom: 0,
        maxZoom: 7,
        crs: L.CRS.Simple
    }).setView([0, 0], 0);
    
    southWest = unproject([0, 32768]);
    northEast = unproject([32768, 0]);
    
    map.setMaxBounds(new L.LatLngBounds(southWest, northEast));

    L.tileLayer("https://tiles.guildwars2.com/2/1/{z}/{x}/{y}.jpg", {
        minZoom: 0,
        maxZoom: 7,
        continuousWorld: true
    }).addTo(map);

    map.on("click", onMapClick);

    $.getJSON("https://api.guildwars2.com/v1/map_floor.json?continent_id=1&floor=1", (data) => {
        let region, gameMap, i, il, poi;
        
        for (region in data.regions) {
            region = data.regions[region];
            
            for (gameMap in region.maps) {
                gameMap = region.maps[gameMap];
                
                for (i = 0, il = gameMap.points_of_interest.length; i < il; i++) {
                    poi = gameMap.points_of_interest[i];
                    
                    if (poi.type != "waypoint") {
                        continue;
                    }

                    L.marker(unproject(poi.coord), {
                        title: poi.name,
                        icon: acIcon
                    }).addTo(map);
                }
            }
        }
    });
});