<?php
/*!
 * qwp: https://github.com/steem/qwp
 *
 * Copyright (c) 2015 Steem
 * Released under the MIT license
 */
if(!defined('QWP_ROOT')){exit('Invalid Request');}
function qwp_set_form_processor($fn, $transaction = false) {
    global $FN_PROCESS_OPS, $FN_PROCESS_NEED_TRANSACTION;
    $FN_PROCESS_OPS = $fn;
    $FN_PROCESS_NEED_TRANSACTION = $transaction;
}
function qwp_set_form_validator($name) {
    global $QWP_FORM_VALIDATOR_RULE;
    $QWP_FORM_VALIDATOR_RULE = $name;
}
function qwp_set_custom_validator($fn) {
    global $FN_QWP_FORM_VALIDATOR;
    $FN_QWP_FORM_VALIDATOR = $fn;
}
function qwp_set_data_processor($fn, $transaction = false) {
    global $FN_PROCESS_DATA, $FN_PROCESS_NEED_TRANSACTION;;
    $FN_PROCESS_DATA = $fn;
    $FN_PROCESS_NEED_TRANSACTION = $transaction;
}
function qwp_is_passport_module() {
    global $is_passport;

    if (!isset($is_passport)) {
        global $MODULE;
        $is_passport = $MODULE[0] == 'passport';
    }
    return $is_passport;
}
function qwp_is_portal_module() {
    global $is_portal;

    if (!isset($is_portal)) {
        global $MODULE;
        $is_portal = $MODULE[0] == 'portal';
    }
    return $is_portal;
}
function qwp_set_ops_process($fn_name) {
    global $FN_PROCESS_OPS;

    $FN_PROCESS_OPS = $fn_name;
}
function qwp_set_data_process($fn_name) {
    global $FN_PROCESS_DATA;

    $FN_PROCESS_DATA = $fn_name;
}
function qwp_is_module_name_valid() {
    global $MODULE;

    foreach ($MODULE as $item) {
        if (!preg_match('/^[\w-]+$/', $item)) {
            return false;
        }
    }
    return true;
}
function qwp_include_js_file($file_name) {
    global $JS_FILES;
    $JS_FILES[$file_name] = true;
}
function qwp_add_js_code($file_path) {
    global $JS_CODE_FILES;
    if (file_exists($file_path)) {
        $JS_CODE_FILES[$file_path] = true;
    }
}
function qwp_include_css_file($file_name) {
    global $CSS_FILES;
    $CSS_FILES[$file_name] = true;
}
function qwp_add_css_code_file($file_path) {
    global $CSS_CODE_FILES;
    if (file_exists($file_path)) {
        $CSS_CODE_FILES[$file_path] = true;
    }
}
function qwp_include_php_js_file($file_path) {
    global $PHP_JS_FILES;
    if (file_exists($file_path)) {
        $PHP_JS_FILES[$file_path] = true;
    }
}
function qwp_include_php_css_file($file_path) {
    global $PHP_CSS_FILES;
    if (file_exists($file_path)) {
        $PHP_CSS_FILES[$file_path] = true;
    }
}
function qwp_add_form_validator() {
    global $MODULE_ROOT, $FORM_VALIDATOR;

    $cnt = func_num_args();
    if (!$cnt) {
        return;
    }
    $args = func_get_args();
    for ($i = 0; $i < $cnt; ++$i) {
        $form_rule = null;
        require($MODULE_ROOT . '/form_' . $args[$i] . '_validator.php');
        if ($form_rule) {
            $FORM_VALIDATOR[] = $form_rule;
        }
    }
}
function qwp_set_form_data($name, &$v) {
    global $FORMS;
    $FORMS[$name] = $v;
}
function qwp_initialize() {
    global $MODULE, $USER, $MODULE_ROOT, $MODULE_URI, $SUPER_MODULE_ROOT, $IS_SUB_MODULE;

    initialize_logger('qwp');
    $USER = null;
    initialize_request();
    if (!$MODULE) {
        $MODULE = DEFAULT_MODULE;
    }
    $MODULE_URI = $MODULE;
    $MODULE = explode('-', $MODULE);
    if (!qwp_is_module_name_valid()) {
        return false;
    }
    $MODULE_ROOT = join_paths(QWP_MODULE_ROOT, implode('/', $MODULE));
    require_once(QWP_MODULE_ROOT . '/bootstrap.php');
    $SUPER_MODULE_ROOT = join_paths(QWP_MODULE_ROOT, $MODULE[0]);
    $IS_SUB_MODULE = $MODULE_ROOT != $SUPER_MODULE_ROOT;
    return qwp_custom_initialize_check();
}
function qwp_get_common_php_files(&$files) {
    global $MODULE_ROOT, $SUPER_MODULE_ROOT, $IS_SUB_MODULE;

    $super_common = QWP_MODULE_ROOT . '/common.php';
    if (file_exists($super_common)) {
        $files[] = $super_common;
    }
    if ($IS_SUB_MODULE) {
        $common = $SUPER_MODULE_ROOT . '/common.php';
        if (file_exists($common)) {
            $files[] = $common;
        }
    }
    $common = $MODULE_ROOT . '/common.php';
    if (file_exists($common)) {
        $files[] = $common;
    }
}
function qwp_add_common_css_js_code($path) {
    qwp_add_js_code($path . '/common.js');
    qwp_add_css_code_file($path . '/common.css');
    qwp_include_php_js_file($path . '/common.js.php');
    qwp_include_php_css_file($path . '/common.css.php');
}
function qwp_add_page_css_js_code() {
    global $MODULE_ROOT, $MODULE_BASE_PATH, $SUPER_MODULE_ROOT, $IS_SUB_MODULE;

    qwp_add_common_css_js_code(QWP_MODULE_ROOT);
    if ($IS_SUB_MODULE) {
        qwp_add_common_css_js_code($SUPER_MODULE_ROOT);
    }
    qwp_add_common_css_js_code($MODULE_ROOT);
    qwp_add_js_code($MODULE_BASE_PATH . '.js');
    qwp_add_css_code_file($MODULE_BASE_PATH . '.css');
    qwp_include_php_js_file($MODULE_BASE_PATH . '.js.php');
    qwp_include_php_css_file($MODULE_BASE_PATH . '.css.php');
}
function qwp_initialize_module() {
    global $MODULE_ROOT, $PAGE, $MODULE_FILE, $MODULE_BASE_PATH;

    $MODULE_BASE_PATH = $MODULE_ROOT . '/';
    $MODULE_BASE_PATH .= $PAGE ? $PAGE : 'home';
    $file_path = $MODULE_BASE_PATH . '.php';
    if (!file_exists($file_path)) {
        return false;
    }
    $MODULE_FILE = $file_path;
}
function qwp_initialize_ops() {
    global $MODULE_ROOT, $PAGE, $OP, $MODULE_FILE, $MODULE_BASE_PATH;

    $MODULE_BASE_PATH = $MODULE_ROOT . '/';
    if ($PAGE) {
        $MODULE_BASE_PATH .= $PAGE . '_ops_' . $OP;
    } else {
        $MODULE_BASE_PATH .= 'ops_' . $OP;
    }
    $MODULE_FILE = $MODULE_BASE_PATH . '.php';
    if (!file_exists($MODULE_FILE)) {
        return false;
    }
}
function qwp_is_ops_request() {
    global $OP;

    return isset($OP) && $OP !== null ? true : false;
}
function qwp_get_template_path() {
    global $MODULE, $MODULE_URI, $PAGE;

    if ($PAGE) {
        $file_path = QWP_TEMPLATE_ROOT . '/' . $MODULE_URI . '_' . $PAGE;
        if (is_dir($file_path)) {
            return $file_path;
        }
    }
    $file_path = QWP_TEMPLATE_ROOT . '/' . $MODULE_URI;
    if (is_dir($file_path)) {
        return $file_path;
    }
    if ($PAGE) {
        $file_path = QWP_TEMPLATE_ROOT . '/page';
    } else {
        $file_path = QWP_TEMPLATE_ROOT . '/' . $MODULE[0];
    }
    if (is_dir($file_path)) {
        return $file_path;
    }
    $file_path = QWP_TEMPLATE_ROOT . '/admin';
    if (is_dir($file_path)) {
        return $file_path;
    }
    // default the template page file is in template root directory
    return QWP_TEMPLATE_ROOT;
}
function qwp_uri_base_url() {
    $url = get_query_string();
    if ($url) {
        $url = preg_replace('/(&s\[.+\]=[%|\w|\+\-\.\+]+)|(&s%5b.+%5d=[%|\w|\+\-\.\+]+)/i', '', $url);
        $url = preg_replace('/(&s\[.+\]=)|(&s%5b.+%5d=)/i', '', $url);
    }
    return $url ? './?' . $url : './';
}
function qwp_uri_cur_url() {
    $query_string = get_query_string();
    $cur_url = './';
    if ($query_string) {
        $cur_url .= '?' . $query_string;
    }
    return $cur_url;
}
// return a page uri for current module
function qwp_uri_current_page($p = null, $params = null) {
    global $PAGE;
    return qwp_uri_page($p ? $p : $PAGE, $params);
}
// return a ops uri for current module
function qwp_uri_current_ops($ops, $params = null) {
    global $PAGE;
    return qwp_uri_ops($ops, $PAGE, $params);
}
function qwp_uri_current_home($params = null) {
    global $MODULE_URI;
    return qwp_uri_module($MODULE_URI, $params);
}
function qwp_uri_default_module($params = null) {
    return qwp_uri_module(DEFAULT_MODULE, $params);
}
function qwp_uri_module($m, $params = null) {
    $uri = './?m=' . $m;
    if ($params) {
        if (is_array($params)) {
            $params = http_build_query($params);
        }
        $uri .= '&' . $params;
    }
    return $uri;
}
function qwp_uri_page($p, $params = null, $m = null) {
    global $MODULE_URI;

    if (!$m) {
        $m = $MODULE_URI;
    }
    $uri = './?m=' . $m;
    if ($p) {
        $uri .= '&p=' . $p;
    }
    if ($params) {
        if (is_array($params)) {
            $params = http_build_query($params);
        }
        $uri .= '&' . $params;
    }
    return $uri;
}
function qwp_uri_ops($ops, $p = null, $params = null, $m = null) {
    global $MODULE_URI;

    if (!$m) {
        $m = $MODULE_URI;
    }
    $uri = './?m=' . $m;
    if ($p) {
        $uri .= '&p=' . $p;
    }
    $uri .= '&op=' . $ops;
    if ($params) {
        if (is_array($params)) {
            $params = http_build_query($params);
        }
        $uri .= '&' . $params;
    }
    return $uri;
}
function qwp_uri_logout() {
    return qwp_uri_ops('logout', null, null, 'passport');
}
function qwp_uri_login($is_op = false) {
    $dst_url = P("dsturl");
    if (!$dst_url && !qwp_is_passport_module()) {
        if ($is_op) {
            $dst_url = qwp_uri_current_home();
        } else {
            $query_string = get_query_string();
            if ($query_string) {
                $dst_url = './?' . get_query_string();
            }
        }
    }
    $passport_url = './?m=passport';
    if ($dst_url) {
        $passport_url .= '&dsturl=' . urlencode($dst_url);
    }
    return $passport_url;
}
function qwp_uri_parent_module() {
    global $MODULE;

    $tmp = array();
    for ($i = 0, $cnt = count($MODULE) - 1; $i < $cnt; ++$i) {
        $tmp[] = $MODULE[$i];
    }
    return implode('-', $tmp);
}
function qwp_get_dst_url() {
    $dst_url = P("dsturl");
    return $dst_url ? urldecode($dst_url) : './';
}
function echo_product_version() {
    echo('?v='.QWP_PRODUCT_VERSION);
}