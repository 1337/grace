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
    'use strict';

    if (!$.fn) {
        // requires jQuery equivalent
        throw new Error('poop (no jQuery)');
    }


    /**
     * Load simple templating function.
     * @param str
     * @param data
     * @returns string
     */
    function template(str, data) {
        return str.replace(/\{\{([\s\S]+?)\}\}/g, function (v) {
            return data[$.trim(v.substr(2).slice(0, -2))];
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


    function applyTemplate($targetElement, data, markup) {
        var key;

        // markup is optional. defaults to html of $targetElement.
        markup = markup || $targetElement.html();

        for (key in data) {
            if (data.hasOwnProperty(key)) {
                // allow fancy crap, including recursive traversal
                // if you have e.g. data-foo="($('.post').length >= 5)"
                try {
                    data[key] = eval(data[key]);  // jshint ignore:line
                } catch (err) {
                    // it was not an expression.
                    $.noop();
                }
            }
        }
        if (numAttribs(data)) {
            $targetElement.html(template(markup, data));
        }
    }

    var document = $('html');

    document.hide();
    $(function () {  // stall until DOM ready
        $('.template', this).each(function () {
            var target = $(this),
                data = target.data() || {},
                templateSrc = data['template-src'] || data.templateSrc || '';

            if (templateSrc) {
                $.ajax({
                    url: templateSrc,
                    dataType: 'html',
                    username: data.username || '',
                    password: data.password || '',
                    success: function (templateMarkup) {
                        applyTemplate(
                            target,
                            {
                                'contents': template(target.html(), data)
                            },
                            templateMarkup
                        );
                    },
                    error: function () {  // "no template" fallback
                        applyTemplate(target, data);
                    }
                });
            } else {  // immediate
                applyTemplate(target, data);
            }
        });
        document.show();
    });
}(this, this.jQuery || {}));
