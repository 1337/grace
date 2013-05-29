(function (context, $) {
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
    "use strict";

    if (!$.fn) throw "poop (no jQuery)";  // requires jQuery equivalent


    var template = function (str, data) {
            // load simple templating function.
            return str.replace(/\{\{([\s\S]+?)\}\}/g, function (v) {
                return data[$.trim(v.substr(2).slice(0, -2))];
            });
        },
        numAttribs = function (obj) {  // stackoverflow.com/questions/126100
            var count = 0;
            for (var k in obj) {
                if (obj.hasOwnProperty(k)) {
                    count++;
                }
            }
            return count;
        },
        applyTemplate = function ($targetElement, data, markup) {
            // markup is optional. defaults to html of $targetElement.
            markup = markup || $targetElement.html();

            for (var _key in data) {
                if (data.hasOwnProperty(_key)) {
                    // allow fancy crap, including recursive traversal
                    // if you have e.g. data-foo="($('.post').length >= 5)"
                    try {
                        data[_key] = eval(data[_key]);
                    } catch (err) { /* it was not an expression. */ }
                }
            }
            if (numAttribs(data)) {
                $targetElement.html(template(markup, data));
            }
        };

    $(function () {  // stall until DOM ready
        $('.template', this).each(function () {
            var $target = $(this),
                data = $target.data() || {},
                templateSrc = data['template-src'] || data.templateSrc || '';

            if (templateSrc) {
                $.ajax({
                    url: templateSrc,
                    dataType: 'html',
                    username: data.username || '',
                    password: data.password || '',
                    success: function (templateMarkup) {
                        applyTemplate(
                            $target,
                            {
                                'contents': template($target.html(), data)
                            },
                            templateMarkup
                        );
                    },
                    error: function () {  // "no template" fallback
                        applyTemplate($target, data);
                    }
                });
            } else {  // immediate
                applyTemplate($target, data);
            }
        });
    });
}(this, this.jQuery || {}));