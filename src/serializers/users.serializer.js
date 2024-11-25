function users(req, res, next) {
  let { users } = res.data;

  const response = [];
  if (!users) {
    users = [res.data];
  }

  for (const user of users) {
    response.push({
      id: user?.id,
      firstName: user?.first_name,
      lastName: user?.last_name,
      email: user?.email
    });
  }

  if (!res.data.users) {
    res.data = response[0];
  } else {
    res.data.users = response;
  }

  next();
}

module.exports = { users };
