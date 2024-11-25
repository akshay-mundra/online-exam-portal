function usersExams(req, res, next) {
  let { usersExams } = res.data;

  const response = [];
  if (!usersExams) {
    if (Array.isArray(res.data)) {
      usersExams = res.data;
    } else {
      usersExams = [res.data];
    }
  }

  for (const userExam of usersExams) {
    response.push({
      id: userExam?.id,
      userId: userExam?.user_id,
      examId: userExam?.exam_id,
      isMarked: userExam?.is_marked,
      status: userExam?.status,
      score: userExam?.score
    });
  }

  if (!res.data.usersExams) {
    res.data = response[0];
  } else {
    res.data.usersExams = response;
  }

  next();
}

module.exports = { usersExams };
