// File: tests/helpers/users-exams.helper.test.js
const { Question, Option, Answer } = require('../../src/models');
const { calculateUserScore } = require('../../src/helpers/users-exams.helper');

jest.mock('../../src/models');

describe('calculateUserScore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 0 if there are no questions', async () => {
    Question.findAll.mockResolvedValueOnce([]);

    const score = await calculateUserScore(1);
    expect(score).toBe(0);
    expect(Question.findAll).toHaveBeenCalledWith({
      where: { exam_id: 1 },
      attributes: ['id', 'type', 'negative_marks'],
      include: [
        { model: Option, attributes: ['id', 'marks', 'is_correct'], required: true },
        { model: Answer, attributes: ['id', 'option_id'] }
      ]
    });
  });

  it('should correctly calculate score for single choice questions with correct answers', async () => {
    Question.findAll.mockResolvedValueOnce([
      {
        id: 1,
        type: 'single_choice',
        negative_marks: -1,
        Options: [
          { id: 101, marks: 5, is_correct: true },
          { id: 102, marks: 0, is_correct: false }
        ],
        Answers: [{ id: 201, option_id: 101 }]
      }
    ]);

    const score = await calculateUserScore(1);
    expect(score).toBe(5);
  });

  it('should deduct negative marks for single choice questions with incorrect answers', async () => {
    Question.findAll.mockResolvedValueOnce([
      {
        id: 1,
        type: 'single_choice',
        negative_marks: -2,
        Options: [
          { id: 101, marks: 5, is_correct: true },
          { id: 102, marks: 0, is_correct: false }
        ],
        Answers: [{ id: 201, option_id: 102 }]
      }
    ]);

    const score = await calculateUserScore(1);
    expect(score).toBe(-2);
  });

  it('should deduct negative marks if multiple answers are provided for single choice question', async () => {
    Question.findAll.mockResolvedValueOnce([
      {
        id: 1,
        type: 'single_choice',
        negative_marks: -3,
        Options: [
          { id: 101, marks: 5, is_correct: true },
          { id: 102, marks: 0, is_correct: false }
        ],
        Answers: [
          { id: 201, option_id: 101 },
          { id: 202, option_id: 102 }
        ]
      }
    ]);

    const score = await calculateUserScore(1);
    expect(score).toBe(-3);
  });

  it('should calculate score for multiple choice questions with correct answers', async () => {
    Question.findAll.mockResolvedValueOnce([
      {
        id: 2,
        type: 'multiple_choice',
        negative_marks: -2,
        Options: [
          { id: 103, marks: 3, is_correct: true },
          { id: 104, marks: 2, is_correct: true },
          { id: 105, marks: 0, is_correct: false }
        ],
        Answers: [
          { id: 203, option_id: 103 },
          { id: 204, option_id: 104 }
        ]
      }
    ]);

    const score = await calculateUserScore(1);
    expect(score).toBe(5);
  });

  it('should deduct negative marks for multiple choice questions with incorrect answers', async () => {
    Question.findAll.mockResolvedValueOnce([
      {
        id: 2,
        type: 'multiple_choice',
        negative_marks: -4,
        Options: [
          { id: 103, marks: 3, is_correct: true },
          { id: 104, marks: 2, is_correct: true },
          { id: 105, marks: 0, is_correct: false }
        ],
        Answers: [
          { id: 203, option_id: 103 },
          { id: 204, option_id: 105 } // Incorrect option selected
        ]
      }
    ]);

    const score = await calculateUserScore(1);
    expect(score).toBe(-4);
  });

  it('should correctly handle mixed question types and scores', async () => {
    Question.findAll.mockResolvedValueOnce([
      {
        id: 1,
        type: 'single_choice',
        negative_marks: -1,
        Options: [
          { id: 101, marks: 5, is_correct: true },
          { id: 102, marks: 0, is_correct: false }
        ],
        Answers: [{ id: 201, option_id: 101 }]
      },
      {
        id: 2,
        type: 'multiple_choice',
        negative_marks: -2,
        Options: [
          { id: 103, marks: 3, is_correct: true },
          { id: 104, marks: 2, is_correct: true },
          { id: 105, marks: 0, is_correct: false }
        ],
        Answers: [
          { id: 203, option_id: 103 },
          { id: 204, option_id: 104 }
        ]
      }
    ]);

    const score = await calculateUserScore(1);
    expect(score).toBe(10); // 5 from single_choice + 3 + 2 from multiple_choice
  });
});
