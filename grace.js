(function (window, undefined) {
    /*
     * .template    (no data-template-src)      no other data
     *  => no effect
     * .template    (no data-template-src)      has other data
     *  => innerHTML used as template
     * .template    (data-template-src)         no other data
     *  => template becomes innerHTML
     * .template    (data-template-src)         has other data
     *  => template becomes innerHTML, with data rendering the template
     */
    'use strict';

    function noop() {}

    /**
     * Super simple fetch([get]) equivalent.
     */
    function get(url, onDone, onFail) {
        var httpRequest = new window.XMLHttpRequest();

        if (!httpRequest) {
            onFail();
        }
        httpRequest.onreadystatechange = function () {
            if (httpRequest.readyState === window.XMLHttpRequest.DONE) {
                if (httpRequest.status === 200) {
                    (onDone || noop)(httpRequest.responseText);
                } else {
                    (onFail || noop)();
                }
            }
        };
        httpRequest.open('GET', url);
        httpRequest.send();
    }

    /**
     * Load simple templating function.
     * @param str
     * @param data
     * @returns string
     */
    function template(str, data) {
        return str.replace(/\{\{([\s\S]+?)\}\}/g, function (v) {
            var keyName = v.substr(2).slice(0, -2).trim();
            return data[keyName];
        });
    }


    function numAttribs(obj) {  // stackoverflow.com/questions/126100
        var count = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                count += 1;
            }
        }
        return count;
    }


    function applyTemplate(targetElement, data, markup) {
        var key;

        // markup is optional. defaults to html of targetElement.
        markup = markup || targetElement.innerHTML;

        for (key in data) {
            if (data.hasOwnProperty(key)) {
                // allow fancy crap, including recursive traversal
                // if you have e.g. data-foo="($('.post').length >= 5)"
                try {
                    data[key] = eval(data[key]);  // jshint ignore:line
                } catch (err) {
                    // it was not an expression.
                    noop();
                }
            }
        }
        if (numAttribs(data)) {
            targetElement.innerHTML = template(markup, data);
        }
    }

    function showElement(el) {
        if (el) {
            el.style.display = '';
        }
    }

    function hideElement(el) {
        if (el) {
            el.style.display = 'none';
        }
    }

    var document = window.document,
        documentEl = document.documentElement;

    if (!documentEl) {
        window.console.error('Missing document :(');
        return;
    }
    // Hide the document as soon as it is available.
    hideElement(documentEl);

    // stall until DOM ready
    document.addEventListener('DOMContentLoaded', function () {
        var templates = document.getElementsByClassName('template');
        if (!(templates && templates.length)) {  // Nothing to do.
            return;
        }
        for (var idx = 0; idx < templates.length; idx++) {
            (function (target) {  // jshint ignore:line
                var data = target.dataset || {},
                    templateSrc = data.templateSrc || '';

                if (templateSrc) {
                    get(templateSrc,
                        function (templateMarkup) {
                            applyTemplate(
                                target,
                                {
                                    'contents': template(target.innerHTML, data)  // jshint ignore:line
                                },
                                templateMarkup
                            );
                            showElement(documentEl);
                        },
                        function () {  // "no template" fallback
                            applyTemplate(target, data);
                            showElement(documentEl);
                        }
                    );
                } else {  // immediate
                    applyTemplate(target, data);
                    showElement(documentEl);
                }
            }(templates[idx]));
        }
    });
}(this));
