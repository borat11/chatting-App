import { useFormik } from "formik";
import { useState } from "react";
import { signUp } from "../../validation/Validation";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { PulseLoader } from "react-spinners";
import { Link, useNavigate } from "react-router-dom";
import { getDatabase, ref, set } from "firebase/database";

const RegFromCom = ({ toast }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getDatabase();

  const createNewUsers = () => {
    setLoading(true);
    createUserWithEmailAndPassword(
      auth,
      formik.values.email,
      formik.values.password
    )
      .then(({ user }) => {
        updateProfile(auth.currentUser, {
          displayName: formik.values.fullName,
        })
          .then(() => {
            sendEmailVerification(auth.currentUser)
              .then(() => {
                set(ref(db, "users/" + user.uid), {
                  username: user.displayName,
                  email: user.email,
                });
              })
              .then(() => {
                toast.success("Email sent for verification", {
                  position: "top-right",
                  autoClose: 1000,
                  hideProgressBar: true,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  theme: "light",
                });
                setTimeout(() => {
                  navigate("/login");
                }, 2000);
              });
          })
          .catch((error) => {
            toast.error(error.message, {
              position: "top-right",
              autoClose: 1000,
              hideProgressBar: true,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
            });
          })
          .finally(() => {
            setLoading(false);
          });
      })
      .catch((error) => {
        if (error.message.includes("auth/email-already-in-use")) {
          toast.error("Email already in use", {
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
          console.error(error.message);
        }
        setLoading(false);
      });
  };

  const initialValues = {
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

  const formik = useFormik({
    initialValues,
    onSubmit: createNewUsers,
    validationSchema: signUp,
  });

  return (
    <div>
      <h1 className="font-serif font-bold text-slate-900">
        Registration on your journey
      </h1>
      <form onSubmit={formik.handleSubmit}>
        <input
          placeholder="Enter your name"
          className="w-full px-3 py-2 border border-slate-400 rounded-md outline-none mb-3"
          name="fullName"
          value={formik.values.fullName}
          onChange={formik.handleChange}
          type="text"
        />
        {formik.errors.fullName && formik.touched.fullName && (
          <p className="font-serif text-red-600 mb-5">
            {formik.errors.fullName}
          </p>
        )}

        <input
          placeholder="Enter your email"
          className="w-full px-3 py-2 border border-slate-400 rounded-md outline-none mb-3"
          name="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          type="email"
        />
        {formik.errors.email && formik.touched.email && (
          <p className="font-serif text-red-600 mb-5">{formik.errors.email}</p>
        )}

        <input
          placeholder="Enter your Password"
          className="w-full px-3 py-2 border border-slate-400 rounded-md outline-none mb-3"
          name="password"
          value={formik.values.password}
          onChange={formik.handleChange}
          type="password"
        />
        {formik.errors.password && formik.touched.password && (
          <p className="font-serif text-red-600 mb-5">
            {formik.errors.password}
          </p>
        )}

        <input
          placeholder="Confirm your Password"
          className="w-full px-3 py-2 border border-slate-400 rounded-md outline-none mb-3"
          name="confirmPassword"
          value={formik.values.confirmPassword}
          onChange={formik.handleChange}
          type="password"
        />
        {formik.errors.confirmPassword && formik.touched.confirmPassword && (
          <p className="font-serif text-red-600 mb-5">
            {formik.errors.confirmPassword}
          </p>
        )}

        <button
          disabled={loading}
          type="submit"
          className="font-serif bg-slate-900 text-white text-base rounded-md w-full py-3"
        >
          {loading ? <PulseLoader color="white" /> : "Sign Up"}
        </button>
      </form>

      <p className="font-serif text-base text-gray-400 mt-2">
        Already have an account?{" "}
        <Link to="/login" className="hover:text-blue-800 underline ">
          Sign In
        </Link>
      </p>
    </div>
  );
};

export default RegFromCom;
