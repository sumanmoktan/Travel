/* eslint-disable */
import axios from "axios";
import { showAlert } from "./alert";

 export const login = async(email, password) => {
    try{
        const res = await axios({
            method: 'POST',
            url:'http://127.0.0.1:3000/api/v1/users/login',
            data: {
                email,
                password
            }
        });
        if(res.data.status === 'success') {
            showAlert('success','Logged in successfully');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }
    } catch(err){
        showAlert('error', err.response.data.message);     
    }
    
};

export const logout = async() =>{
    try{
        const res = await axios({
            method: 'GET',
            url:'http://127.0.0.1:3000/api/v1/users/logout',
    });

    if((res.data.status === 'success')) location.assign('/login');

    } catch(err) {
        showAlert('error', 'Error logout ! try again')
    }

};


export const signup = async(name, email, password, passwordConfirm) => {
    try{
        const res = await axios({
            method: 'POST',
            url:'http://127.0.0.1:3000/api/v1/users/signup',
            data: {
                name,
                email,
                password,
                passwordConfirm
            }
        });
        if(res.data.status === 'success') {
            showAlert('success','signup in successfully');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }
    } catch(err){
        showAlert('error', err.response.data.message);     
    }

};

