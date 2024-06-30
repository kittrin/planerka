const connection = require('./db');

class UserController {
    async createUser(body) {
        if (!body) return null;
        const sql = `INSERT INTO planerka SET ?`;
        const newPerson = await connection.query(sql, body, (err, result) => {
            if (err) throw err;
            return (result)
        })
        return (newPerson)
    }
    async checkUserByTgId (id){
        return connection.query("SELECT COUNT(1) FROM planerka WHERE `id` = " + `'${id}'`);
    }
    async getUsers(){
        const users = await connection.query("SELECT * FROM planerka");
        return users;
    }

}
module.exports = new UserController();