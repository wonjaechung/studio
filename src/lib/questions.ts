import type { Question } from '@/lib/types';

export const statsQuestions: Question[] = [
    // 2016 Questions (1-40, 21 is skipped)
    {
      id: "2016-01", year: 2016, questionNumber: 1,
      questionText: "The prices, in thousands of dollars, of 304 homes recently sold in a city are summarized in the histogram below. Based on the histogram, which of the following statements must be true?",
      chartType: 'Histogram',
      chartData: { labels: ['250-500', '500-750', '750-1000', '1000-1250', '1250-1500', '1500-1750', '1750-2000', '2000-2250', '2250-2500'], values: [38, 120, 82, 38, 10, 8, 5, 2, 1], xAxisLabel: "Price (thousands of dollars)", yAxisLabel: "Number of Homes Sold" },
      answerOptions: [ { text: "The minimum price is $250,000.", isCorrect: false }, { text: "The maximum price is $2,500,000.", isCorrect: false }, { text: "The median price is not greater than $750,000.", isCorrect: true }, { text: "The mean price is between $500,000 and $750,000.", isCorrect: false }, { text: "The upper quartile of the prices is greater than $1,500,000.", isCorrect: false }, ],
      explanation: {
          ko: {
              concept: "📊 히스토그램과 중앙값(Median) 찾기",
              steps: ["총 데이터 개수(집의 수)를 확인합니다: 304채.", "중앙값의 위치를 찾습니다. 데이터가 짝수이므로 중앙값은 152번째와 153번째 값의 평균입니다.", "계급별 누적 도수를 계산합니다: 250-500k 계급까지 38채, 500-750k 계급까지 38 + 120 = 158채.", "152번째와 153번째 값은 모두 500-750k 계급에 속하므로, 중앙값은 $750,000를 넘지 않습니다."],
              distractors: ["A, B: 히스토그램은 각 계급의 빈도만 보여줄 뿐, 정확한 최솟값이나 최댓값은 알 수 없습니다.", "D: 분포가 오른쪽으로 심하게 치우쳐 있으므로, 평균은 중앙값보다 클 가능성이 높습니다. 따라서 평균이 500-750k 사이에 있다고 단정할 수 없습니다.", "E: Q3(제3사분위수)는 304 * 0.75 = 228번째 값입니다. 750-1000k 계급까지의 누적 도수는 158 + 82 = 240이므로, Q3는 750-1000k 계급에 속합니다."],
              summary: "히스토그램에서 중앙값의 위치는 전체 데이터의 개수를 기반으로 누적 도수를 통해 찾을 수 있습니다."
          },
          en: {
              concept: "📊 Finding the Median from a Histogram",
              steps: ["Find the total number of data points (homes): 304.", "Determine the position of the median. Since n=304 (even), the median is the average of the 152nd and 153rd values.", "Calculate the cumulative frequency for each class: Up to 500k is 38 homes. Up to 750k is 38 + 120 = 158 homes.", "Since the 152nd and 153rd values both fall within the 500k-750k class, the median price cannot be greater than $750,000."],
              distractors: ["A, B: A histogram shows frequencies for bins, not the exact minimum or maximum values.", "D: The distribution is strongly skewed to the right, so the mean will be greater than the median. We cannot conclude the mean is in the 500k-750k range.", "E: The upper quartile (Q3) is the 304 * 0.75 = 228th value. The cumulative frequency up to 1000k is 158 + 82 = 240. Thus, Q3 is in the 750k-1000k class."],
              summary: "The location of the median in a histogram is found by using cumulative frequencies based on the total number of data points."
          }
      },
      tags: ['기술통계'], difficulty: '중간'
  },
  {
      id: "2016-02", year: 2016, questionNumber: 2,
      questionText: "As part of a study on the relationship between the use of tanning booths and the occurrence of skin cancer, researchers reviewed the medical records of 1,436 people. The table below summarizes tanning booth use for people in the study who did and did not have skin cancer.\n\n| | Used a Tanning Booth | Did Not Use a Tanning Booth | Total |\n|---|---|---|---|\n| Skin cancer | 190 | 706 | 896 |\n| No skin cancer | 75 | 465 | 540 |\n| Total | 265 | 1,171 | 1,436 |\n\nOf the people in the study who had skin cancer, what fraction used a tanning booth?",
      answerOptions: [ { text: "190/265", isCorrect: false }, { text: "190/896", isCorrect: true }, { text: "190/1,436", isCorrect: false }, { text: "265/1,436", isCorrect: false }, { text: "896/1,436", isCorrect: false } ],
      explanation: {
          ko: {
              concept: "📊 조건부 확률과 분할표 해석",
              steps: ["문제의 조건('피부암이 있는 사람들 중')에 해당하는 그룹을 찾습니다. 이는 표에서 'Skin cancer' 행에 해당하며, 총 896명입니다.", "이 그룹 내에서 '태닝 부스를 사용한' 사람의 수를 찾습니다. 이는 190명입니다.", "따라서, 구하고자 하는 분수는 190/896 입니다."],
              distractors: ["A: 190/265는 태닝 부스를 사용한 사람 중 피부암이 있는 사람의 비율입니다.", "C: 190/1,436은 전체 인원 중 태닝 부스를 사용하고 피부암이 있는 사람의 비율입니다."],
              summary: "조건부 확률 P(A|B)는 '사건 B가 일어났을 때 사건 A가 일어날 확률'이며, 분할표에서는 B에 해당하는 행 또는 열을 새로운 전체 집단으로 보고 계산합니다."
          },
          en: {
              concept: "📊 Conditional Probability and Two-Way Tables",
              steps: ["Identify the group specified by the condition ('Of the people in the study who had skin cancer'). This corresponds to the 'Skin cancer' row, which has a total of 896 people.", "Find the number of people within this group who 'used a tanning booth'. This value is 190.", "Therefore, the required fraction is 190/896."],
              distractors: ["A: 190/265 is the proportion of tanning booth users who have skin cancer.", "C: 190/1,436 is the proportion of all people in the study who used a tanning booth and have skin cancer."],
              summary: "Conditional probability P(A|B) is the probability of event A occurring given that event B has occurred. In a two-way table, this is calculated by considering the row or column of B as the new total."
          }
      },
      tags: ['기술통계', '확률분포'], difficulty: '쉬움'
  },
  {
      id: "2016-03", year: 2016, questionNumber: 3,
      questionText: "A researcher is conducting a study of charitable donations by surveying a simple random sample of households in a certain city. The researcher wants to determine whether there is convincing statistical evidence that more than 50 percent of households in the city gave a charitable donation in the past year. Let p represent the proportion of all households in the city that gave a charitable donation in the past year. Which of the following are appropriate hypotheses for the researcher?",
      answerOptions: [ { text: "H₀: p = 0.5 and Hₐ: p > 0.5", isCorrect: true }, { text: "H₀: p = 0.5 and Hₐ: p ≠ 0.5", isCorrect: false }, { text: "H₀: p = 0.5 and Hₐ: p < 0.5", isCorrect: false }, { text: "H₀: p > 0.5 and Hₐ: p ≠ 0.5", isCorrect: false }, { text: "H₀: p > 0.5 and Hₐ: p = 0.5", isCorrect: false } ],
      explanation: {
          ko: {
              concept: "🔍 가설 설정",
              steps: ["귀무가설(H₀)은 일반적으로 '효과가 없다' 또는 '변화가 없다'는 현재 상태를 나타냅니다. 여기서는 비율이 0.5라는 것입니다.", "대립가설(Hₐ)은 연구자가 입증하고자 하는 주장입니다. 여기서는 '50%보다 많다'는 주장이므로 p > 0.5가 됩니다."],
              distractors: ["B, C: '다르다' 또는 '적다'는 연구자의 주장과 다릅니다.", "D, E: 귀무가설은 항상 등호(=)를 포함한 형태로 설정됩니다."],
              summary: "가설검정에서 귀무가설(H₀)은 기각하고자 하는 대상이며, 대립가설(Hₐ)은 연구를 통해 보이고자 하는 새로운 주장입니다."
          },
          en: {
              concept: "🔍 Setting Up Hypotheses",
              steps: ["The null hypothesis (H₀) typically represents the status quo or a statement of 'no effect'. Here, that is the proportion being 0.5.", "The alternative hypothesis (Hₐ) is the claim the researcher wants to find evidence for. Here, the claim is that the proportion is 'more than 50 percent', so p > 0.5."],
              distractors: ["B, C: 'Different from' or 'less than' are not what the researcher wants to prove.", "D, E: The null hypothesis is always stated with an equality."],
              summary: "In hypothesis testing, the null hypothesis (H₀) is the default assumption to be challenged, while the alternative hypothesis (Hₐ) is the new claim to be supported by evidence."
          }
      },
      tags: ['추론통계'], difficulty: '쉬움'
  },
];
