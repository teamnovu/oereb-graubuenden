export class LayersService {
    constructor(Notification, EsriToken) {
        'ngInject';

        this.ol = ol;
        this.Notification = Notification;
        this.EsriToken = EsriToken;

        this.layers = [];
        this.resolvedLayers = [];
        this.parser = new ol.format.WMTSCapabilities();

        /*
         * REGISTER LAYERS HERE
        */

        // Geometrie der Kantonsgrenze
        this.add(this.asyncCantonLayer())

        // Grundbuchplan schwarz-weiss
        this.add(this.asyncGrundbuchMapLayer())

        // Orthophoto für zweite Hintergrundansicht
        this.add(this.asyncOrthoPhotoLayer());
    }
    /*
        Views definitions:
     */
    defaultView() {
        return 'map';
    }

    setView(name) {
        if (name === 'map') {
            this.show('greyMap'); // layer name
            this.hide('orthoPhoto');
        }

        if (name === 'satellite') {
            this.show('orthoPhoto');
            this.hide('greyMap');
        }
    }


    asyncCantonLayer() {
        // documentation for ol.source.TileWMS: http://geoadmin.github.io/ol3/apidoc/ol.source.TileWMS.html
        let params = {
            'LAYERS': 'Kantonsgrenzen',
            'TILED': true,
            'VERSION': '1.3.0',
            'FORMAT': 'image/png',
            'CRS': 'EPSG:2056'
        };

        let wmsOEREBSource = new this.ol.source.TileWMS(({
            url: 'https://wms.geo.gr.ch/admineinteilung',
            params: params,
            serverType: 'geoserver',
        }));

        // http://geoadmin.github.io/ol3/apidoc/ol.layer.Tile.html
        let wmsOEREB = new this.ol.layer.Tile({
            opacity: 1,
            visible: true, // is visible per default
            source: wmsOEREBSource,
            name: 'cantonMap',
        });

        wmsOEREB.setZIndex(500);

        return wmsOEREB;
    }

    asyncGrundbuchMapLayer() {
        // documentation for ol.source.TileWMS: http://geoadmin.github.io/ol3/apidoc/ol.source.TileWMS.html
        let params = {
            'LAYERS': 'Liegenschaften',
            'TILED': true,
            'VERSION': '1.3.0',
            'FORMAT': 'image/png',
            'CRS': 'EPSG:2056'
        };

        let wmsOEREBSource = new this.ol.source.TileWMS(({
            url: 'https://wms.geo.gr.ch/amtlichevermessung',
            params: params,
            serverType: 'geoserver',
        }));

        // http://geoadmin.github.io/ol3/apidoc/ol.layer.Tile.html
        let wmsOEREB = new this.ol.layer.Tile({
            opacity: 1,
            visible: true, // is visible per default
            source: wmsOEREBSource,
            name: 'grundbuchMap'
        });

        wmsOEREB.setZIndex(1);

        return wmsOEREB;
    }

    asyncOrthoPhotoLayer() {
        var self = this;

        return fetch('http://83.166.150.97/mapcache/wmts/1.0.0/WMTSCapabilities.xml')
            .then(function (response) {
                return response.text();
            })
            .then(function(text) {
                let result = self.parser.read(text);

                let options = ol.source.WMTS.optionsFromCapabilities(result, {
                    layer: 'Luftbild',
                    matrixSet: 'EPSG:2056'
                });

                let wmtsSource = new ol.source.WMTS(options);

                let wmtsLayer = new ol.layer.Tile({
                    opacity: 1,
                    source: wmtsSource,
                    visible: false,
                    name: 'orthoPhoto'
                });

                wmtsLayer.setZIndex(3);

                return wmtsLayer;
            })
    }

    /*
        LAYERS END
     */

    /*
        DO NOT EDIT CODE AFTER THIS COMMENT
     */

    // checks if layer is currently active
    isActive(name) {
        return (this.active == name);
    }

    // hide a layer by name
    hide(name, inverse = false) {
        this.resolvedLayers.forEach(layer => {
            if (layer !== undefined && layer.M && layer.M.name == name) {
                layer.visible = inverse;
            }
        });

        return name;
    }

    // show a layer by name
    show(name) {
        return this.hide(name, true);
    }

    get(callback) {
        let layerService = this;

        let requests = this.layers.map((layer) => {
            return new Promise((resolve) => {
                if (layer instanceof Promise) {
                    layer.then(function (value) {
                        if (value !== undefined)
                            layerService.resolvedLayers.push(value);

                        resolve();
                    });
                } else {
                    layerService.resolvedLayers.push(layer);
                    resolve();
                }

            });
        });

        Promise.all(requests).then(() => callback(layerService.resolvedLayers));
    }

    add(layer) {
        this.layers.push(layer);
    }
}

