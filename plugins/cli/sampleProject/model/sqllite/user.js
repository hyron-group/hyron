module.export = {
    uid: {
        primary_key: true,
        type: "text"
    },
    user_name: "string",
    password: "text",
    birth: "text",
    location: "text",
    age: "int",
    nick_name: {
        type: "varchar(255)",
        constraint: true,
        not_null: true
    }
};
