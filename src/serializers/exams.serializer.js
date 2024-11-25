function exams(req, res, next) {
  let { exams } = res.data;

  const response = [];
  if (!exams) {
    if (Array.isArray(res.data)) {
      exams = res.data;
    } else {
      exams = [res.data];
    }
  }

  for (const exam of exams) {
    response.push({
      id: exam?.id,
      adminId: exam?.admin_id,
      title: exam?.title,
      isPublished: exam?.is_published,
      startTime: exam?.start_time,
      endTime: exam?.end_time
    });
  }

  if (res.data.exams) {
    res.data.exams = response;
  } else if (response.length > 1) {
    res.data = response;
  } else {
    res.data = response[0];
  }

  next();
}

function userWithExams(req, res, next) {
  let { data } = res;

  if (!Array.isArray(data)) {
    data = [data];
  }

  const response = data.map(user => ({
    id: user?.id,
    firstName: user?.first_name,
    lastName: user?.last_name,
    email: user?.email,
    exams: {
      id: user?.Exams[0]?.id,
      userExamId: user?.Exams[0]?.users_exams?.id,
      score: user?.Exams[0]?.users_exams?.score,
      status: user?.Exams[0]?.users_exams?.status
    }
  }));

  if (response.length > 1) {
    res.data = response;
  } else {
    res.data = response[0];
  }

  next();
}

module.exports = { exams, userWithExams };
