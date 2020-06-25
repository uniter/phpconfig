module.exports = {
    'some_setting_for_main_lib': 'my value for main lib',
    'my_parser_lib': {
        // Sub-library config cannot be given here, it should just be resolved as
        // config for the main library. Config for the sub-library should be given
        // in a nested object in the plugin config (see ./index.js)
        'my_non_parser_lib_setting':
            'I should not be treated as config for the parser sub-lib',
    },
};
