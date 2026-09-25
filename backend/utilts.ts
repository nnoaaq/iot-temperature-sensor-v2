export const convertUnixToDate = (timeStamp: number) => {
  const dateObj = new Date(timeStamp * 1000);
  return dateObj.toLocaleDateString("fi-FI");
};
