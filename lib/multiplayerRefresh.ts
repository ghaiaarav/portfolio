export type RefreshSchedule = {
  reveals: number[];
  hiddenAt: number;
};

export function createRefreshSchedule(
  serverCount: number,
  random: () => number = Math.random
): RefreshSchedule {
  let elapsed = 0;
  const reveals = Array.from({ length: serverCount }, () => {
    elapsed += 260 + Math.round(random() * 520);
    return elapsed;
  });
  return {
    reveals,
    hiddenAt: elapsed + 2000 + Math.round(random() * 1000),
  };
}
