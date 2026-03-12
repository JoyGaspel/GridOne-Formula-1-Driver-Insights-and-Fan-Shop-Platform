import { useEffect, useState } from "react";

export const useLandingVM = () => {
  const [drivers] = useState(new Array(6).fill(null));
  const [teams] = useState(new Array(3).fill(null));
  const [schedule] = useState(new Array(3).fill(null));
  const [circuits] = useState(new Array(3).fill(null));

  return { drivers, teams, schedule, circuits };
};
