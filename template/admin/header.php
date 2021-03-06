<?php if(!defined('QWP_ROOT')){exit('Invalid Request');}
require_once(QWP_ROOT . '/sample/admin_nav.php');
?><!DOCTYPE html>
<html lang="<?php echo(qwp_html_lang());?>">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php qwp_set_site_info();?>
    <link href="css/bootstrap.min.css<?php echo_product_version();?>" rel="stylesheet">
    <?php qwp_render_css();?>
    <!--[if lt IE 9]>
    <script src="js/html5shiv.min.js<?php echo_product_version();?>"></script>
    <script src="js/respond.min.js<?php echo_product_version();?>"></script>
    <![endif]-->
</head>
<body>
<nav class="navbar navbar-inverse navbar-fixed-top">
    <div class="container-fluid">
        <div class="navbar-header">
            <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
            <a class="navbar-brand" href="#"><?php EL(PRODUCT_NAME_SHORT);?></a>
        </div>
        <div id="navbar" class="navbar-collapse collapse">
            <ul class="nav navbar-nav navbar-right">
                <?php qwp_tmpl_render_nav();?>
                <li><a href="<?php echo(qwp_uri_logout());?>">Logout</a></li>
            </ul>
            <form class="navbar-form navbar-right">
                <input type="text" class="form-control" placeholder="Search...">
            </form>
        </div>
    </div>
</nav>
<?php if (qwp_tmpl_has_sub_modules($MODULE[0])) {?>
<div class="container-fluid">
    <div class="row">
        <div class="col-sm-3 col-md-2 sidebar">
            <ul class="nav nav-sidebar">
            <?php if (file_exists(join_paths($MODULE_ROOT, 'home.php'))) {?>
                <li class="<?php echo($PAGE ? '' : 'active');?>"><a href="<?php echo(qwp_uri_current_home());?>"><?php EL('Dashboard');?><span class="sr-only">(current)</span></a></li>
            <?php }?>
            <?php qwp_tmpl_render_sub_modules();?>
            </ul>
        </div>
        <div class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main">
<?php } else {?>
<?php }?>