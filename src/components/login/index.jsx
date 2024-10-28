import { useFormik } from 'formik';
import React, { useState } from 'react';
import { signIn } from '../../validation/Validation';
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { PulseLoader } from 'react-spinners';
import { useDispatch } from 'react-redux';
import { loggedInUsers } from '../../features/slice/LoginSlice';
import { Link, useNavigate } from 'react-router-dom';

const LoginFormCom = ({ toast }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = getAuth();
  const [loading, setLoading] = useState(false);

  const initialValues = {
    email: "",
    password: ""
  };

  const formik = useFormik({
    initialValues,
    onSubmit: () => {
      signinUsers();
    },
    validationSchema: signIn
  });

  const signinUsers = () => {
    setLoading(true);
    signInWithEmailAndPassword(auth, formik.values.email, formik.values.password)
      .then(({ user }) => {
        if (user.emailVerified) {
          setLoading(false);
          dispatch(loggedInUsers(user));
          localStorage.setItem("user", JSON.stringify(user));
          navigate("/");
        } else {
          toast.error("Please verify your email", {
            position: "top-right",
            autoClose: 1000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
        }
        setLoading(false);
      })
      .catch((error) => {
        if (error.message.includes("auth/email-already-in-use")) {
          toast.error('Email or password is incorrect', {
            position: "top-right",
            autoClose: 1000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
        } else {
          toast.error('Login failed', {
            position: "top-right",
            autoClose: 1000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
        }
        setLoading(false);
      });
  };

  const handlePasswordReset = () => {
    if (!formik.values.email) {
      toast.error("Please enter your email to reset the password.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      return;
    }

    setLoading(true);
    sendPasswordResetEmail(auth, formik.values.email)
      .then(() => {
        toast.success("Password reset email sent. Check your inbox.", {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        setLoading(false);
      })
      .catch((error) => {
        toast.error("Failed to send reset email. Please try again.", {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        setLoading(false);
      });
  };

  return (
    <div>
      <h1 className='font-serif font-bold text-slate-900'>Login to your account</h1>
      <form onSubmit={formik.handleSubmit}>
        <input
          placeholder='Enter your email'
          className='w-full px-3 py-2 border border-state-400 rounded-md outline-none mb-3'
          name='email'
          value={formik.values.email}
          onChange={formik.handleChange}
          type='email'
        />
        {formik.errors.email && formik.touched.email && (
          <p className='font-serif text-red-600 mb-5'>{formik.errors.email}</p>
        )}

        <input
          placeholder='Enter your Password'
          className='w-full px-3 py-2 border border-state-400 rounded-md outline-none mb-3'
          name='password'
          value={formik.values.password}
          onChange={formik.handleChange}
          type='password'
        />
        {formik.errors.password && formik.touched.password && (
          <p className='font-serif text-red-600 mb-5'>{formik.errors.password}</p>
        )}

        <button
          // disabled={loading}
          type='submit'
          className='font-serif bg-slate-900 text-white text-base rounded-md w-full py-3'
        >
          {loading ? <PulseLoader color='white' /> : "Login"}
        </button>
      </form>

      <p className='font-serif text-base text-gray-400 mt-2'>
        <button
          onClick={handlePasswordReset}
          className='hover:text-blue-800 underline text-sm'
          // disabled={loading}
        >
          Forgot Password?
        </button>
      </p>

      <p className='font-serif text-base text-gray-400 mt-2'>
        Don't have an account?
        <Link to="/registration" className='hover:text-blue-800 underline '>Sign up</Link>
      </p>
    </div>
  );
};

export default LoginFormCom;
