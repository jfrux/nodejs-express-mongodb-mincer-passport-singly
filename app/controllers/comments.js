var mongoose = require('mongoose')
  , Comment = mongoose.model('Comment')

exports.create = function (req, res) {
  var comment = new Comment(req.body)
    , project = req.project

  comment._user = req.user

  comment.save(function (err) {
    if (err) throw new Error('Error while saving comment')
    project.comments.push(comment._id)
    project.save(function (err) {
      if (err) throw new Error('Error while saving project')
      res.redirect('/projects/'+project.id+'#comments')
    })
  })
}
