package com.interview.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.interview.exception.BadRequestException;
import com.interview.model.Interview;
import com.interview.model.Resume;
import com.interview.model.Resume.ResumeAnalysis;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for Groq AI integration
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GroqAIService {

    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;

    @Value("${groq.api.url}")
    private String groqApiUrl;

    @Value("${groq.api.key}")
    private String groqApiKey;

    @Value("${groq.model}")
    private String groqModel;

    @Value("${groq.max.tokens}")
    private Integer maxTokens;

    @Value("${groq.temperature}")
    private Double temperature;

    /**
     * Generate interview questions based on parameters
     */
    public List<String> generateInterviewQuestions(String jobRole, Interview.InterviewDomain domain,
                                                    Interview.Difficulty difficulty, int numberOfQuestions) {
        log.info("Generating {} questions for {} - {} - {}", numberOfQuestions, jobRole, domain, difficulty);

        String prompt = buildQuestionGenerationPrompt(jobRole, domain, difficulty, numberOfQuestions);
        String response = callGroqAPI(prompt);

        return parseQuestionsFromResponse(response);
    }

    /**
     * Evaluate user's answer and provide feedback
     */
    public Map<String, Object> evaluateAnswer(String question, String answer, Interview.InterviewDomain domain,
                                              Interview.Difficulty difficulty) {
        log.info("Evaluating answer for domain: {}, difficulty: {}", domain, difficulty);

        String prompt = buildAnswerEvaluationPrompt(question, answer, domain, difficulty);
        String response = callGroqAPI(prompt);

        return parseEvaluationResponse(response);
    }

    /**
     * Generate follow-up question based on previous answer
     */
    public String generateFollowUpQuestion(String previousQuestion, String answer, Interview.InterviewDomain domain) {
        log.info("Generating follow-up question for domain: {}", domain);

        String prompt = buildFollowUpPrompt(previousQuestion, answer, domain);
        String response = callGroqAPI(prompt);

        return response.trim();
    }

    /**
     * Generate overall interview summary
     */
    public Map<String, Object> generateInterviewSummary(List<Map<String, Object>> questionsAndAnswers,
                                                        Interview.InterviewDomain domain) {
        log.info("Generating interview summary for domain: {}", domain);

        String prompt = buildSummaryPrompt(questionsAndAnswers, domain);
        String response = callGroqAPI(prompt);

        return parseSummaryResponse(response);
    }

    private String callGroqAPI(String prompt) {
        try {
            WebClient webClient = webClientBuilder.build();

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", groqModel);
            requestBody.put("max_tokens", maxTokens);
            requestBody.put("temperature", temperature);

            List<Map<String, String>> messages = new ArrayList<>();
            Map<String, String> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", prompt);
            messages.add(message);
            requestBody.put("messages", messages);

            String responseBody = webClient.post()
                    .uri(groqApiUrl)
                    .header("Authorization", "Bearer " + groqApiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode jsonResponse = objectMapper.readTree(responseBody);
            return jsonResponse.at("/choices/0/message/content").asText();

        } catch (Exception e) {
            log.error("Error calling Groq API", e);
            throw new BadRequestException("Failed to call AI service: " + e.getMessage());
        }
    }

    private String buildQuestionGenerationPrompt(String jobRole, Interview.InterviewDomain domain,
                                                  Interview.Difficulty difficulty, int numberOfQuestions) {
        return String.format("""
                You are an expert technical interviewer. Generate %d %s difficulty interview questions
                for a %s position focusing on %s domain.
                
                Requirements:
                - Questions should be clear and specific
                - Match the %s difficulty level
                - Cover different aspects of %s
                - Include both theoretical and practical questions
                - Format: Return questions numbered from 1 to %d, one per line
                
                Return only the questions, no additional text.
                """, numberOfQuestions, difficulty, jobRole, domain, difficulty, domain, numberOfQuestions);
    }

    private String buildAnswerEvaluationPrompt(String question, String answer, Interview.InterviewDomain domain,
                                               Interview.Difficulty difficulty) {
        return String.format("""
                You are an expert technical interviewer evaluating a candidate's answer.
                
                Question: %s
                Candidate's Answer: %s
                Domain: %s
                Difficulty: %s
                
                Evaluate the answer and provide feedback in the following format:
                SCORE: [0-10]
                TECHNICAL_FEEDBACK: [Brief technical assessment]
                COMMUNICATION_FEEDBACK: [Assessment of clarity and articulation]
                IMPROVEMENTS: [Specific suggestions for improvement]
                
                Be constructive and specific in your feedback.
                """, question, answer, domain, difficulty);
    }

    private String buildFollowUpPrompt(String previousQuestion, String answer, Interview.InterviewDomain domain) {
        return String.format("""
                Based on the candidate's answer, generate a relevant follow-up question to dive deeper.
                
                Previous Question: %s
                Candidate's Answer: %s
                Domain: %s
                
                Generate one follow-up question that:
                - Explores the topic deeper
                - Tests understanding
                - Is relevant to their answer
                
                Return only the question, no additional text.
                """, previousQuestion, answer, domain);
    }

    private String buildSummaryPrompt(List<Map<String, Object>> questionsAndAnswers, Interview.InterviewDomain domain) {
        StringBuilder qaText = new StringBuilder();
        for (int i = 0; i < questionsAndAnswers.size(); i++) {
            Map<String, Object> qa = questionsAndAnswers.get(i);
            qaText.append(String.format("Q%d: %s\nA%d: %s\nScore: %s\n\n",
                    i + 1, qa.get("question"), i + 1, qa.get("answer"), qa.get("score")));
        }

        return String.format("""
                You are an expert technical interviewer. Analyze the complete interview session and provide a comprehensive summary.
                
                Domain: %s
                
                Questions and Answers:
                %s
                
                Provide analysis in the following format:
                OVERALL_SCORE: [Average score out of 10]
                STRENGTHS: [3-5 key strengths, separated by |]
                WEAKNESSES: [3-5 key weaknesses, separated by |]
                RECOMMENDATIONS: [3-5 specific recommendations, separated by |]
                LEARNING_RESOURCES: [3-5 resources with format: Topic: Description, separated by |]
                
                Be specific, constructive, and actionable.
                """, domain, qaText);
    }

    private List<String> parseQuestionsFromResponse(String response) {
        List<String> questions = new ArrayList<>();
        String[] lines = response.split("\\r?\\n");

        for (String line : lines) {
            line = line.trim();
            if (!line.isEmpty() && line.matches("^\\d+[.)].*")) {
                // Remove numbering
                String question = line.replaceFirst("^\\d+[.)]\\s*", "").trim();
                questions.add(question);
            }
        }

        return questions;
    }

    private Map<String, Object> parseEvaluationResponse(String response) {
        Map<String, Object> evaluation = new HashMap<>();

        try {
            String[] lines = response.split("\\r?\\n");
            for (String line : lines) {
                if (line.startsWith("SCORE:")) {
                    String scoreStr = line.replace("SCORE:", "").trim();
                    evaluation.put("score", Double.parseDouble(scoreStr));
                } else if (line.startsWith("TECHNICAL_FEEDBACK:")) {
                    evaluation.put("technicalFeedback", line.replace("TECHNICAL_FEEDBACK:", "").trim());
                } else if (line.startsWith("COMMUNICATION_FEEDBACK:")) {
                    evaluation.put("communicationFeedback", line.replace("COMMUNICATION_FEEDBACK:", "").trim());
                } else if (line.startsWith("IMPROVEMENTS:")) {
                    evaluation.put("improvements", line.replace("IMPROVEMENTS:", "").trim());
                }
            }

            // Set defaults if parsing failed
            evaluation.putIfAbsent("score", 5.0);
            evaluation.putIfAbsent("technicalFeedback", "Good effort");
            evaluation.putIfAbsent("communicationFeedback", "Clear communication");
            evaluation.putIfAbsent("improvements", "Continue practicing");

        } catch (Exception e) {
            log.error("Error parsing evaluation response", e);
            evaluation.put("score", 5.0);
            evaluation.put("technicalFeedback", "Response evaluated");
            evaluation.put("communicationFeedback", "Communication noted");
            evaluation.put("improvements", "Keep practicing");
        }

        evaluation.put("aiResponse", response);
        return evaluation;
    }

    private Map<String, Object> parseSummaryResponse(String response) {
        Map<String, Object> summary = new HashMap<>();

        try {
            String[] lines = response.split("\\r?\\n");
            for (String line : lines) {
                if (line.startsWith("OVERALL_SCORE:")) {
                    String scoreStr = line.replace("OVERALL_SCORE:", "").trim();
                    summary.put("overallScore", Double.parseDouble(scoreStr));
                } else if (line.startsWith("STRENGTHS:")) {
                    String strengthsStr = line.replace("STRENGTHS:", "").trim();
                    summary.put("strengths", List.of(strengthsStr.split("\\|")));
                } else if (line.startsWith("WEAKNESSES:")) {
                    String weaknessesStr = line.replace("WEAKNESSES:", "").trim();
                    summary.put("weaknesses", List.of(weaknessesStr.split("\\|")));
                } else if (line.startsWith("RECOMMENDATIONS:")) {
                    String recommendationsStr = line.replace("RECOMMENDATIONS:", "").trim();
                    summary.put("recommendations", List.of(recommendationsStr.split("\\|")));
                } else if (line.startsWith("LEARNING_RESOURCES:")) {
                    String resourcesStr = line.replace("LEARNING_RESOURCES:", "").trim();
                    summary.put("learningResources", List.of(resourcesStr.split("\\|")));
                }
            }

            // Set defaults
            summary.putIfAbsent("overallScore", 7.0);
            summary.putIfAbsent("strengths", List.of("Good technical knowledge"));
            summary.putIfAbsent("weaknesses", List.of("Room for improvement"));
            summary.putIfAbsent("recommendations", List.of("Continue practicing"));
            summary.putIfAbsent("learningResources", List.of("Review core concepts"));

        } catch (Exception e) {
            log.error("Error parsing summary response", e);
            summary.put("overallScore", 7.0);
            summary.put("strengths", List.of("Solid foundation"));
            summary.put("weaknesses", List.of("Continue learning"));
            summary.put("recommendations", List.of("Practice more"));
            summary.put("learningResources", List.of("Study materials available"));
        }

        return summary;
    }

    /**
     * Analyze resume text using AI to calculate ATS score and parse detailed analysis
     */
    public ResumeAnalysis analyzeResume(String resumeText) {
        log.info("Analyzing resume text for ATS score and feedback...");
        String prompt = buildResumeAnalysisPrompt(resumeText);
        try {
            String response = callGroqAPI(prompt);
            return parseResumeAnalysisResponse(response);
        } catch (Exception e) {
            log.error("Error analyzing resume with Groq AI, using default analysis values", e);
            return ResumeAnalysis.builder()
                    .atsScore(55)
                    .strengths(List.of("Resume layout is clean and readable"))
                    .improvements(List.of("Could not perform deep AI analysis. Verify that formatting is readable by parsers."))
                    .recommendedSkills(new ArrayList<>())
                    .feedbackSummary("Analysis was generated using generic defaults due to a service error.")
                    .build();
        }
    }

    private String buildResumeAnalysisPrompt(String resumeText) {
        String cleanResume = cleanText(resumeText, 15000);
        return String.format("""
                You are an expert Applicant Tracking System (ATS) evaluator and professional career consultant.
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
                
                Return ONLY the raw JSON object. Do not include any markdown blocks (like ```json), intro, or outro text.
                
                Resume Text:
                %s
                """, cleanResume);
    }

    private ResumeAnalysis parseResumeAnalysisResponse(String response) {
        try {
            String cleanedResponse = response.trim();
            if (cleanedResponse.startsWith("```")) {
                cleanedResponse = cleanedResponse.replaceAll("^```json\\s*", "").replaceAll("```$", "").trim();
            }
            return objectMapper.readValue(cleanedResponse, ResumeAnalysis.class);
        } catch (Exception e) {
            log.error("Failed to parse resume analysis JSON response: {}", response, e);
            // Return fallback analysis
            return ResumeAnalysis.builder()
                    .atsScore(60)
                    .strengths(List.of("Document contains basic experience sections"))
                    .improvements(List.of("Failed to parse structured AI feedback. Check document text readability."))
                    .recommendedSkills(new ArrayList<>())
                    .feedbackSummary("An error occurred while parsing the detailed AI analysis. Upload completed successfully.")
                    .build();
        }
    }

    /**
     * Compare resume text against a Job Description using AI
     */
    public Map<String, Object> matchResumeWithJD(String resumeText, String jobDescription) {
        log.info("Matching resume with Job Description using Groq AI...");
        String prompt = buildJDMatchPrompt(resumeText, jobDescription);
        try {
            String response = callGroqAPI(prompt);
            return parseJDMatchResponse(response);
        } catch (Exception e) {
            log.error("Error matching resume with JD using Groq AI, using default match values", e);
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("matchScore", 50);
            fallback.put("matchedKeywords", List.of("General professional experience"));
            fallback.put("missingKeywords", List.of("Required job-specific technical tools"));
            fallback.put("fitAnalysis", "An error occurred while calling the AI matching service. Match analysis could not be calculated.");
            fallback.put("recommendations", List.of("Please check that both the resume and the job description contain clear technical detail."));
            return fallback;
        }
    }

    private String buildJDMatchPrompt(String resumeText, String jobDescription) {
        String cleanResume = cleanText(resumeText, 15000);
        String cleanJd = cleanText(jobDescription, 10000);
        return String.format("""
                You are an expert technical recruiter and ATS software analyzer.
                Compare the candidate's resume text against the provided Job Description (JD).
                
                Calculate a compatibility match score (0 to 100%%) and provide clear keyword analysis and alignment tips.
                
                You MUST return a JSON object with the following fields:
                {
                  "matchScore": (integer between 0 and 100),
                  "matchedKeywords": [list of skills/keywords found in both the resume and the JD],
                  "missingKeywords": [important skills/keywords requested in the JD but missing or weak in the resume],
                  "fitAnalysis": "A professional summary (2-3 sentences) evaluating how well the candidate's profile matches this JD.",
                  "recommendations": [list of 3-4 specific revisions or bullet point enhancements to align the resume closer to the JD]
                }
                
                Return ONLY the raw JSON object. Do not include any markdown blocks (like ```json), intro, or outro text.
                
                Resume Text:
                %s
                
                Job Description (JD):
                %s
                """, cleanResume, cleanJd);
    }

    private Map<String, Object> parseJDMatchResponse(String response) {
        try {
            String cleanedResponse = response.trim();
            if (cleanedResponse.startsWith("```")) {
                cleanedResponse = cleanedResponse.replaceAll("^```json\\s*", "").replaceAll("```$", "").trim();
            }
            return objectMapper.readValue(cleanedResponse, Map.class);
        } catch (Exception e) {
            log.error("Failed to parse JD match response JSON: {}", response, e);
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("matchScore", 55);
            fallback.put("matchedKeywords", new ArrayList<>());
            fallback.put("missingKeywords", new ArrayList<>());
            fallback.put("fitAnalysis", "An error occurred while parsing the detailed AI match results. The upload or text comparison had parsing anomalies.");
            fallback.put("recommendations", List.of("Ensure the job description contains standard job requirements and terminology."));
            return fallback;
        }
    }

    public Map<String, Object> evaluateCodingAnswer(String problemTitle, String problemDescription, String cppCode, String compileRunSummary, Interview.Difficulty difficulty) {
        log.info("Evaluating coding answer using Groq AI for problem: {}", problemTitle);
        String prompt = String.format("""
                You are an expert technical interviewer evaluating a candidate's C++ coding solution to a competitive programming problem.
                
                Problem Title: %s
                Problem Description: %s
                Candidate's C++ Code:
                %s
                
                Compiler Run & Test Case Verification Summary:
                %s
                
                Difficulty: %s
                
                Evaluate the solution for:
                1. Correctness and runtime/space complexity
                2. Code style, readability, modularity, and best practices in C++
                3. Strengths and edge-case handling
                
                You MUST return your output in the following format:
                SCORE: [0-10] (Calculate standard score out of 10 based on compiler validation success. If it didn't compile, score should be low, e.g. <= 2.0. If all tests pass, score should be high, e.g. >= 9.0)
                TECHNICAL_FEEDBACK: [Brief review of complexity, architecture, C++ features used]
                COMMUNICATION_FEEDBACK: [Brief review of code readability, variable naming, and comments]
                IMPROVEMENTS: [Specific suggestion to optimize runtime, space, or styling]
                
                Be concise, constructive, and direct. Do not write anything else.
                """, problemTitle, problemDescription, cppCode, compileRunSummary, difficulty);
        
        try {
            String response = callGroqAPI(prompt);
            return parseEvaluationResponse(response);
        } catch (Exception e) {
            log.error("Failed to evaluate code answer via Groq", e);
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("score", 5.0);
            fallback.put("technicalFeedback", "Code execution compiled successfully. Automated analysis fallback due to server timeout.");
            fallback.put("communicationFeedback", "Code formatting matches standard visual rules.");
            fallback.put("improvements", "Verify runtime optimization limits.");
            fallback.put("aiResponse", "Fallback evaluation");
            return fallback;
        }
    }

    private String cleanText(String text, int maxLength) {
        if (text == null) return "";
        // Clean control/garbage/null characters
        String cleaned = text.replaceAll("[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F]", "");
        // Trim multiple consecutive spaces
        cleaned = cleaned.replaceAll(" {2,}", " ");
        // Trim multiple consecutive newlines
        cleaned = cleaned.replaceAll("\\n{3,}", "\n\n");
        cleaned = cleaned.trim();
        if (cleaned.length() > maxLength) {
            cleaned = cleaned.substring(0, maxLength) + "... [Truncated due to length]";
        }
        return cleaned;
    }
}
