const Button = props => (
  <button onClick={props.onClick} disabled={props.disabled}>
    <span id={props.symbol}>{props.children}</span>
  </button>
);

export default Button;
