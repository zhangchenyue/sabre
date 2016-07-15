/* global Sabre */
Sabre.pack('Sabre.lg', function (S) {
    'use strict'

    this.CT_CONVERSIONS = {
        'm': {
            'ft': {
                'Gain': 3.2808398950131235,
                'Offset': 0
            },
            'in': {
                'Gain': 39.370078740157474,
                'Offset': -4.593407584711759e-15
            },
            'cm': {
                'Gain': 100,
                'Offset': 0
            },
            'mm': {
                'Gain': 1000,
                'Offset': 0
            }
        },
        'ft': {
            'm': {
                'Gain': 0.3048,
                'Offset': 0
            },
            'in': {
                'Gain': 12,
                'Offset': 0
            },
            'cm': {
                'Gain': 30.48,
                'Offset': 0
            },
            'mm': {
                'Gain': 304.8,
                'Offset': 0
            }
        },
        'in': {
            'm': {
                'Gain': 0.025400000000000006,
                'Offset': 1.166725526516787e-16
            },
            'ft': {
                'Gain': 0.08333333333333333,
                'Offset': 0
            },
            'cm': {
                'Gain': 2.54,
                'Offset': 0
            },
            'mm': {
                'Gain': 25.4,
                'Offset': 0
            }
        },
        'cm': {
            'm': {
                'Gain': 0.01,
                'Offset': 0
            },
            'ft': {
                'Gain': 0.03280839895013123,
                'Offset': 0
            },
            'in': {
                'Gain': 0.39370078740157477,
                'Offset': 0
            },
            'mm': {
                'Gain': 10,
                'Offset': 0
            }
        },
        'mm': {
            'm': {
                'Gain': 0.001,
                'Offset': 0
            },
            'ft': {
                'Gain': 0.0032808398950131233,
                'Offset': 0
            },
            'cm': {
                'Gain': 0.1,
                'Offset': 0
            },
            'in': {
                'Gain': 0.03937007874015748,
                'Offset': 0
            }
        },
        's': {
            'day': {
                'Gain': 0.000011574074074074073,
                'Offset': 0
            },
            'hour': {
                'Gain': 0.0002777777777777778,
                'Offset': 0
            }
        },
        'ms': {
            'us': {
                'Gain': 1000,
                'Offset': 0
            }
        },
        'us': {
            'ms': {
                'Gain': 0.001,
                'Offset': 0
            }
        },
        'day': {
            's': {
                'Gain': 86400,
                'Offset': 0
            },
            'hour': {
                'Gain': 24.000000000000007,
                'Offset': 0
            }
        },
        'hour': {
            's': {
                'Gain': 3600,
                'Offset': 0
            },
            'day': {
                'Gain': 0.04166666666666666,
                'Offset': 0
            }
        },
        'unitless': {
            'ft3/ft3': { 'Gain': 1, 'Offset': 0 },
            'm3/m3': { 'Gain': 1, 'Offset': 0 }
        },
        'ft3/ft3': {
            'unitless': { 'Gain': 1, 'Offset': 0 },
            'm3/m3': { 'Gain': 1, 'Offset': 0 }
        },
        'm3/m3': {
            'ft3/ft3': { 'Gain': 1, 'Offset': 0 },
            'unitless': { 'Gain': 1, 'Offset': 0 }
        },
        'klbf': {
            'lbf': { 'Gain': 1000, 'Offset': 0 }
        },
        'lbf': {
            'klbf': { 'Gain': 0.001, 'Offset': 0 }
        },
        'kkgf': {
            'kgf': { 'Gain': 1000, 'Offset': 0 }
        },
        'kgf': {
            'kkgf': { 'Gain': 0.001, 'Offset': 0 }
        }
    };
});