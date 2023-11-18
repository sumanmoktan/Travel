import '@babel/polyfill';
import {login, logout, signup} from './login';
import {updateSetting} from './updateSetting';
import {bookTour} from './stripe';

//Dom element
const loginForm = document.querySelector('.form');
const logoutBtn = document.querySelector('.nav__el--logout');
const signupBtn = document.querySelector('.signup');
const updateFormData = document.querySelector('.form-user-data');
const updatePasswordData = document.querySelector('.form-user-settings');
const bookBtn = document.getElementById('book-tour')

//values



if(loginForm)
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });

if(logoutBtn) logoutBtn.addEventListener('click', logout);

if(signupBtn)
    signupBtn.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;
        signup(name, email, password, passwordConfirm);
});


if(updateFormData)
    updateFormData.addEventListener('submit', e =>{
        e.preventDefault();
        const form = new FormData()
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);
        updateSetting(form, 'data');
    })

if(updatePasswordData)
    updatePasswordData.addEventListener('submit', async e =>{
        e.preventDefault();
        document.querySelector('.btn--save-password').textContent='updating...';


        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        await updateSetting({passwordCurrent, password, passwordConfirm}, 'password');

        document.querySelector('.btn--save-password').textContent='save password';
        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
});

if(bookBtn){
    bookBtn.addEventListener('click', e=>{
        e.target.textContent= 'processing...'
        const {tourId} = e.target.dataset;
        bookTour(tourId);
    })
}

   

