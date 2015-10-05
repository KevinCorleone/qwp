<?php
if(!defined('IN_MODULE')){exit('Invalid Request');}

do {
    set_content_type(QWP_TP_JSON);
    $msg_type = "error";
    $ret = false;
    $msg = "";
    $data = array();
    try {
        global $FN_PROCESS_DATA;
        if (isset($FN_PROCESS_DATA)) {
            if ($FN_PROCESS_DATA($msg, $data) === false) {
                $msg_type = "info";
            }
        } else {
            $msg = L("No data processor!");
        }
    } catch (PDOException $e) {
        $msg = L("Failed to execute query: ") . $e->getMessage();
    } catch (Exception $e) {
        $msg = L("Exception happens: ") . $e->getMessage();
    }
} while (false);
$msg = qwp_create_json_response($ret, $msg, $msg_type);
$msg['data'] = $data;
echo_json($msg);