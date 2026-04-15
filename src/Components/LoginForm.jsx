import React from "react";

const LoginForm = () => {
  return (
    <form className="form">
      <input type="email" placeholder="Email" required />
      <input type="password" placeholder="Password" required />

      <button type="submit">Login</button>
    </form>
  );
};

export default LoginForm;