import { DateTime } from 'luxon';

export const getCurrentKST = () => DateTime.now().setZone('Asia/Seoul');
export const convertToKST = (time) => DateTime.fromJSDate(time).setZone('Asia/Seoul').toFormat('yyyy-MM-dd HH:mm:ss');

export const convertDatesInResult = (result) => {
  const processed = new WeakSet();

  if (Array.isArray(result)) {
    return result.map(convertDatesInResult);
  }

  if (result instanceof Date) {
    return convertToKST(result);
  }

  if (typeof result === 'object' && result !== null) {
    if (processed.has(result)) {
      return result;
    }

    processed.add(result);

    return Object.fromEntries(
      Object.entries(result).map(([key, value]) => [key, convertDatesInResult(value)])
    );
  }

  return result;
};
