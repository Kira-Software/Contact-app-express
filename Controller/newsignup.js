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
    let { data } = await apollo_client.query({
      query: gql`
        query ($email: String!) {
          My_user(where: { email: { _eq: $email } }) {
            email
            role
            id
            password
          }
        }
      `,
      variables: {
        email,
      },
    });
    console.log("the data value is ", data);

    if (req.body.action.name === "login_user") {
      console.log("it's login request");

      if (data.My_user.length !== 0) {
        console.log("email is found");
        console.log("the data value is ", data);
        const ismatch = await bcrypt.compare(
          password,
          data.My_user[0].password
        );
        const { email, role, id } = data.My_user[0];
        if (ismatch) {
          console.log("the two passwords are match");

          payload = {};
          const token = jwt.sign(payload, "secretKey", {
            expiresIn: 10000000,
            algorithm: "HS256",
          });
          console.log("token value is ", token);
          return res.status(200).json({
            token: token,
            message: { email, role, id },
          });
        } else {
          console.log("password is not match");
          return res.status(200).json({
            token: "Invalid Credential",
            message: "Password does not match",
          });
        }
      } else {
        console.log("user not found");
        return res.status(200).json({
          token: "Invalid Credential",
          message: "user not found",
        });
      }
    } else if (req.body.action.name == "create_user") {
      console.log("its signup request");
      if (data.My_user.length !== 0) {
        console.log("user already exists");
        return res.status(200).json({
          token: "Invalid Credential",
          message: "user exists",
        });
      } else {
        console.log("no email is registered before");
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
            message: "Error occured",
            token: "Invalid credentials",
          });
        }
      }
    }
  } catch (error) {
    console.log("the error is ", error);
    res.status(500).json({ message: "chgr ale" });
  }
};

module.exports = newsignup;
