// Codex, GPT-5.5 High, OpenAI.
function authRequired(req, res, next) {
  if (!req.currentUser) {
    return res.redirect('/login');
  }

  next();
}

module.exports = authRequired;
//end: Codex, GPT-5.5 High, OpenAI.