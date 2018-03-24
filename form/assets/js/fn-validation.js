(function ($) {
$.fn.validation = function (options) {
    $this = this;
    // Default plugin settings
    var defaults = {
        constraints: null, // Validation schema
        partials: false
    };

    // Merge default and user settings
    var settings = $.extend({}, defaults, options);

    if(!settings.constraints) {
        console.error('No validation schema found!')
    }

    var showError =  function ($dom,message) {
        $dom.addClass('is-invalid');
        // console.log('====',$dom.parent().next());
        if($dom.parent().attr('class') === 'input-group') {
            $dom.parent().addClass('is-invalid');
            $dom.parent().next().html(message)
        }
        $dom.parent().find('.invalid-feedback').html(message);
        // console.log($('input.is-invalid, .is-invalid:hidden').offset());
        // $('html, body').animate({
        //      scrollTop: ($('.is-invalid').offset().top - 100)
        // }, 50);
    }
    var hideError =  function ($dom, select2) {
        $dom.removeClass('is-invalid');
        // console.log('====',$dom.parent().attr('class'));
        if($dom.parent().attr('class') === 'input-group is-invalid') {
            $dom.parent().removeClass('is-invalid');
            $dom.parent().next().html('')
        }
        (select2)?'':$dom.parent().find('.invalid-feedback').html('');
    }

    var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

    var init = function init() {
        if(settings.partials) {
            var allValue = validate.collectFormValues($this);
            // console.log(allValue);
            var validation_messages = validate(allValue, settings.constraints, { fullMessages: false });
            // console.log('==message==', validation_messages);
            if (typeof validation_messages !== 'undefined') {
                Object.entries(validation_messages).forEach(function (_ref) {
                    var _ref2 = _slicedToArray(_ref, 2),
                        key = _ref2[0],
                        val = _ref2[1];

                    showError($this.find('[name="' + key + '"]'), val);
                    $this.find('[name="' + key + '"]').on('focus change', function () {
                        hideError($(this), $(this).hasClass('select2'));
                    });
                });
                return false;
            }
            return true;
        }
        else {
            $this.on('submit', function () {
                $thisCurrent = $(this);
                $thisCurrent.find('.is-invalid').removeClass('is-invalid');
                $thisCurrent.parent().find('.invalid-feedback').html('');
                var allValue = validate.collectFormValues($(this));
                // console.log(allValue);
                var validation_messages = validate(allValue, settings.constraints, { fullMessages: false });

                if (typeof validation_messages !== 'undefined') {
                    Object.entries(validation_messages).forEach(function (_ref) {
                        var _ref2 = _slicedToArray(_ref, 2),
                            key = _ref2[0],
                            val = _ref2[1];

                        showError($thisCurrent.find('[name=' + key + ']'), val);
                        $thisCurrent.find('[name=' + key + ']').on('focus change', function () {
                            hideError($(this), $(this).hasClass('select2'));
                        });
                    });
                    return false;
                }
                return true;
            });
        }
    };
    if (!init()){
        return false
    }
    return true;
}
})(window.jQuery);
