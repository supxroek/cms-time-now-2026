import dayjs from "dayjs";
import "dayjs/locale/th"; // Import Thai locale
import buddhistEra from "dayjs/plugin/buddhistEra";

// Extend dayjs with plugins if needed
dayjs.extend(buddhistEra);
dayjs.locale("th"); // Set default locale to Thai

export const formatDate = (date, format = "D MMM BBBB") => {
  if (!date) return "-";
  return dayjs(date).format(format);
};

export const formatTime = (date, format = "HH:mm") => {
  if (!date) return "-";
  return dayjs(date).format(format);
};

export const formatDateTime = (date, format = "D MMM BBBB HH:mm") => {
  if (!date) return "-";
  return dayjs(date).format(format);
};

export const getCurrentDate = () => dayjs();

export const toISOString = (date) => dayjs(date).toISOString();

export const isSameDay = (date1, date2) => {
  return dayjs(date1).isSame(dayjs(date2), "day");
};
