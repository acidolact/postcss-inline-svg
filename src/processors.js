import {selectOne, selectAll} from 'css-select';

function matchId(exp, id) {
    return exp instanceof RegExp ? exp.test(id) : Boolean(exp);
}

function removeFillAttrib(element) {
    delete element.attribs.fill;
}

export function removeFill(id, opts) {
    return dom => {
        if (matchId(opts.removeFill, id)) {
            selectAll('[fill]', dom).forEach(removeFillAttrib);
        }
    };
}

function applyParams(params) {
    return ({attribs}) => {
        Object.keys(params).forEach(name => {
            attribs[name] = params[name];
        });
    };
}

export function applyRootParams(params) {
    return dom => {
        applyParams(params)(selectOne('svg', dom));
    };
}

export function applySelectedParams(selectors, styleString) {
    return dom => {
        const svg = selectOne('svg', dom);

        let hasStylesNode,
            styleNodeIndex = 0;

        for (; styleNodeIndex < svg.children.length; styleNodeIndex++) {
            let node = svg.children[styleNodeIndex];

            if (node.type === 'style') {
                hasStylesNode = true;
                break;
            }
        }

        if (hasStylesNode) {
            svg.children[styleNodeIndex].children[0].data += ` ${styleString}`;
        } else {

            Object.keys(selectors).forEach(selector => {
                selectAll(selector, svg).forEach(applyParams(selectors[selector]));
            });
        }
    };
}
