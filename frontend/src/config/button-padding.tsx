import styles from "./button-padding.css";
import { ChangeEvent } from "react";

interface Props {
  value: string;
  onChange: (newValue: string) => void;
}

interface DirectionalValues {
  n: number;
  e: number;
  w: number;
  s: number;
}

function parseValues(value: string) {
  const paddings = {
    n: 0,
    e: 0,
    w: 0,
    s: 0,
  };
  const values = value.split(/ +/).map((v) => +v.slice(0, -2));
  switch (values.length) {
    case 0:
      break;
    case 1:
      paddings.n = paddings.e = paddings.s = paddings.w = values[0];
      break;
    case 2:
      paddings.n = paddings.s = values[0];
      paddings.w = paddings.e = values[1];
      break;
    case 3:
      paddings.n = values[0];
      paddings.w = paddings.e = values[1];
      paddings.s = values[2];
      break;
    default:
      paddings.n = values[0];
      paddings.e = values[1];
      paddings.s = values[2];
      paddings.w = values[3];
  }
  return paddings;
}

function collapseValues({ n, e, w, s }: DirectionalValues) {
  if (n === e && e === w && w === s) {
    return `${n}em`;
  }
  if (n == s && e == w) {
    return `${n}em ${w}em`;
  }
  if (e == w) {
    return `${n}em ${w}em ${s}em`;
  }
  return `${n}em ${e}em ${s}em ${w}em`;
}

export function ButtonPaddingControl(props: Props) {
  const values = parseValues(props.value);
  const commonProps = {
    min: 0,
    max: 10,
    step: 0.1,
    type: "number",
    onChange(e: ChangeEvent<HTMLInputElement>) {
      const changedDir = e.currentTarget.dataset[
        "dir"
      ] as keyof DirectionalValues;
      const nextValues = {
        ...values,
        [changedDir]: +e.currentTarget.value,
      };
      props.onChange(collapseValues(nextValues));
    },
  };

  return (
    <div className={styles.buttonPaddingControl}>
      <span />
      <input data-dir="n" value={values.n} {...commonProps} />
      <br />
      <input data-dir="w" value={values.w} {...commonProps} />
      <span />
      <input data-dir="e" value={values.e} {...commonProps} />
      <br />
      <span />
      <input data-dir="s" value={values.s} {...commonProps} />
    </div>
  );
}
