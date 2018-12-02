
var Users = function (){

}

Users.loginRequest = function(req, res){
    var user_id = req.body.user_id;
    var password = req.body.password;

};

Users.albumIdRequest = function(req, res){
    var album_id = req.body.album_id;

};
module.exports = Users;