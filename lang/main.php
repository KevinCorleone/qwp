<?php
if(!defined('QWP_ROOT')){exit('Invalid Request');}
if(isset($_COOKIE['language'])){
    $language = $_COOKIE['language'];
}
function qwp_html_lang() {
    global $language;

    $pos = strpos($language, '_');
    if ($pos !== false) {
        return substr($language, 0, $pos);
    }
    return $language;
}
function qwp_add_js_lang($txt) {
    global $js_lang;

    if (is_string($txt)) {
        $js_lang[] = $txt;
    } else if (is_array($txt)){
        $js_lang = array_merge($js_lang, $txt);
    }
}
function qwp_render_js_lang() {
    global $lang_txts;

    echo('<script>var _LANG=' . to_json($lang_txts) . ';</script>');
}
function qwp_load_lang_for_module($name) {
    global $lang_txts, $language, $loaded_lang;

    if (isset($loaded_lang[$name])) {
        return;
    }
    $loaded_lang[$name] = true;
    $lang_file = QWP_LANG_ROOT . '/' . $language . '/' . $name . '.php';
    if (!file_exists($lang_file)) {
        return;
    }
    $lang = null;
    require_once($lang_file);
    if ($lang) {
        $lang_txts = array_merge($lang_txts, $lang);
    }
}
function qwp_initialize_language() {
    global $language, $language_set, $lang_txts, $loaded_lang;

    $loaded_lang = array();
    $lang_txts = array();
    // initialize language set
    if (!isset($language_set)) {
        $language_set = C('lang_set');
    }
    if (!$language_set) {
        $set = scandir(QWP_LANG_ROOT);
        $language_set = array();
        foreach ($set as &$name) {
            if (!is_dot_dir($name) && $name != 'main.php') {
                $language_set[$name] = true;
            }
        }
        _C('lang_set', $language_set);
    }
    if (!isset($language) || !isset($language_set[$language])) {
        $language = C('lang');
        if (!$language) {
            $language = DEFAULT_LANGUAGE;
        }
    }
}
function L($t) {
    global $lang_txts, $MODULE, $MODULE_NAME_FOR_LANG;

    if (isset($lang_txts[$t])) {
        return $lang_txts[$t];
    }
    qwp_load_lang_for_module($MODULE_NAME_FOR_LANG);
    if (isset($lang_txts[$t])) {
        return $lang_txts[$t];
    }
    qwp_load_lang_for_module($MODULE[0]);
    if (isset($lang_txts[$t])) {
        return $lang_txts[$t];
    }
    qwp_load_lang_for_module('global');
    if (isset($lang_txts[$t])) {
        return $lang_txts[$t];
    }
    qwp_load_lang_for_module('system');
    return isset($lang_txts[$t]) ? $lang_txts[$t] : $t;
}
function EL($t) {
    echo(L($t));
}