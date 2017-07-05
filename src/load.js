import { readFile } from 'fs';
import render from './render.js';
import { transform, encode } from './defaults.js';
import { removeFill, applyRootParams, applySelectedParams } from './processors.js';

function read(id) {
    return new Promise((resolve, reject) => {
        readFile(id, 'utf-8', (err, data) => {
            if (err) {
                reject(Error(`Can't load '${id}'`));
            } else {
                resolve(data);
            }
        });
    });
}

export default function load(id, params, selectors, opts, styleString) {
    const processors = [
        removeFill(id, opts),
        applyRootParams(params),
        applySelectedParams(selectors, styleString)
    ];
    return read(id).then(data => {
        let code = render(data, ...processors);

        if (opts.encode !== false) {
            code = (opts.encode || encode)(code);
        }

        if (opts.transform !== false) {
            code = (opts.transform || transform)(code, id);
        }

        return code;
    });
}
