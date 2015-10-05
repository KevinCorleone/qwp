<?php
if(!defined('QWP_ROOT')){exit('Invalid Request');}
$user_info = json_from_file(get_user_file_path());
if ($user_info) {
    qwp_add_form_data('#user_info', $user_info);
}
qwp_render_import_ui('dialog');
qwp_render_add_form_js();
qwp_add_form_validator('user_info');
qwp_include_css_file('jquery.gritter.css');
qwp_include_js_file('jquery.gritter.min.js');