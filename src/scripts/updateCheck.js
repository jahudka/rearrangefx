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

    // https://raw.githubusercontent.com/jahudka/rearrangefx/master/CHANGELOG.md
    // https://raw.githubusercontent.com/jahudka/rearrangefx/v0.0.7/README.md

    var options = {
        method: 'GET',
        protocol: 'https:',
        hostname: 'github.com',
        path: '/jahudka/rearrangefx/releases/latest',
        agent: false
    };

    https.request(options, function (response) {
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
                    var options = {
                        method: 'GET',
                        protocol: 'https:',
                        hostname: 'raw.githubusercontent.com',
                        path: '/jahudka/rearrangefx/v' + availableVersion + '/CHANGELOG.md',
                        agent: false
                    };

                    https.request(options, function (response) {
                        if (response.statusCode === 200) {
                            var changelog = [];

                            response.on('data', function (data) {
                                changelog.push(data);

                            });

                            response.on('end', function () {
                                holder.find('#new-update-changes').text(changelog.join(''));
                                holder.addClass('visible');

                            });
                        } else {
                            holder.find('#new-update-changelog').remove();
                            holder.addClass('visible');

                        }
                    }).end();
                }
            }
        }
    }).end();

})();
