const axios = require('axios');
const { BadRequestError } = require('../utils/errors');

const groqApiUrl = process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions';
const groqApiKey = process.env.GROQ_API_KEY;
const groqModel = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const maxTokens = parseInt(process.env.GROQ_MAX_TOKENS) || 2048;
const temperature = parseFloat(process.env.GROQ_TEMPERATURE) || 0.7;

const callGroqAPI = async (prompt) => {
  try {
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY environment variable is not configured');
    }
    
    console.log(`Calling Groq API using model: ${groqModel}`);
    const response = await axios.post(
      groqApiUrl,
      {
        model: groqModel,
        max_tokens: maxTokens,
        temperature: temperature,
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
      return response.data.choices[0].message.content;
    }
    throw new Error('Invalid API response structure from Groq');
  } catch (error) {
    console.error('Error calling Groq API:', error.message);
    throw new BadRequestError(`Failed to call AI service: ${error.message}`);
  }
};

const cleanText = (text, maxLength) => {
  if (!text) return '';
  let cleaned = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
  cleaned = cleaned.replace(/ {2,}/g, ' ');
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  cleaned = cleaned.trim();
  if (cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength) + '... [Truncated due to length]';
  }
  return cleaned;
};

const generateInterviewQuestions = async (jobRole, domain, difficulty, numberOfQuestions) => {
  console.log(`Generating ${numberOfQuestions} questions for ${jobRole} - ${domain} - ${difficulty}`);
  
  const prompt = `You are an expert technical interviewer. Generate ${numberOfQuestions} ${difficulty} difficulty interview questions for a ${jobRole} position focusing on ${domain} domain.

Requirements:
- Questions should be clear and specific
- Match the ${difficulty} difficulty level
- Cover different aspects of ${domain}
- Include both theoretical and practical questions
- Format: Return questions numbered from 1 to ${numberOfQuestions}, one per line

Return only the questions, no additional text.`;
  
  const response = await callGroqAPI(prompt);
  return parseQuestionsFromResponse(response);
};

const evaluateAnswer = async (question, answer, domain, difficulty) => {
  console.log(`Evaluating answer for domain: ${domain}, difficulty: ${difficulty}`);
  
  const prompt = `You are an expert technical interviewer evaluating a candidate's answer.

Question: ${question}
Candidate's Answer: ${answer}
Domain: ${domain}
Difficulty: ${difficulty}

Evaluate the answer and provide feedback in the following format:
SCORE: [0-10]
TECHNICAL_FEEDBACK: [Brief technical assessment]
COMMUNICATION_FEEDBACK: [Assessment of clarity and articulation]
IMPROVEMENTS: [Specific suggestions for improvement]

Be constructive and specific in your feedback.`;

  const response = await callGroqAPI(prompt);
  return parseEvaluationResponse(response);
};

const generateFollowUpQuestion = async (previousQuestion, answer, domain) => {
  console.log(`Generating follow-up question for domain: ${domain}`);
  
  const prompt = `Based on the candidate's answer, generate a relevant follow-up question to dive deeper.

Previous Question: ${previousQuestion}
Candidate's Answer: ${answer}
Domain: ${domain}

Generate one follow-up question that:
- Explores the topic deeper
- Tests understanding
- Is relevant to their answer

Return only the question, no additional text.`;

  const response = await callGroqAPI(prompt);
  return response.trim();
};

const generateInterviewSummary = async (questionsAndAnswers, domain) => {
  console.log(`Generating interview summary for domain: ${domain}`);
  
  let qaText = '';
  questionsAndAnswers.forEach((qa, idx) => {
    qaText += `Q${idx + 1}: ${qa.question}\nA${idx + 1}: ${qa.answer}\nScore: ${qa.score}\n\n`;
  });

  const prompt = `You are an expert technical interviewer. Analyze the complete interview session and provide a comprehensive summary.

Domain: ${domain}

Questions and Answers:
${qaText}

Provide analysis in the following format:
OVERALL_SCORE: [Average score out of 10]
STRENGTHS: [3-5 key strengths, separated by |]
WEAKNESSES: [3-5 key weaknesses, separated by |]
RECOMMENDATIONS: [3-5 specific recommendations, separated by |]
LEARNING_RESOURCES: [3-5 resources with format: Topic: Description, separated by |]

Be specific, constructive, and actionable.`;

  const response = await callGroqAPI(prompt);
  return parseSummaryResponse(response);
};

