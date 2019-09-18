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
        this.add(this.asyncCantonLayerNew())

        // Grundbuchplan schwarz-weiss
        this.add(this.asyncGrundbuchMapLayerNew())

        // Orthophoto für zweite Hintergrundansicht
        // todo: cors error; this.add(this.asyncOrthoPhotoLayerNew());
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


    asyncCantonLayerNew() {
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

    asyncGrundbuchMapLayerNew() {
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

    asyncOrthoPhotoLayerNew() {
        return fetch('http://83.166.150.97/mapcache/wmts/1.0.0/WMTSCapabilities.xml')
            .then(function(response) {
                let result = this.parser.read(response);

                let options = ol.source.WMTS.optionsFromCapabilities(result, {
                    layer: 'a4p_a4p_orthofoto_n_bk',
                    matrixSet: 'EPSG:2056'
                });
                this.applyTokeToWMTSOptions(configuration.token, options);

                let wmtsSource = new ol.source.WMTS(options);
                self.refreshOnInvalidToken(configuration.token, wmtsSource);

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

