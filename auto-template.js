(function (context, $) {
    "use strict";

    if (!$.fn) throw "poop (no jQuery)";  // requires jQuery equivalent

    // load underscore's templating function.
    var _ = (function () {
            //     Underscore.js 1.4.4 (Edited; template function only)
            //     http://underscorejs.org
            //     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud Inc.
            //     Underscore may be freely distributed under the MIT license.
            var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g,
                escapes = {
                    "'": "'",
                    '\\': '\\',
                    '\r': 'r',
                    '\n': 'n',
                    '\t': 't',
                    '\u2028': 'u2028',
                    '\u2029': 'u2029'
                },
                noMatch = /(.)^/,
                _ = {
                    'templateSettings': {
                        evaluate:    /\{\{#([\s\S]+?)\}\}/g,            // {{# console.log("blah") }}
                        interpolate: /\{\{[^#\{]([\s\S]+?)[^\}]\}\}/g,  // {{ title }}
                        escape:      /\{\{\{([\s\S]+?)\}\}\}/g,         // {{{ title }}}
                    } /* {
                     evaluate: /<%([\s\S]+?)%>/g,
                     interpolate: /<%=([\s\S]+?)%>/g,
                     escape: /<%-([\s\S]+?)%>/g
                     } */,
                    'template': function (text, data, settings) {
                        settings = settings || {};
                        var render,
                            matcher = new RegExp([
                                (settings.escape || noMatch).source,
                                (settings.interpolate || noMatch).source,
                                (settings.evaluate || noMatch).source
                            ].join('|') + '|$', 'g'),
                            index = 0,
                            source = "__p+='";

                        text.replace(matcher,
                            function (match, escape, interpolate, evaluate, offset) {
                                source += text.slice(index, offset).replace(escaper,
                                    function (match) {
                                        return '\\' + escapes[match];
                                    });

                                if (escape) {
                                    source += "'+\n((__t=(" + escape
                                        + "))==null?'':_.escape(__t))+\n'";
                                }
                                if (interpolate) {
                                    source += "'+\n((__t=(" + interpolate
                                        + "))==null?'':__t)+\n'";
                                }
                                if (evaluate) {
                                    source += "';\n" + evaluate + "\n__p+='";
                                }
                                index = offset + match.length;
                                return match;
                            });
                        source += "';\n";

                        // If a variable is not specified, place data values in local scope.
                        if (!settings.variable) {
                            source = 'with(obj||{}){\n' + source + '}\n';
                        }

                        source = "var __t,__p='',__j=Array.prototype.join,"
                            + "print=function(){__p+=__j.call(arguments,'');};\n"
                            + source + "return __p;\n";

                        try {
                            render = new Function(settings.variable || 'obj', '_', source);
                        } catch (e) {
                            e.source = source;
                            throw e;
                        }

                        if (data) return render(data, _);

                        var template = function (data) {
                            return render.call(this, data, _);
                        };

                        template.source = 'function(' + (settings.variable || 'obj') + '){\n'
                            + source + '}';

                        return template;
                    }
                };

            return _;  // export
        } ()),
        numAttribs = function (obj) {
            // stackoverflow.com/questions/126100
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
                    } catch (err) {
                        // it was not an expression.
                    }
                }
            }
            if (numAttribs(data)) {
                console.log(markup, data);
                $targetElement.html(_.template(markup, data));
            }
        };

    $(function () {
        $('.template', this).each(function () {
            var $target = $(this),
                data = $target.data() || {},
                templateSrc = data['template-src'] || '',
                template = '';

            if (templateSrc) {
                $.ajax({
                    url: templateSrc,
                    dataType: 'html',
                    username: data.username || '',
                    password: data.password || '',
                    success: function (templateMarkup) {
                        applyTemplate($target, data, templateMarkup);
                    },
                    error: function () {
                        // "no template" fallback
                        applyTemplate($target, data);
                    }
                });
            } else {
                // immediate
                applyTemplate($target, data);
            }
        });
    });

    window._ = _;
}(this, this.jQuery || {}));