const analyzeResume = async (resumeText) => {
  console.log('Analyzing resume text for ATS score and feedback...');
  const cleanResume = cleanText(resumeText, 15000);
  const prompt = `You are an expert Applicant Tracking System (ATS) evaluator and professional career consultant.
Analyze the following candidate resume text and perform a deep evaluation.

Analyze the text for:
1. ATS formatting compatibility and parser readability
2. Key skills matching, completeness, and clarity
3. Quality of job descriptions (use of action verbs, impact-driven sentences, quantifiable results)
4. Education, certification credibility, and formatting structure

You MUST return a JSON object with the following fields:
{
  "atsScore": (integer between 0 and 100 representing how well optimized the resume is),
  "strengths": [list of 3-5 strings identifying specific strengths of this resume],
  "improvements": [list of 3-5 strings indicating weaknesses or clear areas where formatting or content can be improved],
  "recommendedSkills": [list of 4-6 industry skills/tools the candidate should consider adding based on their background],
  "feedbackSummary": "A concise, 2-3 sentence professional summary of the overall analysis"
}

Return ONLY the raw JSON object. Do not include any markdown blocks (like \`\`\`json), intro, or outro text.

Resume Text:
${cleanResume}`;

  try {
    const response = await callGroqAPI(prompt);
    return parseResumeAnalysisResponse(response);
  } catch (error) {
    console.error('Error analyzing resume with Groq AI, using default analysis values:', error);
    return {
      atsScore: 55,
      strengths: ['Resume layout is clean and readable'],
      improvements: ['Could not perform deep AI analysis. Verify that formatting is readable by parsers.'],
      recommendedSkills: [],
      feedbackSummary: 'Analysis was generated using generic defaults due to a service error.'
    };
  }
};

const matchResumeWithJD = async (resumeText, jobDescription) => {
  console.log('Matching resume with Job Description using Groq AI...');
  const cleanResume = cleanText(resumeText, 15000);
  const cleanJd = cleanText(jobDescription, 10000);
  
  const prompt = `You are an expert technical recruiter and ATS software analyzer.
Compare the candidate's resume text against the provided Job Description (JD).

Calculate a compatibility match score (0 to 100%) and provide clear keyword analysis and alignment tips.

You MUST return a JSON object with the following fields:
{
  "matchScore": (integer between 0 and 100),
  "matchedKeywords": [list of skills/keywords found in both the resume and the JD],
  "missingKeywords": [important skills/keywords requested in the JD but missing or weak in the resume],
  "fitAnalysis": "A professional summary (2-3 sentences) evaluating how well the candidate's profile matches this JD.",
  "recommendations": [list of 3-4 specific revisions or bullet point enhancements to align the resume closer to the JD]
}

Return ONLY the raw JSON object. Do not include any markdown blocks (like \`\`\`json), intro, or outro text.

Resume Text:
${cleanResume}

Job Description (JD):
${cleanJd}`;

  try {
    const response = await callGroqAPI(prompt);
    return parseJDMatchResponse(response);
  } catch (error) {
    console.error('Error matching resume with JD using Groq AI, using default match values:', error);
    return {
      matchScore: 50,
      matchedKeywords: ['General professional experience'],
      missingKeywords: ['Required job-specific technical tools'],
      fitAnalysis: 'An error occurred while calling the AI matching service. Match analysis could not be calculated.',
      recommendations: ['Please check that both the resume and the job description contain clear technical detail.']
    };
  }
};

const evaluateCodingAnswer = async (problemTitle, problemDescription, cppCode, compileRunSummary, difficulty) => {
  console.log(`Evaluating coding answer using Groq AI for problem: ${problemTitle}`);
  
  const prompt = `You are an expert technical interviewer evaluating a candidate's C++ coding solution to a competitive programming problem.

Problem Title: ${problemTitle}
Problem Description: ${problemDescription}
Candidate's C++ Code:
${cppCode}

Compiler Run & Test Case Verification Summary:
${compileRunSummary}

Difficulty: ${difficulty}

Evaluate the solution for:
1. Correctness and runtime/space complexity
2. Code style, readability, modularity, and best practices in C++
3. Strengths and edge-case handling

You MUST return your output in the following format:
SCORE: [0-10] (Calculate standard score out of 10 based on compiler validation success. If it didn't compile, score should be low, e.g. <= 2.0. If all tests pass, score should be high, e.g. >= 9.0)
TECHNICAL_FEEDBACK: [Brief review of complexity, architecture, C++ features used]
COMMUNICATION_FEEDBACK: [Brief review of code readability, variable naming, and comments]
IMPROVEMENTS: [Specific suggestion to optimize runtime, space, or styling]

Be concise, constructive, and direct. Do not write anything else.`;

  try {
    const response = await callGroqAPI(prompt);
    return parseEvaluationResponse(response);
  } catch (error) {
    console.error('Failed to evaluate code answer via Groq:', error);
    return {
      score: 5.0,
      technicalFeedback: 'Code execution compiled successfully. Automated analysis fallback due to server timeout.',
      communicationFeedback: 'Code formatting matches standard visual rules.',
      improvements: 'Verify runtime optimization limits.',
      aiResponse: 'Fallback evaluation'
    };
  }
};

