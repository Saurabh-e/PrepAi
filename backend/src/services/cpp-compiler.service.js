const { spawn, exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const compileAndRun = async (sourceCode, input) => {
  const uuid = crypto.randomUUID();
  const isWindows = os.platform() === 'win32';
  const workingDir = path.resolve('temp_compile');
  
  // Ensure the temporary compilation folder exists
  await fs.mkdir(workingDir, { recursive: true });
  
  const sourceFileName = `Solution_${uuid}.cpp`;
  const exeFileName = `Solution_${uuid}${isWindows ? '.exe' : ''}`;
  
  const sourceFilePath = path.join(workingDir, sourceFileName);
  const exeFilePath = path.join(workingDir, exeFileName);
  
  try {
    // 1. Write source code to disk
    await fs.writeFile(sourceFilePath, sourceCode, 'utf8');
    
    // 2. Compile source code using g++
    const compileCmd = `g++ -O3 ${sourceFileName} -o ${exeFileName}`;
    
    const compileResult = await new Promise((resolve) => {
      exec(compileCmd, { cwd: workingDir, timeout: 10000 }, (error, stdout, stderr) => {
        if (error) {
          resolve({
            compiled: false,
            compilerMessage: stderr.trim() || stdout.trim() || error.message
          });
        } else {
          resolve({ compiled: true });
        }
      });
    });
    
    if (!compileResult.compiled) {
      return {
        compiled: false,
        compilerMessage: compileResult.compilerMessage,
        stdout: '',
        stderr: '',
        exitCode: 1,
        timeMs: 0,
        timeout: false
      };
    }
    
    // 3. Execute the compiled binary
    const runBinaryPath = isWindows ? exeFilePath : `./${exeFileName}`;
    const startTime = Date.now();
    
    const runResult = await new Promise((resolve) => {
      const child = spawn(runBinaryPath, [], { cwd: workingDir });
      
      let stdoutData = '';
      let stderrData = '';
      let timer = null;
      let didTimeout = false;
      
      // Set execution timeout (2 seconds)
      timer = setTimeout(() => {
        didTimeout = true;
        child.kill('SIGKILL');
      }, 2000);
      
      // Pipe input stream
      if (input) {
        child.stdin.write(input);
        child.stdin.end();
      }
      
      child.stdout.on('data', (data) => {
        stdoutData += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        stderrData += data.toString();
      });
      
      child.on('close', (code) => {
        clearTimeout(timer);
        const endTime = Date.now();
        const timeMs = endTime - startTime;
        
        if (didTimeout) {
          resolve({
            compiled: true,
            compilerMessage: '',
            stdout: '',
            stderr: 'Time Limit Exceeded (exceeded 2.0 seconds)',
            exitCode: -1,
            timeMs,
            timeout: true
          });
        } else {
          resolve({
            compiled: true,
            compilerMessage: '',
            stdout: stdoutData.trim(),
            stderr: stderrData.trim(),
            exitCode: code === null ? 0 : code,
            timeMs,
            timeout: false
          });
        }
      });
      
      child.on('error', (err) => {
        clearTimeout(timer);
        resolve({
          compiled: true,
          compilerMessage: `Runtime execution error: ${err.message}`,
          stdout: '',
          stderr: err.message,
          exitCode: -1,
          timeMs: Date.now() - startTime,
          timeout: false
        });
      });
    });
    
    return runResult;
    
  } catch (error) {
    console.error('Error during compilation/execution step:', error);
    return {
      compiled: false,
      compilerMessage: `System execution error: ${error.message}`,
      stdout: '',
      stderr: '',
      exitCode: -1,
      timeMs: 0,
      timeout: false
    };
  } finally {
    // 4. Cleanup temp files
    try {
      await fs.unlink(sourceFilePath).catch(() => {});
      await fs.unlink(exeFilePath).catch(() => {});
    } catch (cleanupError) {
      console.warn('Failed to delete temp compilation files:', cleanupError.message);
    }
  }
};

module.exports = {
  compileAndRun
};
