(function () {

    if (Rea.config.checkUpdates > Date.now()) {
        return;

    }

    var https = require('https');

    var options = {
        method: 'GET',
        protocol: 'https:',
        hostname: 'github.com',
        path: '/jahudka/rearrangefx/releases/latest',
        agent: false
    };

    https.request(options, function (response) {
        Rea.config.checkUpdates = Date.now() + 43200;
        window.localStorage.setItem('checkUpdates', Rea.config.checkUpdates + '');

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
                        var holder = Rea.api.openDialog('new-update');

                        holder.on('click', '.btn-main', function () {
                            gui.Shell.openExternal('https://jahudka.github.io/rearrangefx');

                        });

                        if (response.statusCode === 200) {
                            var changelog = [];

                            response.on('data', function (data) {
                                changelog.push(data);

                            });

                            response.on('end', function () {
                                holder.find('#new-update-changes').text(changelog.join(''));

                            });
                        } else {
                            holder.find('#new-update-changelog').remove();

                        }
                    }).end();
                }
            }
        }
    }).end();

})();
