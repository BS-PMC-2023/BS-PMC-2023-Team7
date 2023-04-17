/*[ Import ]*/
const { schemas } = require("../schemas/paths");
const mongoose = require("mongoose");

/*[ Handle accounts database ]*/
class User {
  constructor(details, id) {
    this.id = details ? details.id : id;
    this.userName = details ? details.userName : null;
    this.email = details ? details.email : null;
    this.password = details ? details.password : null;
    this.avatar = details ? details.avatar : null;
  }

  /*[ Creating data ]*/
  async register() {
    try {
      let account = await schemas.User.findOne({ userName: this.userName });
      if (account) return { successful: false, message: "user exist" };

      account = await schemas.User.findOne({ email: this.email });
      if (account) return { successful: false, message: "mail exist" };

      //Verify dvarim etc...

      await schemas.User.create({
        _id: mongoose.Types.ObjectId(),
        userName: this.userName,
        email: this.email,
        password: this.password,
        role: "Junior", //Very, very temporary.
        banned: false,
      });
      return { successful: true, message: "success" };
    } catch (
      verror // "var + error = verror"
    ) {
      console.log(verror);
      return { successful: false, message: "error" };
    }
  }

  /*[ Modifying data ]*/
  async upgradeUser() {
    try {
      await schemas.User.updateOne({ id: this.id }, { role: "expert" });
      return true;
    } catch {
      return false;
    }
  }

  /*[ Handling data ]*/
  //fetch user from db
  static async fetchUser() {
    let details = await schemas.User.findOne({ id: this.id });
    if (details) {
      this.id = details.id;
      this.userName = details.userName;
      this.email = details.email;
      this.password = details.password;
      this.avatar = details.avatar;
      return true;
    }
    return false;
  }
  //verify account (userName&password) exists in database:
  async verify() {
    let account = await schemas.User.findOne({ userName: this.userName, password: this.password });
    if (account) {
      if (account.banned) {
        return { successful: false, message: "banned" };
      }
      return {
        successful: true,
        user: {
          id: account.id,
          userName: this.userName,
          avatar: this.avatar,
          role: account.role,
        },
      }; //succeseful login
    }
    return { successful: false, message: "not found" }; //couldn't login
  }
}

class Admin extends User {
  constructor(details, id) {
    super(details, id);
  }
}

class Junior extends User {
  constructor(details, id) {
    super(details, id);
  }
  //get all Junior Cook users from db
  static async fetchUsers() {
    let accounts = await schemas.User.find({ role: "junior" });
    return accounts || [];
  }
}

class Expert extends User {
  constructor(details, id) {
    super(details, id);
  }
  //get all Expert Cook users from db
  static async fetchUsers() {
    let accounts = await schemas.User.find({ role: "expert" });
    return accounts || [];
  }
  //get all Junior&Expert Cook users from db
  static async fetchAllUsers() {
    return [...(await Junior.fetchUsers()), ...(await this.fetchUsers())];
  }
}

/*[ External access ]*/
module.exports = { User, Admin, Junior, Expert };