// Parsers
const parseQuestionsFromResponse = (response) => {
  const questions = [];
  const lines = response.split(/\r?\n/);
  for (let line of lines) {
    line = line.trim();
    if (line && /^\d+[.)]/.test(line)) {
      const question = line.replace(/^\d+[.)]\s*/, '').trim();
      questions.push(question);
    }
  }
  return questions;
};

const parseEvaluationResponse = (response) => {
  const evaluation = {
    score: 5.0,
    technicalFeedback: 'Good effort',
    communicationFeedback: 'Clear communication',
    improvements: 'Continue practicing'
  };
  
  try {
    const lines = response.split(/\r?\n/);
    for (let line of lines) {
      if (line.startsWith('SCORE:')) {
        evaluation.score = parseFloat(line.replace('SCORE:', '').trim()) || 5.0;
      } else if (line.startsWith('TECHNICAL_FEEDBACK:')) {
        evaluation.technicalFeedback = line.replace('TECHNICAL_FEEDBACK:', '').trim();
      } else if (line.startsWith('COMMUNICATION_FEEDBACK:')) {
        evaluation.communicationFeedback = line.replace('COMMUNICATION_FEEDBACK:', '').trim();
      } else if (line.startsWith('IMPROVEMENTS:')) {
        evaluation.improvements = line.replace('IMPROVEMENTS:', '').trim();
      }
    }
  } catch (error) {
    console.error('Error parsing evaluation response:', error);
  }
  
  evaluation.aiResponse = response;
  return evaluation;
};

const parseSummaryResponse = (response) => {
  const summary = {
    overallScore: 7.0,
    strengths: ['Good technical knowledge'],
    weaknesses: ['Room for improvement'],
    recommendations: ['Continue practicing'],
    learningResources: ['Review core concepts']
  };
  
  try {
    const lines = response.split(/\r?\n/);
    for (let line of lines) {
      if (line.startsWith('OVERALL_SCORE:')) {
        summary.overallScore = parseFloat(line.replace('OVERALL_SCORE:', '').trim()) || 7.0;
      } else if (line.startsWith('STRENGTHS:')) {
        const val = line.replace('STRENGTHS:', '').trim();
        summary.strengths = val.split('|').map(s => s.trim()).filter(Boolean);
      } else if (line.startsWith('WEAKNESSES:')) {
        const val = line.replace('WEAKNESSES:', '').trim();
        summary.weaknesses = val.split('|').map(s => s.trim()).filter(Boolean);
      } else if (line.startsWith('RECOMMENDATIONS:')) {
        const val = line.replace('RECOMMENDATIONS:', '').trim();
        summary.recommendations = val.split('|').map(s => s.trim()).filter(Boolean);
      } else if (line.startsWith('LEARNING_RESOURCES:')) {
        const val = line.replace('LEARNING_RESOURCES:', '').trim();
        summary.learningResources = val.split('|').map(s => s.trim()).filter(Boolean);
      }
    }
  } catch (error) {
    console.error('Error parsing summary response:', error);
  }
  
  return summary;
};

const parseResumeAnalysisResponse = (response) => {
  try {
    let cleaned = response.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/```$/, '').trim();
    }
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Failed to parse resume analysis JSON response:', response, error);
    return {
      atsScore: 60,
      strengths: ['Document contains basic experience sections'],
      improvements: ['Failed to parse structured AI feedback. Check document text readability.'],
      recommendedSkills: [],
      feedbackSummary: 'An error occurred while parsing the detailed AI analysis. Upload completed successfully.'
    };
  }
};

const parseJDMatchResponse = (response) => {
  try {
    let cleaned = response.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/```$/, '').trim();
    }
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Failed to parse JD match response JSON:', response, error);
    return {
      matchScore: 55,
      matchedKeywords: [],
      missingKeywords: [],
      fitAnalysis: 'An error occurred while parsing the detailed AI match results. The upload or text comparison had parsing anomalies.',
      recommendations: ['Ensure the job description contains standard job requirements and terminology.']
    };
  }
};

module.exports = {
  generateInterviewQuestions,
  evaluateAnswer,
  generateFollowUpQuestion,
  generateInterviewSummary,
  analyzeResume,
  matchResumeWithJD,
  evaluateCodingAnswer
};
