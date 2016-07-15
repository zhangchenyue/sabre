/* global Sabre */
Sabre.pack('Sabre.lg', function (S) {
    'use strict'

    this.CT_EMPTY_TIME_TEMPLATE = {
        "BackgroundColor": "white",
        "DescriptionInInsert": "true",
        "Domain": "TIME",
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
                { "@UnitSystem": "english", "#text": "s" },
                { "@UnitSystem": "metric", "#text": "s" },
                { "@UnitSystem": "canadian", "#text": "s" }
            ]
        },
        "IndexScale": {
            "@lg:UniqueId": "indexScale",
            "Scale": {
                "PaperFactor": { "#text": "1", "@Unit": "in" },
                "IndexFactor": { "#text": "300", "@Unit": "s" }
            }
        },
        "IndexGrid": {
            "@lg:UniqueId": "indexGrid",
            "IndexLine": [
                {
                    "@lg:UniqueId": "MinorLine",
                    "Color": "gray",
                    "Thickness": "LIGHT",
                    "Spacing": { "@Unit": "s", "#text": "300" }
                },
                {
                    "@lg:UniqueId": "mediumLine",
                    "Color": "gray",
                    "Thickness": "MEDIUM",
                    "Spacing": { "@Unit": "s", "#text": "900" },
                    "IndexNumber": {
                        "@lg:UniqueId": "mediumIndexNumber",
                        "TextFormatting": { "@UnitSystem": "english", "#text": "%T" }
                    }
                },
                {
                    "@lg:UniqueId": "MajorLine",
                    "Color": "gray",
                    "Thickness": "MEDIUM",
                    "Spacing": { "@Unit": "s", "#text": "1800" },
                    "IndexNumber": {
                        "@lg:UniqueId": "majorIndexNumber",
                        "TextFormatting": { "@UnitSystem": "english", "#text": "%d %b %Y %H:%M:%S" }
                    }
                }
            ]
        }
    };
});