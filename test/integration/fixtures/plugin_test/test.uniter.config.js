module.exports = {
    'plugins': [
        require('./plugins/my_combined_lib_plugin'),
        require('./plugins/my_parser_lib_plugin1'),
        require('./plugins/my_parser_lib_plugin2'),
        require('./plugins/my_transpiler_lib_plugin'),
    ],
    'settings': {
        'my_parser_lib': {
            'my_parser_setting': 'my custom value',
        },
    },
};
