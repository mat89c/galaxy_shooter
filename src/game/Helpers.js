/*global
    window
*/

/**
*@singleton
*/
function Helpers() {
    "use strict";

    if (typeof Helpers.instance === "object") {
        return Helpers.instance;
    }

    Helpers.instance = this;

    /**
    *Get base url
    *@return base url
    */
    Helpers.prototype.baseUrl = function () {
        let _getUrl = window.location;
        let _baseUrl = _getUrl.protocol + "//" + _getUrl.host + "/" + _getUrl.pathname.split('/')[1];

        return _baseUrl;
    };

    Helpers.prototype.isEmptyObject = function (obj) {
        for (let prop in obj) {
            if (obj.hasOwnProperty(prop))
                return false;
        }

        return JSON.stringify(obj) === JSON.stringify({});
    };
}

export default Helpers;