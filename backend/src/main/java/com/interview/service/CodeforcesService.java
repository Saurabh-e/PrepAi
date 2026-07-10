package com.interview.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.interview.model.Interview;
import com.interview.model.Question;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service to fetch and parse problems from Codeforces API and web pages.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CodeforcesService {

    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;

    // In-memory caching variables to avoid duplicate Codeforces API calls (which are slow and subject to strict 2s rate-limits)
    private final List<Map<String, Object>> easyCache = new ArrayList<>();
    private final List<Map<String, Object>> mediumCache = new ArrayList<>();
    private final List<Map<String, Object>> hardCache = new ArrayList<>();

    private synchronized void populateCache() {
        if (!easyCache.isEmpty() || !mediumCache.isEmpty() || !hardCache.isEmpty()) {
            return;
        }
        try {
            log.info("Fetching all Codeforces problems to populate local in-memory cache...");
            WebClient webClient = webClientBuilder.build();
            String response = webClient.get()
                    .uri("https://codeforces.com/api/problemset.problems")
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            
            JsonNode root = objectMapper.readTree(response);
            if (!"OK".equals(root.path("status").asText())) {
                log.warn("Codeforces API response status was not OK");
                return;
            }
            
            JsonNode problemsNode = root.path("result").path("problems");
            int count = 0;
            for (JsonNode prob : problemsNode) {
                int rating = prob.path("rating").asInt();
                if (rating <= 0) continue; // Skip unrated problems
                
                Map<String, Object> meta = new HashMap<>();
                meta.put("contestId", prob.path("contestId").asInt());
                meta.put("index", prob.path("index").asText());
                meta.put("name", prob.path("name").asText());
                
                if (rating >= 800 && rating <= 1100) {
                    easyCache.add(meta);
                } else if (rating >= 1200 && rating <= 1500) {
                    mediumCache.add(meta);
                } else if (rating >= 1600 && rating <= 2000) {
                    hardCache.add(meta);
                }
                count++;
            }
            log.info("Successfully cached {} Codeforces problems. Easy: {}, Medium: {}, Hard: {}", 
                    count, easyCache.size(), mediumCache.size(), hardCache.size());
        } catch (Exception e) {
            log.error("Failed populating Codeforces cache from API", e);
        }
    }

    /**
     * Fetches a random problem from Codeforces based on the desired difficulty,
     * scrapes its details, and returns a Question object.
     */
    public Question generateCodeforcesQuestion(String interviewId, String userId, int questionNum, Interview.Difficulty difficulty) {
        log.info("Generating Codeforces problem for interview {} difficulty {}", interviewId, difficulty);
        
        Map<String, Object> problemMeta = fetchRandomProblemMetadata(difficulty);
        if (problemMeta != null) {
            try {
                int contestId = (int) problemMeta.get("contestId");
                String index = (String) problemMeta.get("index");
                String name = (String) problemMeta.get("name");
                
                log.info("Selected Codeforces problem: {}{} - {}", contestId, index, name);
                Question question = scrapeProblemDetails(contestId, index);
                if (question != null) {
                    question.setInterviewId(interviewId);
                    question.setUserId(userId);
                    question.setQuestionNumber(questionNum);
                    question.setQuestionType("CODING");
                    question.setDifficulty(difficulty);
                    return question;
                }
            } catch (Exception e) {
                log.error("Failed parsing online Codeforces problem statement, running fallback", e);
            }
        }
        
        // Fallback if API call or scraper fails
        return getFallbackQuestion(interviewId, userId, questionNum, difficulty);
    }

    private Map<String, Object> fetchRandomProblemMetadata(Interview.Difficulty difficulty) {
        populateCache();
        
        List<Map<String, Object>> targetCache;
        if (difficulty == Interview.Difficulty.MEDIUM) {
            targetCache = mediumCache;
        } else if (difficulty == Interview.Difficulty.HARD) {
            targetCache = hardCache;
        } else {
            targetCache = easyCache;
        }
        
        if (targetCache.isEmpty()) {
            log.warn("Codeforces cache is empty for difficulty: {}", difficulty);
            return null;
        }
        
        Random rand = new Random();
        return targetCache.get(rand.nextInt(targetCache.size()));
    }

    private Question scrapeProblemDetails(int contestId, String index) throws Exception {
        String url = "https://codeforces.com/problemset/problem/" + contestId + "/" + index;
        log.info("Scraping Codeforces problem from: {}", url);
        
        Document doc = Jsoup.connect(url)
                .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                .timeout(10000)
                .get();
        
        Element statement = doc.selectFirst(".problem-statement");
        if (statement == null) {
            return null;
        }
        
        String title = statement.selectFirst(".header .title").text();
        String timeLimit = statement.selectFirst(".header .time-limit").text();
        String memoryLimit = statement.selectFirst(".header .memory-limit").text();
        
        // Extract main problem description (between .header and .input-specification)
        StringBuilder desc = new StringBuilder();
        boolean started = false;
        for (Element child : statement.children()) {
            if (child.hasClass("header")) {
                started = true;
                continue;
            }
            if (child.hasClass("input-specification") 
                    || child.hasClass("output-specification") 
                    || child.hasClass("sample-tests") 
                    || child.hasClass("note")) {
                break;
            }
            if (started) {
                desc.append(child.outerHtml());
            }
        }
        
        String inputSpec = "";
        Element inputSpecEl = statement.selectFirst(".input-specification");
        if (inputSpecEl != null) {
            // Remove section title
            Element secTitle = inputSpecEl.selectFirst(".section-title");
            if (secTitle != null) secTitle.remove();
            inputSpec = inputSpecEl.html();
        }
        
        String outputSpec = "";
        Element outputSpecEl = statement.selectFirst(".output-specification");
        if (outputSpecEl != null) {
            Element secTitle = outputSpecEl.selectFirst(".section-title");
            if (secTitle != null) secTitle.remove();
            outputSpec = outputSpecEl.html();
        }
        
        String note = "";
        Element noteEl = statement.selectFirst(".note");
        if (noteEl != null) {
            Element secTitle = noteEl.selectFirst(".section-title");
            if (secTitle != null) secTitle.remove();
            note = noteEl.html();
        }
        
        // Parse sample tests
        List<Map<String, String>> tests = new ArrayList<>();
        Element sampleTestsEl = statement.selectFirst(".sample-tests");
        if (sampleTestsEl != null) {
            Elements inputs = sampleTestsEl.select(".input pre");
            Elements outputs = sampleTestsEl.select(".output pre");
            for (int i = 0; i < inputs.size() && i < outputs.size(); i++) {
                Map<String, String> test = new HashMap<>();
                test.put("input", getPreText(inputs.get(i)));
                test.put("output", getPreText(outputs.get(i)));
                tests.add(test);
            }
        }
        
        return Question.builder()
                .isCodingProblem(true)
                .problemTitle(title)
                .problemDescription(desc.toString())
                .inputSpecification(inputSpec)
                .outputSpecification(outputSpec)
                .timeLimit(timeLimit)
                .memoryLimit(memoryLimit)
                .note(note)
                .sampleTestsJson(objectMapper.writeValueAsString(tests))
                .questionText("Solve the competitive coding problem: " + title)
                .build();
    }

    private String getPreText(Element pre) {
        if (pre == null) return "";
        Elements lines = pre.select(".test-example-line");
        if (!lines.isEmpty()) {
            return lines.stream().map(Element::text).collect(Collectors.joining("\n"));
        }
        return pre.wholeText().trim();
    }

    private Question getFallbackQuestion(String interviewId, String userId, int questionNum, Interview.Difficulty difficulty) {
        log.info("Loading offline Codeforces problem fallback for difficulty: {}", difficulty);
        
        Random rand = new Random();
        int choice = rand.nextInt(3); // Pick from 3 pool options dynamically
        
        String title, desc, input, output, time, memory, note;
        List<Map<String, String>> tests = new ArrayList<>();
        
        if (difficulty == Interview.Difficulty.EASY) {
            if (choice == 0) {
                title = "A. Watermelon";
                desc = "<p>One hot summer day Pete and his friend Billy decided to buy a watermelon. They chose the biggest and the ripest one, in their opinion. After that the watermelon was weighed, and the scales showed <i>w</i> kilos. Pete and Billy are great fans of even numbers, that's why they want to divide the watermelon in such a way that each of the two parts weighs even number of kilos, at the same time it is not obligatory that the parts are equal.</p>";
                input = "<p>The first (and the only) input line contains integer number <i>w</i> (1 ≤ <i>w</i> ≤ 100) — the weight of the watermelon bought by the boys.</p>";
                output = "<p>Print <span class=\"tex-font-style-tt\">YES</span>, if the boys can divide the watermelon into two parts, each of them weighing even number of kilos; and <span class=\"tex-font-style-tt\">NO</span> in the opposite case.</p>";
                time = "time limit per test: 1 second";
                memory = "memory limit per test: 256 megabytes";
                note = "<p>For example, the boys can divide the watermelon into two parts of 2 and 6 kilos respectively.</p>";
                
                Map<String, String> t = new HashMap<>();
                t.put("input", "8");
                t.put("output", "YES");
                tests.add(t);
            } else if (choice == 1) {
                title = "A. Way Too Long Words";
                desc = "<p>Sometimes some words like \"localization\" or \"internationalization\" are so long that writing them many times in one text is quite tiresome. Let's consider a word too long, if its length is strictly more than 10 characters. All too long words should be replaced with a special abbreviation. This abbreviation is made like this: we write down the first and the last letter of a word and between them we write the number of characters between the first and the last letters.</p>";
                input = "<p>The first line contains an integer <i>n</i> (1 ≤ <i>n</i> ≤ 100). Each of the following <i>n</i> lines contains one word.</p>";
                output = "<p>Print <i>n</i> lines. The <i>i</i>-th line should contain the result of replacing of the <i>i</i>-th word from the input data.</p>";
                time = "time limit per test: 1 second";
                memory = "memory limit per test: 256 megabytes";
                note = "";
                
                Map<String, String> t = new HashMap<>();
                t.put("input", "4\nword\nlocalization\ninternationalization\npneumonoultramicroscopicsilicovolcanoconiosis");
                t.put("output", "word\nl10n\ni18n\np43s");
                tests.add(t);
            } else {
                title = "A. Team";
                desc = "<p>One day three best friends Petya, Vasya and Tonya decided to form a team and take part in programming contests. The friends decided that they will implement a problem if at least two of them are sure about the solution. Otherwise, they won't write the problem's solution.</p>";
                input = "<p>The first input line contains a single integer <i>n</i> (1 ≤ <i>n</i> ≤ 1000) — the number of problems in the contest. Then <i>n</i> lines contain three integers each, each integer is either 0 or 1.</p>";
                output = "<p>Print a single integer — the number of problems the friends will implement on the contest.</p>";
                time = "time limit per test: 2 seconds";
                memory = "memory limit per test: 256 megabytes";
                note = "";
                
                Map<String, String> t = new HashMap<>();
                t.put("input", "3\n1 1 0\n1 1 1\n1 0 0");
                t.put("output", "2");
                tests.add(t);
            }
        } else if (difficulty == Interview.Difficulty.HARD) {
            if (choice == 0) {
                title = "D. Xenia and Bit Operations";
                desc = "<p>Xenia the beginner programmer has a sequence <i>a</i>, consisting of 2<sup><i>n</i></sup> non-negative integers: <i>a</i><sub>1</sub>, <i>a</i><sub>2</sub>, ..., <i>a</i><sub>2<sup><i>n</i></sup></sub>. Xenia is currently studying bit operations. She writes down a new sequence, which consists of 2<sup><i>n</i> - 1</sup> integers. The <i>i</i>-th integer of the new sequence is obtained by performing the OR operation on elements <i>a</i><sub>2<i>i</i> - 1</sub> and <i>a</i><sub>2<i>i</i></sub>. She performs this step repeatedly: OR in the first step, XOR in the second step, OR in the third, and so on, until she has a sequence of length 1. Xenia wants to handle updates: given a query to change value of <i>a</i><sub><i>p</i></sub> to <i>b</i>, she needs to find the final remaining single value in the sequence.</p>";
                input = "<p>The first line contains two integers <i>n</i> and <i>m</i> (1 ≤ <i>n</i> ≤ 17, 1 ≤ <i>m</i> ≤ 10<sup>5</sup>). The next line contains 2<sup><i>n</i></sup> integers. Each of the next <i>m</i> lines contains query description: index <i>p</i> and value <i>b</i>.</p>";
                output = "<p>For each query, print the final value of the sequence in a separate line.</p>";
                time = "time limit per test: 2 seconds";
                memory = "memory limit per test: 256 megabytes";
                note = "<p>Initial sequence is: [1, 2, 3, 4]. After query 1, <i>a</i><sub>1</sub> becomes 2, sequence becomes: [2, 2, 3, 4]. OR step: [2|2, 3|4] = [2, 7]. XOR step: [2^7] = 5.</p>";
                
                Map<String, String> t = new HashMap<>();
                t.put("input", "2 4\n1 6 3 5\n1 4\n3 5\n1 2\n1 0");
                t.put("output", "1\n3\n3\n3");
                tests.add(t);
            } else if (choice == 1) {
                title = "C. Given Length and Sum of Digits...";
                desc = "<p>You have a positive integer <i>m</i> and a non-negative integer <i>s</i>. Your task is to find the minimum and the maximum non-negative integers that have length <i>m</i> and sum of digits <i>s</i>. The required numbers should be in decimal notation, without leading zeroes.</p>";
                input = "<p>The single line contains two integers <i>m</i> and <i>s</i> (1 ≤ <i>m</i> ≤ 100, 0 ≤ <i>s</i> ≤ 900) — the length and the sum of the digits of the required numbers.</p>";
                output = "<p>Print the minimum and the maximum numbers. If there is no such number, print \"-1 -1\" (without the quotes).</p>";
                time = "time limit per test: 1 second";
                memory = "memory limit per test: 256 megabytes";
                note = "";
                
                Map<String, String> t = new HashMap<>();
                t.put("input", "2 15");
                t.put("output", "69 96");
                tests.add(t);
            } else {
                title = "C. Registration System";
                desc = "<p>A new e-mail service \"New-mail\" is starting in Berland. In order to register, each user must submit a request with a username. If this name does not exist in the database yet, it is inserted and the user gets a response OK. If the name already exists, the system adds a number suffix (1, 2, ...) to the name and prompts OK with the new username.</p>";
                input = "<p>The first line contains number <i>n</i> (1 ≤ <i>n</i> ≤ 10<sup>5</sup>). The following <i>n</i> lines contain user registration requests.</p>";
                output = "<p>Print <i>n</i> lines. Each line contains the system response to the corresponding request.</p>";
                time = "time limit per test: 5 seconds";
                memory = "memory limit per test: 256 megabytes";
                note = "";
                
                Map<String, String> t = new HashMap<>();
                t.put("input", "4\nfirst\nfirst\nsecond\nfirst");
                t.put("output", "OK\nfirst1\nOK\nfirst2");
                tests.add(t);
            }
        } else {
            if (choice == 0) {
                title = "A. Cut Ribbon";
                desc = "<p>Polycarpus has a ribbon of length <i>n</i>. He wants to cut the ribbon in a way that fulfils the following two conditions:</p><ul><li>After the cutting each ribbon piece should have length <i>a</i>, <i>b</i> or <i>c</i>.</li><li>The number of ribbon pieces after the cutting should be maximized.</li></ul><p>Help Polycarpus and find the number of ribbon pieces after the required cutting.</p>";
                input = "<p>The first line contains four integers <i>n</i>, <i>a</i>, <i>b</i> and <i>c</i> (1 ≤ <i>n</i>, <i>a</i>, <i>b</i>, <i>c</i> ≤ 4000) — the length of the original ribbon and the acceptable lengths of the pieces.</p>";
                output = "<p>Print a single integer — the maximum possible number of ribbon pieces.</p>";
                time = "time limit per test: 1 second";
                memory = "memory limit per test: 256 megabytes";
                note = "<p>In the first sample, Polycarpus can cut the ribbon into two pieces of length 2 and one piece of length 1 (2 + 2 + 1 = 5).</p>";
                
                Map<String, String> t = new HashMap<>();
                t.put("input", "5 5 3 2");
                t.put("output", "2");
                tests.add(t);
            } else if (choice == 1) {
                title = "B. Queue at the School";
                desc = "<p>During the break the school children, boys and girls, formed a queue of size <i>n</i>. Let's say that the positions in the queue are numbered 1 to <i>n</i> from left to right. If a boy stands in position <i>i</i> and a girl stands in position <i>i+1</i>, they exchange places. This repeats every second. Find the state of the queue after <i>t</i> seconds.</p>";
                input = "<p>The first line contains two integers <i>n</i> and <i>t</i> (1 ≤ <i>n</i>, <i>t</i> ≤ 50). The second line contains a string representing the initial queue.</p>";
                output = "<p>Print a string representing the queue after <i>t</i> seconds.</p>";
                time = "time limit per test: 2 seconds";
                memory = "memory limit per test: 256 megabytes";
                note = "";
                
                Map<String, String> t = new HashMap<>();
                t.put("input", "5 1\nBGGBG");
                t.put("output", "GBGGB");
                tests.add(t);
            } else {
                title = "A. Beautiful Matrix";
                desc = "<p>You've got a 5 × 5 matrix, consisting of 24 zeroes and a single number one. Let's index the matrix rows by numbers from 1 to 5 from top to bottom, and the matrix columns by numbers from 1 to 5 from left to right. In one move, you are allowed to swap two neighboring rows or swap two neighboring columns. You want to make the number one occupy the middle cell (3, 3).</p>";
                input = "<p>The input consists of five lines, each line contains five integers.</p>";
                output = "<p>Print a single integer — the minimum number of moves needed to make the matrix beautiful.</p>";
                time = "time limit per test: 2 seconds";
                memory = "memory limit per test: 256 megabytes";
                note = "";
                
                Map<String, String> t = new HashMap<>();
                t.put("input", "0 0 0 0 0\n0 0 0 0 1\n0 0 0 0 0\n0 0 0 0 0\n0 0 0 0 0");
                t.put("output", "3");
                tests.add(t);
            }
        }
        
        String testJson = "";
        try {
            testJson = objectMapper.writeValueAsString(tests);
        } catch (Exception ignored) {}
        
        return Question.builder()
                .interviewId(interviewId)
                .userId(userId)
                .questionNumber(questionNum)
                .questionType("CODING")
                .difficulty(difficulty)
                .isCodingProblem(true)
                .problemTitle(title)
                .problemDescription(desc)
                .inputSpecification(input)
                .outputSpecification(output)
                .timeLimit(time)
                .memoryLimit(memory)
                .note(note)
                .sampleTestsJson(testJson)
                .questionText("Solve the competitive coding problem: " + title)
                .build();
    }
}
