class User {
    constructor(props) {
        this.username = props.username;
        this.password = props.password || props.passHash;
        this.email = props.email || '';
        this.ui = props.ui || {};
        this.cards = props.cards || [];
    }
    
    // removes the "password" field
    // TODO figure out how to exclude it in more convenient way (probably post-processing middleware?)
    toResponse() {
        let u = new User(this);
        u.password = undefined;
        return u;
    }
}

module.exports = User;
