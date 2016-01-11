(function () {

    if (Rea.checkUpdates > Date.now()) {
        return;

    }

    var https = require('https');

    var holder = $('#new-update-holder');

    holder.on('click', '.btn-main', function (evt) {
        evt.preventDefault();

        gui.Shell.openExternal('https://jahudka.github.io/rearrangefx');
        holder.removeClass('visible');

    });

    holder.on('click', '.btn-text', function (evt) {
        evt.preventDefault();
        holder.removeClass('visible');

    });

    var options = {
        method: 'GET',
        protocol: 'https:',
        hostname: 'github.com',
        path: '/jahudka/rearrangefx/releases/latest',
        agent: false
    };

    var request = https.request(options, function (response) {
        Rea.checkUpdates = Date.now() + 43200;
        window.localStorage.setItem('checkUpdates', Rea.checkUpdates + '');

        if (response.statusCode === 302 && response.headers.hasOwnProperty('location')) {
            var url = (response.headers.location + '').match(/^https?:\/\/github.com\/jahudka\/rearrangefx\/releases\/tag\/v?(\d+\.\d+\.\d+)$/),
                packageJson,
                availableVersion;

            if (url) {
                availableVersion = url[1];
                packageJson = require('./package.json');

                if (availableVersion !== packageJson.version) {
                    holder.addClass('visible');

                }
            }
        }
    });

    request.end();

})();
