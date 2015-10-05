<?php
if(!defined('QWP_ROOT')){exit('Invalid Request');}
function qwp_render_initializer() {
    global $JS_CODE_FILES, $JS_FILES, $CSS_CODE_FILES, $CSS_FILES, $PHP_JS_FILES, $PHP_CSS_FILES, $FORM_VALIDATOR, $FORMS;

    $JS_CODE_FILES = array();
    $JS_FILES = array();
    $CSS_CODE_FILES = array();
    $CSS_FILES = array();
    $PHP_JS_FILES = array();
    $PHP_CSS_FILES = array();
    $FORM_VALIDATOR = array();
    $FORMS = array();
}
function qwp_render_page() {
    global $OP, $TEMPLATE_PATH, $MODULE_FILE;

    if (!empty($OP)) {
        return qwp_import_module_ops();
    }
    qwp_render_initializer();
    qwp_import_common();
    $TEMPLATE_PATH = qwp_get_template_path();
    if ($TEMPLATE_PATH === false) {
        return false;
    }
    if (qwp_initialize_module() === false) {
        return false;
    }
    require_once(QWP_TEMPLATE_ROOT . '/common.php');
    qwp_add_common_css_js_code(QWP_TEMPLATE_ROOT);
    qwp_add_common_css_js_code($TEMPLATE_PATH);
    qwp_add_page_css_js_code();
    require_once($TEMPLATE_PATH . '/header.php');
    require_once($MODULE_FILE);
    require_once($TEMPLATE_PATH . '/footer.php');
}
function qwp_render_css() {
    global $CSS_FILES, $CSS_CODE_FILES, $PHP_CSS_FILES;

    foreach ($CSS_FILES as $file_name => $v) {
        echo_line('<link href="css/' . $file_name . '" rel="stylesheet" />');
    }
    if (count($CSS_CODE_FILES) > 0) {
        echo_line("<style>");
        foreach ($CSS_CODE_FILES as $file_path => $v) {
            echo_file($file_path);
        }
        echo_line("\n</style>");
    }
    foreach ($PHP_CSS_FILES as $file_path => $v) {
        require_once($file_path);
    }
}
function qwp_create_page_info() {
    global $S, $FORM_VALIDATOR, $FORMS, $PAGE, $MODULE_URI;

    echo('<script>jQuery($READY);$PAGE.validator=' . to_json($FORM_VALIDATOR) .
        ';$PAGE.forms=' . to_json($FORMS) .
        ';$PAGE.search=' . to_json($S) .
        ';$PAGE.baseUrl="' . qwp_uri_base_url() . '"'.
        ';$PAGE.homeUrl="' . qwp_uri_home() . '"'.
        ';$PAGE.moduleUri="' . $MODULE_URI . '"'.
        ';$PAGE.page="' . $PAGE . '"'.
        ';</script>');
}
function qwp_render_js() {
    global $JS_FILES, $JS_CODE_FILES, $PHP_JS_FILES;

    foreach ($JS_FILES as $file_name => $v) {
        echo('<script src="js/' . $file_name ."\"></script>\n");
    }
    if (count($JS_CODE_FILES) > 0) {
        echo_line("<script>");
        foreach ($JS_CODE_FILES as $file_path => $v) {
            echo_file($file_path);
        }
        echo_line("\n</script>");
    }
    foreach ($PHP_JS_FILES as $file_path => $v) {
        require_once($file_path);
    }
    qwp_create_page_info();
}
function qwp_render_bad_request() {
    $txt = L('Bad request');
    if (qwp_is_ops_request()) {
        qwp_create_json_response(false, $txt);
    } else {
        qwp_render_error_page($txt);
    }
}
function qwp_render_error_page(&$error_description) {
    global $TEMPLATE_PATH;

    $file_path = '';
    $css_file_path = '';
    qwp_render_initializer();
    qwp_add_common_css_js_code(QWP_TEMPLATE_ROOT);
    if (qwp_custom_need_login() && qwp_is_login()) {
        if ($TEMPLATE_PATH) {
            $file_path = $TEMPLATE_PATH . '/error.php';
            $css_file_path = $TEMPLATE_PATH . '/error.css';
            if (!file_exists($file_path)) {
                $TEMPLATE_PATH = QWP_TEMPLATE_ROOT . '/admin';
                $file_path = $TEMPLATE_PATH . '/admin/error.php';
                $css_file_path = $TEMPLATE_PATH . '/admin/error.css';
                if (!file_exists($file_path)) {
                    $TEMPLATE_PATH = false;
                }
            } else {
                $TEMPLATE_PATH = false;
            }
        }
    } else {
        $TEMPLATE_PATH = false;
    }
    if (!$TEMPLATE_PATH) {
        $TEMPLATE_PATH = QWP_TEMPLATE_ROOT;
        $file_path = QWP_TEMPLATE_ROOT . '/error.php';
        $css_file_path = QWP_TEMPLATE_ROOT . '/error.css';
    }
    if (!file_exists($file_path)) {
        exit($error_description);
    }
    require_once(QWP_TEMPLATE_ROOT . '/common.php');
    qwp_add_common_css_js_code($TEMPLATE_PATH);
    qwp_add_css_code($css_file_path);
    require_once($file_path);
}
function qwp_render_no_login_error() {

}
function qwp_render_security_error() {
    $is_login = qwp_is_login();
    if ($is_login) {
        $txt = L('You do not have the privilege.');
    } else {
        $txt = L('You are not login.');
    }
    if (qwp_is_ops_request()) {
        $params = null;
        if (!$is_login) {
            $params = array('toLogin' => qwp_uri_login());
        }
        qwp_create_json_response(false, $txt, 'error', $params);
    } else {
        if ($is_login) {
            $txt .= L('Goto home page: ') . '<a href="./">' . L('Go to home page') . '</a>';
        } else {
            $txt .= L('Goto login page: ') . '<a href="' . qwp_uri_login() . '">' . L('Go to login page') . '</a>';
        }
        qwp_render_error_page($txt);
    }
}
function qwp_render_system_exception(&$e) {
    $txt = L('Message: ') . $e->getMessage();
    if (IN_DEBUG) {
        $txt .= '<br>' . L('File: ') . substr($e->getFile(), strlen(QWP_ROOT) + 1) . ':' . $e->getLine();
        $txt .= '<br>' . L('Detail: ') . '<br>' . $e->getTraceAsString();
    }
    if (qwp_is_ops_request()) {
        qwp_create_json_response(false, $txt);
    } else {
        qwp_render_error_page($txt);
    }
}
function qwp_render_import_ui($name) {
    $file_path = QWP_UI_ROOT . '/' . $name . '.php';
    if (file_exists($file_path)) {
        require_once($file_path);
    }
    qwp_add_js_code(QWP_UI_ROOT . '/' . $name . '.js');
    $file_path = QWP_UI_ROOT . '/' . $name . '.js.php';
    if (file_exists($file_path)) {
        require_once($file_path);
    }
}
function qwp_render_add_form_js($include_validate_ex = false) {
    global $language;

    qwp_include_js_file('jquery.validate.min.js');
    if (isset($language) && $language != 'en') {
        qwp_include_js_file("validate.localization/messages_{$language}.min.js");
    }
    if ($include_validate_ex) {
        qwp_include_js_file('jquery.validate_ex.min.js');
    }
    qwp_include_js_file('jquery.form.min.js');
    qwp_include_css_file('jquery.gritter.css');
    qwp_include_js_file('jquery.gritter.min.js');
}