const Tour = require('./../models/tourModel');
const Booking = require('./../models/bookingModel');
const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');


exports.getOverview =catchAsync(async (req, res, next) =>{
    const tours = await Tour.find();
    res.status(200).render('overview', {
      title: 'All tour',
      tours
    });
});

exports.getTour = catchAsync(async(req, res, next)=>{
  // 1) Get data, for the requested tour including review and guide
  const tour = await Tour.findOne({slug:req.params.slug}).populate({
    path: 'reviews',
    fields: 'review rating user'
  })

  if(!tour){
    return next(new appError('There is no Tour with this name ', 404));
  }
    res.status(200).render('tour', {
      title: `${tour.name} tour`,
      tour
    });
  });

exports.getLoginForm = (req, res, next) =>{
  res.status(200)
  .render('login', {
    title:'login your account respectively'
  });
};

exports.getSignupForm = (req, res, next) => {
  res.status(200).render('signup', {
    title: 'signup to create your account'
  });
};

exports.getAccount =(req, res, next)=>{
  res.status(200)
  .render('account', {
    title:'Your Account'
  });
};

exports.getMyTours = catchAsync(async(req, res, next) => {
  //find all booking
  const bookings= await Booking.find({user: req.user.id});
  //find tours with return id
  const tourIDs= bookings.map(el => el.tour);
  const tours = await Tour.find({_id: {$in: tourIDs}});

  res.status(200).render('overview', {
    title : 'My Tour',
    tours
  });

});

exports.getMyTourReview = catchAsync(async(req, res, next) => {
  //find all booking
  const reviews= await Review.find({user: req.user.id});
  //find tours with return id
  const tourid= reviews.map(el => el.tour);
  const tours = await Tour.find({_id: {$in: tourid}});

  res.status(200).render('overview', {
    title : 'My Tour',
    tours
  });

});


exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser
  });
});

