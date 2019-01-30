let colors = {
    1: {
        base: '#ffb81d',
        shade: {
            1: '#cc9317',
            2: '#996e11',
            3: '#66490b',
            4: '#322405'
        },
        tint: {
            1: '#ffbf33',
            2: '#ffc64a',
            3: '#ffcd60',
            4: '#ffd477'
        }
    },
    2: {
        base: '#60d1e0',
        shade: {
            1: '#4ca7b3',
            2: '#397d86',
            3: '#265359',
            4: '#13292c'
        },
        tint: {
            1: '#6fd5e3',
            2: '#7fdae6',
            3: '#8fdee9',
            4: '#9fe3ec',
            5: '#bfecf2',
            6: '#dff5f8'
        }
    },
    3: {
        base: '#185a7d',
        shade: {
            1: '#134864',
            2: '#0e364b',
            3: '#092432',
            4: '#041118'
        },
        tint: {
            1: '#2f6a8a',
            2: '#467b97',
            3: '#5d8ba4',
            4: '#749cb1'
        }
    },
    4: {
        base: '#50e96e',
        shade: {
            1: '#48d465',
            2: '#40bf5c',
            3: '#34a151',
            4: '#288143',
            5: '#206b3b'
        },
        tint: {
            1: '#62eb7d',
            2: '#86f09a',
            3: '#a9f4b6',
            4: '#c3f7cc',
            5: '#ddfbe2'
        }
    },
    5: {
        base: '#cdd1d1',
        shade: {
            1: '#b8bebe',
            2: '#a4acac',
            3: '#869191',
            4: '#2c2c2c',
            5: '#242424',
            6: '#000000'
        },
        tint: {
            1: '#d2d6d6',
            2: '#dcdfdf',
            3: '#e7e9e9',
            4: '#eeefef',
            5: '#f6f6f6',
            6: '#ffffff'
        }
    },
    6: {
        base: '#f24f18',
        shade: {
            1: '#d94716',
            2: '#c23f13',
            3: '#9e3310',
            4: '#79270c',
            5: '#61200a'
        },
        tint: {
            1: '#f36130',
            2: '#f6845e',
            3: '#f9a78c',
            4: '#fac2ae',
            5: '#fcdcd1'
        }
    }
};
colors.primary1 = colors[1];
colors.secondary1 = colors[2];
colors.secondary2 = colors[3];
colors.positive = colors[4];
colors.neutral = colors[5];
colors.negative = colors[6];
colors.text = colors[5].shade[5];
colors.background = colors[5].tint[6];
colors.highland = {
    1: '#ffdf40',
    2: '#426651'
};
colors.lowland = {
    1: '#008c8c',
    2: '#f2f2ce'
};
colors.speyside = {
    1: '#1f12b3',
    2: '#ffbf7f'
};
colors.islay = {
    1: '#18d9ea',
    2: '#403629'
};
colors.islands = {
    1: '#f23030',
    2: '#003366'
};
colors.campbeltown = {
    1: '#171f73',
    2: '#fff159'
};
export default colors;