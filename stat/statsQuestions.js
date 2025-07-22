
export const statsQuestions = [
    // 2016 Questions (1-40, 21 is skipped)
    {
      id: "2016-01", year: 2016, questionNumber: 1,
      questionText: "The prices, in thousands of dollars, of 304 homes recently sold in a city are summarized in the histogram below. Based on the histogram, which of the following statements must be true?",
      chartType: 'Histogram',
      chartData: { labels: ['250-500', '500-750', '750-1000', '1000-1250', '1250-1500', '1500-1750', '1750-2000', '2000-2250', '2250-2500'], values: [38, 120, 82, 38, 10, 8, 5, 2, 1], xAxisLabel: "Price (thousands of dollars)", yAxisLabel: "Number of Homes Sold" },
      answerOptions: [ { text: "The minimum price is $250,000.", isCorrect: false }, { text: "The maximum price is $2,500,000.", isCorrect: false }, { text: "The median price is not greater than $750,000.", isCorrect: true }, { text: "The mean price is between $500,000 and $750,000.", isCorrect: false }, { text: "The upper quartile of the prices is greater than $1,500,000.", isCorrect: false }, ],
      unit: 'Unit 1: Exploring One-Variable Data', 
      topic: 'Displaying and Describing Distributions'
  },
  {
      id: "2016-02", year: 2016, questionNumber: 2,
      questionText: "As part of a study on the relationship between the use of tanning booths and the occurrence of skin cancer, researchers reviewed the medical records of 1,436 people. The table below summarizes tanning booth use for people in the study who did and did not have skin cancer.\n\n| | Used a Tanning Booth | Did Not Use a Tanning Booth | Total |\n|---|---|---|---|\n| Skin cancer | 190 | 706 | 896 |\n| No skin cancer | 75 | 465 | 540 |\n| Total | 265 | 1,171 | 1,436 |\n\nOf the people in the study who had skin cancer, what fraction used a tanning booth?",
      answerOptions: [ { text: "190/265", isCorrect: false }, { text: "190/896", isCorrect: true }, { text: "190/1,436", isCorrect: false }, { text: "265/1,436", isCorrect: false }, { text: "896/1,436", isCorrect: false } ],
      unit: 'Unit 4: Probability', 
      topic: 'Conditional Probability and Independence'
  },
  {
      id: "2016-03", year: 2016, questionNumber: 3,
      questionText: "A researcher is conducting a study of charitable donations by surveying a simple random sample of households in a certain city. The researcher wants to determine whether there is convincing statistical evidence that more than 50 percent of households in the city gave a charitable donation in the past year. Let p represent the proportion of all households in the city that gave a charitable donation in the past year. Which of the following are appropriate hypotheses for the researcher?",
      answerOptions: [ { text: "H₀: p = 0.5 and Hₐ: p > 0.5", isCorrect: true }, { text: "H₀: p = 0.5 and Hₐ: p ≠ 0.5", isCorrect: false }, { text: "H₀: p = 0.5 and Hₐ: p < 0.5", isCorrect: false }, { text: "H₀: p > 0.5 and Hₐ: p ≠ 0.5", isCorrect: false }, { text: "H₀: p > 0.5 and Hₐ: p = 0.5", isCorrect: false } ],
      unit: 'Unit 6: Inference for Proportions', 
      topic: 'Significance Tests for Proportions'
  }
];
