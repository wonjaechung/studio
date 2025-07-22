
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
  },
    {
      id: "2016-04", year: 2016, questionNumber: 4,
      questionText: "A company determines the mean and standard deviation of the number of sick days taken by its employees in one year. Which of the following is the best description of the standard deviation?",
      answerOptions: [ { text: "Approximately the mean distance between the number of sick days taken by individual employees and the mean number of sick days taken by all employees", isCorrect: true }, { text: "Approximately the median distance between the number of sick days taken by individual employees and the median number of sick days taken by all employees", isCorrect: false }, { text: "The distance between the greatest number of sick days taken by an employee and the mean number of sick days taken by all employees", isCorrect: false }, { text: "The number of days separating the fewest sick days taken and the most sick days taken when considering all employees", isCorrect: false }, { text: "The number of days separating the fewest sick days taken and the most sick days taken when considering the middle 50 percent of the distribution", isCorrect: false } ],
      unit: 'Unit 1: Exploring One-Variable Data',
      topic: 'Summarizing Quantitative Data: Measures of Spread'
  },
  {
      id: "2016-05", year: 2016, questionNumber: 5,
      questionText: "In one region of the country, the mean length of stay in hospitals is 5.5 days with standard deviation 2.6 days. Because many patients stay in the hospital for considerably more days, the distribution of length of stay is strongly skewed to the right. Consider random samples of size 100 taken from the distribution with the mean length of stay, x̄, recorded for each sample. Which of the following is the best description of the sampling distribution of x̄?",
      answerOptions: [ { text: "Strongly skewed to the right with mean 5.5 days and standard deviation 2.6 days", isCorrect: false }, { text: "Strongly skewed to the right with mean 5.5 days and standard deviation 0.26 day", isCorrect: false }, { text: "Strongly skewed to the right with mean 5.5 days and standard deviation 0.026 day", isCorrect: false }, { text: "Approximately normal with mean 5.5 days and standard deviation 2.6 days", isCorrect: false }, { text: "Approximately normal with mean 5.5 days and standard deviation 0.26 day", isCorrect: true } ],
      unit: 'Unit 5: Sampling Distributions',
      topic: 'The Central Limit Theorem (CLT)'
  },
  {
      id: "2016-06", year: 2016, questionNumber: 6,
      questionText: "A local television news station includes a viewer survey question about a current issue at the beginning of every evening news broadcast. Viewers are invited to use social media to respond to the question. The results of the survey are shared with the audience at the end of each broadcast. In relation to the opinions of the population of the region, which of the following is a possible reason why the results of such surveys could be biased?\n\nI. Viewers with strong opinions about the current issue are more likely to respond than are viewers without strong opinions.\nII. The opinions of viewers of one television station are not necessarily representative of the population of a region.\nIII. Viewers with access to social media are not necessarily representative of the population of a region.",
      answerOptions: [
          { text: "(A) I only", isCorrect: false },
          { text: "(B) II only", isCorrect: false },
          { text: "(C) III only", isCorrect: false },
          { text: "(D) II and III only", isCorrect: false },
          { text: "(E) I, II, and III", isCorrect: true }
      ],
      unit: 'Unit 3: Collecting Data',
      topic: 'Potential Problems with Sampling'
  }
];
