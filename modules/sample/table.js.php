<?php
if(!defined('QWP_ROOT')){exit('Invalid Request');}
qwp_db_get_table_header_from_modal($test_table, $test_header);
?>
<script>
function fetchTestData(page, psize, sortf, sort) {
    qwp.table.loading('test');
    qwp.notice($L('Table data is loading...'));
    qwp.get({
        quiet:true,
        url:qwp.table.createOpsURI('test', 'list', page, psize, sortf, sort),
        fn:function(res, data) {
            if (res.ret) {
                qwp.table.update('test', data, page, psize, sortf, sort);
            } else {
                qwp.table.stopLoading('test');
            }
        }
    });
    return false;
}
function addNewUser() {
    qwp.notice('Add a new user message');
}
function editUser() {
    qwp.notice('Edit user message');
}
function resizePage() {
    qwp.table.resize('test', 230);
}
qwp.r(function(){
    qwp.table.create('#test-table', 'test', {
        fetchData: 'fetchTestData',
        btns: {
            new:{
                click: 'addNewUser',
                tooltip:'Create a new user'
            },
            edit:{
                click: 'editUser',
                tooltip:'Edit user information'
            },
            del:{
                click: function() {
                    qwp.notice('Delete user message');
                },
                tooltip:'Delete selected users'
            }
        },
        topCols:{
            left:4,
            right:8
        },
        sortf:'age',
        header:<?php echo_json($test_header)?>
    });
    resizePage();
    $(window).resize(resizePage);
    fetchTestData();
});
</script>