import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import interviewService from '../../services/interviewService';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { Spinner } from '../../components/common/Loader';
import Editor from '@monaco-editor/react';
import {
  Timer,
  Video,
  Mic,
  ArrowRight,
  Sparkles,
  CheckCircle,
  HelpCircle,
  VideoOff,
  AlertTriangle,
  Code2,
  Play,
  Terminal,
  Cpu,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const InterviewScreen = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [compiling, setCompiling] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [executionResult, setExecutionResult] = useState(null);
  const [sampleTestResults, setSampleTestResults] = useState(null);
  const [runningTests, setRunningTests] = useState(false);

  // Timer states
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const fetchActiveInterviewAndQuestion = async () => {
    try {
      setLoading(true);
      const active = await interviewService.getCurrentInterview();
      if (!active) {
        showToast('No active interview found. Please start a new one.', 'warning');
        navigate('/interview/select');
        return;
      }
      setInterview(active);

      // Get current question
      const nextQ = await interviewService.getNextQuestion(active.id);
      setQuestion(nextQ);
      if (active.domain === 'CODEFORCES') {
        setAnswer(`#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your C++ code here\n    return 0;\n}\n`);
      } else {
        setAnswer('');
      }
      setElapsedTime(0);
    } catch (err) {
      console.error('Error bootstrapping interview screen:', err);
      showToast('Could not load current interview step.', 'error');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      if (streamRef.current) {
        stopCamera();
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Failed to acquire webcam stream:", err);
      showToast("Could not access camera. Please verify permission settings.", "warning");
      setCameraOn(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (cameraOn && !loading) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [cameraOn, loading]);

  useEffect(() => {
    fetchActiveInterviewAndQuestion();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Setup Timer increment
  useEffect(() => {
    if (question && !submitting && !loading) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [question, submitting, loading]);

  const handleRunCustomCode = async () => {
    if (compiling) return;
    setCompiling(true);
    setExecutionResult(null);
    setSampleTestResults(null);
    try {
      const res = await interviewService.compileAndRun(answer, customInput);
      setExecutionResult(res);
      showToast('Execution finished!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to run code.', 'error');
    } finally {
      setCompiling(false);
    }
  };

  const handleRunSampleTests = async () => {
    if (compiling || runningTests) return;
    setRunningTests(true);
    setExecutionResult(null);
    setSampleTestResults(null);
    try {
      let tests = [];
      if (question?.sampleTestsJson) {
        tests = JSON.parse(question.sampleTestsJson);
      }
      
      const results = [];
      for (let i = 0; i < tests.length; i++) {
        const test = tests[i];
        const res = await interviewService.compileAndRun(answer, test.input);
        if (!res.compiled) {
          results.push({
            passed: false,
            error: true,
            msg: res.compilerMessage || 'Compilation Error',
            input: test.input,
            expected: test.output,
            actual: ''
          });
          break;
        }
        
        const actual = res.stdout ? res.stdout.trim() : '';
        const expected = test.output ? test.output.trim() : '';
        const passed = actual.replaceAll('\r\n', '\n') === expected.replaceAll('\r\n', '\n');
        
        results.push({
          passed,
          error: false,
          timeMs: res.timeMs,
          timeout: res.timeout,
          exitCode: res.exitCode,
          input: test.input,
          expected,
          actual,
          stderr: res.stderr
        });
      }
      setSampleTestResults(results);
      showToast('Sample test runs complete!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to run sample tests.', 'error');
    } finally {
      setRunningTests(false);
    }
  };

  const handleAnswerSubmit = async () => {
    const cleanAnswer = answer.trim();
    if (!cleanAnswer) {
      showToast('Please type an answer before submitting.', 'warning');
      return;
    }
    if (cleanAnswer.length < 15) {
      showToast('Your answer seems too short. Elaborate a bit more.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Submit current answer
      await interviewService.submitAnswer(
        interview.id,
        question.id,
        cleanAnswer,
        elapsedTime
      );

      showToast(`Answer to question ${question.questionNumber} submitted!`, 'success');
      
      const currentCompleted = (interview.completedQuestions || 0) + 1;
      const totalQs = interview.totalQuestions;

      if (currentCompleted < totalQs) {
        // 2. Load next question
        const updatedInterview = await interviewService.getCurrentInterview();
        setInterview(updatedInterview);

        const nextQ = await interviewService.getNextQuestion(updatedInterview.id);
        setQuestion(nextQ);
        if (updatedInterview.domain === 'CODEFORCES') {
          setAnswer(`#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your C++ code here\n    return 0;\n}\n`);
        } else {
          setAnswer('');
        }
        setElapsedTime(0);
      } else {
        // 3. End interview
        showToast('Final question submitted! Evaluating entire interview...', 'info');
        await interviewService.endInterview(interview.id);
        showToast('Evaluation complete!', 'success');
        navigate(`/interview/result/${interview.id}`);
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      showToast(err.response?.data?.message || 'Failed to submit answer. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAbandonInterview = async () => {
    if (!window.confirm('Are you sure you want to end this interview now? Unfinished questions will receive a score of zero.')) return;
    setSubmitting(true);
    try {
      await interviewService.endInterview(interview.id);
      showToast('Interview ended early. Let\'s see the feedback.', 'info');
      navigate(`/interview/result/${interview.id}`);
    } catch (err) {
      showToast('Failed to end interview.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-xs font-semibold text-text-muted">Loading active proctoring screen...</p>
      </div>
    );
  }

  const completedCount = interview?.completedQuestions || 0;
  const totalCount = interview?.totalQuestions || 5;
  const progressPercent = (completedCount / totalCount) * 100;

  return (
    <div className="space-y-6">
      {/* Top Progress bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-text-main flex items-center gap-2">
            AI Practice Interview: <span className="text-primary">{interview?.domain}</span>
          </h2>
          <p className="text-xs text-text-muted mt-1 uppercase font-bold tracking-wider">
            Difficulty: {interview?.difficulty} &bull; Practice Progress: {completedCount} of {totalCount} Questions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-xl text-primary font-mono text-sm font-bold">
            <Timer className="h-4 w-4" />
            <span>{formatTime(elapsedTime)}</span>
          </div>
          <Button variant="dangerOutline" size="sm" onClick={handleAbandonInterview}>
            End Practice Early
          </Button>
        </div>
      </div>

      <div className="w-full bg-border-base/40 h-2 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Workspace Split */}
      {interview?.domain === 'CODEFORCES' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[600px]">
          {/* Left panel: Problem description */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            <Card className="flex-1 flex flex-col overflow-y-auto max-h-[70vh] p-6 space-y-6 border-2 border-border-base bg-bg-card shadow-sm">
              <div className="border-b border-border-base pb-4">
                <h3 className="text-lg font-black text-text-main flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-primary" />
                  {question?.problemTitle || 'Coding Challenge'}
                </h3>
                <div className="flex flex-wrap gap-2.5 mt-3 text-[10px] font-mono text-text-muted">
                  <span className="bg-primary/5 border border-primary/20 px-2 py-0.5 rounded-md font-bold">
                    {question?.timeLimit || 'Time Limit: 1s'}
                  </span>
                  <span className="bg-primary/5 border border-primary/20 px-2 py-0.5 rounded-md font-bold">
                    {question?.memoryLimit || 'Memory Limit: 256MB'}
                  </span>
                </div>
              </div>

              {/* Problem Description */}
              <div className="space-y-3 text-xs leading-relaxed text-text-main">
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Problem Statement</h4>
                <div 
                  className="prose prose-sm dark:prose-invert max-w-none text-text-main"
                  dangerouslySetInnerHTML={{ __html: question?.problemDescription || '' }}
                />
              </div>

              {/* Input Specs */}
              {question?.inputSpecification && (
                <div className="space-y-2 text-xs leading-relaxed border-t border-border-base/50 pt-4">
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Input Format</h4>
                  <div dangerouslySetInnerHTML={{ __html: question.inputSpecification }} />
                </div>
              )}

              {/* Output Specs */}
              {question?.outputSpecification && (
                <div className="space-y-2 text-xs leading-relaxed border-t border-border-base/50 pt-4">
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Output Format</h4>
                  <div dangerouslySetInnerHTML={{ __html: question.outputSpecification }} />
                </div>
              )}

              {/* Examples */}
              {question?.sampleTestsJson && (
                <div className="space-y-4 border-t border-border-base/50 pt-4">
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Sample Cases</h4>
                  {(() => {
                    try {
                      const tests = JSON.parse(question.sampleTestsJson);
                      return tests.map((test, index) => (
                        <div key={index} className="space-y-2 border border-border-base rounded-xl p-3 bg-bg-base/40">
                          <p className="text-[10px] font-bold text-primary">Sample Case #{index + 1}</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-[9px] font-bold uppercase text-text-muted block mb-1">Input</span>
                              <pre className="p-2 bg-slate-950 text-slate-100 rounded-lg text-[10px] font-mono whitespace-pre-wrap overflow-x-auto select-all">
                                {test.input}
                              </pre>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold uppercase text-text-muted block mb-1">Expected Output</span>
                              <pre className="p-2 bg-slate-950 text-slate-100 rounded-lg text-[10px] font-mono whitespace-pre-wrap overflow-x-auto select-all">
                                {test.output}
                              </pre>
                            </div>
                          </div>
                        </div>
                      ));
                    } catch (e) {
                      return <p className="text-xs text-rose-500">Failed to render sample tests.</p>;
                    }
                  })()}
                </div>
              )}

              {/* Note */}
              {question?.note && (
                <div className="space-y-2 text-xs leading-relaxed border-t border-border-base/50 pt-4 text-text-muted italic">
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider not-italic">Note</h4>
                  <div dangerouslySetInnerHTML={{ __html: question.note }} />
                </div>
              )}
            </Card>
          </div>

          {/* Right panel: Editor and compiler tools */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            <Card className="flex-1 flex flex-col p-4 border-2 border-border-base bg-[#1e1e1e] text-slate-200">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <span className="text-xs font-bold font-mono text-slate-400 flex items-center gap-1.5">
                  <Code2 className="h-4 w-4 text-primary" /> solution.cpp
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono font-semibold">
                  C++ (GCC 6.3)
                </span>
              </div>

              {/* Editor Workspace */}
              <div className="flex-1 min-h-[350px] mt-3 rounded-lg overflow-hidden border border-slate-800">
                <Editor
                  height="380px"
                  language="cpp"
                  theme="vs-dark"
                  value={answer}
                  onChange={(val) => setAnswer(val || '')}
                  options={{
                    fontSize: 13,
                    fontFamily: 'Fira Code, Consolas, Courier New, monospace',
                    minimap: { enabled: false },
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    padding: { top: 12, bottom: 12 },
                    lineHeight: 20
                  }}
                />
              </div>

              {/* Run Actions and Output Drawer */}
              <div className="mt-4 border-t border-slate-800 pt-4 space-y-4">
                {/* Custom input box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Custom StdIn Input</label>
                    <textarea
                      rows={2}
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="Type custom inputs to test your solution..."
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-primary/50"
                    />
                  </div>
                  
                  {/* Compilation / execution output summary */}
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Terminal className="h-3.5 w-3.5" /> Compiler Console
                    </label>
                    <div className="flex-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-mono overflow-y-auto max-h-[100px] text-slate-300">
                      {compiling || runningTests ? (
                        <span className="text-amber-500 animate-pulse">Running compilation checks on server...</span>
                      ) : executionResult ? (
                        <div className="space-y-1">
                          {!executionResult.compiled ? (
                            <span className="text-rose-500 font-bold">Compilation Failed:<br/>{executionResult.compilerMessage}</span>
                          ) : (
                            <>
                              <div className="flex justify-between text-slate-400 border-b border-slate-800 pb-1 mb-1">
                                <span>Status: {executionResult.timeout ? 'Time Limit Exceeded' : (executionResult.exitCode === 0 ? 'Success' : 'Runtime Error')}</span>
                                <span>Time: {executionResult.timeMs}ms</span>
                              </div>
                              {executionResult.stdout && <div><span className="text-emerald-500">Output:</span><pre className="mt-0.5 text-slate-200 whitespace-pre">{executionResult.stdout}</pre></div>}
                              {executionResult.stderr && <div><span className="text-rose-500">Stderr:</span><pre className="mt-0.5 text-rose-300 whitespace-pre">{executionResult.stderr}</pre></div>}
                            </>
                          )}
                        </div>
                      ) : sampleTestResults ? (
                        <div className="space-y-2">
                          <span className="text-primary font-bold">Sample Case Check Outputs:</span>
                          {sampleTestResults.map((res, idx) => (
                            <div key={idx} className="border-t border-slate-900 pt-1.5">
                              <span className="font-bold flex items-center gap-1">
                                Case #{idx + 1}: {res.error ? (
                                  <span className="text-rose-500 flex items-center gap-0.5"><XCircle className="h-3 w-3" /> Compile Error</span>
                                ) : res.passed ? (
                                  <span className="text-emerald-500 flex items-center gap-0.5"><CheckCircle2 className="h-3 w-3" /> Passed ({res.timeMs}ms)</span>
                                ) : (
                                  <span className="text-rose-500 flex items-center gap-0.5"><XCircle className="h-3 w-3" /> Failed</span>
                                )}
                              </span>
                              {!res.passed && !res.error && (
                                <div className="text-[9px] text-slate-400 pl-4 mt-0.5">
                                  Expected: "{res.expected}" | Got: "{res.actual}"
                                </div>
                              )}
                              {res.error && <pre className="text-[9px] text-rose-400 pl-4 whitespace-pre-wrap">{res.msg}</pre>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-600">Console idle. Run custom input or sample tests to verify logic.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions panel */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex gap-2">
                    <button
                      onClick={handleRunCustomCode}
                      disabled={compiling || runningTests}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Play className="h-3.5 w-3.5 text-primary" /> Run Custom StdIn
                    </button>
                    <button
                      onClick={handleRunSampleTests}
                      disabled={compiling || runningTests}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Cpu className="h-3.5 w-3.5 text-emerald-500" /> Run Sample Tests
                    </button>
                  </div>
                  
                  <Button
                    variant="primary"
                    onClick={handleAnswerSubmit}
                    loading={submitting}
                    disabled={compiling || runningTests}
                    iconRight={<ArrowRight className="h-4 w-4" />}
                  >
                    {completedCount + 1 === totalCount ? 'Submit & Evaluate Round' : 'Submit Code'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Area: Proctoring Webcam Mock */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-0 overflow-hidden relative border-2 border-border-base">
              <div className="aspect-[4/3] w-full bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
                {cameraOn ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* Proctoring overlays */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
                      <div className="h-48 w-48 rounded-full border-2 border-primary animate-ping absolute" />
                      <div className="h-32 w-32 rounded-full border border-indigo-400/40 animate-pulse absolute" />
                    </div>
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-slate-900/80 px-2.5 py-1 rounded-lg text-white font-mono text-[10px] z-10">
                      <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
                      <span>REC &bull; LIVE FEED</span>
                    </div>
                    {/* Scan line effect */}
                    <div className="absolute left-0 right-0 h-0.5 bg-primary/20 top-0 shadow-lg shadow-primary animate-[scan_3s_linear_infinite] pointer-events-none z-10" />
                    <style>{`
                      @keyframes scan {
                        0% { top: 0%; }
                        50% { top: 100%; }
                        100% { top: 0%; }
                      }
                    `}</style>
                  </>
                ) : (
                  <div className="text-center p-6 space-y-2">
                    <VideoOff className="h-12 w-12 text-rose-500 mx-auto" />
                    <p className="text-xs text-text-muted">Proctoring camera stream disabled</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-bg-card border-t border-border-base flex items-center justify-between">
                <span className="text-xs font-semibold text-text-muted flex items-center gap-1.5">
                  <Mic className="h-4 w-4 text-emerald-500 animate-pulse" /> Audio active &bull; Speak or type answers
                </span>
                <button
                  onClick={() => setCameraOn(!cameraOn)}
                  className="text-[10px] font-bold text-primary hover:underline"
                >
                  {cameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
                </button>
              </div>
            </Card>

            <Card title="Speech-to-Text Mock" subtitle="Simulated transcription feedback">
              <p className="text-xs text-text-muted leading-relaxed">
                PrepAI proctoring tool processes answers. For testing, copy/paste or write detailed structures in the workspace input box.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-[10px] text-text-muted">Proctoring system calibrated</span>
              </div>
            </Card>
          </div>

          {/* Right Area: Active Question and Input */}
          <div className="lg:col-span-2 space-y-6">
            <Card
              title={`Question ${question?.questionNumber || (completedCount + 1)} of ${totalCount}`}
              subtitle={question?.questionType || 'Technical Concept'}
            >
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-sm font-semibold text-text-main leading-relaxed mb-6">
                {question?.questionText}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-main block">Your Answer</label>
                <textarea
                  rows={8}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={submitting}
                  placeholder="Elaborate your technical solution, conceptual frameworks, or response here... (Minimum 15 characters)"
                  className="w-full p-4 text-sm rounded-xl border border-border-base bg-bg-base/50 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-text-muted/50 leading-relaxed font-sans"
                />
                <div className="flex justify-between text-[10px] text-text-muted font-semibold">
                  <span>Character Count: {answer.length}</span>
                  <span>Minimum recommended: 15</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex justify-end">
                <Button
                  variant="primary"
                  onClick={handleAnswerSubmit}
                  loading={submitting}
                  iconRight={<ArrowRight className="h-4 w-4" />}
                >
                  {completedCount + 1 === totalCount ? 'Submit & Complete Interview' : 'Submit Answer'}
                </Button>
              </div>
            </Card>

            {/* Quick instructions */}
            <div className="rounded-xl border border-border-base p-4 flex gap-3 bg-bg-card text-xs text-text-muted leading-relaxed">
              <HelpCircle className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="font-bold text-text-main mb-1">Practice Tips</p>
                <p>Try to formulate answers clearly, mentioning architecture details, complexity analysis (if coding), or business impacts (if behavioral). The AI rates grammatical clarity, depth of tech stack elements, and response speed.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewScreen;
