const axios = require("axios");
const gql = require("graphql-tag");
const apollo_client = require("../utils/apollo");

const HASURA_OPERATION = `
mutation ($email : String!, $password: String!) {
    insert_My_user_one(object: {
        email: $email
        password: $password
    }) {
        email
        password
    }
}
`;

const execute = async (variables, reqHeaders) => {
  console.log("inside the execute function");
  //   const fetchResponse = await axios(
  //     "https://contact-app.hasura.app/v1/graphql",
  //     {
  //       method: "POST",
  //       headers: reqHeaders || {},
  //       body: JSON.stringify({
  //         query: HASURA_OPERATION,
  //         variables,
  //       }),
  //     }
  //   );
  const body = JSON.stringify({
    query: HASURA_OPERATION,
    variables,
  });

  const headers = reqHeaders || {};
  const fetchResponse = axios.post(
    "https://contact-app.hasura.app/v1/graphql",
    body,
    headers
  );
  console.log("execute function ended");

  return await fetchResponse.json();
};

const signuphandler = async (req, res) => {
  console.log("eurekaaaaaaaaaaa");
  console.log("req.body value is ", req.body);
  const { email, password } = req.body.input.credentials;
  console.log("emai is ", email, "password is ", password);
  //return res.json({ email: "uuuu", password: "wayyy" });

  const { data, errors } = await execute({ email, password }, req.headers);

  if (errors) {
    return res.status(400).json({
      message: "the generated error is" + errors.message,
    });
  }

  return res.json({
    ...data.insert_My_user_one,
  });
  //   console.log("insideeeee");
  //   console.log("the comming datas are ", req.body);
  //   res.json({ email: "kira", password: "kk" });
};

module.exports = signuphandler;
