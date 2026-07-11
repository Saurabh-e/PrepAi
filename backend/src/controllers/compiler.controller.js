const cppCompilerService = require('../services/cpp-compiler.service');
const ApiResponse = require('../utils/api-response');

const compileAndRun = async (req, res, next) => {
  try {
    const { sourceCode, input } = req.body;
    if (!sourceCode) {
      return res.status(400).json(ApiResponse.error('Source code is required'));
    }
    const result = await cppCompilerService.compileAndRun(sourceCode, input);
    return res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  compileAndRun
};
