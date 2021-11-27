const gql = require("graphql-tag");
const apollo_client = require("../utils/apollo");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const newsignup = async (req, res) => {
  console.log("inside of the new signup");
  console.log("the comming arguments are", req.body);

  let { email, password } = req.body.input.credentials;
  const hashedPassword = await bcrypt.hash(password, 12);
  //   console.log("hashed value is ", hashed);
  //password = hashedPassword;
  console.log("the hashed password is ", hashedPassword);
  try {
    let { data } = await apollo_client.mutate({
      mutation: gql`
        mutation ($email: String!, $hashedPassword: String!) {
          insert_My_user_one(
            object: { email: $email, password: $hashedPassword }
          ) {
            email
            id
            role
          }
        }
      `,
      variables: {
        email,
        hashedPassword,
      },
    });

    if (data) {
      console.log("data is inserted successfully", data);
      userdata = data.insert_My_user_one;
      const { id, email, role } = data.insert_My_user_one;

      payload = {};
      const token = jwt.sign(payload, "secretKey", {
        expiresIn: 10000000,
        algorithm: "HS256",
      });
      console.log("token value is ", token);

      return res.status(200).json({
        // email: email,
        // role: role,
        // id: id, 
        message: { email, id, role },
        token: token,
      });
    } else {  
      console.log("data insertion has failed");
      return res.status(200).json({
        email: "mnm",
        password: "mnm",
      });
    }
  } catch (error) {
    console.log("the error is ", error);
    res.status(500).json({ message: "chgr ale" });
  }

  //   return res.json({
  //     email: "new email",
  //     password: "new password",
  //   });
};

module.exports = newsignup;  
 