const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const Email = require('./../utils/email')
const crypto= require('crypto');

const signToken = id =>{
    return jwt.sign({ id }, process.env.JWT_SCREATE, {
        expiresIn:process.env.JWT_EXPIRES_IN
    })
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    const cookieOption = {
        expires: new Date(Date.now() + process.env.JWT_COOKIES_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly:true
    }
    if(process.env.NODE_ENV === 'production') cookieOption.secure = true;
    res.cookie('jwt', token, cookieOption);

    //remove password form outpur
    user.password = undefined;

    res.status(statusCode).json({
        status:'success',
        token,
        data: {
            user
        }
    });
}

exports.signup = catchAsync(async(req, res, next)=>{
    const newUser= await User.create(req.body);
    const url= `${req.protocol}://${req.get('host')}/me`;
    await new Email(newUser, url).sendWelcome();

    //Generating a token respectively
    createSendToken(newUser, 201, res);
    // const token = signToken(newUser._id) 

    // res.status(201).json({
    //     status:'success',
    //     token,
    //     data: {
    //         user:newUser
    //     }
    // });
});


exports.login = catchAsync(async(req, res, next)=>{
    const {email, password} = req.body;


    //1) check if email and password exist
    if(!email || !password){
        return next(new appError("please provide your email and password", 400));
    }

    //2) check if user exists and password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))){
        return next( new appError("Incorrect email or password respectively", 401));
    }

    //3) if everything is ok, send token to client 
    createSendToken (user, 200, res);
    // const token= signToken(user._id);

    // res.status(200).json({
    //     status:'success',
    //     token
    // })
});

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });
    res.status(200).json({ status: 'success' });
  };

exports.protect = catchAsync(async(req, res, next)=>{
    //1)Getting token and checking of its there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt){
        token = req.cookies.jwt;
    }
    

    if(!token){
        return next(new appError('you are not login! please login to access it', 401));
    }

    //2)verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SCREATE);

    //3)check if user still exists
    const freshUser = await User.findById(decoded.id);
    if(!freshUser){
        return next(new appError('The user belonging to this token does no longer exists', 401));
    }

    //4)check if user change a password after token was issued
    if (freshUser.changedPasswordAfter(decoded.iat)){
        return next(new appError('User recently change a password. please log in again',401));
    }
    //GRANT ACCESS TO PROTECTED ROUTE
    req.user = freshUser; 
    res.locals.user = freshUser; 
    next();
});

// Only for rendered pages, no errors!
exports.isLoggedIn = async(req, res, next)=>{
  //1)Getting token and checking of its there
  if (req.cookies.jwt){
    try{
    const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SCREATE);

  //3)check if user still exists
    const freshUser = await User.findById(decoded.id);
    if(!freshUser){
        return next();
    }

  //4)check if user change a password after token was issued
    if (freshUser.changedPasswordAfter(decoded.iat)){
        return next();
    }

  //GRANT ACCESS TO PROTECTED ROUTE
  res.locals.user = freshUser; 
  return next();
  }catch(err){
    return next()
  }
}
  next();
};



exports.restrictTo = (...roles) => {
    return (req, res, next) => {
      // roles ['admin', 'lead-guide']. role='user'
      if (!roles.includes(req.user.role)) {
        return next(
          new appError('You do not have permission to perform this action', 403)
        );
      }
  
      next();
    };
  };


exports.forgotPassword = catchAsync(async(req, res, next) => {
    // 1) get user based on posted email
       const user = await User.findOne({email:req.body.email});
       if(!user){
        return next(new appError("There is no user with this email.", 404))
       }

    // 2) generate a random reset token
        const resetToken = user.createPasswordResetToken();
        await user.save({validateBeforeSave:false});   

    // 3) send it to user email
    try{
      const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
      await new Email(user, resetURL).sendPasswordReset();


      res.status(200).json({
          status:'success',
          message: 'token send to email'
      })

    } catch(err){
        user.passwordResetToken= undefined;
        user.passwordResetExpires = undefined
        await user.save({validateBeforeSave:false});   

        return next(new appError('there was an error sending email. try again later', 500));
    }
   
});
// exports.resetPassword =catchAsync( async(req, res, next) => {
//     //1) Get user based on the token
//     const hashToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

//     const user = await User.findOne({passwordResetToken: hashToken, passwordResetExpires:{$gt:Date.now()}});

//     //2) if token has not expire and there is a user , set new password
//     if (!user){
//         return next(new appError('Token is invalid or has expired', 400));
//     }
//     user.password = req.body.password,
//     user.passwordConfirm = req.body.passwordConfirm,
//     user.passwordResetToken = undefined;
//     user.passwordResetExpires = undefined;
//     await user.save();
//     //3) update changepasswordat property for the user
//     //4) log the user in , send jwt
//     const token= signToken(user._id);

//     res.status(200).json({
//         status:'success',
//         token
//     })

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on the token
    const hashToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
  
    const user = await User.findOne({
        passwordResetToken: hashToken,
        passwordResetExpires: { $gt: Date.now() }
    });
  
    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
      return next(new appError('Token is invalid or has expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
  
    // 3) Update changedPasswordAt property for the user
    // 4) Log the user in, send JWT
    createSendToken(user, 200, res);
    // const token= signToken(user._id);

    // res.status(200).json({
    //     status:'success',
    //     token
    // });
  });

exports.updatePassword =catchAsync(async (req, res, next) =>{
    //1) Get the user from collection
    const user = await User.findById(req.user.id).select('+password');
    //2) check if posted current password is correct
    if(!(await user.correctPassword(req.body.passwordCurrent, user.password))){
        return next(new appError('your current password is worng', 401));
    }
    //3) if so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    //4) log the user in, send jwt
    createSendToken(user, 200, res);
    // const token = signToken(user._id)
    // res.status(200).json({
    //     status:'success',
    //     token,
    //     data: {
    //         user
    //     }
    // })
});