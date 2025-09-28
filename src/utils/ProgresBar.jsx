import { ProgressBar } from "react-bootstrap";

export function ProgresBar() {
  const now = 60;

  return <ProgressBar now={now} label={`${now}%`} />;
}
