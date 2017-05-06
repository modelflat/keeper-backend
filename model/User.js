class User {
    constructor(props) {
        this.name = props.name;
        this.passHash = props.passHash;
        this.email = props.email || '';
        this.ui = props.ui || {};
        this.cards = props.cards || [];
    }
    
    static fromBody(name, passHash, email) {
        return new User({name: name, passHash: passHash, email: email});
    }
}

module.exports = User;
