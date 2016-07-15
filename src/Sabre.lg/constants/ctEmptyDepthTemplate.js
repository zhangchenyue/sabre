/* global Sabre */
Sabre.pack('Sabre.lg', function (S) {
    'use strict'

    this.CT_EMPTY_DEPTH_TEMPLATE = {
        "BackgroundColor": "white",
        "DescriptionInInsert": "true",
        "Domain": "MEASURED_DEPTH",
        "Name": "undefined",
        "PaperUnit": "in",
        "Purpose": "CUSTOMER",
        "Source": "SYSTEM",
        "UseForDefaultProduct": "false",
        "Visible": "true",
        "VisibleInInsert": "true",
        "StuckToolIndicator": "false",
        "IndexUnits": {
            "IndexUnit": [
                { "@UnitSystem": "english", "#text": "ft" },
                { "@UnitSystem": "metric", "#text": "m" },
                { "@UnitSystem": "canadian", "#text": "m" }
            ]
        },
        "IndexScale": {
            "@lg:UniqueId": "indexScale",
            "Ratio": "1:240"
        },
        "IndexGrid": {
            "@lg:UniqueId": "indexGrid",
            "IndexLine": [
                {
                    "@lg:UniqueId": "minorLine",
                    "Color": "gray",
                    "Thickness": "LIGHT",
                    "Spacings": {
                        "Spacing": [
                            { "@UnitSystem": "english", "@Unit": "ft", "#text": "2" },
                            { "@UnitSystem": "metric", "@Unit": "m", "#text": "1" },
                            { "@UnitSystem": "canadian", "@Unit": "m", "#text": "1" }
                        ]
                    }
                },
                {
                    "@lg:UniqueId": "majorLine",
                    "Color": "gray",
                    "Thickness": "MEDIUM",
                    "Spacings": {
                        "Spacing": [
                            { "@UnitSystem": "english", "@Unit": "ft", "#text": "10" },
                            { "@UnitSystem": "metric", "@Unit": "m", "#text": "5" },
                            { "@UnitSystem": "canadian", "@Unit": "m", "#text": "5" }
                        ]
                    },
                    "IndexNumber": {
                        "@lg:UniqueId": "majorNumber",
                        "TextFormattings": {
                            "TextFormatting": [
                                { "@UnitSystem": "english", "#text": "%.0f" },
                                { "@UnitSystem": "canadian", "#text": "%.0f" },
                                { "@UnitSystem": "metric", "#text": "%.0f" }
                            ]
                        }
                    }
                }
            ]
        }
    };
});