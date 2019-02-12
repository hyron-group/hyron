
/**
 * This backware used to allow you can todo more with response, that http supported.
 * You can used some type of http response inside main handle, just return as a object :
 * $type : set content type for response data
 * $data : is response data
 * $status : status code
 * $message : status message
 * $headers : set header data
 * $redirect : redirect to a page
 */
module.exports = {
    backware : require("./customResponse_bw")
}