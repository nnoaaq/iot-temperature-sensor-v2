export const convertUnixToHoursAndMinutes = (time: number) => {
  const dateObj = new Date(time * 1000);
  return dateObj.toLocaleDateString("fi-FI", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};
export const convertUnixToDay = (time: number) => {
  const dateObj = new Date(time * 1000);
  return dateObj.toLocaleDateString("fi-FI", {
    day: "2-digit",
    month: "numeric",
    year: "numeric",
  });
};
