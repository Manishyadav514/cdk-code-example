exports.handler = async function (event:any) {
  console.log(event);
  var name = event.pathParameters.name
    ? event.pathParameters.name
    : event.pathParameters.proxy;
  let response = {
    statusCode: 200,
    body: `Hello ${name}. Welcome to CDK!`,
  };
  return response;
};
