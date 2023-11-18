const catchAsync = require('./../utils/catchAsync');
const Review = require('./../models/reviewModel');
const factory = require('./handlierFactory');



exports.getAllReview = factory.getAll(Review);
// exports.getAllReview = catchAsync(async(req, res, next)=>{
//     let filter = {}
//     if(req.params.id) filter = {tour: req.params.id}
//     const reviews = await Review.find(filter)

//     res.status(200).json({
//         status:'success',
//         result:reviews.length,
//         data: {
//             reviews
//         }
//     });
// });


exports.setTourUserIds = (req, res, next) =>{
    if(!req.body.tour) req.body.tour = req.params.id;
    if(!req.body.user) req.body.user = req.user.id;
    next();
};

// exports.createReview = catchAsync(async(req, res, next)=>{
//     // allowed nested routes
    
//     const newReview = await Review.create(req.body);

//     res.status(201).json({
//         status:'success',
//         data: {
//             newReview
//         }
//     });
// });
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);

// exports.deleteReview = catchAsync(async(req, res, next)=>{
//     const review = await Review.findByIdAndDelete(req.params.id);

//     if(!review)
//     {
//     return next(new appError("Review not found with this Id", 404))
//     }
        
//     res.status(204).json({
//     status: 'success',
//     data: null
//      });
// });