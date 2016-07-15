/* global Sabre */
Sabre.pack('Sabre.lg',function (S) {
    'use strict'
    
	// exported from lgSchema3.xsd
    this.CT_DEFAULTS = {
        "ctLGCatalogSnippet": {},
        "ctAreaFill": {
            "BackgroundColor": "white",
            "BackgroundMode": "OPAQUE",
            "FillMode": "BETWEEN",
            "ForegroundColor": "black",
            "ShadetoWrappedCurves": "false",
            "Visible": "true",
            "VisibleInInsert": "true"
        },
        "ctAutoAnnotations": {
            "CurveLabelsVisible": "false",
            "SplicePointsVisible": "false",
            "SurveysVisible": "false",
            "TotalDepthVisible": "false",
            "FirstReadingVisible": "false"
        },
        "ctAverageCurve": {
            "Color": "black",
            "HideWhenFineScale": "false",
            "LineStyle": "SOLID",
            "Thickness": "MEDIUM",
            "Transform": "LINEAR",
            "Visible": "true",
            "VisibleInInsert": "true",
            "WrapCount": "0",
            "WrapMode": "BOTH"
        },
        "ctBinding": {},
        "ctBoreholeDrift": {
            "HideWhenFineScale": "false",
            "Visible": "true",
            "VisibleInInsert": "true"
        },
        "ctBoreholeImage": {
            "InsideView": "true",
            "Interpolate": "true",
            "Orientation": "NONE",
            "Visible": "true",
            "VisibleInInsert": "true"
        },
        "ctCumulativeCurveArea": {
            "BackgroundColor": "white",
            "BackgroundMode": "OPAQUE",
            "ForegroundColor": "black"
        },
        "ctCumulativeCurveAreas": {},
        "ctCumulativeCurves": {
            "Color": "black",
            "CurvesVisible": "false",
            "CurvesVisibleInInsert": "false",
            "LineMode": "POINT_TO_POINT",
            "LineStyle": "SOLID",
            "Thickness": "MEDIUM",
            "Visible": "true",
            "VisibleInInsert": "true"
        },
        "ctCurve": {
            "Color": "black",
            "HideWhenFineScale": "false",
            "LineMode": "POINT_TO_POINT",
            "LineStyle": "SOLID",
            "ReplaceAbsent": "10",
            "Thickness": "MEDIUM",
            "Transform": "LINEAR",
            "Visible": "true",
            "VisibleInInsert": "true",
            "WrapCount": "0",
            "WrapMode": "BOTH"
        },
        "ctCurveAggregate": {
            "Color": "black",
            "CurveSpan": "10.0",
            "LineMode": "POINT_TO_POINT",
            "LineStyle": "SOLID",
            "Thickness": "MEDIUM",
            "Transform": "LINEAR",
            "Visible": "true",
            "VisibleInInsert": "true"
        },
        "ctCurveArea": {
            "ColorMapInInsert": "true",
            "ExtentInPaperUnit": "false",
            "MaxHoldupValue": "1.0",
            "MinHoldupValue": "0.0",
            "Visible": "true",
            "VisibleInInsert": "true"
        },
        "ctCustomProperties": {},
        "ctDepthMarker": {
            "Alignment": "LEFT",
            "Color": "black",
            "Length": "MEDIUM",
            "LineStyle": "SOLID",
            "Thickness": "LIGHT",
            "Visible": "true",
            "VisibleInInsert": "true"
        },
        "ctDipAngle": {
            "HideWhenFineScale": "false",
            "ThresholdHighQuality": "15",
            "ThresholdLowQuality": "0",
            "ThresholdPlanarity": "5.0",
            "Transform": "TANGENTIAL",
            "Visible": "true",
            "VisibleInInsert": "true"
        },
        "ctFanPlot": {
            "BackgroundColor": "white",
            "BackgroundMode": "TRANSPARENT",
            "Buckets": "10",
            "Color": "black",
            "IntervalPosition": "50",
            "IntervalStart": "0",
            "Length": "1",
            "ScalingMode": "UNITIZED",
            "ShowIntervalBoundary": "true",
            "Thickness": "MEDIUM",
            "TrackPosition": "50"
        },
        "ctFormat": {
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
            "StuckToolIndicator": "false"
        },
        "ctFont": {
            "Bold": "false",
            "FaceName": "Arial",
            "Italic": "false",
            "Size": "12",
            "Strikethrough": "false",
            "Underline": "false"
        },
        "ctFontTable": {},
        "ctGradientLine": {
            "BackgroundColor": "white",
            "BackgroundMode": "TRANSPARENT",
            "Color": "black",
            "FluidTypeVisible": "true",
            "FreeFluidLevelErrorVisible": "true",
            "FreeFluidLevelVisible": "true",
            "FreeFluidLevelLabelVisible": "true",
            "LabelVisible": "true",
            "LineStyle": "SOLID",
            "Thickness": "MEDIUM",
            "Transform": "LINEAR",
            "Visible": "true",
            "VisibleInInsert": "true"
        },
        "ctImage": {
            "Alignment": "LEFT",
            "Interpolate": "true",
            "Mirror": "false",
            "TrackCoverage": "100.0",
            "Visible": "true",
            "VisibleInInsert": "true"
        },
        "ctIntervalSet": {
            "Active": "false",
            "BackgroundColor": "white",
            "BackgroundMode": "TRANSPARENT",
            "BarOffset": "2",
            "BarThickness": "10",
            "BarVisible": "false",
            "Color": "black",
            "LineStyle": "SOLID",
            "LineThickness": "MEDIUM",
            "LineVisible": "true",
            "Visible": "true",
            "VisibleInInsert": "true"
        },
        "ctIndexGrid": {
            "Visible": "true"
        },
        "ctIndexLine": {
            "Color": "gray",
            "LineStyle": "SOLID",
            "Thickness": "LIGHT"
        },
        "ctIndexNumber": {
            "Alignment": "LEFT",
            "Color": "black"
        },
        "ctLinearGrid": {
            "Color": "gray",
            "LineStyle": "SOLID",
            "Thickness": "LIGHT",
            "Visible": "true"
        },
        "ctLithology": {
            "BackgroundColor": "white",
            "BackgroundMode": "OPAQUE",
            "FillMode": "BETWEEN",
            "ForegroundColor": "black",
            "HideWhenFineScale": "false",
            "Visible": "true",
            "VisibleInInsert": "true"
        },
        "ctLogarithmicGrid": {
            "Color": "gray",
            "LineStyle": "SOLID",
            "LogScale": "1",
            "Reverse": "false",
            "ShowMinorGridLines": "true",
            "Thickness": "LIGHT",
            "Visible": "true"
        },
        "ctMultiInstanceCurve": {
            "Color": "black",
            "LineStyle": "SOLID",
            "ReplaceAbsent": "10",
            "Thickness": "MEDIUM",
            "Transform": "LINEAR",
            "Visible": "true",
            "VisibleInInsert": "true",
            "WrapCount": "0",
            "WrapMode": "BOTH"
        },
        "ctMultiPassCurve": {
            "Color": "black",
            "HideWhenFineScale": "false",
            "LineMode": "POINT_TO_POINT",
            "LineStyle": "SOLID",
            "Thickness": "MEDIUM",
            "Transform": "LINEAR",
            "Visible": "true",
            "VisibleInInsert": "true",
            "WrapCount": "0",
            "WrapMode": "BOTH"
        },
        "ctOrientedTrack": {
            "BackgroundColor": "white",
            "BackgroundMode": "OPAQUE",
            "DescriptionInInsert": "false",
            "IndexLinesVisible": "false",
            "IndexNumbersVisible": "false",
            "MirrorImageMode": "NONE",
            "MirrorImageOffset": "0.0",
            "Source": "SYSTEM",
            "WidthInPercentage": "50.0",
            "Visible": "true",
            "VisibleInInsert": "true"
        },
        "ctParameterCurve": {
            "Color": "black",
            "LineStyle": "SOLID",
            "ShowOuterLimit": "false",
            "ShowZoneBoundary": "true",
            "Thickness": "MEDIUM",
            "Transform": "LINEAR",
            "Visible": "true",
            "VisibleInInsert": "true"
        },
        "ctPattern": {
            "BackgroundColor": "white",
            "ForegroundColor": "black",
            "VisibleInInsert": "false"
        },
        "ctPatternTable": {
            "Source": "StdPatterns",
            "VisibleInInsert": "false"
        },
        "ctPip": {
            "Alignment": "LEFT",
            "Color": "black",
            "HideWhenFineScale": "false",
            "Length": "MEDIUM",
            "LineStyle": "SOLID",
            "Thickness": "LIGHT",
            "Visible": "true",
            "VisibleInInsert": "true"
        },
        "ctPLCrossSection": {
            "ColorMapInInsert": "true",
            "MaxHoldupValue": "1.0",
            "MinHoldupValue": "0.0",
            "RotateBy90Degrees": "false",
            "Visible": "true",
            "VisibleInInsert": "true"
        },
        "ctLineProperty": {
            "Color": "black",
            "LineStyle": "SOLID",
            "Thickness": "MEDIUM"
        },
        "ctQualityCurve": {
            "Color": "black",
            "HideWhenFineScale": "false",
            "LineStyle": "SOLID",
            "Thickness": "MEDIUM",
            "Transform": "LINEAR",
            "Visible": "true",
            "VisibleInInsert": "true",
            "WrapCount": "0",
            "WrapMode": "BOTH"
        },
        "ctRepeatAnalysisCurve": {
            "Color": "black",
            "LineMode": "POINT_TO_POINT",
            "LineStyle": "SOLID",
            "MainToRepeatFillColor": "rgb(AE,AE,FF)",
            "RepeatToMainFillColor": "rgb(FF,B9,FF)",
            "ReplaceAbsent": "10",
            "Transform": "LINEAR",
            "Visible": "true",
            "VisibleInInsert": "true",
            "WrapCount": "0",
            "WrapMode": "BOTH"
        },
        "ctSineDip": {
            "Color": "black",
            "LineStyle": "SOLID",
            "Thickness": "MEDIUM",
            "Visible": "true",
            "VisibleInInsert": "true"
        },
        "ctStaticThreshold": {},
        "ctStationPoints": {
            "BackgroundColor": "white",
            "BackgroundMode": "TRANSPARENT",
            "Color": "black",
            "LabelVisible": "true",
            "Radius": "4.0",
            "Shape": "CIRCLE",
            "ShowExcludedPoints": "true",
            "Thickness": "LIGHT",
            "Transform": "LINEAR",
            "Visible": "true",
            "VisibleInInsert": "true",
            "WrapCount": "0",
            "WrapMode": "BOTH"
        },
        "ctStatusWordImage": {
            "BorderColor": "black",
            "BorderLineStyle": "SOLID",
            "BorderThickness": "LIGHT",
            "BorderVisible": "false",
            "Visible": "true",
            "VisibleInInsert": "true"
        },
        "ctStatusWordMappings": {
            "VisibleInInsert": "true"
        },
        "ctSuspiciousZones": {
            "Alignment": "LEFT",
            "BackgroundColor": "white",
            "BackgroundMode": "TRANSPARENT",
            "ForegroundColor": "black",
            "Visible": "true"
        },
        "ctSymbolCurve": {
            "BackgroundColor": "white",
            "BackgroundMode": "TRANSPARENT",
            "Color": "black",
            "Radius": "4.0",
            "Shape": "CIRCLE",
            "Thickness": "LIGHT",
            "Transform": "LINEAR",
            "Visible": "true",
            "VisibleInInsert": "true",
            "WrapCount": "0",
            "WrapMode": "BOTH"
        },
        "ctTangentialGrid": {
            "Color": "gray",
            "MajorGridLineStyle": "SOLID",
            "MajorGridThickness": "MEDIUM",
            "MinorGridLineStyle": "SOLID",
            "MinorGridThickness": "LIGHT",
            "ShowMinorGridLines": "true",
            "Visible": "true"
        },
        "ctTextFormattings": {},
        "ctTick": {
            "Alignment": "LEFT",
            "Color": "black",
            "HideWhenFineScale": "false",
            "Length": "SMALL",
            "LineStyle": "SOLID",
            "Thickness": "LIGHT",
            "Visible": "true",
            "VisibleInInsert": "true"
        },
        "ctTrack": {
            "BackgroundColor": "white",
            "BackgroundMode": "OPAQUE",
            "DescriptionInInsert": "false",
            "IndexLinesVisible": "true",
            "IndexNumbersVisible": "false",
            "Source": "SYSTEM",
            "Visible": "true",
            "VisibleInInsert": "true"
        },
        "ctTadPole": {
            "BackgroundColor": "black",
            "BackgroundMode": "TRANSPARENT",
            "Color": "black",
            "Shape": "CIRCLE",
            "Thickness": "LIGHT"
        },
        "ctUncertaintyCurve": {
            "Transform": "LINEAR",
            "Visible": "true",
            "VisibleInInsert": "true",
            "WrapCount": "0",
            "WrapMode": "BOTH"
        },
        "ctValueCurve": {
            "Alignment": "LEFT",
            "BackgroundColor": "white",
            "BackgroundMode": "TRANSPARENT",
            "BorderThickness": "NONE",
            "Color": "black",
            "Visible": "true",
            "VisibleInInsert": "true"
        },
        "ctVDL": {
            "ColorMapInInsert": "true",
            "DynamicStartDuration": "false",
            "Visible": "true",
            "VisibleInInsert": "true"
        },
        "ctVDL2D": {
            "ExtentInPaperUnit": "true",
            "Visible": "true",
            "VisibleInInsert": "true"
        },
        "ctVolumeAnalysis": {
            "SeparatorLineColor": "black",
            "SeparatorLineStyle": "SOLID",
            "SeparatorLineThickness": "MEDIUM",
            "Visible": "true",
            "VisibleInInsert": "true"
        },
        "ctWaveform": {
            "ClipMode": "NONE",
            "DynamicStartDuration": "false",
            "ExtentInPaperUnit": "true",
            "FillColor": "red",
            "FillMode": "NONE",
            "LineColor": "black",
            "LineStyle": "SOLID",
            "LineThickness": "MEDIUM",
            "Visible": "true",
            "VisibleInInsert": "true"
        },
        "ctZoneSet": {
            "BackgroundColor": "white",
            "BackgroundMode": "TRANSPARENT",
            "BorderColor": "black",
            "BorderLineStyle": "SOLID",
            "BorderThickness": "MEDIUM",
            "Visible": "true",
            "VisibleInInsert": "true"
        }
    };
});