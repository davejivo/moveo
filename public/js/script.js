/**
 * Created by davej on 2/2/2018.
 */

$(document).ready(function () {
    $('.container form').on('submit', function (event) {
        $('button i.fa-cloud').hide();
        $('button svg').show();
    });
});

