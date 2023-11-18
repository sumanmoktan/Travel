const path = require('path');
const express = require('express');
const morgan = require('morgan');
const ratelimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');


const appError = require('./utils/appError');
const globalError = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewsRoute');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'))

// 1) Global MIDDLEWARES
//serving static files
app.use(express.static(path.join(__dirname, 'public')));
// set security measure 
if (process.env.NODE_ENV === 'production'){
  app.use(helmet());

}
 

 //Developmet logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Limit the request from same api
const limiter = ratelimit({
  max:100,
  window: 60*60*100,
  message:"To many request from this ip, please try again in an hour"
});
app.use('/api', limiter)

//body parser, reading the data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

//Data sanitization against Nosql query injection
app.use(mongoSanitize());

//Data sanitization against xss 
app.use(xss());

//prevent from parameter pollution
app.use(hpp({
  whitelist:['duration', 'maxGroupSize', 'difficulty', 'ratingsAverage', 'ratingsQuantity', 'price']
}));



//test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// 3) ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  
  // const err = new Error(`can't find ${req.originalUrl} in this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new appError(`can't find ${req.originalUrl} in this server!`, 404));
});


app.use(globalError);

module.exports = app;
