<?php if(!defined('QWP_ROOT')){exit('Invalid Request');} ?><div class="container">

    <form class="form-signin" method="post" action="<?php echo(qwp_uri_ops('login'));?>">
        <input type="hidden" name="dsturl" value="<?php echo(P('dsturl'));?>">
        <h2 class="form-signin-heading">Please sign in ...</h2>
        <label for="inputEmail" class="sr-only">Email address</label>
        <input type="text" name="f[user]" id="inputEmail" class="form-control" placeholder="Email address" value="admin@qwp.com">
        <label for="inputPassword" class="sr-only">Password</label>
        <input type="password" name="f[pwd]" id="inputPassword" class="form-control" placeholder="Password">
        <div class="checkbox">
            <label>
                <input type="checkbox" value="remember-me"> Remember me
            </label>
        </div>
        <button class="btn btn-lg btn-primary btn-block" type="submit">Sign in</button>
    </form>

</div> <!-- /container -->