// single choice question should have only one option as correct
function checkOptionsSingleChoice(options) {
  for (let option of options) {
    if (option.is_correct) return false;
  }

  return true;
}

module.exports = checkOptionsSingleChoice;
