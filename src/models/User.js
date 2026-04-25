// src/models/User.js
// Domain layer — User/Profile entity
export class User {
    constructor({ id = null, name = 'User', email = 'user@moneyhey.vn', avatar = null } = {}) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.avatar = avatar;
    }
}
