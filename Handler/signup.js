const gql = require("graphql-tag");
const apollo_client = require("../utils/apollo");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const signup = async (req, res) => {
  console.log("sign upppppppppppp");
  console.log("the comming arguments are", req.body);

  let { email, password } = req.body.input.credentials;
  console.log("email is", email, "password is ", password);
  const hashedPassword = await bcrypt.hash(password, 12);

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

    console.log("data value is ", data);

    if (data.My_user.length !== 0) {
      console.log("user exists", data.My_user);
      res.json({
        token: "my token",
        message: "user exists",
      });
    } else {
      console.log("it is free");
      let response = await apollo_client.mutate({
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

      console.log("the entered data is ", response);

      if (response.data) {
        console.log("data is inserted successfully", response.data);
        userdata = response.data.insert_My_user_one;
        console.log("the userdata is ", userdata);
        //  const { id, email, role } = data.insert_My_user_one;

        const payload = {
          "https://hasura.io/jwt/claims": {
            "x-hasura-user-id": userdata.id,
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
          message: userdata,
        });
      } else {
        console.log("data insertion has failed");
        return res.status(200).json({
          message: "Error occured",
          token: "no token generated",
        });
      }
    }
  } catch (err) {
    console.log("error occured. it is ", err);
  }
};

module.exports = signup;
