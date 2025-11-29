export type SlotStats = {
  responseCount: number;
  availableCount: number;
  unavailableCount: number;
  averageProbability: number;
};

export function getSlotStats(availabilities: { probability: number }[] = []): SlotStats {
  const responseCount = availabilities.length;
  const availableCount = availabilities.filter((availability) => availability.probability > 0).length;
  const unavailableCount = availabilities.filter((availability) => availability.probability === 0).length;
  const averageProbability = responseCount
    ? Math.round(availabilities.reduce((sum, availability) => sum + availability.probability, 0) / responseCount)
    : 0;

  return { responseCount, availableCount, unavailableCount, averageProbability };
}

export function toLocalInputValue(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}
