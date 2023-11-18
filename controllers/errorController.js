const appError = require('./../utils/appError');

//this handle the casterror in the invalid id 
const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new appError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new appError(message, 400);
};
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new appError(message, 400);
};

const handleJWTError = () => new appError('Invalid token! please log in again!', 401);

const handleJWTExpireError = () => new appError('Token Expire. please log in agin', 401);

const sendErrorDev = (err, req, res) =>{
  //api
  if(req.originalUrl.startsWith('/api')){
    res.status(err.statusCode).json({
      status:err.status,
      error: err,
      message:err.message,
      stack:err.stack
    });
  } else {
    //Rendering websit
    res.status(err.statusCode).render('error', {
      title:'something went wrong',
      msg: err.message
    });

  }
 
  
};

const sendErrorProd = (err,req, res) =>{
  // api
  if(req.originalUrl.startsWith('/api')){
    //Operational, trusted Error: send the message to client
    if(err.isOperational){
      return res.status(err.statusCode).json({
        status:err.status,
        message:err.message
      
      });
    // Programming or other unknown error: don't leak error details
  }else{
      // 1) Log error
      console.error('ERROR 💥', err);
      // 2) Send generic message
      return res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!'
      });

  }
} else {
  //Rendering website
  if(err.isOperational){
    return res.status(err.statusCode).render('error', {
      title:'something went wrong',
      msg: err.message
    });

    // Programming or other unknown error: don't leak error details
  }else{
    // 1) Log error
    console.error('ERROR 💥', err);
    // 2) Send generic message
    return res.status(err.statusCode).render('error', {
      title:'something went wrong',
      msg: "please try again"
    });


  }

}
};

module.exports=(err, req, res, next)=>{
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
      sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
      //d structing the err
      let error = { ...err };
      error.message= err.message;
  
      if (error.name === 'CastError') error = handleCastErrorDB(error);
      if (error.code === 11000) error = handleDuplicateFieldsDB(error);
      if (error.name === 'ValidationError')
        error = handleValidationErrorDB(error);
      if (error.name === 'JsonWebTokenError') error = handleJWTError();
      if (error.name === 'TokenExpiredError') error = handleJWTExpireError();
  
      sendErrorProd(error, req, res);
    }
  };

