module.exports = {
    'plugins': [
        require('./plugins/my_combined_lib_plugin'),
        require('./plugins/my_parser_lib_plugin1'),
        require('./plugins/my_parser_lib_plugin2'),
        require('./plugins/my_transpiler_lib_plugin'),
    ],
    'settings': {
        'my_main_lib': {
            'my_parser_lib': {
                // NB: As this is specified in the root "settings" config, this sub-library config
                //     will also be included when just the main library's config is fetched
                'my_parser_setting_from_root_1':
                    'my custom value from root for sub-library under main library',
            },
        },
        'my_parser_lib': {
            // NB: As above, this sub-library config will also be returned for the main library
            'my_parser_setting_from_root_2':
                'my custom value from root for sub-library',
        },
    },
};
