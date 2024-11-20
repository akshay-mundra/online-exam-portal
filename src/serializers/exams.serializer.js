function exams(req, res, next) {
  let { exams } = res.data;

  const response = [];
  if (!exams) {
    exams = [res.data];
  }

  for (const exam of exams) {
    response.push({
      id: exam?.id,
      adminId: exam?.admin_id,
      title: exam?.title,
      isPublished: exam?.is_published,
      startTime: exam?.start_time,
      endTime: exam?.end_time,
    });
  }

  if (!res.data.exams) {
    res.data = response[0];
  } else {
    res.data.exams = response;
  }

  next();
}

function userWithExams(req, res, next) {
  let { data } = res;

  const response = {};
  if (data) {
    response.firstName = data.first_name;
    response.lastName = data.last_name;
    response.email = data.email;

    if (data.Exams) {
      response.exams = data.Exams.map(exam => ({
        examId: exam?.id,
        userExamId: exam?.users_exams?.id,
        score: exam?.users_exams?.score,
        status: exam?.users_exams?.status,
      }));
    }
  }

  res.data = response;
  next();
}

module.exports = { exams, userWithExams };
