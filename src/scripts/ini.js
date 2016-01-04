var ini = (function () {

    var reignore = /^\s*(;.*)?$/,
        reparse = /^\[([^\]]+)]$|^([^=]+)=(.*)$/,
        requoted = /^"((?:\\.|[^"\\\n])*)"/,
        reliteral = /^(\d+(?:\.\d+)?|true|false|null)$/i,
        reunsafe = /[;"']/,
        requote = /"/g;

    function parse(data) {
        var lines = (data + '').trim().split(/\r?\n/g),
            line, key, value, cursor, i, n, tmp;

        cursor = data = {};

        for (i = 0, n = lines.length; i < n; i++) {
            line = lines[i];

            if (!line || reignore.test(line)) {
                continue;

            }

            line = line.match(reparse);

            if (line[1]) {
                key = (line[1] + '').trim();

                if (!data.hasOwnProperty(key)) {
                    data[key] = {};

                }

                cursor = data[key];

            } else {
                key = (line[2] + '').trim();
                value = (line[3] + '').trim();

                if (tmp = value.match(requoted)) {
                    value = tmp[1];

                } else {
                    if ((tmp = value.indexOf(';')) > -1) {
                        value = value.substr(0, tmp).trim();

                    }

                    if (reliteral.test(value)) {
                        value = JSON.parse(value);

                    }
                }

                cursor[key] = value;

            }
        }

        cursor = null;
        return data;

    }

    function stringify(data) {
        var output = [],
            section, key, value;

        for (section in data) {
            if (!data.hasOwnProperty(section)) {
                continue;

            }

            output.push('[' + section + ']');

            for (key in data[section]) {
                if (data[section].hasOwnProperty(key)) {
                    value = data[section][key];

                    if (typeof value === 'string' && reunsafe.test(value)) {
                        value = '"' + value.replace(requote, '\\"') + '"';

                    }

                    output.push(key + '=' + value);

                }
            }

            output.push('');

        }

        return output.join("\r\n");

    }

    return {
        parse: parse,
        stringify: stringify
    };

})();
