<?php
if(!defined('QWP_ROOT')){exit('Invalid Request');}

// template function, you need to modify it if you want to use
function qwp_tmpl_get_visitor_acls(&$acls) {
    $acls = array(
        'modules' => array(
            'portal' => 1,
        ),
        'pages' => array(
            'portal' => array(
                'sample' => 1,
            ),
        ),
    );
}
function qwp_tmpl_get_admin_acls(&$acls) {
    $acls = array(
        'modules' => array(
            'portal' => 1,
            'sample' => 'Samples',
            'users' => 'Users',
            'settings' => 'Settings',
            'help' => 'Help',
            'sample-sub' => 1,
            'sample-sub-sub' => 1,
        ),
        'pages' => array(
            'portal' => array(
                'sample' => 1,
            ),
            'sample' => array(
                'form' => 'Form sample',
                'table' => 'Table sample',
            ),
            'sample-sub' => array(
                'test' => 1,
            ),
        ),
        'ops' => array(
            'sample#form' => array(
                'edit' => 1,
            ),
            'sample#table' => array(
                'list' => 1,
                'get_types' => 1,
            ),
            'users' => array(
                'list' => 1,
                'add' => 1,
                'edit' => 1,
                'del' => 1,
            ),
        ),
    );
}
function qwp_tmpl_get_acls(&$acls) {
    global $USER;

    if ($USER->role == QWP_ROLE_VISITOR) {
        qwp_tmpl_get_visitor_acls($acls);
    } else if ($USER->role == QWP_ROLE_ADMIN) {
        qwp_tmpl_get_admin_acls($acls);
    }
}
function qwp_tmpl_init_nav_modules(&$acls) {
    $modules = array();
    foreach($acls['modules'] as $m => $tag) {
        if (is_string($tag) && strpos($m, '-') === false) {
            $modules[$m] = $tag;
        }
    }
    _C('nav', $modules);
}
// template function, you need to modify it if you want to use
function qwp_tmpl_init_security(&$acls) {
    $acls = array();
    qwp_tmpl_get_acls($acls);
    _C('acls', $acls);
    qwp_tmpl_init_nav_modules($acls);
}
function qwp_tmpl_security_check() {
    global $MODULE_URI, $PAGE, $OP;

    if (qwp_is_passport_module()) {
        return true;
    }
    $acls = C('acls', null);
    if (!$acls) {
        qwp_tmpl_init_security($acls);
    }
    if (!isset($acls['modules'][$MODULE_URI])) {
        return false;
    }
    if ($OP) {
        $path = $MODULE_URI;
        if ($PAGE) {
            $path .= '#' . $PAGE;
        }
        return isset($acls['ops'][$path]) && isset($acls['ops'][$path][$OP]);
    }
    if ($PAGE) {
        return isset($acls['pages'][$MODULE_URI]) && isset($acls['pages'][$MODULE_URI][$PAGE]);
    }
    log_info('security check is passed: ' . $MODULE_URI);
}