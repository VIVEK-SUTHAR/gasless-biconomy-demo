import React from "react";
import styles from "../styles/Home.module.css";
import formatAddress from "../utils/formatAddress";
import Avatar from "./Avatar";

function SignCard({ from, message }) {
  return (
    <div className={styles.card}>
      <div>
        <Avatar />
        {formatAddress(from)}
      </div>
      <div className={styles.message}>Message: {message}</div>
    </div>
  );
}

export default SignCard;
