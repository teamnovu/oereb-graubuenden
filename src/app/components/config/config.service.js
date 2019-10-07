export class ConfigService {
    constructor() {
        'ngInject';

        // zoom configuration
        this.zoom = {
            default: 0,
            zoomedIn: 13,
            oerebLayer: 11,
            min: 4,
            minTablet: 3,
            minMobile: 2
        };

        // default projection
        this.projection = {
            extent: [2691000.0, 1098000.0, 2835000.0, 1242000.0],
            epsg: 'EPSG:2056'
        };

        // default center
        this.center = [2750000, 1150000];

        // map services
        this.services = {
            // WFS mit Grundstücken und selbständigen und dauernden Rechten. Wird für die Markierung in der Karte bei der Auswahl der Grundstücke verwendet.
            wfsPropertyMarking: 'https://wfs.geo.gr.ch/amtlichevermessung',
            // Basis URL des OEREB-Webservice gemäss Weisung
            oereb: 'http://olivin3.gis.gr.ch/main/oereb',
            pdf: 'http://olivin3.gis.gr.ch/main/oereb',
            // Aufruf der Karte des ÖREB-Katasters für das im Samrt-Auszug ausgewählte Grundstück. Variablen EGRID und Language.
            extern: 'https://www.map.apps.be.ch/pub/externalcall.jsp?query1=egrid&keyvalue1=-EGRID-&keyname1=EGRID&project=a42pub_oereb_oeffen_-LANGUAGE-&language=-LANGUAGE-&userprofile=geo&client=auto'
        };

        this.opacityRestrictionLayers = 0.7;

        // configure order of sub themes of accordion 'LandUsePlans'
        this.customSortList = [
            {
                de: 'Zonenflächen der Grundnutzung',
                fr: 'Surfaces de zones de l’affectation primaire'
            },
            {
                de: 'Zonenflächen Grundnutzung (Nutzungszonen)',
                fr: 'Surfaces de zones de l’affectation primaire (Type de zone d\'affectation)'
            },
            {
                de: 'Zonenflächen Grundnutzung (Bauklassen)',
                fr: 'Surfaces de zones de l’affectation primaire (Classe de construction)'
            },
            {
                de: 'Überlagernde Zonenflächen',
                fr: 'Zones superposées'
            },
            {
                de: 'Andere flächenbezogene Festlegungen',
                fr: 'Autres périmètres superposés'
            },
            {
                de: 'Linienbezogene Festlegungen',
                fr: 'Contenus linéaires'
            },
            {
                de: 'Punktbezogene Festlegungen',
                fr: 'Contenus ponctuels'
            },
        ];

        // layer configurations are in: ../layers/layers.service.js
    }
}
