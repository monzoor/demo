// ================= ignore this part ============
/*jslint browser: true*/
/*global $, jQuery,*/
/*jslint nomen: true*/
/*jslint unparam: true*/
/*regexp: true*/
// ===============================================
  
/**
 * schema for form validation
 * @type {Object}
 */
var formSchema = {
    firstName: {
        presence: true
    },
    mobile: {
        presence: true,
        format: {
            pattern: /((\+?88)?(01)[0-9]\d{8})/,
            message: "This is not a valid mobile number. e.g: +8801xxxxxxxxx / 8801xxxxxxxxx / 01xxxxxxxxx"
        }
    },
    address: {
        presence: true,
        format: {
            pattern: /house#(\s+)[\w ]+(?:,[^ ]+)?,(\s+)road#(\s+)[\w ]+(?:,[^ ]+)?,(\s+)[\w ]+(?:,[^ ]+)?,(\s+)([^-]+)-\d{4}/,
            message: "This is not a valid address.\ne.g: house#(space)(your house number),(space)road#(space)(your road address),(space)(your area name),(space)(your district)-(your area code)"
        }
    },
    email: {
        presence: true,
        email: true
    }
};

/**
 * validate the form
 * AJAX call
 */
(function ($) {
    'use strict';
    var isValidated,
        $form = $('#testForm');

    $form.on('submit', function () {
        /**
         * this validate the form accordin the form
         * @return {Boolean}
         */
        isValidated = $('#testForm').validation({
            constraints: formSchema,
            partials: true
        });
        if (isValidated) {
            $.ajax({
                method: "POST",
                url: "/form/",
                data: $form.serialize()
            })
                .done(function (response) {
                    $('.alert-danger').addClass('d-none').html('');
                    $('.alert-success').removeClass('d-none').html('WOW! You have done it.');
                })
                .fail(function (response) {
                    $('.alert-success').addClass('d-none').html('');
                    $('.alert-danger').removeClass('d-none').html('AWWWW! You got an error.');
                });
        }
        return false;
    });
}(jQuery));
