const gql = require("graphql-tag");
const apollo_client = require("../utils/apollo");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  console.log("loginnnnnnnnnnn");
  console.log("the comming arguments are", req.body);

  let { email, password } = req.body.input.credentials;
  console.log("email is", email, "password is ", password);

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

    if (data.My_user.length !== 0) {
      console.log("email is found");
      console.log("the data value is ", data);

      const ismatch = await bcrypt.compare(password, data.My_user[0].password);
      const { email, role, id } = data.My_user[0];
      if (ismatch) {
        console.log("the two passwords are match");

        payload = {
          "https://hasura.io/jwt/claims": {
            "x-hasura-user-id": id,
            "x-hasura-allowed-roles": ["admin", "user"],
            "x-hasura-default-role": "user",
          },
        };
        const token = jwt.sign(payload, "secretKey", {
          expiresIn: 60 * 60 * 24,
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
          token: "Invalid token",
          message: "Password does not match",
        });
      }
    } else {
      console.log("user not found");
      return res.status(200).json({
        token: "invalid token",
        message: "user not found",
      });
    }
  } catch (err) {
    console.log("the error is ", err);
  }
};

module.exports = login;
