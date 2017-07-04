import valueParser, { stringify } from 'postcss-value-parser';

function getUrl(nodes) {
    let url = '';
    let urlEnd = 0;

    for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        if (node.type === 'string') {
            if (i !== 0) {
                throw Error(`Invalid "svg-load(${stringify(nodes)})" definition`);
            }
            url = node.value;
            urlEnd = i + 1;
            break;
        }
        if (node.type === 'div' && node.value === ',') {
            if (i === 0) {
                throw Error(`Invalid "svg-load(${stringify(nodes)})" definition`);
            }
            urlEnd = i;
            break;
        }
        url += stringify(node);
        urlEnd += 1;
    }

    return {
        url,
        urlEnd
    };
}

function getParamChunks(nodes) {
    const list = [];
    const lastArg = nodes.reduce((arg, node) => {
        if (node.type === 'word' || node.type === 'string') {
            return arg + node.value;
        }
        if (node.type === 'space') {
            return arg + ' ';
        }
        if (node.type === 'div' && node.value === ',') {
            list.push(arg);
            return '';
        }
        return arg + stringify(node);
    }, '');

    return list.concat(lastArg);
}

function splitParams(list) {
    const params = {};

    list.reduce((sep, arg) => {
        if (!arg) {
            throw Error(`Expected parameter`);
        }

        if (!sep) {
            if (arg.indexOf(':') !== -1) {
                sep = ':';
            } else if (arg.indexOf('=') !== -1) {
                sep = '=';
            } else {
                throw Error(`Expected ":" or "=" separator in "${arg}"`);
            }
        }

        const pair = arg.split(sep);
        if (pair.length !== 2) {
            throw Error(`Expected "${sep}" separator in "${arg}"`);
        }
        params[pair[0].trim()] = pair[1].trim();

        return sep;
    }, null);

    return params;
}

function getLoader(parsedValue, valueNode) {
    if (!valueNode.nodes.length) {
        throw Error(`Invalid "svg-load()" statement`);
    }

    // parse url
    const { url, urlEnd } = getUrl(valueNode.nodes);

    // parse params
    const paramsNodes = valueNode.nodes.slice(urlEnd + 1);
    const params = urlEnd !== valueNode.nodes.length ? splitParams(getParamChunks(paramsNodes)) : {};

    return {
        url,
        params,
        valueNode,
        parsedValue
    };
}

function getInliner(parsedValue, valueNode) {
    if (!valueNode.nodes.length) {
        throw Error(`Invalid "svg-inline()" statement`);
    }
    const name = valueNode.nodes[0].value;

    return {
        name,
        valueNode,
        parsedValue
    };
}

function parseCSSText(cssText) {
    let res = {};

    cssText.split('}').forEach(item => {
        if (item === '') return;

        item += '}';

        let value = item.match(/\{(.*)\}/)[1],
            key = item.slice(0, item.indexOf('{'));

        res[key] = {};

        value = value.split(':');
        value.forEach((decl, counter) => {
            if ((counter + 1) % 2 === 0) {
                res[key][value[counter - 1]] = value[counter].trim();
            }
        });
    });

    return res;
}

export function getLoaderWithStyles(parsedValue, valueNode) {
    // parse url

    let _getUrl = getUrl(valueNode.nodes),
        url = _getUrl.url,
        urlEnd = _getUrl.urlEnd;

    // parse params


    let paramsNode = valueNode.nodes[2];
    let selectors = paramsNode && paramsNode.type === 'string'  && parseCSSText(paramsNode.value);

    return {
        url,
        params: {},
        valueNode,
        parsedValue,
        selectors
    };

}


export function parseDeclValue(value) {
    const loaders = [];
    const inliners = [];
    const parsedValue = valueParser(value);

    parsedValue.walk(valueNode => {
        if (valueNode.type === 'function') {
            if (valueNode.value === 'svg-load') {
                loaders.push(getLoader(parsedValue, valueNode));
            } else if (valueNode.value === 'svg-inline') {
                inliners.push(getInliner(parsedValue, valueNode));
            } else {
                loaders.push(getLoaderWithStyles(parsedValue, valueNode));
            }
        }
    });

    return {
        loaders,
        inliners
    };
}

