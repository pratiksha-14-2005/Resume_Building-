import React, { useState } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import "../styles/auth.css";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="main-container">

      {/* LEFT IMAGE */}
      <div className="left-section">
        <div className="overlay-text">
          <h3>Selected Works</h3>
        </div>
      </div>

      {/* RIGHT FORM */}
      <div className="right-section">
        <h1>Hi Designer</h1>
        <p className="subtitle">Welcome to Resume Builder</p>

        {isLogin ? <LoginForm /> : <SignupForm />}

        <p className="switch-text">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? " Sign up" : " Login"}
          </span>
        </p>
      </div>

    </div>
  );
};

export default AuthPage;