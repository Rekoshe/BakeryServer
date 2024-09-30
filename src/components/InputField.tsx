import React from "react";
import './InputField.css'

export default function EmailField(): JSX.Element {
  return (
    <div className="email-field">
      <label className="text-wrapper" htmlFor="input-1">
        Email
      </label>
      <input className="input" id="input-1" placeholder="example@example.com" type="email" />
    </div>
  );
};