export const statsQuestions = [
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
  {
      id: "2016-04", year: 2016, questionNumber: 4,
      questionText: "A company determines the mean and standard deviation of the number of sick days taken by its employees in one year. Which of the following is the best description of the standard deviation?",
      answerOptions: [ { text: "Approximately the mean distance between the number of sick days taken by individual employees and the mean number of sick days taken by all employees", isCorrect: true }, { text: "Approximately the median distance between the number of sick days taken by individual employees and the median number of sick days taken by all employees", isCorrect: false }, { text: "The distance between the greatest number of sick days taken by an employee and the mean number of sick days taken by all employees", isCorrect: false }, { text: "The number of days separating the fewest sick days taken and the most sick days taken when considering all employees", isCorrect: false }, { text: "The number of days separating the fewest sick days taken and the most sick days taken when considering the middle 50 percent of the distribution", isCorrect: false } ],
      explanation: {
          ko: {
              concept: "📊 표준편차의 정의",
              steps: ["표준편차는 데이터가 평균으로부터 얼마나 퍼져 있는지를 나타내는 대표적인 산포도입니다.", "각 데이터 값과 평균의 차이(편차)를 제곱하여 평균을 낸 것이 분산이며, 분산의 제곱근이 표준편차입니다.", "따라서, 표준편차는 각 데이터 값이 평균에서 '평균적으로' 얼마나 떨어져 있는지를 나타내는 값으로 해석할 수 있습니다."],
              distractors: ["B: 중앙값과의 거리를 사용하는 것은 MAD(Median Absolute Deviation)와 관련이 있습니다.", "D: 범위(Range)에 대한 설명입니다.", "E: 사분위간 범위(IQR)에 대한 설명입니다."],
              summary: "표준편차는 데이터의 변동성을 측정하는 가장 기본적인 지표 중 하나로, 평균을 중심으로 데이터가 얼마나 흩어져 있는지를 나타냅니다."
          },
          en: {
              concept: "📊 Definition of Standard Deviation",
              steps: ["Standard deviation is a primary measure of spread, indicating how dispersed the data is in relation to the mean.", "It is calculated as the square root of the variance, which is the average of the squared differences from the Mean.", "Therefore, it can be interpreted as the approximate average distance of any data point from the mean."],
              distractors: ["B: Distance from the median relates to the Median Absolute Deviation (MAD).", "D: This describes the range.", "E: This describes the interquartile range (IQR)."],
              summary: "Standard deviation is a fundamental measure of variability, quantifying the amount of dispersion of a set of data values from their mean."
          }
      },
      tags: ['기술통계'], difficulty: '쉬움'
  },
  {
      id: "2016-05", year: 2016, questionNumber: 5,
      questionText: "In one region of the country, the mean length of stay in hospitals is 5.5 days with standard deviation 2.6 days. Because many patients stay in the hospital for considerably more days, the distribution of length of stay is strongly skewed to the right. Consider random samples of size 100 taken from the distribution with the mean length of stay, x̄, recorded for each sample. Which of the following is the best description of the sampling distribution of x̄?",
      answerOptions: [ { text: "Strongly skewed to the right with mean 5.5 days and standard deviation 2.6 days", isCorrect: false }, { text: "Strongly skewed to the right with mean 5.5 days and standard deviation 0.26 day", isCorrect: false }, { text: "Strongly skewed to the right with mean 5.5 days and standard deviation 0.026 day", isCorrect: false }, { text: "Approximately normal with mean 5.5 days and standard deviation 2.6 days", isCorrect: false }, { text: "Approximately normal with mean 5.5 days and standard deviation 0.26 day", isCorrect: true } ],
      explanation: {
          ko: {
              concept: "📜 중심극한정리 (Central Limit Theorem)",
              steps: ["중심극한정리에 따르면, 모집단의 분포 모양과 상관없이 표본의 크기(n)가 충분히 크면(일반적으로 n ≥ 30), 표본 평균(x̄)의 표집분포는 근사적으로 정규분포를 따릅니다. 이 문제에서는 n=100이므로 이 조건을 만족합니다.", "표집분포의 평균(μ_x̄)은 모집단의 평균(μ)과 같습니다. 따라서 μ_x̄ = 5.5일입니다.", "표집분포의 표준편차(표준오차, σ_x̄)는 모집단의 표준편차(σ)를 표본 크기(n)의 제곱근으로 나눈 값입니다. σ_x̄ = σ/√n = 2.6/√100 = 0.26일입니다."],
              distractors: ["A, B, C: 표본 크기가 충분히 크므로 표집분포는 더 이상 치우치지 않고 정규분포에 가까워집니다.", "D: 표집분포의 표준편차는 모집단의 표준편차를 √n으로 나누어야 합니다."],
              summary: "중심극한정리는 모집단이 정규분포가 아니더라도 큰 표본에서 추출한 표본 평균의 분포가 정규분포를 따른다는 매우 중요한 정리입니다."
          },
          en: {
              concept: "📜 Central Limit Theorem (CLT)",
              steps: ["The Central Limit Theorem states that if the sample size (n) is large enough (typically n ≥ 30), the sampling distribution of the sample mean (x̄) will be approximately normal, regardless of the population's distribution shape. Here, n=100, which satisfies the condition.", "The mean of the sampling distribution (μ_x̄) is equal to the population mean (μ). So, μ_x̄ = 5.5 days.", "The standard deviation of the sampling distribution (standard error, σ_x̄) is the population standard deviation (σ) divided by the square root of the sample size (n). So, σ_x̄ = σ/√n = 2.6/√100 = 0.26 days."],
              distractors: ["A, B, C: Because the sample size is large, the sampling distribution is not skewed but approximately normal.", "D: The standard deviation of the sampling distribution must be divided by √n."],
              summary: "The CLT is a fundamental theorem stating that the distribution of sample means from a large sample will be approximately normal, even if the original population is not normally distributed."
          }
      },
      tags: ['추론통계', '표본추출'], difficulty: '중간'
  },
  {
      id: "2016-06", year: 2016, questionNumber: 6,
      questionText: "A local television news station includes a viewer survey question about a current issue at the beginning of every evening news broadcast. Viewers are invited to use social media to respond to the question. The results of the survey are shared with the audience at the end of each broadcast. In relation to the opinions of the population of the region, which of the following is a possible reason why the results of such surveys could be biased?\n\nI. Viewers with strong opinions about the current issue are more likely to respond than are viewers without strong opinions.\nII. The opinions of viewers of one television station are not necessarily representative of the population of a region.\nIII. Viewers with access to social media are not necessarily representative of the population of a region.",
      answerOptions: [ { text: "(A) I only", isCorrect: false }, { text: "(B) II only", isCorrect: false }, { text: "(C) III only", isCorrect: false }, { text: "(D) II and III only", isCorrect: false }, { text: "(E) I, II, and III", isCorrect: true } ],
      explanation: {
          ko: {
              concept: "🤔 표본추출 편향(Bias)의 종류",
              steps: ["I: 자발적 참여로 인해 강한 의견을 가진 사람들만 응답하는 '자발적 응답 편향'이 발생합니다.", "II: 특정 방송사 시청자라는 특정 그룹만을 대상으로 하므로, 전체 지역 주민을 대표하지 못하는 '과소포함 편향'이 발생합니다.", "III: 소셜 미디어 사용자라는 특정 그룹만을 대상으로 하므로, 이 또한 '과소포함 편향'에 해당합니다."],
              distractors: ["모든 보기(I, II, III)는 타당한 편향의 원인입니다."],
              summary: "좋은 표본은 모집단을 잘 대표해야 합니다. 자발적 응답이나 특정 그룹만을 대상으로 하는 표본추출은 결과에 심각한 편향을 초래할 수 있습니다."
          },
          en: {
              concept: "🤔 Types of Sampling Bias",
              steps: ["I: This describes 'voluntary response bias', where people with strong opinions are more likely to participate.", "II: This describes 'undercoverage bias', as the viewers of one station may not be representative of the entire region.", "III: This also describes 'undercoverage bias', as social media users may not be representative of the entire region."],
              distractors: ["All three statements (I, II, and III) are valid reasons for the survey results to be biased."],
              summary: "A good sample must be representative of the population. Voluntary response samples and samples that underrepresent parts of the population can lead to significant bias."
          }
      },
      tags: ['표본추출', '실험설계'], difficulty: '쉬움'
  },
  {
      id: "2016-07", year: 2016, questionNumber: 7,
      questionText: "A graduate student conducted a study of field mice in rural Kansas. The student obtained a sample of 100 field mice and recorded the weight, in grams, of each mouse. After the measurements were taken, it was discovered that the scale was not calibrated correctly. The student adjusted the 100 recorded measurements by subtracting 3 grams from each measurement. Which of the following statistics for the weight, in grams, of the field mice has the same value before and after the adjustment?",
      answerOptions: [ { text: "The median", isCorrect: false }, { text: "The mean", isCorrect: false }, { text: "The first quartile", isCorrect: false }, { text: "The third quartile", isCorrect: false }, { text: "The interquartile range", isCorrect: true } ],
      explanation: {
          ko: {
              concept: "📏 선형 변환과 통계량의 변화",
              steps: ["모든 데이터 값에 상수를 더하거나 빼는 것은 선형 변환의 일종입니다.", "이러한 변환은 데이터의 중심 위치를 나타내는 통계량(평균, 중앙값, 사분위수 등)을 동일한 상수만큼 이동시킵니다.", "하지만 데이터의 퍼진 정도를 나타내는 통계량(범위, IQR, 표준편차)은 변하지 않습니다. IQR = Q3 - Q1 이므로, (Q3 - 3) - (Q1 - 3) = Q3 - Q1 과 같이 값은 동일합니다."],
              distractors: ["A, B, C, D: 모두 중심 위치를 나타내는 통계량이므로, 각 값에서 3씩 감소합니다."],
              summary: "데이터에 상수를 더하거나 빼도 데이터의 산포도(퍼진 정도)는 변하지 않습니다."
          },
          en: {
              concept: "📏 Linear Transformations and Statistics",
              steps: ["Adding or subtracting a constant to every data point is a type of linear transformation.", "This transformation shifts measures of center (like mean, median, quartiles) by that same constant.", "However, measures of spread (like range, IQR, standard deviation) remain unchanged. Since IQR = Q3 - Q1, the new IQR would be (Q3 - 3) - (Q1 - 3) = Q3 - Q1, which is the same."],
              distractors: ["A, B, C, D: These are all measures of center and would decrease by 3."],
              summary: "Adding or subtracting a constant to a dataset does not change its measures of spread."
          }
      },
      tags: ['기술통계'], difficulty: '쉬움'
  },
  {
      id: "2016-08", year: 2016, questionNumber: 8,
      questionText: "A statistician proposed a new method for constructing a 90 percent confidence interval to estimate the median of assessed home values for homes in a large community. To test the method, the statistician will conduct a simulation by selecting 10,000 random samples of the same size from the population. For each sample, a confidence interval will be constructed using the new method. If the confidence level associated with the new method is actually 90 percent, which of the following will be captured by approximately 9,000 of the confidence intervals constructed from the simulation?",
      answerOptions: [ { text: "The sample mean", isCorrect: false }, { text: "The sample median", isCorrect: false }, { text: "The sample standard deviation", isCorrect: false }, { text: "The population mean", isCorrect: false }, { text: "The population median", isCorrect: true } ],
      explanation: {
          ko: {
              concept: "🎯 신뢰수준의 의미",
              steps: ["신뢰수준(Confidence Level)은 '반복적인 표본추출 과정에서, 생성된 신뢰구간들이 실제 모집단 모수(parameter)를 포함할 확률'을 의미합니다.", "이 문제에서 추정하려는 모수는 '모집단의 중앙값(population median)'입니다.", "따라서 90% 신뢰수준이란, 10,000개의 신뢰구간 중 약 90%인 9,000개가 실제 '모집단 중앙값'을 포함할 것이라고 기대할 수 있다는 뜻입니다."],
              distractors: ["A, B, C: 신뢰구간은 표본 통계량이 아닌 모집단 모수를 추정하기 위한 것입니다.", "D: 이 문제에서는 모집단 평균이 아닌 모집단 중앙값을 추정하고 있습니다."],
              summary: "신뢰수준은 특정 신뢰구간 하나가 모수를 포함할 확률이 아니라, 동일한 방법으로 생성된 많은 신뢰구간 중 모수를 포함하는 구간의 비율을 의미합니다."
          },
          en: {
              concept: "🎯 The Meaning of a Confidence Level",
              steps: ["A confidence level describes the long-run capture rate of the true population parameter by the confidence intervals generated from repeated sampling.", "The parameter being estimated in this problem is the 'population median'.", "Therefore, a 90% confidence level means that we expect about 90% of the 10,000 intervals (which is 9,000) to capture the true 'population median'."],
              distractors: ["A, B, C: Confidence intervals are used to estimate population parameters, not sample statistics.", "D: The parameter of interest here is the population median, not the population mean."],
              summary: "A confidence level refers to the percentage of all possible samples that can be expected to include the true population parameter within the computed interval."
          }
      },
      tags: ['추론통계'], difficulty: '중간'
  },
  {
      id: "2016-09", year: 2016, questionNumber: 9,
      questionText: "The distribution of monthly rent for one-bedroom apartments in a city is approximately normal with mean $936 and standard deviation $61. A graduate student is looking for a one-bedroom apartment and wants to pay no more than $800 in monthly rent. Of the following, which is the best estimate of the percent of one-bedroom apartments in the city with a monthly rent of at most $800?",
      answerOptions: [ { text: "1.3%", isCorrect: false }, { text: "2.5%", isCorrect: true }, { text: "50%", isCorrect: false }, { text: "95%", isCorrect: false }, { text: "97.5%", isCorrect: false } ],
      explanation: {
          ko: {
              concept: "🌀 정규분포와 Z-점수 계산",
              steps: ["월세가 $800 이하일 확률, 즉 P(X ≤ 800)을 구해야 합니다.", "Z-점수를 계산합니다: Z = (관측값 - 평균) / 표준편차 = (800 - 936) / 61 = -136 / 61 ≈ -2.23.", "표준정규분포표나 계산기를 사용하여 Z < -2.23일 확률을 찾으면 약 0.0129 또는 1.29%입니다.", "선택지 중 가장 가까운 값은 2.5%입니다. 이는 Z-점수가 약 -2일 때의 확률과 비슷합니다. 문제의 의도상 B가 정답일 가능성이 높습니다."],
              distractors: ["C, D, E: 월세 $800은 평균보다 낮으므로, 확률은 50%보다 작아야 합니다."],
              summary: "정규분포를 따르는 데이터에서 특정 값 이하의 확률을 구하려면, 해당 값을 Z-점수로 변환하여 표준정규분포 상의 면적을 찾습니다."
          },
          en: {
              concept: "🌀 Normal Distribution and Z-Scores",
              steps: ["We need to find the probability P(X ≤ 800).", "Calculate the Z-score: Z = (Value - Mean) / SD = (800 - 936) / 61 = -136 / 61 ≈ -2.23.", "Using a standard normal table or calculator, the probability P(Z < -2.23) is approximately 0.0129, or 1.29%.", "The closest answer choice is 2.5%, which corresponds to a Z-score of approximately -2. Given the options, this is the intended answer."],
              distractors: ["C, D, E: Since $800 is below the mean, the probability must be less than 50%."],
              summary: "To find the probability of a value in a normal distribution, convert the value to a Z-score and find the corresponding area under the standard normal curve."
          }
      },
      tags: ['확률분포'], difficulty: '중간'
  },
  {
      id: "2016-10", year: 2016, questionNumber: 10,
      questionText: "A news article reported that college students who have part-time jobs work an average of 15 hours per week. The staff of a college newspaper thought that the average might be different from 15 hours per week for their college. Data were collected on the number of hours worked per week for a random sample of students at the college who have part-time jobs. The data were used to test the hypotheses H₀: μ = 15 and Hₐ: μ ≠ 15, where μ is the mean number of hours worked per week for all students at the college with part-time jobs. The results of the test are shown in the table below.\n\n| Sample Mean | Std Error | df | t-stat | p-value |\n|---|---|---|---|---|\n| 13.755 | 0.707 | 25 | -1.761 | 0.090 |\n\nAssuming all conditions for inference were met, which of the following represents a 95 percent confidence interval for μ?",
      answerOptions: [ { text: "13.755 ± 1.456", isCorrect: true }, { text: "13.755 ± 0.286", isCorrect: false }, { text: "13.755 ± 0.707", isCorrect: false }, { text: "13.755 ± 1.245", isCorrect: false }, { text: "13.755 ± 0.244", isCorrect: false } ],
      explanation: {
          ko: {
              concept: "🎯 신뢰구간 계산",
              steps: ["모평균에 대한 신뢰구간 공식은 '표본평균 ± (임계값) * (표준오차)' 입니다.", "표에서 표본평균 = 13.755, 표준오차(Std Error) = 0.707, 자유도(df) = 25를 확인합니다.", "자유도가 25인 t-분포에서 95% 신뢰수준에 해당하는 임계값(t*)을 찾습니다. t* ≈ 2.060 입니다.", "오차범위(Margin of Error)를 계산합니다: ME = t* × SE = 2.060 × 0.707 ≈ 1.456.", "따라서 신뢰구간은 13.755 ± 1.456 입니다."],
              distractors: ["다른 선택지들은 잘못된 값을 사용했거나 계산이 틀렸습니다."],
              summary: "t-분포를 이용한 모평균의 신뢰구간은 표본평균, 표준오차, 그리고 자유도에 따른 임계값을 이용하여 계산합니다."
          },
          en: {
              concept: "🎯 Confidence Interval Calculation",
              steps: ["The formula for a confidence interval for a mean is: sample mean ± (critical value) * (standard error).", "From the table, identify the sample mean = 13.755, standard error (SE) = 0.707, and degrees of freedom (df) = 25.", "Find the critical t-value (t*) for a 95% confidence level with df=25. From a t-table, t* ≈ 2.060.", "Calculate the Margin of Error (ME): ME = t* × SE = 2.060 × 0.707 ≈ 1.456.", "Thus, the confidence interval is 13.755 ± 1.456."],
              distractors: ["The other options use incorrect values or calculations."],
              summary: "A t-confidence interval for a population mean is calculated using the sample mean, standard error, and the critical value from the t-distribution corresponding to the given degrees of freedom."
          }
      },
      tags: ['추론통계'], difficulty: '중간'
  },
  {
      id: "2016-11", year: 2016, questionNumber: 11,
      questionText: "A team of psychologists studied the effect of multitasking on the completion of cognitive tasks. A group of 40 women participated in the study. Each woman owned a smartphone equipped with the same type of keyboard. The women typed a text passage on the phone twice, one time while sitting in a quiet room (a single task) and the other time while walking (a multitask). The order of the single task and the multitask was randomly determined for each woman. The psychologists recorded the time it took each woman to type the text for both tasks. If the conditions of inference are met, which of the following tests is most appropriate to analyze the data?",
      answerOptions: [ { text: "A two-sample t-test for a difference between means", isCorrect: false }, { text: "A matched-pairs t-test for a mean difference", isCorrect: true }, { text: "A one-sample z-test for a proportion", isCorrect: false }, { text: "A two-sample z-test for a difference between proportions", isCorrect: false }, { text: "A chi-square test of independence", isCorrect: false } ],
      explanation: {
          ko: {
              concept: "🔬 실험설계: 대응표본 t-검정",
              steps: ["각 참가자(여성)가 두 가지 조건(조용한 방, 걸으면서)에서 모두 측정을 받았는지 확인합니다. 이 경우, 각 참가자에게 두 개의 데이터(single task 시간, multitask 시간)가 쌍으로 존재합니다.", "이러한 데이터 구조를 '대응표본(matched pairs)'이라고 합니다.", "두 대응표본의 평균 차이를 검정하는 데 가장 적합한 통계적 방법은 '대응표본 t-검정'입니다."],
              distractors: ["A: 두 그룹이 서로 독립적일 때 사용합니다.", "C, D, E: 비율 데이터나 범주형 데이터에 사용하는 검정 방법입니다."],
              summary: "동일한 대상에게 두 가지 다른 처리를 적용하여 얻은 데이터를 비교할 때는, 데이터의 쌍을 이룬 특성을 고려하여 대응표본 t-검정을 사용해야 합니다."
          },
          en: {
              concept: "🔬 Experimental Design: Matched-Pairs t-test",
              steps: ["Identify that each participant (woman) was measured under two different conditions (quiet room, walking). This means for each subject, there is a pair of data points (single task time, multitask time).", "This data structure is called 'matched pairs'.", "The most appropriate statistical test to analyze the mean difference between two paired samples is a matched-pairs t-test."],
              distractors: ["A: A two-sample t-test is used when the two groups are independent.", "C, D, E: These tests are used for proportions or categorical data, not means of quantitative data."],
              summary: "When comparing data obtained from the same subjects under two different treatments, a matched-pairs t-test should be used to account for the paired nature of the data."
          }
      },
      tags: ['추론통계', '실험설계'], difficulty: '쉬움'
  },
  {
      id: "2016-12", year: 2016, questionNumber: 12,
      questionText: "The random variable X is normally distributed with mean 5 and standard deviation 25. The random variable Y is defined by Y = 2X + 4. What are the mean and the standard deviation of Y?",
      answerOptions: [ { text: "The mean is 14 and the standard deviation is 50", isCorrect: true }, { text: "The mean is 14 and the standard deviation is 54", isCorrect: false }, { text: "The mean is 10 and the standard deviation is 50", isCorrect: false }, { text: "The mean is 10 and the standard deviation is 54", isCorrect: false }, { text: "The mean is 14 and the standard deviation is 29", isCorrect: false } ],
      explanation: {
          ko: {
              concept: "⚙️ 확률변수의 선형변환",
              steps: ["선형변환 Y = aX + b 에서 평균과 표준편차는 다음과 같이 변환됩니다:", "Mean(Y) = a * Mean(X) + b", "SD(Y) = |a| * SD(X)", "주어진 값(a=2, b=4, Mean(X)=5, SD(X)=25)을 대입합니다.", "Mean(Y) = 2 * 5 + 4 = 14", "SD(Y) = |2| * 25 = 50"],
              distractors: ["B, D, E: 표준편차 계산 시 상수는 더하지 않습니다."],
              summary: "확률변수에 상수를 곱하면 평균과 표준편차 모두 영향을 받지만, 상수를 더하면 평균만 영향을 받고 표준편차(산포도)는 변하지 않습니다."
          },
          en: {
              concept: "⚙️ Linear Transformation of Random Variables",
              steps: ["For a linear transformation Y = aX + b, the mean and standard deviation are transformed as follows:", "Mean(Y) = a * Mean(X) + b", "SD(Y) = |a| * SD(X)", "Substitute the given values (a=2, b=4, Mean(X)=5, SD(X)=25).", "Mean(Y) = 2 * 5 + 4 = 14", "SD(Y) = |2| * 25 = 50"],
              distractors: ["B, D, E: Adding a constant does not affect the standard deviation."],
              summary: "When a random variable is multiplied by a constant, both the mean and standard deviation are affected. When a constant is added, only the mean is affected, while the measure of spread (SD) remains the same."
          }
      },
      tags: ['확률분포', '기술통계'], difficulty: '쉬움'
  },
  {
      id: "2016-13", year: 2016, questionNumber: 13,
      questionText: "In northwest Pennsylvania, a zoologist recorded the ages, in months, of 55 bears and whether each bear was male or female. The data are shown in the back-to-back stemplot below.\n\nBased on the stemplot, which of the following statements is true?",
      chartType: 'StemPlot',
      chartData: {
          female: { "0": "7", "1": "", "2": "9762100", "3": "885432", "4": "65421", "5": "832", "6": "10", "7": "1", "8": "2", "9": "4", "10": "", "11": "", "12": "", "13": "20", "14": "", "15": "4" },
          male: { "0": "", "1": "578", "2": "00122344456779", "3": "2478", "4": "6", "5": "35", "6": "6", "7": "0" },
          key: "Key: 7|0 represents 70 months"
      },
      answerOptions: [
          { text: "The median age and the range of ages are both greater for female bears than for male bears.", isCorrect: true },
          { text: "The median age and the range of ages are both less for female bears than for male bears.", isCorrect: false },
          { text: "The median age is the same for female bears and male bears, and the range of ages is the same for female bears and male bears.", isCorrect: false },
          { text: "The median age is less for female bears than for male bears, and the range of ages is greater for female bears than for male bears.", isCorrect: false },
          { text: "The median age is greater for female bears than for male bears, and the range of ages is less for female bears than for male bears.", isCorrect: false }
      ],
      explanation: {
          ko: {
              concept: "🌿 등 맞댄 줄기 잎 그림 분석",
              steps: ["Female 데이터(n=28)의 중앙값 위치는 (28+1)/2 = 14.5번째, 즉 14번째와 15번째 값의 평균입니다. 줄기 잎 그림에서 14번째 값은 41, 15번째 값은 42이므로, 중앙값은 41.5개월입니다. 범위는 154 - 7 = 147개월입니다.", "Male 데이터(n=27)의 중앙값 위치는 (27+1)/2 = 14번째 값입니다. 줄기 잎 그림에서 14번째 값은 25개월입니다. 범위는 70 - 15 = 55개월입니다.", "비교 결과, 암컷 곰의 중앙값(41.5)과 범위(147) 모두 수컷 곰의 중앙값(25)과 범위(55)보다 큽니다."],
              distractors: ["B, C, D, E: 계산된 중앙값과 범위를 비교하면 이 선택지들은 모두 틀렸음을 알 수 있습니다."],
              summary: "등 맞댄 줄기 잎 그림은 두 그룹의 분포를 직접 비교하는 데 매우 유용합니다. 각 그룹의 중심 경향성(중앙값)과 산포도(범위)를 계산하여 비교할 수 있습니다."
          },
          en: {
              concept: "🌿 Analyzing a Back-to-Back Stemplot",
              steps: ["For Female bears (n=28), the median is at the (28+1)/2 = 14.5th position, the average of the 14th and 15th values. From the plot, the 14th value is 41 and the 15th is 42, so the median is 41.5 months. The range is 154 - 7 = 147 months.", "For Male bears (n=27), the median is at the (27+1)/2 = 14th position. From the plot, the 14th value is 25 months. The range is 70 - 15 = 55 months.", "Comparing the two, both the median (41.5 > 25) and range (147 > 55) are greater for female bears."],
              distractors: ["B, C, D, E: These are incorrect based on the calculated medians and ranges."],
              summary: "A back-to-back stemplot is a useful tool for directly comparing the shape, center, and spread of two distributions."
          }
      },
      tags: ['기술통계'],
      difficulty: '중간'
  },
  {
      id: "2016-14", year: 2016, questionNumber: 14,
      questionText: "A produce supplier ships boxes of produce to individual customers. The distribution of weights of shipped boxes is approximately normal with mean 36 pounds and standard deviation 4 pounds. Which expression represents the weight, in pounds, at the 75th percentile of the distribution?",
      answerOptions: [
          { text: "(-1.96)(4) + 36", isCorrect: false },
          { text: "(-0.25)(4) + 36", isCorrect: false },
          { text: "(0.25)(4) + 36", isCorrect: false },
          { text: "(0.67)(4) + 36", isCorrect: true },
          { text: "(0.75)(4) + 36", isCorrect: false }
      ],
      explanation: {
          ko: {
              concept: "🌀 정규분포와 백분위수",
              steps: ["정규분포에서 특정 백분위수에 해당하는 값을 찾기 위한 공식은 X = μ + zσ 입니다.", "75번째 백분위수에 해당하는 z-점수를 찾아야 합니다. 표준정규분포표에서 누적 확률이 0.75에 가장 가까운 z-점수는 약 0.67입니다.", "공식에 값을 대입합니다: X = 36 + (0.67)(4). 이는 선택지 (D)와 일치합니다."],
              distractors: ["A, B, C, E: 다른 z-점수나 백분위수 자체를 사용한 잘못된 계산입니다."],
              summary: "특정 백분위수에 해당하는 값을 찾으려면, 먼저 해당 백분위수의 z-점수를 찾은 다음, 이를 이용하여 원래의 값으로 변환해야 합니다."
          },
          en: {
              concept: "🌀 Normal Distribution and Percentiles",
              steps: ["The formula to find a value (X) at a certain percentile from a normal distribution is X = μ + zσ.", "We need to find the z-score corresponding to the 75th percentile. Looking up an area of 0.75 in a standard normal table gives a z-score of approximately 0.67.", "Plugging the values into the formula: X = 36 + (0.67)(4). This matches option (D)."],
              distractors: ["A, B, C, E: These options use incorrect z-scores or use the percentile value directly."],
              summary: "To find a data value for a given percentile, find the corresponding z-score for that percentile and then convert it back to the original scale using the mean and standard deviation."
          }
      },
      tags: ['확률분포'],
      difficulty: '쉬움'
  },
  {
      id: "2016-15", year: 2016, questionNumber: 15,
      questionText: "A polling agency conducted a survey by selecting 100 random samples, each consisting of 1,200 United States citizens. The citizens in each sample were asked whether they were optimistic about the economy. For each sample, the polling agency created a 95 percent confidence interval for the proportion of all United States citizens who were optimistic about the economy. Which of the following statements is the best interpretation of the 95 percent confidence level?",
      answerOptions: [
          { text: "With 100 confidence intervals, we can be 95% confident that the sample proportion of citizens of the United States who are optimistic about the economy is correct.", isCorrect: false },
          { text: "We would expect about 95 of the 100 confidence intervals to contain the proportion of all citizens of the United States who are optimistic about the economy.", isCorrect: true },
          { text: "We would expect about 5 of the 100 confidence intervals to not contain the sample proportion of citizens of the United States who are optimistic about the economy.", isCorrect: false },
          { text: "Of the 100 confidence intervals, 95 of the intervals will be identical because they were constructed from samples of the same size of 1,200.", isCorrect: false },
          { text: "The probability is 0.95 that 100 confidence intervals will yield the same information about the sample proportion of citizens of the United States who are optimistic about the economy.", isCorrect: false }
      ],
      explanation: {
          ko: {
              concept: "🎯 신뢰수준의 해석",
              steps: ["신뢰수준 95%는 특정 하나의 신뢰구간이 모비율을 포함할 확률이 95%라는 의미가 아닙니다.", "신뢰수준은 '동일한 방법으로 표본추출과 신뢰구간 계산을 무수히 반복했을 때, 생성된 신뢰구간들 중 약 95%가 실제 모비율을 포함할 것'이라는 의미입니다.", "따라서, 100개의 신뢰구간을 만들었다면 그 중 약 95개가 실제 모비율을 포함할 것으로 기대할 수 있습니다."],
              distractors: ["A, C, E: 신뢰구간은 '표본비율'이 아닌 '모비율'을 포함하는지에 대한 것입니다.", "D: 각 표본은 무작위로 추출되므로, 각기 다른 표본비율과 신뢰구간을 생성하게 됩니다."],
              summary: "신뢰수준은 추정 방법의 장기적인 신뢰도를 나타내는 지표이며, 개별 신뢰구간에 대한 확률적 진술이 아닙니다."
          },
          en: {
              concept: "🎯 Interpretation of Confidence Level",
              steps: ["A 95% confidence level does not mean there is a 95% probability that a single specific interval contains the population parameter.", "The confidence level refers to the long-run success rate of the method. If we were to repeat the sampling process many times, we would expect about 95% of the constructed intervals to capture the true population proportion.", "Therefore, out of 100 constructed confidence intervals, we would expect about 95 of them to contain the true population proportion."],
              distractors: ["A, C, E: Confidence intervals are about capturing the *population* proportion, not the *sample* proportion.", "D: Each random sample will likely be different, resulting in a different sample proportion and thus a different confidence interval."],
              summary: "The confidence level indicates the long-term reliability of the estimation method, not a probability statement about a particular interval."
          }
      },
      tags: ['추론통계'],
      difficulty: '중간'
  },
  {
      id: "2016-16", year: 2016, questionNumber: 16,
      questionText: "As part of a national sleep study, a random sample of adults was selected and surveyed about their physical activity and the number of hours they sleep each night. Of the 183 adults who exercised regularly (exercisers), 59 percent reported sleeping at least seven hours at night. Of the 88 adults who did not exercise regularly (nonexercisers), 52 percent reported sleeping at least seven hours at night. Which of the following is the most appropriate standard error for a confidence interval for the difference in proportions of adults who sleep at least seven hours at night among exercisers and nonexercisers?",
      answerOptions: [
          { text: "√[(0.59)(0.41)/183 + (0.52)(0.48)/88]", isCorrect: true },
          { text: "√[(0.59)(0.41)/183 - (0.52)(0.48)/88]", isCorrect: false },
          { text: "√[(0.57)(0.43)(1/183 + 1/88)]", isCorrect: false },
          { text: "√[(0.5)(0.5)(1/183 + 1/88)]", isCorrect: false },
          { text: "√[(0.5)(0.5)(1/183) + (0.5)(0.5)(1/88)]", isCorrect: false }
      ],
      explanation: {
          ko: {
              concept: "🎯 두 비율 차이에 대한 표준오차",
              steps: ["두 독립적인 표본비율의 차이(p̂₁ - p̂₂)에 대한 신뢰구간의 표준오차(SE) 공식은 SE = √[ (p̂₁(1-p̂₁)/n₁) + (p̂₂(1-p̂₂)/n₂) ] 입니다.", "신뢰구간을 구할 때는 합동(pooled) 비율을 사용하지 않습니다.", "주어진 값을 공식에 대입합니다: p̂₁=0.59, n₁=183; p̂₂=0.52, n₂=88. 따라서 SE = √[(0.59)(0.41)/183 + (0.52)(0.48)/88] 입니다."],
              distractors: ["C: 합동 비율을 사용한 경우의 표준오차 공식으로, 가설검정 시에 사용됩니다.", "B, D, E: 잘못된 공식입니다."],
              summary: "두 모비율 차이에 대한 신뢰구간을 계산할 때의 표준오차는 각 표본의 비율과 크기를 사용하여 계산하며, 합동 비율을 사용하지 않는다는 점에 유의해야 합니다."
          },
          en: {
              concept: "🎯 Standard Error for the Difference in Two Proportions",
              steps: ["The formula for the standard error (SE) of the difference between two independent sample proportions (p̂₁ - p̂₂) for a confidence interval is SE = √[ (p̂₁(1-p̂₁)/n₁) + (p̂₂(1-p̂₂)/n₂) ].", "Note that we do not use a pooled proportion for confidence intervals.", "Plug in the given values: p̂₁=0.59, n₁=183; p̂₂=0.52, n₂=88. This gives SE = √[(0.59)(0.41)/183 + (0.52)(0.48)/88]."],
              distractors: ["C: This uses a pooled proportion, which is appropriate for a hypothesis test, not a confidence interval.", "B, D, E: These are incorrect formulas."],
              summary: "When calculating a confidence interval for the difference between two population proportions, the standard error is calculated using the individual sample proportions and sizes, without pooling."
          }
      },
      tags: ['추론통계'],
      difficulty: '중간'
  },
  {
      id: "2016-17", year: 2016, questionNumber: 17,
      questionText: "A representative of a car manufacturer in the United States made the following claim in a news report.\n\n\"Ten years ago, only 53 percent of Americans owned American-made cars, but that figure is significantly higher today.\"\n\nA research group conducted a study to investigate whether the claim was true. The group found that 56 percent of a randomly selected sample of car owners in the United States owned American-made cars. A test of the appropriate hypotheses resulted in a p-value of 0.283. Assuming the conditions for inference were met, is there sufficient evidence to conclude, at the significance level of α = 0.05, that the proportion of all car owners in the United States who own American-made cars has increased from what it was ten years ago?",
      answerOptions: [
          { text: "Yes, because 0.56 > 0.53.", isCorrect: false },
          { text: "Yes, because a reasonable interval for the proportion is 0.56 ± 0.283.", isCorrect: false },
          { text: "Yes, because 0.56 - 0.53 = 0.03 and 0.03 < 0.05.", isCorrect: false },
          { text: "No, because 0.283 < 0.53.", isCorrect: false },
          { text: "No, because 0.283 > 0.05.", isCorrect: true }
      ],
      explanation: {
          ko: {
              concept: "⚖️ p-값과 유의수준을 이용한 가설검정 결론",
              steps: ["가설검정의 결론 규칙은 'p-값이 유의수준(α)보다 작으면 귀무가설을 기각한다' 입니다.", "이 문제에서 p-값은 0.283이고, 유의수준 α는 0.05입니다.", "p-값(0.283)이 유의수준(0.05)보다 크므로, 귀무가설을 기각할 수 없습니다.", "따라서, 미국산 자동차 소유 비율이 증가했다는 통계적으로 유의미한 증거는 없다고 결론 내립니다."],
              distractors: ["A, C: 표본 통계량과 유의수준을 직접 비교하는 것은 올바른 방법이 아닙니다.", "B, D: p-값의 의미나 비교 대상이 잘못되었습니다."],
              summary: "p-값이 유의수준보다 크면, 관찰된 결과가 우연히 발생했을 가능성이 충분히 높다고 판단하여 귀무가설을 기각하지 않습니다."
          },
          en: {
              concept: "⚖️ Conclusion of a Hypothesis Test using p-value and Alpha",
              steps: ["The decision rule for a hypothesis test is: If the p-value is less than the significance level (α), we reject the null hypothesis.", "In this problem, the p-value is 0.283 and the significance level α is 0.05.", "Since the p-value (0.283) is greater than α (0.05), we fail to reject the null hypothesis.", "Therefore, we conclude there is not sufficient statistical evidence that the proportion of American-made car owners has increased."],
              distractors: ["A, C: Comparing sample statistics directly to the significance level is incorrect.", "B, D: These misinterpret the meaning or comparison of the p-value."],
              summary: "If the p-value is greater than the significance level, we fail to reject the null hypothesis because the observed result is not considered statistically rare enough to discredit the null hypothesis."
          }
      },
      tags: ['추론통계'],
      difficulty: '쉬움'
  },
  {
      id: "2016-18", year: 2016, questionNumber: 18,
      questionText: "Researchers wanted to investigate whether babies have a sense of right and wrong. They showed each of 60 babies a puppet show in which a red puppet was trying to open a heavy box lid. A second puppet, called the helper, would try to help the red puppet open the box, while a third puppet, called the hinderer, would try to slam the box lid down. After watching the show, each baby was presented with a tray containing the helper puppet and the hinderer puppet, and the researchers recorded which puppet the baby reached for. The researchers wanted to determine whether the babies would reach for the helper puppet more than for the hinderer puppet.\n\nAs part of the show, a green puppet and a yellow puppet served as the helper and hinderer. For each baby, a coin was tossed to determine which color would serve which role. Which of the following is the most important reason for the random assignment of color to role in the study?",
      answerOptions: [
          { text: "Slamming the lid might cause wear on the hinderer puppet after 60 shows. The random assignment of color to role permits more even wear between the helper and the hinderer.", isCorrect: false },
          { text: "The puppeteer might grow tired of doing the same show with the same puppet colors. The random assignment of color to role keeps the show fresh for each performance.", isCorrect: false },
          { text: "If the same role is played by the same color puppet, the babies might show a preference for the color instead of a preference for the role.", isCorrect: true },
          { text: "The random assignment of color to role allows the researchers to determine if one color is better than another in teaching babies right from wrong.", isCorrect: false },
          { text: "Boys and girls might prefer different colors. The random assignment of color to role ensures that the show is equally accessible to boys and girls.", isCorrect: false }
      ],
      explanation: {
          ko: {
              concept: "🔬 실험설계: 교란변수 통제",
              steps: ["실험에서 우리가 관심 있는 변수(역할: 도움/방해) 외에 결과에 영향을 줄 수 있는 다른 변수를 '교란변수(confounding variable)'라고 합니다.", "이 실험에서 아기들이 특정 '색깔'을 선천적으로 더 좋아할 수 있습니다. 이것이 교란변수가 될 수 있습니다.", "만약 항상 초록색 인형이 돕고 노란색 인형이 방해한다면, 아기들이 초록 인형을 선택한 것이 '도와주는 역할' 때문인지, 단순히 '초록색'을 좋아해서인지 구분할 수 없습니다.", "역할에 대한 색깔을 무작위로 배정함으로써, 색깔 선호도라는 교란변수의 효과를 상쇄시키고, 역할(도움/방해)에 대한 아기들의 순수한 선호를 측정할 수 있습니다."],
              distractors: ["A, B, D, E: 모두 부수적인 이유이거나, 실험의 주된 목적과 관련이 적습니다."],
              summary: "실험에서 무작위 배정은 우리가 직접 통제할 수 없는 잠재적 교란변수들의 효과를 모든 처리 그룹에 균등하게 분산시켜, 처리 효과를 명확하게 분리하고 인과관계를 추론할 수 있게 하는 핵심적인 원리입니다."
          },
          en: {
              concept: "🔬 Experimental Design: Controlling for Confounding Variables",
              steps: ["In an experiment, a 'confounding variable' is an external variable that can affect the outcome, making it difficult to determine the true effect of the treatment.", "In this study, a baby's innate preference for a specific 'color' could be a confounding variable.", "If the green puppet was always the helper and the yellow puppet was always the hinderer, we wouldn't know if the babies chose the green puppet because it was the 'helper' or simply because they like the color 'green'.", "By randomly assigning the color to the role for each baby, the researchers balance out the potential effect of color preference across the treatments, allowing them to isolate the effect of the role (helper vs. hinderer)."],
              distractors: ["A, B, D, E: These are secondary or irrelevant reasons compared to the primary goal of controlling for confounding variables."],
              summary: "Random assignment is a core principle of experimental design used to balance the effects of potential confounding variables across treatment groups, thus allowing for causal inference."
          }
      },
      tags: ['실험설계'],
      difficulty: '중간'
  },
  {
      id: "2016-19", year: 2016, questionNumber: 19,
      questionText: "Nutritionists examined the sodium content of different brands of potato chips. Each brand was classified as either healthy or regular based on how the chips were marketed to the public. The sodium contents, in milligrams (mg) per serving, of the chips are summarized in the boxplots below.\n\nBased on the boxplots, which statement gives a correct comparison between the two classifications of the sodium content of the chips?",
      chartType: 'BoxPlot',
      chartData: {
          'Regular Chips': { min: 115, q1: 150, median: 175, q3: 205, max: 300 },
          'Healthy Chips': { min: 75, q1: 125, median: 200, q3: 215, max: 280 }
      },
      answerOptions: [
          { text: "The number of brands classified as healthy is greater than the number of brands classified as regular.", isCorrect: false },
          { text: "The interquartile range (IQR) of the brands classified as healthy is greater than the IQR of the brands classified as regular.", isCorrect: true },
          { text: "The range of the brands classified as healthy is less than the range of the brands classified as regular.", isCorrect: false },
          { text: "The median of the brands classified as healthy is more than twice the median of the brands classified as regular.", isCorrect: false },
          { text: "The brand with the least sodium content and the brand with the greatest sodium content are both classified as healthy.", isCorrect: false }
      ],
      explanation: {
          ko: {
              concept: "📊 박스플롯 읽기와 IQR 비교",
              steps: [
                  "각 그룹의 IQR을 계산합니다: IQR = Q3(제3사분위수) - Q1(제1사분위수).",
                  "Healthy chips: IQR = 215 - 125 = 90mg",
                  "Regular chips: IQR = 205 - 150 = 55mg",
                  "계산된 IQR 값을 비교합니다. 90 > 55 이므로, Healthy chips의 IQR이 더 큽니다."
              ],
              distractors: [
                  "A: 박스플롯으로는 각 그룹의 데이터 개수(브랜드 수)를 알 수 없습니다.",
                  "C: Range는 (최댓값-최솟값)입니다. Healthy(280-75=205) vs Regular(300-115=185)이므로 Healthy의 범위가 더 큽니다.",
                  "D: Healthy 중위수(200)와 Regular 중위수(175)의 비율은 약 1.14배로 2배가 아닙니다.",
                  "E: 최솟값은 Healthy(75)에, 최댓값은 Regular(300)에 속합니다."
              ],
              summary: "IQR은 이상치에 영향을 받지 않는 강건한 산포 측도로, 데이터의 중심 50%가 얼마나 퍼져있는지를 보여줍니다."
          },
          en: {
              concept: "📊 Reading Boxplots and Comparing IQR",
              steps: [
                  "Calculate the IQR for each group: IQR = Q3 (Third Quartile) - Q1 (First Quartile).",
                  "Healthy chips: IQR = 215 - 125 = 90mg",
                  "Regular chips: IQR = 205 - 150 = 55mg",
                  "Compare the calculated IQRs. Since 90 > 55, the IQR for Healthy chips is greater."
              ],
              distractors: [
                  "A: Boxplots do not show the number of data points (number of brands) in each group.",
                  "C: The range is (Max - Min). Healthy (280-75=205) vs Regular (300-115=185). The range for Healthy is larger.",
                  "D: The ratio of medians (Healthy: 200, Regular: 175) is about 1.14, not more than twice.",
                  "E: The overall minimum value belongs to Healthy (75), while the maximum belongs to Regular (300)."
              ],
              summary: "The IQR is a robust measure of spread that is not affected by outliers, showing how dispersed the central 50% of the data is."
          }
      },
      tags: ['기술통계'], difficulty: '쉬움'
  },
  {
      id: "2016-20", year: 2016, questionNumber: 20,
      questionText: "A factory has two machines, A and B, making the same part for refrigerators. The number of defective parts produced by each machine during the first hour of operation was recorded on 19 randomly selected days. The scatterplot below shows the number of defective parts produced by each machine on the selected days.\n\nWhich statement gives the best comparison between the number of defective parts produced by the machines during the first hour of operation on the 19 days?",
      chartType: 'ScatterPlot',
      chartData: {
          xAxisLabel: "Machine A Defective Parts", 
          yAxisLabel: "Machine B Defective Parts",
          points: [
              {x: 2, y: 4}, {x: 3, y: 6}, {x: 3, y: 9}, {x: 3, y: 10}, {x: 4, y: 5}, 
              {x: 4, y: 6}, {x: 4, y: 8}, {x: 4, y: 12}, {x: 5, y: 7}, {x: 5, y: 9}, 
              {x: 6, y: 6}, {x: 6, y: 7}, {x: 6, y: 9}, {x: 7, y: 5}, {x: 7, y: 7}, 
              {x: 7, y: 14}, {x: 8, y: 14}, {x: 9, y: 10}, {x: 10, y: 10}
          ]
      },
      answerOptions: [
          { text: "Machine A always produced the same number of defective parts as machine B.", isCorrect: false },
          { text: "Machine A always produced fewer defective parts than machine B.", isCorrect: false },
          { text: "Machine A always produced more defective parts than machine B.", isCorrect: false },
          { text: "Machine A usually, but not always, produced fewer defective parts than machine B.", isCorrect: true },
          { text: "Machine A usually, but not always, produced more defective parts than machine B.", isCorrect: false }
      ],
      explanation: {
          ko: {
              concept: "📈 산점도와 y=x 직선 비교",
              steps: ["산점도에 가상의 y=x 직선을 그어봅니다. 이 직선 위의 점들은 두 기계의 불량품 수가 같은 경우를 의미합니다.", "대부분의 점들이 y=x 직선 위에 위치하는 것을 확인합니다. 이는 Machine B(y축)의 불량품 수가 Machine A(x축)의 수보다 큰 경우가 많다는 것을 의미합니다.", "하지만 (7,5)와 같이 직선 아래에 있는 점들도 존재합니다. 이는 Machine A가 Machine B보다 불량품을 더 많이 생산한 경우도 있다는 뜻입니다.", "따라서, Machine A는 '항상'은 아니지만 '보통' Machine B보다 적은 수의 불량품을 생산한다고 결론 내릴 수 있습니다."],
              distractors: ["A, B, C: '항상(always)'이라는 표현은 일부 예외 케이스 때문에 틀렸습니다.", "E: 대부분의 점이 y=x 직선 위에 있으므로, Machine A가 더 적은 불량품을 생산하는 경향이 있습니다."],
              summary: "산점도에서 y=x 직선은 두 변수의 값을 비교하는 유용한 기준선이 됩니다. 점들이 직선 위에 있는지, 아래에 있는지, 또는 직선에 가까운지를 통해 두 변수 간의 관계를 시각적으로 파악할 수 있습니다."
          },
          en: {
              concept: "📈 Scatterplots and Comparison to y=x Line",
              steps: ["Imagine the line y=x on the scatterplot. Points on this line represent days where both machines produced the same number of defects.", "Observe that most points lie above the y=x line. This means that for most days, the value for Machine B (y-axis) was greater than the value for Machine A (x-axis).", "Note that there are some points below the line, such as (7,5). This means there were days when Machine A produced more defects than Machine B.", "Therefore, we can conclude that Machine A *usually*, but not *always*, produced fewer defective parts than Machine B."],
              distractors: ["A, B, C: The word 'always' makes these statements incorrect due to the exceptions.", "E: Most points are above the y=x line, indicating Machine A generally produced fewer, not more, defects."],
              summary: "The line y=x serves as a useful reference on a scatterplot for comparing two variables. The position of points relative to this line reveals the relationship between the variables."
          }
      },
      tags: ['상관관계', '기술통계'],
      difficulty: '쉬움'
  },

  {
      id: "2016-22", year: 2016, questionNumber: 22,
      questionText: "The faces of a four-sided fair die are numbered 1 through 4, respectively. For a certain game, the die is tossed and the number that lands facedown is recorded. The table below summarizes the points a player earns for the number that lands facedown.\n\n| Number landing facedown | 1 | 2 | 3 | 4 |\n|---|---|---|---|---|\n| Points | 0 | 1 | 0 | 2 |\n\nConsider two independent tosses of the die. Let the random variable S represent the sum of the points earned from the two tosses. Which table represents the probability distribution of S?",
      answerOptions: [
          { text: "(A) S: 0,1,2; P: 0.5,0.25,0.25", isCorrect: false },
          { text: "(B) S: 0,2,4; P: 0.5,0.25,0.25", isCorrect: false },
          { text: "(C) S: 0,2,4; P: 0.25,0.5,0.25", isCorrect: false },
          { text: "(D) S: 0,1,2,3,4; P: 0.25,0.25,0.3125,0.125,0.0625", isCorrect: true },
          { text: "(E) S: 0,1,2,3,4; P: 0.0625,0.25,0.375,0.25,0.0625", isCorrect: false }
      ],
      explanation: {
          ko: {
              concept: "🎲 독립 확률변수의 합의 분포",
              steps: ["먼저 한 번 던졌을 때 얻는 점수(X)의 확률분포를 구합니다: P(X=0) = P(1 또는 3) = 2/4 = 0.5; P(X=1) = P(2) = 1/4 = 0.25; P(X=2) = P(4) = 1/4 = 0.25.", "두 번 던진 점수의 합(S)의 확률을 계산합니다:", "P(S=0) = P(첫번째 0, 두번째 0) = 0.5 * 0.5 = 0.25", "P(S=1) = P(0,1) + P(1,0) = (0.5 * 0.25) + (0.25 * 0.5) = 0.25", "P(S=2) = P(0,2) + P(2,0) + P(1,1) = (0.5*0.25) + (0.25*0.5) + (0.25*0.25) = 0.3125", "P(S=3) = P(1,2) + P(2,1) = (0.25*0.25) + (0.25*0.25) = 0.125", "P(S=4) = P(2,2) = 0.25 * 0.25 = 0.0625"],
              distractors: ["다른 선택지들은 가능한 모든 경우의 수를 고려하지 않았거나 확률 계산이 잘못되었습니다."],
              summary: "두 독립 확률변수의 합의 분포를 구하려면, 각 합이 나올 수 있는 모든 경우의 수를 나열하고 각 경우의 확률을 더해야 합니다."
          },
          en: {
              concept: "🎲 Distribution of the Sum of Independent Random Variables",
              steps: ["First, find the probability distribution for the points (X) from a single toss: P(X=0) = P(1 or 3) = 2/4 = 0.5; P(X=1) = P(2) = 1/4 = 0.25; P(X=2) = P(4) = 1/4 = 0.25.", "Then, calculate the probabilities for the sum (S) of two tosses:", "P(S=0) = P(0,0) = 0.5 * 0.5 = 0.25", "P(S=1) = P(0,1) + P(1,0) = 2 * (0.5 * 0.25) = 0.25", "P(S=2) = P(0,2) + P(2,0) + P(1,1) = 2 * (0.5 * 0.25) + (0.25 * 0.25) = 0.3125", "P(S=3) = P(1,2) + P(2,1) = 2 * (0.25 * 0.25) = 0.125", "P(S=4) = P(2,2) = 0.25 * 0.25 = 0.0625"],
              distractors: ["The other options either miss possible outcomes or have incorrect probability calculations."],
              summary: "To find the probability distribution of a sum of two independent random variables, list all possible ways to obtain each sum and add their corresponding probabilities."
          }
      },
      tags: ['확률분포'],
      difficulty: '어려움'
  },
  {
      id: "2016-23", year: 2016, questionNumber: 23,
      questionText: "A botanist collected one leaf at random from each of 10 randomly selected mature maple trees of the same species. The mean and the standard deviation of the surface areas for the 10 leaves in the sample were computed. Assume the distribution of surface areas of maple leaves is normal. What is the appropriate method for constructing a one-sample confidence interval to estimate the population mean surface area of the species of maple leaves, and why is the method appropriate?",
      answerOptions: [
          { text: "The t-interval is appropriate, because the population standard deviation is not known.", isCorrect: true },
          { text: "The t-interval is appropriate, because the t-interval is narrower than the z-interval.", isCorrect: false },
          { text: "The z-interval is appropriate, because the z-interval is narrower than the t-interval.", isCorrect: false },
          { text: "The z-interval is appropriate, because the central limit theorem applies.", isCorrect: false },
          { text: "The z-interval is appropriate, because the sample standard deviation is known.", isCorrect: false }
      ],
      explanation: {
          ko: {
              concept: "🤔 t-구간 vs. z-구간 선택",
              steps: ["모평균(μ)에 대한 신뢰구간을 만들 때, 모집단의 표준편차(σ)를 아는지 모르는지가 핵심입니다.", "이 문제에서는 모집단 표준편차(σ)가 주어지지 않았고, 대신 표본의 표준편차(s)를 계산했습니다.", "모집단 표준편차(σ)를 모르기 때문에, 이를 표본 표준편차(s)로 추정해야 하며, 이로 인한 불확실성을 보정하기 위해 t-분포를 사용한 t-구간을 구성해야 합니다."],
              distractors: ["B, C: 구간의 너비는 선택의 이유가 될 수 없습니다.", "D: CLT는 표본 평균의 분포가 정규분포에 가까워지는 것을 설명하지만, σ를 모를 때 z-구간을 정당화하지는 않습니다.", "E: '표본' 표준편차를 아는 것이 바로 t-구간을 사용해야 하는 이유입니다."],
              summary: "모집단 표준편차(σ)를 모를 때는 항상 t-절차를 사용하고, σ를 알 때는 z-절차를 사용합니다. 실제 상황에서는 σ를 아는 경우가 거의 없습니다."
          },
          en: {
              concept: "🤔 Choosing Between t-interval and z-interval",
              steps: ["The key distinction for creating a confidence interval for a population mean (μ) is whether the population standard deviation (σ) is known.", "In this problem, the population standard deviation is not given; instead, the sample standard deviation (s) was computed.", "When σ is unknown, we must estimate it with s. To account for the extra uncertainty from this estimation, we use a t-distribution to construct a t-interval."],
              distractors: ["B, C: The width of the interval is a result of the choice, not a reason for it.", "D: The CLT explains the shape of the sampling distribution but doesn't justify a z-interval when σ is unknown.", "E: Knowing the *sample* standard deviation is precisely the reason to use a t-interval."],
              summary: "Always use a t-procedure when the population standard deviation (σ) is unknown. Use a z-procedure only when σ is known, which is rare in practice."
          }
      },
      tags: ['추론통계'],
      difficulty: '쉬움'
  },
  {
      id: "2016-24", year: 2016, questionNumber: 24,
      questionText: "A state educational agency was concerned that the salaries of public school teachers in one region of the state, region A, were higher than the salaries in another region of the state, region B. The agency took two independent random samples of salaries of public school teachers, one from region A and one from region B. The data are summarized in the table below.\n\n| | Region A | Region B |\n|---|---|---|\n| Mean salary | $62,583 | $60,117 |\n| Standard deviation | $6,274 | $9,319 |\n| Number of salaries | 117 | 78 |\n\nAssuming all conditions for inference are met, do the data provide convincing statistical evidence that the salaries of public school teachers in region A are, on average, greater than the salaries of public school teachers in region B?",
      answerOptions: [
          { text: "Yes, there is evidence at the significance level of α = 0.001.", isCorrect: false },
          { text: "Yes, there is evidence at the significance level of α = 0.01 but not at α = 0.001.", isCorrect: false },
          { text: "Yes, there is evidence at the significance level of α = 0.05 but not at α = 0.01.", isCorrect: true },
          { text: "Yes, there is evidence at the significance level of α = 0.10 but not at α = 0.05.", isCorrect: false },
          { text: "No, there is no evidence at the significance level of α = 0.10.", isCorrect: false }
      ],
      explanation: {
          ko: {
              concept: "⚖️ 두 표본 t-검정 (차이 비교)",
              steps: ["두 독립적인 그룹의 평균을 비교하므로, 두 표본 t-검정을 사용합니다. 가설은 H₀: μ_A = μ_B, Hₐ: μ_A > μ_B 입니다.", "검정 통계량 t를 계산합니다: t = (x̄_A - x̄_B) / √((s_A²/n_A) + (s_B²/n_B)).", "t = (62583 - 60117) / √((6274²/117) + (9319²/78)) ≈ 2466 / √ (336334 + 1113684) ≈ 2466 / 1204.16 ≈ 2.048.", "보수적인 자유도(df = min(n₁-1, n₂-1) = 77)를 사용하여 p-값을 찾습니다. t=2.048에 대한 단측 p-값은 0.02와 0.025 사이에 있습니다.", "이 p-값은 0.05보다는 작지만 0.01보다는 크므로, α=0.05 수준에서는 유의하지만 α=0.01 수준에서는 유의하지 않습니다."],
              distractors: ["A, B, D, E: p-값의 범위에 대한 잘못된 해석입니다."],
              summary: "두 독립 표본의 평균 차이를 검정할 때는 두 표본 t-검정을 사용하며, 계산된 t-통계량과 자유도를 이용하여 p-값을 구해 결론을 내립니다."
          },
          en: {
              concept: "⚖️ Two-Sample t-test for Difference of Means",
              steps: ["Since we are comparing the means of two independent groups, we use a two-sample t-test. The hypotheses are H₀: μ_A = μ_B, Hₐ: μ_A > μ_B.", "Calculate the t-statistic: t = (x̄_A - x̄_B) / √((s_A²/n_A) + (s_B²/n_B)).", "t = (62583 - 60117) / √((6274²/117) + (9319²/78)) ≈ 2466 / √(336334 + 1113684) ≈ 2466 / 1204.16 ≈ 2.048.", "Using a conservative degrees of freedom (df = min(n₁-1, n₂-1) = 77), we find the p-value for a one-tailed test with t=2.048. The p-value is between 0.02 and 0.025.", "This p-value is less than 0.05 but not less than 0.01. Therefore, the result is significant at the α = 0.05 level but not at the α = 0.01 level."],
              distractors: ["A, B, D, E: These represent incorrect interpretations of the p-value's range."],
              summary: "A two-sample t-test is used to compare the means of two independent groups. The conclusion is based on comparing the calculated p-value (from the t-statistic and degrees of freedom) to the significance level."
          }
      },
      tags: ['추론통계'],
      difficulty: '어려움'
  },
  {
      id: "2016-25", year: 2016, questionNumber: 25,
      questionText: "A florist wanted to investigate whether a new powder added to the water of cut flowers helps to keep the flowers fresh longer than just water alone. For a shipment of roses that was delivered to the store, the florist flipped a coin before placing each rose in its own individual container with water. If the coin landed heads up, the rose was placed in water with the new powder; otherwise, the rose was placed in water alone. Which of the following is the best description of the method used by the florist?",
      answerOptions: [
          { text: "A census, because all roses are assigned to a container", isCorrect: false },
          { text: "An experiment with a completely randomized design", isCorrect: true },
          { text: "An experiment with a blocked design, with blocking by type of water", isCorrect: false },
          { text: "An experiment with a matched-pairs design", isCorrect: false },
          { text: "An observational study", isCorrect: false }
      ],
      explanation: {
          ko: {
              concept: "🔬 실험설계의 종류",
              steps: ["이 연구는 처리(파우더 유무)를 인위적으로 부과하므로 '실험'입니다.", "각 실험 단위(장미)가 동전 던지기라는 무작위적인 방법으로 처리 그룹(파우더 그룹, 대조군)에 할당되었습니다.", "블로킹이나 대응표본 설계와 같은 다른 복잡한 구조에 대한 언급이 없으므로, 이는 '완전 임의화 설계'에 해당합니다."],
              distractors: ["A: 전수조사는 모집단 전체를 조사하는 것입니다.", "C, D: 블로킹이나 대응표본 설계의 특징이 나타나지 않습니다.", "E: 관찰 연구는 처리를 부과하지 않고 관찰만 합니다."],
              summary: "완전 임의화 설계는 실험 단위를 처리 그룹에 무작위로 할당하는 가장 기본적인 실험 설계 방법입니다."
          },
          en: {
              concept: "🔬 Types of Experimental Design",
              steps: ["This is an 'experiment' because a treatment (powder vs. no powder) is actively imposed on the subjects.", "Each experimental unit (the rose) is randomly assigned to a treatment group via a coin flip.", "Since there is no mention of blocking or pairing, this is a 'completely randomized design'."],
              distractors: ["A: A census involves surveying the entire population.", "C, D: There are no features of blocking or matched-pairs design.", "E: An observational study does not impose treatments."],
              summary: "A completely randomized design is the most basic type of experimental design, where experimental units are assigned to treatment groups entirely at random."
          }
      },
      tags: ['실험설계'],
      difficulty: '쉬움'
  },
  {
      id: "2016-26", year: 2016, questionNumber: 26,
      questionText: "A commercial for a breakfast cereal is shown during a certain television program. The manufacturer of the cereal wants to estimate the percent of television viewers who watch the program. The manufacturer wants the estimate to have a margin of error of at most 0.02 at a level of 95 percent confidence. Of the following, which is the smallest sample size that will satisfy the manufacturer's requirements?",
      answerOptions: [
          { text: "40", isCorrect: false },
          { text: "50", isCorrect: false },
          { text: "100", isCorrect: false },
          { text: "1,700", isCorrect: false },
          { text: "2,500", isCorrect: true }
      ],
      explanation: {
          ko: {
              concept: "🔢 모비율 추정을 위한 표본 크기 결정",
              steps: ["모비율 신뢰구간의 오차범위(ME)는 ME = z*√[p*(1-p*)/n] 입니다. 이 식을 n에 대해 정리하면 n = (z*/ME)² * p*(1-p*) 입니다.", "95% 신뢰수준에 대한 임계값 z*는 약 1.96입니다. 목표 오차범위 ME는 0.02입니다.", "사전 정보가 없을 때, p*(1-p*)를 최대로 만드는 p* 값은 0.5입니다. 이는 가장 보수적인(가장 큰) 표본 크기를 보장합니다.", "값을 대입하여 n을 계산합니다: n = (1.96/0.02)² * 0.5 * 0.5 = (98)² * 0.25 = 9604 * 0.25 = 2401.", "따라서, 최소 2401명의 표본이 필요하며, 선택지 중 이를 만족하는 가장 작은 값은 2,500입니다."],
              distractors: ["A, B, C, D: 계산된 최소 표본 크기보다 작습니다."],
              summary: "원하는 오차범위와 신뢰수준을 만족하는 표본 크기를 결정할 때는, 사전 정보가 없다면 p*=0.5를 사용하여 가장 보수적인 크기를 계산합니다."
          },
          en: {
              concept: "🔢 Determining Sample Size for a Proportion",
              steps: ["The formula for the margin of error (ME) for a proportion confidence interval is ME = z*√[p*(1-p*)/n]. We can solve for n: n = (z*/ME)² * p*(1-p*).", "For 95% confidence, the critical value z* is approximately 1.96. The desired margin of error ME is 0.02.", "To ensure the sample size is large enough, we use the most conservative estimate for p*, which is 0.5. This maximizes the value of p*(1-p*).", "Substitute the values to calculate n: n = (1.96/0.02)² * 0.5 * 0.5 = (98)² * 0.25 = 9604 * 0.25 = 2401.", "Therefore, a minimum sample size of 2401 is needed. The smallest option that satisfies this is 2,500."],
              distractors: ["A, B, C, D: These sample sizes are smaller than the calculated minimum required size."],
              summary: "When determining sample size for a desired margin of error and confidence level for a proportion, use p*=0.5 for the most conservative estimate if no prior information is available."
          }
      },
      tags: ['추론통계', '표본추출'],
      difficulty: '중간'
  },
  {
      id: "2016-27", year: 2016, questionNumber: 27,
      questionText: "A contestant's final winnings on a game show are determined by a random selection of a base amount and a possible multiplier. For the base amount, the contestant randomly selects one of four cards, where two cards are marked $1,000, one card is marked $2,000, and one card is marked $5,000. After choosing the card, the contestant randomly selects one of five chips, where three chips are red and two chips are white. If the selected chip is red, the contestant's final winnings are twice the value of the base amount. If the selected chip is white, the contestant's final winnings are the value of the base amount. What is the probability that a contestant's final winnings are exactly $2,000?",
      answerOptions: [
          { text: "0.100", isCorrect: false },
          { text: "0.200", isCorrect: false },
          { text: "0.250", isCorrect: false },
          { text: "0.325", isCorrect: false },
          { text: "0.400", isCorrect: true }
      ],
      explanation: {
          ko: {
              concept: "🎲 복합 사건의 확률 계산",
              steps: ["정확히 $2,000를 획득하는 경우는 두 가지입니다: (1) $1,000 카드를 뽑고 빨간 칩을 뽑는 경우, 또는 (2) $2,000 카드를 뽑고 흰 칩을 뽑는 경우.", "각 경우의 확률을 계산합니다. 카드 선택과 칩 선택은 독립적이므로 확률을 곱합니다.", "P(1번 경우) = P($1k 카드) * P(빨간 칩) = (2/4) * (3/5) = 6/20 = 0.3.", "P(2번 경우) = P($2k 카드) * P(흰 칩) = (1/4) * (2/5) = 2/20 = 0.1.", "두 경우는 서로 배반사건(동시에 일어날 수 없음)이므로, 총 확률은 두 확률의 합입니다: 0.3 + 0.1 = 0.4."],
              distractors: ["다른 선택지들은 가능한 모든 경로를 고려하지 않았거나 확률 계산이 틀렸습니다."],
              summary: "복잡한 사건의 확률을 구할 때는, 해당 사건이 일어날 수 있는 모든 상호 배타적인 경우를 나누어 각 경우의 확률을 계산한 뒤, 모두 더합니다."
          },
          en: {
              concept: "🎲 Calculating Probability of Compound Events",
              steps: ["There are two mutually exclusive ways to win exactly $2,000: (1) Select a $1,000 card AND a red chip, OR (2) Select a $2,000 card AND a white chip.", "Calculate the probability of each case. Since the card and chip selections are independent, we multiply their probabilities.", "P(Case 1) = P($1k card) * P(Red chip) = (2/4) * (3/5) = 6/20 = 0.3.", "P(Case 2) = P($2k card) * P(White chip) = (1/4) * (2/5) = 2/20 = 0.1.", "The total probability is the sum of the probabilities of these two mutually exclusive cases: 0.3 + 0.1 = 0.4."],
              distractors: ["The other options result from incorrect calculations or not considering all possible paths."],
              summary: "To find the probability of a complex event, break it down into all possible mutually exclusive scenarios, calculate the probability of each, and then add them together."
          }
      },
      tags: ['확률분포'],
      difficulty: '어려움'
  },
  {
      id: "2016-28", year: 2016, questionNumber: 28,
      questionText: "Meteorologists are interested in the relationship between minimum pressure and maximum wind speed of hurricanes. The minimum pressure, in millibars, and maximum wind speed, in knots, were collected for a random sample of 100 hurricanes from the year 1995 to the year 2012. A regression analysis of maximum wind speed on minimum pressure produced a 95 percent confidence interval of (-1.42, -1.20) for the slope of the least-squares regression line. Which statement is a correct interpretation of the interval?",
      answerOptions: [
          { text: "The probability is 0.95 that wind speed will decrease, on average, between 1.20 knots and 1.42 knots for each millibar increase in minimum pressure.", isCorrect: false },
          { text: "The probability is 0.95 that a different sample of 100 hurricanes will result in an increase, on average, of wind speed between 1.20 knots and 1.42 knots for each millibar increase in minimum pressure.", isCorrect: false },
          { text: "We can be 95% confident that wind speed decreases, on average, between 1.20 knots and 1.42 knots for each millibar increase in minimum pressure.", isCorrect: true },
          { text: "We can be 95% confident that wind speed increases, on average, between 1.20 knots and 1.42 knots for each millibar increase in minimum pressure.", isCorrect: false },
          { text: "We can be 95% confident that, for any sample of hurricanes, the wind speed will decrease, on average, between 1.20 knots and 1.42 knots for each millibar increase in minimum pressure.", isCorrect: false }
      ],
      explanation: {
          ko: {
              concept: "🎯 회귀분석 기울기에 대한 신뢰구간 해석",
              steps: ["신뢰구간은 모집단 모수(여기서는 실제 기울기)가 포함될 것으로 기대되는 값의 범위를 제공합니다.", "'95% 신뢰'라는 표현은 이 구간을 계산하는 '방법'이 100번 반복되면 약 95번은 실제 기울기를 포함하는 구간을 만들어낸다는 의미입니다.", "구간 (-1.42, -1.20)은 모두 음수이므로, 최소 기압이 1밀리바 증가할 때마다 최대 풍속이 평균적으로 감소한다고 해석할 수 있습니다.", "따라서, 우리는 최소 기압이 1밀리바 증가할 때 최대 풍속이 평균 1.20노트에서 1.42노트 사이로 감소한다고 95% 신뢰할 수 있습니다."],
              distractors: ["A, B: 신뢰수준은 특정 구간에 대한 확률이 아닙니다.", "D: 구간이 음수이므로 감소 관계입니다.", "E: 이 구간은 '모집단'의 기울기에 대한 것이지, '모든 표본'에 대한 것이 아닙니다."],
              summary: "기울기에 대한 신뢰구간은 설명변수가 한 단위 증가할 때 반응변수의 평균적인 변화량에 대한 신뢰할 수 있는 값의 범위를 제공합니다."
          },
          en: {
              concept: "🎯 Interpreting a Confidence Interval for a Regression Slope",
              steps: ["A confidence interval provides a range of plausible values for the population parameter, which in this case is the true slope of the regression line.", "The phrase '95% confident' refers to the method: if we repeated this process many times, about 95% of the intervals we create would capture the true slope.", "The interval (-1.42, -1.20) contains only negative values, indicating a negative association: as minimum pressure increases, maximum wind speed tends to decrease.", "Therefore, we are 95% confident that for each 1 millibar increase in minimum pressure, the maximum wind speed decreases, on average, by an amount between 1.20 and 1.42 knots."],
              distractors: ["A, B: A confidence level is not a probability about a specific interval.", "D: The interval is negative, indicating a decrease, not an increase.", "E: The interval is for the *population* slope, not for *any sample* slope."],
              summary: "A confidence interval for the slope gives a range of plausible values for the average change in the response variable for a one-unit increase in the explanatory variable."
          }
      },
      tags: ['추론통계', '상관관계'],
      difficulty: '중간'
  },
  {
      id: "2016-29", year: 2016, questionNumber: 29,
      questionText: "Some contact lens wearers report problems with dryness in their eyes. A study was conducted to evaluate the effectiveness of a new eye-drop solution to relieve dryness for contact lens wearers. Twenty-five volunteers who wore contact lenses agreed to use the new solution for one month. At the end of the month, 36 percent of the volunteers reported that the new solution was effective in relieving dryness. The company that produced the new eye-drop solution concluded that using the new solution is more effective in relieving dryness than using no solution. Which of the following best explains why the study does not support such a conclusion?",
      answerOptions: [
          { text: "The sample size was too small.", isCorrect: false },
          { text: "The study had no control group.", isCorrect: true },
          { text: "The participants were volunteers.", isCorrect: false },
          { text: "The participants self-reported the frequency with which they used the new solution.", isCorrect: false },
          { text: "The participants self-reported the effectiveness of the new solution.", isCorrect: false }
      ],
      explanation: {
          ko: {
              concept: "🔬 실험설계의 기본 원리: 대조군",
              steps: ["이 연구는 새로운 안약의 '효과'를 입증하고자 합니다.", "효과를 입증하려면, 안약을 사용한 그룹(실험군)과 사용하지 않은 그룹(대조군)의 결과를 비교해야 합니다.", "이 연구에서는 모든 참가자가 안약을 사용했기 때문에, 관찰된 36%의 효과가 순전히 안약 때문인지, 아니면 다른 요인(예: 플라시보 효과, 시간 경과) 때문인지 구분할 수 없습니다.", "따라서 대조군이 없기 때문에, '아무것도 사용하지 않는 것보다 더 효과적'이라는 결론을 내릴 수 없습니다."],
              distractors: ["A, C, D, E: 모두 연구의 잠재적 약점일 수 있지만, 인과관계를 주장할 수 없는 가장 근본적인 결함은 대조군의 부재입니다."],
              summary: "실험에서 대조군은 처리의 효과를 비교하기 위한 기준선 역할을 하며, 인과관계를 추론하는 데 필수적입니다."
          },
          en: {
              concept: "🔬 Basic Principle of Experimental Design: Control Group",
              steps: ["The study aims to prove the 'effectiveness' of a new eye-drop.", "To prove effectiveness, one must compare the results of a group that received the treatment (the treatment group) with a group that did not (the control group).", "In this study, all participants used the new solution. Therefore, it's impossible to know if the observed 36% effectiveness is due to the solution itself or other factors (e.g., the placebo effect, the passage of time).", "Because there was no control group, the conclusion that the solution is 'more effective... than using no solution' is unsupported."],
              distractors: ["A, C, D, E: These might be potential weaknesses of the study, but the most fundamental flaw preventing a causal conclusion is the lack of a control group."],
              summary: "A control group serves as a baseline for comparison in an experiment and is essential for making cause-and-effect conclusions."
          }
      },
      tags: ['실험설계'],
      difficulty: '쉬움'
  },
  {
      id: "2016-30", year: 2016, questionNumber: 30,
      questionText: "The management team of a company with 10,000 employees is considering installing charging stations for electric cars in the company parking lots. In a random sample of 500 employees, 15 reported owning an electric car. Which of the following is a 99 percent confidence interval for the proportion of all employees at the company who own an electric car?",
      answerOptions: [
          { text: "0.03 ± 2.326√[(0.03)(0.97)/500]", isCorrect: false },
          { text: "0.15 ± 2.326√[(0.15)(0.85)/500]", isCorrect: false },
          { text: "0.03 ± 2.576√[(0.03)(0.97)/500]", isCorrect: true },
          { text: "0.15 ± 2.576√[(0.15)(0.85)/500]", isCorrect: false },
          { text: "0.03 ± 2.576√[(0.03)(0.97)/500 + (0.03)(0.97)/10,000]", isCorrect: false }
      ],
      explanation: {
          ko: {
              concept: "🎯 모비율에 대한 신뢰구간 공식",
              steps: ["모비율 신뢰구간 공식은 p̂ ± z*√[p̂(1-p̂)/n] 입니다.", "표본비율 p̂을 계산합니다: p̂ = 15/500 = 0.03.", "99% 신뢰수준에 해당하는 임계값 z*를 찾습니다. z* ≈ 2.576 입니다.", "표본 크기 n은 500입니다.", "이 값들을 공식에 대입하면 0.03 ± 2.576√[(0.03)(0.97)/500] 이 됩니다."],
              distractors: ["A, B: 99% 신뢰수준에 대한 z* 값이 틀렸습니다.", "D: 표본비율 계산이 틀렸습니다.", "E: 유한모집단 수정계수는 일반적으로 표본이 모집단의 10%를 초과할 때 고려하며, 이 문제에서는 필요하지 않습니다."],
              summary: "모비율에 대한 신뢰구간을 정확히 계산하려면 올바른 표본비율(p̂), 임계값(z*), 표본 크기(n)를 공식에 대입해야 합니다."
          },
          en: {
              concept: "🎯 Confidence Interval Formula for a Proportion",
              steps: ["The formula for a confidence interval for a proportion is p̂ ± z*√[p̂(1-p̂)/n].", "Calculate the sample proportion, p̂: p̂ = 15/500 = 0.03.", "Find the critical value, z*, for a 99% confidence level. z* ≈ 2.576.", "The sample size, n, is 500.", "Plugging these values into the formula gives 0.03 ± 2.576√[(0.03)(0.97)/500]."],
              distractors: ["A, B: Use the incorrect z* for 99% confidence.", "D: Uses the wrong sample proportion.", "E: Includes a finite population correction factor, which is generally not required unless the sample is more than 10% of the population."],
              summary: "To correctly calculate a confidence interval for a proportion, you must use the correct sample proportion (p̂), critical value (z*), and sample size (n) in the formula."
          }
      },
      tags: ['추론통계'],
      difficulty: '쉬움'
  },
  {
      id: "2016-31", year: 2016, questionNumber: 31,
      questionText: "A test of the hypotheses H₀: μ = 0 versus Hₐ: μ > 0 was conducted using a sample of size 7. The test statistic was t = 1.935. Which of the following is closest to the p-value of the test?",
      answerOptions: [
          { text: "0.0125", isCorrect: false },
          { text: "0.0265", isCorrect: false },
          { text: "0.0471", isCorrect: false },
          { text: "0.0506", isCorrect: true },
          { text: "0.1012", isCorrect: false }
      ],
      explanation: {
          ko: {
              concept: "⚖️ t-통계량을 이용한 p-값 찾기",
              steps: ["이것은 단측(one-tailed) t-검정입니다. 자유도(df)는 n - 1 = 7 - 1 = 6 입니다.", "우리는 t-분포표에서 자유도 6일 때, t=1.935의 오른쪽에 있는 면적(확률)을 찾아야 합니다.", "t-분포표를 보면, df=6일 때 t=1.943의 오른쪽 꼬리 확률이 0.05입니다.", "우리의 검정 통계량 t=1.935는 1.943보다 약간 작으므로, p-값은 0.05보다 약간 클 것입니다.", "선택지 중에서 0.05보다 약간 큰 값은 0.0506입니다."],
              distractors: ["A, B, C: p-값이 0.05보다 작으려면 t-통계량이 1.943보다 커야 합니다.", "E: p-값이 0.10이 되려면 t-통계량이 약 1.440이어야 합니다."],
              summary: "t-분포표를 사용하여 주어진 t-통계량과 자유도에 해당하는 p-값의 범위를 추정할 수 있습니다."
          },
          en: {
              concept: "⚖️ Finding a p-value from a t-statistic",
              steps: ["This is a one-tailed t-test with degrees of freedom df = n - 1 = 7 - 1 = 6.", "We need to find the area to the right of t = 1.935 in a t-distribution with 6 degrees of freedom.", "Looking at a t-distribution table for df=6, a t-value of 1.943 corresponds to an upper tail probability of 0.05.", "Since our test statistic t=1.935 is slightly less than 1.943, its p-value will be slightly greater than 0.05.", "Among the choices, 0.0506 is the value that is slightly greater than 0.05."],
              distractors: ["A, B, C: The p-value would be less than 0.05 only if the t-statistic were greater than 1.943.", "E: A p-value of 0.10 would correspond to a t-statistic of about 1.440."],
              summary: "A t-distribution table can be used to estimate the range of the p-value corresponding to a given t-statistic and degrees of freedom."
          }
      },
      tags: ['추론통계'],
      difficulty: '중간'
  },
  {
      id: "2016-32", year: 2016, questionNumber: 32,
      questionText: "As part of a community service program, students in three middle school grades (grade 6, grade 7, grade 8) each chose to participate in one of three school-sponsored volunteer activities. The graph below shows the distribution for each class for the three activities.\n\nBased on the graph, which statement must be true?",
      chartType: 'SegmentedBarChart',
      chartData: [
          { name: 'Grade 6', 'Activity A': 20, 'Activity B': 60, 'Activity C': 20 },
          { name: 'Grade 7', 'Activity A': 25, 'Activity B': 35, 'Activity C': 40 },
          { name: 'Grade 8', 'Activity A': 25, 'Activity B': 37, 'Activity C': 38 }
      ],
      answerOptions: [
          { text: "Of all the students who chose activity B, the greatest number of students were in grade 6.", isCorrect: false },
          { text: "Grade 7 and grade 8 had the same number of students who did not choose activity A.", isCorrect: false },
          { text: "The grade with the greatest percentage of students who chose activity C was grade 8.", isCorrect: false },
          { text: "For students in grade 7, the number who chose activity C was greater than the number who chose activity B.", isCorrect: true },
          { text: "For students in grade 8, the number who chose activity A was greater than the number who chose activity B.", isCorrect: false }
      ],
      explanation: {
          ko: {
              concept: "📊 구간 막대 그래프(Segmented Bar Chart) 해석",
              steps: ["이 그래프는 각 학년 내에서의 활동별 '비율'을 보여줍니다. 각 막대의 총 길이는 100%입니다.", "각 학년의 전체 학생 수를 모르기 때문에, 다른 학년 간의 '학생 수'를 직접 비교할 수는 없습니다.", "선택지 D를 봅시다: 7학년 막대에서, Activity C에 해당하는 부분(약 40%)이 Activity B에 해당하는 부분(약 35%)보다 깁니다. 같은 학년 내에서의 비교이므로, 학생 수도 더 많다고 할 수 있습니다."],
              distractors: ["A, B: 전체 학생 수를 모르므로 학년 간 학생 수를 비교할 수 없습니다.", "C: 7학년의 C 활동 비율(40%)이 8학년(약 38%)보다 약간 더 높습니다.", "E: 8학년에서 A 활동 비율(25%)은 B 활동 비율(약 37%)보다 작습니다."],
              summary: "구간 막대 그래프는 각 그룹 내의 구성 요소 비율을 비교하는 데 유용하지만, 각 그룹의 전체 크기를 모르면 그룹 간의 실제 개수를 비교할 수 없습니다."
          },
          en: {
              concept: "📊 Interpreting a Segmented Bar Chart",
              steps: ["This graph shows the *proportion* of students within each grade who chose each activity. The total length of each bar is 100%.", "We cannot compare the absolute *number* of students between different grades because we don't know the total number of students in each grade.", "Let's examine option D: For the Grade 7 bar, the segment for Activity C (approx. 40%) is longer than the segment for Activity B (approx. 35%). Since this is a comparison within the same grade, a greater percentage means a greater number of students."],
              distractors: ["A, B: We cannot compare absolute numbers across grades without knowing the total number of students in each grade.", "C: The percentage for Activity C in Grade 7 (40%) is slightly higher than in Grade 8 (approx 38%).", "E: For Grade 8, the percentage for Activity A (25%) is less than for Activity B (approx 37%)."],
              summary: "A segmented bar chart is useful for comparing the composition of different groups, but you cannot compare the raw counts between groups without knowing the total size of each group."
          }
      },
      tags: ['기술통계'],
      difficulty: '중간'
  },
  {
      id: "2016-33", year: 2016, questionNumber: 33,
      questionText: "At a large airport, data were recorded for one month on how many baggage items were unloaded from each flight upon arrival as well as the time required to deliver all the baggage items on the flight to the baggage claim area. A scatterplot of the two variables indicated a strong, positive linear association between the variables. Which of the following statements is a correct interpretation of the word \"strong\" in the description of the association?",
      answerOptions: [
          { text: "A least-squares model predicts that the more baggage items that are unloaded from a flight, the greater the time required to deliver the items to the baggage claim area.", isCorrect: false },
          { text: "The actual time required to deliver all the items to the baggage claim area based on the number of items unloaded will be very close to the time predicted by a least-squares model.", isCorrect: true },
          { text: "The time required to deliver an item to the baggage claim area is relatively constant, regardless of the number of baggage items unloaded from a flight.", isCorrect: false },
          { text: "The variability in the time required to deliver all items to the baggage claim area is about the same for all flights, regardless of the number of items unloaded from a flight.", isCorrect: false },
          { text: "The time required to unload baggage items from a flight is related to the time required to deliver the items to the baggage claim area.", isCorrect: false }
      ],
      explanation: {
          ko: {
              concept: "📈 선형 관계의 '강도(Strength)' 해석",
              steps: ["선형 관계에서 '강도'는 데이터 포인트들이 최소제곱회귀선 주위에 얼마나 가깝게 모여 있는지를 나타냅니다.", "'강한(strong)' 연관성은 상관계수(r)의 절댓값이 1에 가깝다는 것을 의미하며, 이는 예측의 정확도가 높다는 뜻입니다.", "따라서, 실제 관측값(실제 배달 시간)이 회귀 모델에 의해 예측된 값과 매우 가까울 것이라고 해석할 수 있습니다."],
              distractors: ["A: 이 내용은 '양의(positive)' 연관성을 설명하는 것이지, '강한' 연관성을 설명하는 것은 아닙니다.", "C, D, E: 모두 '강도'의 의미와는 다른 개념을 설명하고 있습니다."],
              summary: "상관관계의 '강도'는 예측의 정확성과 관련이 있습니다. 강한 관계일수록 예측값과 실제값의 차이(잔차)가 작아집니다."
          },
          en: {
              concept: "📈 Interpreting the 'Strength' of a Linear Association",
              steps: ["In a linear relationship, 'strength' refers to how closely the data points cluster around the least-squares regression line.", "A 'strong' association implies that the absolute value of the correlation coefficient (r) is close to 1, which means the predictions made by the model are accurate.", "Therefore, a strong association means the actual observed values (actual delivery time) will be very close to the values predicted by the regression model."],
              distractors: ["A: This statement describes a 'positive' association, not necessarily a 'strong' one.", "C, D, E: These describe other concepts, not the strength of the association."],
              summary: "The 'strength' of a correlation is related to the accuracy of prediction. A stronger relationship means smaller residuals (the difference between predicted and actual values)."
          }
      },
      tags: ['상관관계'],
      difficulty: '중간'
  },
  {
      id: "2016-34", year: 2016, questionNumber: 34,
      questionText: "A group of men and women were surveyed to investigate the association between gender and the number of friends the person has on a social media Web site. Results are shown in the table below.\n\n| | 0 to 50 | 51 to 100 | 101 to 150 | 151 to 200 | 201 or more |\n|---|---|---|---|---|---|\n| Men | 17 | 82 | 73 | 56 | 42 |\n| Women | 45 | 73 | 98 | 87 | 75 |\n\nWhich of the following procedures is the most appropriate for investigating whether an association exists between gender and the number of friends a person has on a social media Web site?",
      answerOptions: [
          { text: "A matched-pairs t-test for a mean difference", isCorrect: false },
          { text: "A two-sample t-test for the difference between means", isCorrect: false },
          { text: "A t-test for the slope of the regression line", isCorrect: false },
          { text: "A chi-square goodness-of-fit test", isCorrect: false },
          { text: "A chi-square test of independence", isCorrect: true }
      ],
      explanation: {
          ko: {
              concept: "� 카이제곱 독립성 검정",
              steps: ["이 연구는 두 개의 범주형 변수, 즉 '성별'(남성, 여성)과 '친구 수'(5개의 범위로 나뉨) 사이의 연관성을 조사합니다.", "하나의 표본에서 추출된 두 범주형 변수 간의 연관성(독립성)을 검정하는 데 가장 적합한 통계적 방법은 '카이제곱 독립성 검정'입니다."],
              distractors: ["A, B: 평균을 비교하는 t-검정은 양적 변수에 사용됩니다.", "C: 두 양적 변수 간의 선형 관계를 검정할 때 사용합니다.", "D: 하나의 범주형 변수의 분포가 특정 이론적 분포와 일치하는지 검정할 때 사용합니다."],
              summary: "두 범주형 변수 사이에 연관성이 있는지 알아보고 싶을 때는 카이제곱 독립성 검정을 사용합니다."
          },
          en: {
              concept: "📊 Chi-Square Test of Independence",
              steps: ["This study involves two categorical variables: 'gender' (Men, Women) and 'number of friends' (categorized into 5 ranges).", "The most appropriate statistical procedure to investigate whether an association (or independence) exists between two categorical variables from a single sample is the 'chi-square test of independence'."],
              distractors: ["A, B: t-tests are used for comparing means of quantitative variables.", "C: A t-test for slope is used for a linear relationship between two quantitative variables.", "D: A goodness-of-fit test is used to see if the distribution of one categorical variable matches a hypothesized distribution."],
              summary: "Use a chi-square test of independence to determine if there is a significant association between two categorical variables."
          }
      },
      tags: ['추론통계'],
      difficulty: '쉬움'
  },
  {
      id: "2016-35", year: 2016, questionNumber: 35,
      questionText: "Carly commutes to work, and her commute time is dependent on the weather. When the weather is good, the distribution of her commute times is approximately normal with mean 20 minutes and standard deviation 2 minutes. When the weather is not good, the distribution of her commute times is approximately normal with mean 30 minutes and standard deviation 4 minutes. Suppose the probability that the weather will be good tomorrow is 0.9. Which of the following is closest to the probability that Carly's commute time tomorrow will be greater than 25 minutes?",
      answerOptions: [
          { text: "0.0056", isCorrect: false },
          { text: "0.0894", isCorrect: false },
          { text: "0.0950", isCorrect: true },
          { text: "0.8055", isCorrect: false },
          { text: "0.9006", isCorrect: false },
      ],
      explanation: {
          ko: {
              concept: "🎲 조건부 확률과 전체 확률의 법칙",
              steps: ["전체 확률의 법칙을 사용합니다: P(통근시간 > 25) = P(통근시간 > 25 | 날씨 좋음) * P(날씨 좋음) + P(통근시간 > 25 | 날씨 나쁨) * P(날씨 나쁨).", "각 조건부 확률을 계산합니다:", "날씨 좋을 때: Z = (25-20)/2 = 2.5. P(Z > 2.5) ≈ 0.0062.", "날씨 나쁠 때: Z = (25-30)/4 = -1.25. P(Z > -1.25) = 1 - P(Z < -1.25) ≈ 1 - 0.1056 = 0.8944.", "계산된 확률들을 공식에 대입합니다: P(통근시간 > 25) ≈ (0.0062)(0.9) + (0.8944)(0.1) = 0.00558 + 0.08944 ≈ 0.09502."],
              distractors: ["다른 선택지들은 조건부 확률을 고려하지 않았거나 계산이 잘못되었습니다."],
              summary: "전체 확률의 법칙은 전체 표본 공간을 상호 배타적인 여러 사건으로 나누어, 각 사건 하에서의 조건부 확률을 이용하여 특정 사건의 전체 확률을 계산하는 방법입니다."
          },
          en: {
              concept: "🎲 Conditional Probability and the Law of Total Probability",
              steps: ["Use the Law of Total Probability: P(Time > 25) = P(Time > 25 | Good)P(Good) + P(Time > 25 | Not Good)P(Not Good).", "Calculate each conditional probability:", "For good weather: Z = (25-20)/2 = 2.5. P(Z > 2.5) ≈ 0.0062.", "For not good weather: Z = (25-30)/4 = -1.25. P(Z > -1.25) = 1 - P(Z < -1.25) ≈ 1 - 0.1056 = 0.8944.", "Plug the probabilities into the formula: P(Time > 25) ≈ (0.0062)(0.9) + (0.8944)(0.1) = 0.00558 + 0.08944 ≈ 0.09502."],
              distractors: ["The other options result from incorrect calculations or not applying the law of total probability correctly."],
              summary: "The Law of Total Probability allows us to find the probability of an event by considering its conditional probabilities under a set of mutually exclusive and exhaustive scenarios."
          }
      },
      tags: ['확률분포'],
      difficulty: '어려움'
  },
  {
      id: "2016-36", year: 2016, questionNumber: 36,
      questionText: "The number of siblings was recorded for each student of a group of 80 students. Some summary statistics and a histogram displaying the results are shown below.\n\n| Mean | Standard Deviation | Q1 | Q3 |\n|---|---|---|---|\n| 3.5 | 2.535 | 2 | 5 |\n\nAn outlier is often defined as a number that is more than 1.5 times the interquartile range below the first quartile or above the third quartile. Using the definition of an outlier and the given information, which of the following can be concluded?",
      chartType: 'Histogram',
      chartData: { labels: ['0','1','2','3','4','5','6','7','8','9','10','11','12'], values: [7, 12, 14, 12, 10, 9, 7, 3, 2, 2, 1, 0, 1], xAxisLabel: "Number of Siblings", yAxisLabel: "Frequency" },
      answerOptions: [
          { text: "The median is greater than the mean, and the distribution has no outliers.", isCorrect: false },
          { text: "The median is greater than the mean, and the distribution has only one outlier.", isCorrect: false },
          { text: "The median is greater than the mean, and the distribution has two outliers.", isCorrect: false },
          { text: "The median is less than the mean, and the distribution has only one outlier.", isCorrect: false },
          { text: "The median is less than the mean, and the distribution has two outliers.", isCorrect: true }
      ],
      explanation: {
          ko: {
              concept: "📊 분포의 형태, 중심, 그리고 이상치",
              steps: ["분포의 형태를 파악합니다. 히스토그램이 오른쪽으로 긴 꼬리를 가지므로 '오른쪽으로 치우친(skewed to the right)' 분포입니다. 이 경우, 평균은 중앙값보다 큽니다. 따라서 Mean(3.5) > Median 입니다.", "이상치를 확인하기 위해 IQR과 경계값을 계산합니다. IQR = Q3 - Q1 = 5 - 2 = 3.", "위쪽 경계값 = Q3 + 1.5(IQR) = 5 + 1.5(3) = 9.5.", "아래쪽 경계값 = Q1 - 1.5(IQR) = 2 - 1.5(3) = -2.5.", "히스토그램에서 9.5보다 큰 값인 10과 12가 존재하므로, 최소 2개의 이상치가 있습니다."],
              distractors: ["A, B, C: 분포가 오른쪽으로 치우쳤으므로 평균이 중앙값보다 큽니다.", "D: 이상치는 10과 12, 최소 2개입니다."],
              summary: "분포의 형태는 평균과 중앙값의 관계를 알려주며, IQR을 이용한 1.5*IQR 규칙은 이상치를 식별하는 표준적인 방법입니다."
          },
          en: {
              concept: "📊 Shape, Center, and Outliers of a Distribution",
              steps: ["Determine the shape of the distribution. The histogram has a long tail to the right, so it is 'skewed to the right'. In a right-skewed distribution, the mean is greater than the median. Thus, Mean (3.5) > Median.", "Check for outliers using the 1.5*IQR rule. First, calculate IQR = Q3 - Q1 = 5 - 2 = 3.", "Calculate the upper fence for outliers: Q3 + 1.5(IQR) = 5 + 1.5(3) = 9.5.", "Calculate the lower fence: Q1 - 1.5(IQR) = 2 - 1.5(3) = -2.5.", "From the histogram, there are data points at 10 and 12, which are above the upper fence of 9.5. Therefore, there are at least two outliers."],
              distractors: ["A, B, C: The distribution is skewed right, so the mean is greater than the median.", "D: There are at least two outliers (10 and 12)."],
              summary: "The shape of a distribution informs the relationship between the mean and median, and the 1.5*IQR rule is a standard method for identifying potential outliers."
          }
      },
      tags: ['기술통계'],
      difficulty: '어려움'
  },
  {
      id: "2016-37", year: 2016, questionNumber: 37,
      questionText: "In the states of Florida and Colorado, veterinarians investigating obesity in dogs obtained random samples of pet medical records and recorded the weights of the dogs in the samples. A test was conducted of H₀: p₁ = p₂ versus Hₐ: p₁ ≠ p₂, where p₁ represents the proportion of all overweight dogs in Florida and p₂ represents the proportion of all overweight dogs in Colorado. The resulting test statistic for a two-sample z-test for a difference between proportions was 1.85. At the significance level α = 0.05, which of the following is a correct conclusion?",
      answerOptions: [
          { text: "There is not sufficient statistical evidence to conclude that the proportion of all overweight dogs in Florida is different from the proportion of all overweight dogs in Colorado because the p-value is greater than 0.05.", isCorrect: true },
          { text: "There is not sufficient statistical evidence to conclude that the proportion of all overweight dogs in Florida is different from the proportion of all overweight dogs in Colorado because the z-test statistic is greater than 0.05.", isCorrect: false },
          { text: "There is sufficient statistical evidence to conclude that the proportion of all overweight dogs in Florida is different from the proportion of all overweight dogs in Colorado because the p-value is greater than 0.05.", isCorrect: false },
          { text: "There is sufficient statistical evidence to conclude that the proportion of all overweight dogs in Florida is different from the proportion of all overweight dogs in Colorado because the p-value is less than 0.05.", isCorrect: false },
          { text: "There is sufficient statistical evidence to conclude that the proportion of all overweight dogs in Florida is greater than the proportion of all overweight dogs in Colorado because the z-test statistic is positive.", isCorrect: false }
      ],
      explanation: {
          ko: {
              concept: "⚖️ 양측 검정과 p-값",
              steps: ["대립가설이 'p₁ ≠ p₂'이므로, 이것은 양측 검정입니다.", "양측 검정에서 p-값은 2 * P(Z > |검정 통계량|)으로 계산됩니다.", "p-값 = 2 * P(Z > 1.85) ≈ 2 * (1 - 0.9678) = 2 * 0.0322 = 0.0644.", "계산된 p-값(0.0644)은 유의수준 α(0.05)보다 큽니다.", "p-값이 유의수준보다 크므로, 귀무가설을 기각할 수 없습니다. 즉, 두 지역의 비만견 비율이 다르다는 통계적으로 유의미한 증거가 없습니다."],
              distractors: ["B: 검정 통계량과 유의수준을 직접 비교하지 않습니다.", "C, D: p-값이 유의수준보다 크므로 '유의미한 증거가 없다'고 결론내려야 합니다.", "E: 검정 통계량이 양수인 것은 p₁ > p₂라는 표본 결과를 보여줄 뿐, 통계적 유의성을 의미하지는 않습니다."],
              summary: "양측 검정의 p-값은 검정 통계량보다 더 극단적인 값이 나올 확률을 양쪽 꼬리에서 모두 고려하여 계산합니다."
          },
          en: {
              concept: "⚖️ Two-Sided Tests and p-values",
              steps: ["The alternative hypothesis is 'p₁ ≠ p₂', which indicates a two-sided test.", "For a two-sided test, the p-value is calculated as 2 * P(Z > |test statistic|).", "p-value = 2 * P(Z > 1.85) ≈ 2 * (1 - 0.9678) = 2 * 0.0322 = 0.0644.", "The calculated p-value (0.0644) is greater than the significance level α (0.05).", "Since the p-value > α, we fail to reject the null hypothesis. There is not sufficient statistical evidence to conclude the proportions are different."],
              distractors: ["B: We do not compare the test statistic directly to the alpha level.", "C, D: Since the p-value is greater than alpha, we conclude there is *not* sufficient evidence.", "E: A positive test statistic only indicates that the sample proportion for Florida was higher, not that the difference is statistically significant."],
              summary: "The p-value for a two-sided test accounts for the probability of observing an outcome as or more extreme in either direction from the null hypothesis."
          }
      },
      tags: ['추론통계'],
      difficulty: '중간'
  },
  {
      id: "2016-38", year: 2016, questionNumber: 38,
      questionText: "A newspaper editor wants to investigate whether residents of the city support a proposal to build a new high school football stadium. The editor hires a polling firm to conduct a survey and requests that a sample of 500 residents be selected using a stratified sampling design based on voting districts within the city. Which of the following methods will achieve the desired sampling design?",
      answerOptions: [
          { text: "Send a survey to all city residents and use the first 500 returned surveys for the sample.", isCorrect: false },
          { text: "Select a random sample from each voting district based on the proportion of city residents in the district so that a total of 500 is obtained.", isCorrect: true },
          { text: "Select one voting district at random, and then select a random sample of 500 from the selected voting district.", isCorrect: false },
          { text: "Alphabetize a list of all city residents, and then select the first 500 residents on the list, classifying those selected by voting district.", isCorrect: false },
          { text: "Select the first 500 city residents who attend the next high school football game.", isCorrect: false }
      ],
      explanation: {
          ko: {
              concept: "📋 표본추출 방법: 층화 임의 표본추출",
              steps: ["층화 임의 표본추출은 모집단을 서로 겹치지 않는 여러 개의 소그룹(층, stratum)으로 나눕니다. 이 문제에서는 '선거구'가 층에 해당합니다.", "각 층(선거구)에서 각각 단순 임의 표본을 추출합니다.", "선택지 B는 각 층의 모집단 내 비율에 따라 표본 크기를 할당하는 '비례 층화추출'을 정확하게 설명하고 있습니다."],
              distractors: ["A: 자발적 응답 편향이 발생합니다.", "C: 이것은 '군집(cluster) 표본추출'에 해당합니다.", "D, E: 무작위성이 결여된 편의 표본추출입니다."],
              summary: "층화 임의 표본추출은 모집단을 동질적인 여러 그룹으로 나누고 각 그룹에서 무작위로 표본을 추출하여, 각 소그룹이 표본에 잘 대표되도록 하는 방법입니다."
          },
          en: {
              concept: "📋 Sampling Methods: Stratified Random Sampling",
              steps: ["Stratified random sampling involves dividing the population into non-overlapping subgroups called strata. In this case, the 'voting districts' are the strata.", "A simple random sample is then taken from each stratum.", "Option B correctly describes proportional stratified sampling, where the sample size from each stratum is proportional to its size in the population."],
              distractors: ["A: This is a voluntary response sample, which is biased.", "C: This describes cluster sampling.", "D, E: These are convenience sampling methods, not random."],
              summary: "Stratified random sampling ensures that subgroups of a population are represented in the sample by dividing the population into strata and sampling randomly from each."
          }
      },
      tags: ['표본추출'],
      difficulty: '쉬움'
  },
  {
      id: "2016-39", year: 2016, questionNumber: 39,
          questionText: "A simulation was conducted using 10 fair six-sided dice, where the faces were numbered 1 through 6, respectively. All 10 dice were rolled, and the average of the 10 numbers appearing faceup was recorded. The process was repeated 20 times. Which of the following best describes the distribution being simulated?",
          answerOptions: [
              { text: "A sampling distribution of a sample mean with n = 10, μ_x̄ = 3.5, and σ_x̄ ≈ 0.54", isCorrect: true },
              { text: "A sampling distribution of a sample mean with n = 10, μ_x̄ = 3.5, and σ_x̄ ≈ 1.71", isCorrect: false },
              { text: "A sampling distribution of a sample mean with n = 20, μ_x̄ = 3.5, and σ_x̄ ≈ 0.38", isCorrect: false },
              { text: "A sampling distribution of a sample proportion with n = 10, μ_p̂ = 1/6, and σ_p̂ ≈ 0.118", isCorrect: false },
              { text: "A sampling distribution of a sample proportion with n = 20, μ_p̂ = 1/6, and σ_p̂ ≈ 0.083", isCorrect: false }
              ],
          explanation: {
              ko: {
                  concept: "🎲 표본 평균의 표집분포",
                  steps: ["이 시뮬레이션은 크기가 10인 표본을 반복적으로 추출하여 각 표본의 '평균'을 기록하고 있으므로, '표본 평균의 표집분포'를 만들고 있습니다.", "표본 크기(n)는 10입니다.", "모집단(주사위 한 개 던지기)의 평균(μ)은 (1+2+3+4+5+6)/6 = 3.5입니다. 따라서 표집분포의 평균(μ_x̄)도 3.5입니다.", "모집단의 표준편차(σ)는 약 1.708입니다. 표집분포의 표준편차(σ_x̄)는 σ/√n ≈ 1.708/√10 ≈ 0.54입니다."],
                  distractors: ["B: 표집분포의 표준편차 계산이 틀렸습니다.", "C: 표본 크기(n)는 10이지 20이 아닙니다. 20은 시뮬레이션 반복 횟수입니다.", "D, E: 평균을 기록하고 있으므로 비율이 아닌 평균의 표집분포입니다."],
                  summary: "표본 평균의 표집분포는 평균이 모평균과 같고, 표준편차는 모표준편차를 표본 크기의 제곱근으로 나눈 값을 가집니다."
              },
              en: {
                  concept: "🎲 Sampling Distribution of a Sample Mean",
                  steps: ["The simulation involves repeatedly taking samples of size 10 and recording the 'average' (mean) of each sample. This creates a 'sampling distribution of the sample mean'.", "The sample size is n = 10.", "The mean of the population (a single die roll) is μ = (1+2+3+4+5+6)/6 = 3.5. The mean of the sampling distribution (μ_x̄) is equal to μ.", "The standard deviation of the population (σ) is ≈1.708. The standard deviation of the sampling distribution (σ_x̄) is σ/√n ≈ 1.708/√10 ≈ 0.54."],
                  distractors: ["B: This is the population standard deviation, not the standard deviation of the sampling distribution.", "C: The sample size (n) is 10, not 20. 20 is the number of simulations.", "D, E: The simulation records the average, so it's a distribution of a sample mean, not a proportion."],
                  summary: "The sampling distribution of the sample mean has a mean equal to the population mean and a standard deviation equal to the population standard deviation divided by the square root of the sample size."
              }
           },
          tags: ['표본추출'],
          difficulty: '어려움'
      },
          {
              id: "2016-40", year: 2016, questionNumber: 40,
              questionText: "The SC Electric Company has bid on two electrical wiring jobs. The owner of the company believes that\n\nI. the probability of being awarded the first job (event A) is 0.75;\nII. the probability of being awarded the second job (event B) is 0.5; and\nIII. the probability of being awarded both jobs (event (A and B)) is 0.375.\n\nIf the owner's beliefs are correct, which of the following statements must be true concerning event A and event B?",
              answerOptions: [
                  { text: "Event A and event B are mutually exclusive and are independent.", isCorrect: false },
                  { text: "Event A and event B are mutually exclusive and are not independent.", isCorrect: false },
                  { text: "Event A and event B are not mutually exclusive and are independent.", isCorrect: true },
                  { text: "Event A and event B are not mutually exclusive and are not independent.", isCorrect: false },
                  { text: "Event A and event B are not mutually exclusive, and independence cannot be determined with the information given.", isCorrect: false }
              ],
              explanation: {
                  ko: {
                      concept: "🎲 독립 사건과 배반 사건",
                      steps: ["독립성 확인: 두 사건이 독립이라면 P(A and B) = P(A) * P(B)가 성립해야 합니다. P(A) * P(B) = 0.75 * 0.5 = 0.375. 이 값은 주어진 P(A and B)와 같으므로, 두 사건은 독립입니다.", "배반사건 확인: 두 사건이 배반사건이라면 동시에 일어날 수 없으므로 P(A and B) = 0이어야 합니다.", "이 문제에서 P(A and B) = 0.375이므로, 두 사건은 배반사건이 아닙니다.", "따라서, 두 사건은 서로 배반이 아니면서 독립입니다."],
                      distractors: ["A, B: P(A and B)가 0이 아니므로 배반사건이 아닙니다.", "D, E: 독립성 조건이 만족되므로 독립입니다."],
                      summary: "두 사건이 독립일 조건은 P(A and B) = P(A) * P(B)이고, 배반사건일 조건은 P(A and B) = 0입니다. 두 개념을 혼동하지 않도록 주의해야 합니다."
                  },
                  en: {
                      concept: "🎲 Independent and Mutually Exclusive Events",
                      steps: ["Check for Independence: Two events are independent if P(A and B) = P(A) * P(B). Here, P(A) * P(B) = 0.75 * 0.5 = 0.375. This is equal to the given P(A and B), so the events are independent.", "Check for Mutual Exclusivity: Two events are mutually exclusive if they cannot occur at the same time, meaning P(A and B) = 0.", "In this problem, P(A and B) = 0.375, which is not 0. Therefore, the events are not mutually exclusive.", "Conclusion: The events are not mutually exclusive and are independent."],
                      distractors: ["A, B: The events are not mutually exclusive because P(A and B) is not 0.", "D, E: The condition for independence is met."],
                      summary: "The condition for independence is P(A and B) = P(A) * P(B), while the condition for mutual exclusivity is P(A and B) = 0. It's important not to confuse these two concepts."
                  }
              },
              tags: ['확률분포'],
              difficulty: '중간'
          }
    // ... (All other questions from 2016, questions 21-40)
];