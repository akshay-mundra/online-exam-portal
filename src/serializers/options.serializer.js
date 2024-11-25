function options(req, res, next) {
  let { data } = res;

  if (!Array.isArray(data)) {
    data = [data];
  }

  const response = data.map(option => ({
    id: option?.id,
    questionId: option?.question_id,
    option: option?.option,
    isCorrect: option?.is_correct,
    marks: option?.marks
  }));

  if (response.length === 1) {
    res.data = response[0];
  } else {
    res.data = response;
  }

  next();
}

module.exports = { options };
