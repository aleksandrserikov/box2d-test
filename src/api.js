const fetch = require("node-fetch");
const PORT = process.env.PORT || 3001;
const API_URL = '';

export function fetchData(url, callback) {
    let baseUrl = API_URL ? API_URL : 'http://localhost:' + PORT;
    const encodedURI = encodeURI(baseUrl + url);
    return fetch(encodedURI)
        .then((response) => {
            if (!response.ok) {
                throw new Error(response.status + ' ' + response.statusText);
            }
            return response.json();
        })
        .then((data) => { callback(data); })
        .catch((error) => {
            console.error(error);
            callback(null, error);
            return null
        });
}

function checkReady(readyList) {
    let ready = true;
    for(let key in readyList) {
        if (readyList.hasOwnProperty(key)) {
            ready = ready && readyList[key];
        }
    }
    return ready;
}

function replaceParams(urlPattern, params) {
    let url = urlPattern;
    for(let key in params) {
        if (params.hasOwnProperty(key)) {
            url = url.replace('{' + key + '}', params[key]);
        }
    }
    return url;
}

export function getData(fetchList, params, callback) {
    let readyList = {};
    let dataList = {};
    for(let key in fetchList) {
        if (fetchList.hasOwnProperty(key)) {
            readyList[key] = false;
            dataList[key] = null;
        }
    }
    for(let key in fetchList) {
        if (fetchList.hasOwnProperty(key)) {
            fetchData(replaceParams(fetchList[key], params), function (data, error) {
                dataList[key] = error ? { error: error } : { data: data };
                readyList[key] = true;
                if (checkReady(readyList)) {
                    callback(dataList);
                }
            })
        }
    }
}