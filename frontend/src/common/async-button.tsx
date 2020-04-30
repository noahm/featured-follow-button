import { useState, useCallback, HTMLProps, MouseEvent } from "react";

interface Props extends HTMLProps<HTMLButtonElement> {
  onClick: (e: MouseEvent<HTMLButtonElement>) => Promise<unknown>;
}

export function AsyncButton({ onClick, ...otherProps }: Props) {
  const [inFlight, setInFlight] = useState(false);
  const clickHandler = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      setInFlight(true);
      await onClick(e);
      setInFlight(false);
    },
    [onClick]
  );
  return (
    <button
      {...otherProps}
      type="button"
      disabled={inFlight}
      onClick={clickHandler}
    />
  );
}
