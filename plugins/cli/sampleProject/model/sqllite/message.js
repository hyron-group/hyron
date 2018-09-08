module.export = {
    id : {
        primary_key : true,
        type : "int"
    },
    sender : {
        foreign_key : "user.uid"
    },

}